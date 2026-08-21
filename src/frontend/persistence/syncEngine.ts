import type { PersistenceAdapter, StoredRecord } from "./types.js";
import { getIndexedDbAdapter } from "./indexedDb.js";
import {
  SYNCABLE_STORES,
  isSyncableStore,
  type MergePreview,
  type RemoteSyncAdapter,
  type StoreRecordCounts,
  type SyncChange,
  type SyncConflict,
  type SyncCoordinator,
  type SyncMeta,
  type SyncQueueItem,
  type SyncResult,
  type SyncStatus,
  type SyncableStore,
} from "./sync.js";
import { cloudSyncAvailable, getSupabaseClient } from "./supabaseClient.js";
import { isChangeSeqCursor, SupabaseRemoteSyncAdapter } from "./supabaseAdapter.js";
import { isDefaultLocalSettingsRecord } from "./settingsDefaults.js";

const DEFAULT_SYNC_META: SyncMeta = {
  id: "sync-meta",
  localDatasetOwnerUserId: null,
  lastCursor: null,
  lastSyncAt: null,
  lastSyncStatus: "SIGNED_OUT",
  lastSyncError: null,
  syncDataSchemaVersion: 1,
};

export const CURRENT_SYNC_DATA_SCHEMA_VERSION = 2;

const MEANINGFUL_LOCAL_DATA_STORES = [
  "vocabulary",
  "readings",
  "activities",
  "quizHistory",
  "collections",
] as const satisfies readonly SyncableStore[];

function syncKey(store: SyncableStore, recordId: string): string {
  return `${store}:${recordId}`;
}

function isAtOrBeforeCursor(change: SyncChange, cursor?: string | null): boolean {
  if (!change.changeSeq || !cursor) return false;
  try {
    return BigInt(change.changeSeq) <= BigInt(cursor);
  } catch {
    return false;
  }
}

export class LocalFirstSyncCoordinator implements SyncCoordinator {
  private isSyncing = false;
  private statusListeners = new Set<(status: SyncStatus) => void>();
  private debouncedSyncTimer: ReturnType<typeof setTimeout> | null = null;
  private currentStatus: SyncStatus = "UNCONFIGURED";
  private readonly persistence: PersistenceAdapter;

  constructor(persistence?: PersistenceAdapter) {
    this.persistence = persistence ?? getIndexedDbAdapter();
    void this.initStatus();
    this.setupNetworkListeners();
  }

  private async initStatus(): Promise<void> {
    if (!cloudSyncAvailable()) {
      this.setStatus("UNCONFIGURED");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      this.setStatus("UNCONFIGURED");
      return;
    }

    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) {
      this.setStatus("SIGNED_OUT");
      return;
    }

    const meta = await this.getMeta();
    if (meta.lastSyncStatus === "SYNCING" || meta.lastSyncStatus === "SIGNED_OUT" || !meta.lastSyncStatus) {
      this.setStatus("IDLE");
    } else {
      this.setStatus(meta.lastSyncStatus);
    }
  }

  private setupNetworkListeners(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      if (this.currentStatus === "OFFLINE") {
        this.setStatus("PENDING_CHANGES");
        void this.sync();
      }
    });

    window.addEventListener("offline", () => {
      this.setStatus("OFFLINE");
    });
  }

  private setStatus(status: SyncStatus): void {
    this.currentStatus = status;
    this.statusListeners.forEach((listener) => {
      try {
        listener(status);
      } catch (err) {
        console.error("Sync status listener error:", err);
      }
    });
  }

  getStatus(): SyncStatus {
    return this.currentStatus;
  }

  onStatusChange(listener: (status: SyncStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.currentStatus);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  async getMeta(): Promise<SyncMeta> {
    const saved = await this.persistence.get<SyncMeta>("meta", "sync-meta");
    if (!saved) {
      await this.persistence.put("meta", { ...DEFAULT_SYNC_META });
      return { ...DEFAULT_SYNC_META };
    }
    return { ...DEFAULT_SYNC_META, ...saved };
  }

  async saveMeta(meta: Partial<SyncMeta>): Promise<SyncMeta> {
    const current = await this.getMeta();
    const updated: SyncMeta = {
      ...current,
      ...meta,
      id: "sync-meta",
    };
    await this.persistence.put("meta", updated);
    return updated;
  }

  async queueLocalChange(
    store: SyncableStore,
    recordId: string,
    record?: StoredRecord,
    deleted = false,
  ): Promise<void> {
    if (!isSyncableStore(store) || !recordId) return;

    const queueId = syncKey(store, recordId);
    const queueItem: SyncQueueItem = {
      id: queueId,
      store,
      recordId,
      updatedAt: typeof record?.updatedAt === "string" ? record.updatedAt : new Date().toISOString(),
      deleted,
      record: deleted ? undefined : record,
    };

    await this.persistence.put("syncQueue", queueItem);

    if (this.currentStatus !== "SYNCING" && this.currentStatus !== "OFFLINE") {
      this.setStatus("PENDING_CHANGES");
    }

    // Debounced automatic background sync (trigger after 2 seconds of inactivity)
    this.triggerDebouncedSync();
  }

  private triggerDebouncedSync(): void {
    if (this.debouncedSyncTimer) {
      clearTimeout(this.debouncedSyncTimer);
    }
    this.debouncedSyncTimer = setTimeout(() => {
      this.debouncedSyncTimer = null;
      void this.sync();
    }, 2000);
  }

  async getPendingCount(): Promise<number> {
    const items = await this.persistence.getAll<SyncQueueItem>("syncQueue");
    return items.length;
  }

  async getConflicts(): Promise<SyncConflict[]> {
    return this.persistence.getAll<SyncConflict>("syncConflicts");
  }

  async resolveConflict(conflictId: string, choice: "local" | "remote"): Promise<void> {
    const conflict = await this.persistence.get<SyncConflict>("syncConflicts", conflictId);
    if (!conflict) return;

    if (choice === "local") {
      if (conflict.localDeleted) {
        await this.persistence.delete(conflict.store, conflict.recordId);
        await this.queueLocalChange(conflict.store, conflict.recordId, undefined, true);
      } else if (conflict.localRecord) {
        await this.persistence.put(conflict.store, conflict.localRecord);
        await this.queueLocalChange(conflict.store, conflict.recordId, conflict.localRecord, false);
      } else {
        return;
      }
    } else if (choice === "remote") {
      if (conflict.remoteRecord) {
        await this.persistence.put(conflict.store, conflict.remoteRecord);
      } else {
        await this.persistence.delete(conflict.store, conflict.recordId);
      }
    }

    conflict.resolvedAt = new Date().toISOString();
    conflict.resolution = choice;
    await this.persistence.put("syncConflicts", conflict);
  }

  async disconnect(): Promise<void> {
    // Keep ownership and cursor. Clearing them made a later sign-in with a
    // different account look like a safe first-device seed.
    await this.saveMeta({
      lastSyncStatus: "SIGNED_OUT",
      lastSyncError: null,
    });
    this.setStatus("SIGNED_OUT");
  }

  /** Queues the existing local dataset only after an empty remote has been proven. */
  private async seedInitialUpload(userId: string): Promise<void> {
    const queueMap = new Map<string, SyncQueueItem>();
    const existingQueue = await this.persistence.getAll<SyncQueueItem>("syncQueue");
    for (const q of existingQueue) {
      queueMap.set(q.id, q);
    }

    for (const store of SYNCABLE_STORES) {
      const records = await this.persistence.getAll<StoredRecord>(store);
      for (const record of records) {
        if (!record.id) continue;
        const queueId = syncKey(store, record.id);
        if (!queueMap.has(queueId)) {
          const updatedAt = typeof record.updatedAt === "string" ? record.updatedAt : new Date().toISOString();
          const item: SyncQueueItem = {
            id: queueId,
            store,
            recordId: record.id,
            updatedAt,
            deleted: false,
            record,
          };
          await this.persistence.put("syncQueue", item);
        }
      }
    }

    await this.saveMeta({ localDatasetOwnerUserId: userId });
  }

  private async hasMeaningfulLocalDataset(): Promise<boolean> {
    for (const store of MEANINGFUL_LOCAL_DATA_STORES) {
      if ((await this.persistence.getAll<StoredRecord>(store)).length > 0) return true;
    }
    const pending = await this.persistence.getAll<SyncQueueItem>("syncQueue");
    return pending.some((item) => item.store !== "settings");
  }

  /**
   * Preferences are not learning-content ownership proof. Preserve imported or
   * otherwise unqueued custom settings independently so a first cloud pull
   * either pushes them or records a normal settings conflict instead of
   * silently overwriting them.
   */
  private async queueUntrackedCustomizedSettings(): Promise<void> {
    const settingsRecords = await this.persistence.getAll<StoredRecord>("settings");
    const queuedIds = new Set(
      (await this.persistence.getAll<SyncQueueItem>("syncQueue"))
        .filter((item) => item.store === "settings")
        .map((item) => item.recordId),
    );
    for (const record of settingsRecords) {
      if (!record.id || queuedIds.has(record.id) || isDefaultLocalSettingsRecord(record)) continue;
      const queueId = syncKey("settings", record.id);
      await this.persistence.put("syncQueue", {
        id: queueId,
        store: "settings",
        recordId: record.id,
        updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : new Date().toISOString(),
        deleted: false,
        record,
      } satisfies SyncQueueItem);
    }
  }

  private async pullAll(adapter: RemoteSyncAdapter, initialCursor?: string): Promise<{
    changes: SyncChange[];
    cursor?: string;
  }> {
    const changes: SyncChange[] = [];
    let cursor = initialCursor;

    do {
      const page = await adapter.pull(cursor);
      changes.push(...page.changes);

      if (page.cursor !== undefined && !isChangeSeqCursor(page.cursor)) {
        throw new Error("Máy chủ trả về cursor change_seq không hợp lệ.");
      }

      if (page.hasMore && (!page.cursor || page.cursor === cursor)) {
        throw new Error("Máy chủ trả về trang đồng bộ không tiến được cursor.");
      }

      cursor = page.cursor ?? cursor;
      if (!page.hasMore) break;
    } while (true);

    return { changes, cursor };
  }

  private async upgradeLegacyCursor(adapter: RemoteSyncAdapter, legacyCursor: string): Promise<string> {
    if (!adapter.translateLegacyCursor) {
      throw new Error("Không thể nâng cấp cursor đồng bộ cũ một cách an toàn. Vui lòng thử lại khi kết nối đám mây sẵn sàng.");
    }

    const upgradedCursor = await adapter.translateLegacyCursor(legacyCursor);
    if (!isChangeSeqCursor(upgradedCursor)) {
      throw new Error("Máy chủ trả về cursor đồng bộ đã nâng cấp không hợp lệ.");
    }

    // Persist only a proven numeric boundary. The legacy timestamp remains
    // untouched when the authenticated lookup fails, allowing a safe retry.
    await this.saveMeta({ lastCursor: upgradedCursor });
    return upgradedCursor;
  }

  private async applyRemoteChanges(
    changes: SyncChange[],
    previouslyAppliedCursor?: string | null,
  ): Promise<{ pulledCount: number; conflictsCount: number }> {
    let pulledCount = 0;
    let conflictsCount = 0;

    for (const change of changes) {
      if (!isSyncableStore(change.store)) continue;

      const queueId = syncKey(change.store, change.id);
      const pendingItem = await this.persistence.get<SyncQueueItem>("syncQueue", queueId);
      const localRecord = await this.persistence.get<StoredRecord>(change.store, change.id);

      // A force/full refresh can include the already-known cloud base for a
      // new local edit. It is not a concurrent change and must not overwrite
      // or falsely conflict with that queued edit.
      if (pendingItem && isAtOrBeforeCursor(change, previouslyAppliedCursor)) {
        continue;
      }

      if (change.deleted) {
        if (pendingItem) {
          conflictsCount++;
          await this.recordConflict(
            change.store,
            change.id,
            localRecord,
            undefined,
            "last-write-wins",
            pendingItem.deleted,
          );
          await this.persistence.delete("syncQueue", queueId);
        }
        await this.persistence.delete(change.store, change.id);
        pulledCount++;
      } else if (change.record) {
        if (pendingItem) {
          // The cloud is ordered by a server-assigned sequence. A pending local
          // mutation and a later pulled cloud mutation are a real conflict;
          // remote wins deterministically and the local version is retained for
          // explicit user resolution. Never compare device clocks here.
          conflictsCount++;
          await this.recordConflict(
            change.store,
            change.id,
            localRecord,
            change.record,
            "last-write-wins",
            pendingItem.deleted,
          );
          await this.persistence.delete("syncQueue", queueId);
        }
        await this.persistence.put(change.store, change.record);
        pulledCount++;
      }
    }

    return { pulledCount, conflictsCount };
  }

  /**
   * Runs the complete two-way synchronization cycle.
   */
  async sync(customAdapter?: RemoteSyncAdapter, force = false): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, pulledCount: 0, pushedCount: 0, conflictsCount: 0, error: "Sync already in progress" };
    }

    if (typeof window !== "undefined" && typeof navigator !== "undefined" && typeof navigator.onLine === "boolean" && !navigator.onLine) {
      this.setStatus("OFFLINE");
      return { success: false, pulledCount: 0, pushedCount: 0, conflictsCount: 0, error: "Thiết bị đang ngoại tuyến" };
    }

    let adapter: RemoteSyncAdapter | undefined = customAdapter;
    let userId: string | null = null;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        userId = data.session?.user?.id ?? null;
      } catch {
        userId = null;
      }
    }

    if (!adapter) {
      if (!cloudSyncAvailable()) {
        this.setStatus("UNCONFIGURED");
        return { success: false, pulledCount: 0, pushedCount: 0, conflictsCount: 0, error: "Chưa cấu hình Supabase" };
      }

      if (!supabase) {
        this.setStatus("UNCONFIGURED");
        return { success: false, pulledCount: 0, pushedCount: 0, conflictsCount: 0, error: "Supabase client không khả dụng" };
      }

      if (!userId) {
        this.setStatus("SIGNED_OUT");
        return { success: false, pulledCount: 0, pushedCount: 0, conflictsCount: 0, error: "Chưa đăng nhập" };
      }

      const { data } = await supabase.auth.getSession();
      adapter = new SupabaseRemoteSyncAdapter(supabase, data.session!.user);
    }

    this.isSyncing = true;
    this.setStatus("SYNCING");

    let pulledCount = 0;
    let pushedCount = 0;
    let conflictsCount = 0;

    try {
      const meta = await this.getMeta();

      // Account Switch Protection Check. The first pull happens before any
      // initial upload so a clean second device never seeds over cloud data.
      if (userId) {
        if (meta.localDatasetOwnerUserId && meta.localDatasetOwnerUserId !== userId) {
          // Dangerous: Local dataset belongs to another user
          this.setStatus("ACCOUNT_MISMATCH");
          await this.saveMeta({
            lastSyncStatus: "ACCOUNT_MISMATCH",
            lastSyncError: "Dữ liệu trên máy này thuộc về tài khoản khác.",
          });
          return {
            success: false,
            pulledCount: 0,
            pushedCount: 0,
            conflictsCount: 0,
            error: "Dữ liệu trên máy này thuộc về tài khoản khác. Vui lòng xác nhận trước khi đồng bộ.",
          };
        }
      }

      // ================= 1. UPGRADE / PULL REMOTE CHANGES =================
      // Old clients persisted an ISO updated_at cursor. Translate it before
      // querying change_seq so we neither send invalid bigint input nor replay
      // all historic rows as false concurrent changes.
      const needsSyncSchemaUpgrade = (meta.syncDataSchemaVersion ?? 1) < CURRENT_SYNC_DATA_SCHEMA_VERSION;
      let effectiveCursor = meta.lastCursor ?? undefined;
      if (effectiveCursor !== undefined && !isChangeSeqCursor(effectiveCursor)) {
        effectiveCursor = await this.upgradeLegacyCursor(adapter, effectiveCursor);
      }

      const cursor = force || needsSyncSchemaUpgrade ? undefined : effectiveCursor;
      const pullResult = await this.pullAll(adapter, cursor);

      if (userId && !meta.localDatasetOwnerUserId) {
        if (pullResult.changes.length > 0) {
          if (await this.hasMeaningfulLocalDataset()) {
            this.setStatus("MERGE_REQUIRED");
            await this.saveMeta({
              lastSyncStatus: "MERGE_REQUIRED",
              lastSyncError: "Đã tìm thấy dữ liệu cục bộ trên thiết bị và dữ liệu sao lưu trên tài khoản. Cần xác nhận hợp nhất.",
            });
            return {
              success: false,
              pulledCount: 0,
              pushedCount: 0,
              conflictsCount: 0,
              error: "Đã tìm thấy dữ liệu cục bộ trên thiết bị và dữ liệu sao lưu trên tài khoản. Vui lòng xác nhận hợp nhất để tiếp tục đồng bộ.",
            };
          }
          await this.queueUntrackedCustomizedSettings();
          await this.saveMeta({ localDatasetOwnerUserId: userId });
        } else {
          await this.seedInitialUpload(userId);
        }
      }

      const applied = await this.applyRemoteChanges(pullResult.changes, effectiveCursor);
      pulledCount += applied.pulledCount;
      conflictsCount += applied.conflictsCount;

      // ================= 2. PUSH LOCAL CHANGES =================
      const pendingQueue = await this.persistence.getAll<SyncQueueItem>("syncQueue");
      if (pendingQueue.length > 0) {
        const changesToPush: SyncChange[] = pendingQueue.map((item: SyncQueueItem) => ({
          store: item.store,
          id: item.recordId,
          updatedAt: item.updatedAt,
          deleted: item.deleted,
          record: item.record,
        }));

        const pushResult = await adapter.push(changesToPush);
        const acknowledgedSet = new Set(pushResult.acknowledgedKeys);

        for (const item of pendingQueue) {
          if (acknowledgedSet.has(item.id)) {
            await this.persistence.delete("syncQueue", item.id);
            pushedCount++;
          }
        }
      }

      // ================= 3. FINALIZE & UPDATE META =================
      const remainingPending = await this.getPendingCount();
      const updatedStatus: SyncStatus = remainingPending > 0 ? "PENDING_CHANGES" : "IDLE";
      const now = new Date().toISOString();

      await this.saveMeta({
        lastCursor: pullResult.cursor ?? effectiveCursor ?? null,
        lastSyncAt: now,
        lastSyncStatus: updatedStatus,
        lastSyncError: null,
        ...(needsSyncSchemaUpgrade ? { syncDataSchemaVersion: CURRENT_SYNC_DATA_SCHEMA_VERSION } : {}),
      });

      this.setStatus(updatedStatus);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("tutrinh:sync-complete"));
      }

      return {
        success: true,
        pulledCount,
        pushedCount,
        conflictsCount,
      };
    } catch (err: any) {
      console.error("Sync cycle failed:", err);
      const errorMessage = err?.message || "Lỗi đồng bộ đám mây";

      await this.saveMeta({
        lastSyncStatus: "ERROR",
        lastSyncError: errorMessage,
      });

      this.setStatus("ERROR");

      return {
        success: false,
        pulledCount,
        pushedCount,
        conflictsCount,
        error: errorMessage,
      };
    } finally {
      this.isSyncing = false;
    }
  }

  async getMergePreview(adapter?: RemoteSyncAdapter): Promise<MergePreview | null> {
    const supabase = getSupabaseClient();
    let userId: string | null = null;
    if (supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        userId = data.session?.user?.id ?? null;
      } catch {
        userId = null;
      }
    }

    if (!adapter) {
      if (!cloudSyncAvailable() || !supabase || !userId) {
        return null;
      }
      const { data } = await supabase.auth.getSession();
      adapter = new SupabaseRemoteSyncAdapter(supabase, data.session!.user);
    }

    const meta = await this.getMeta();
    if (meta.localDatasetOwnerUserId && meta.localDatasetOwnerUserId !== userId) {
      return null;
    }

    const pullResult = await this.pullAll(adapter, undefined);

    const localCounts: StoreRecordCounts = {
      vocabulary: 0,
      readings: 0,
      activities: 0,
      quizHistory: 0,
      collections: 0,
      settings: 0,
    };

    const remoteCounts: StoreRecordCounts = {
      vocabulary: 0,
      readings: 0,
      activities: 0,
      quizHistory: 0,
      collections: 0,
      settings: 0,
    };

    let localOnlyCount = 0;
    let remoteOnlyCount = 0;
    let sameIdSameContentCount = 0;
    let sameIdDifferentContentCount = 0;

    const remoteMap = new Map<SyncableStore, Map<string, SyncChange>>();
    for (const store of SYNCABLE_STORES) {
      remoteMap.set(store, new Map());
    }
    for (const change of pullResult.changes) {
      const storeMap = remoteMap.get(change.store);
      if (storeMap) {
        storeMap.set(change.id, change);
      }
    }

    for (const store of SYNCABLE_STORES) {
      const localRecords = await this.persistence.getAll<StoredRecord>(store);
      const storeRemoteMap = remoteMap.get(store) ?? new Map<string, SyncChange>();

      const activeLocalMap = new Map<string, StoredRecord>();
      for (const rec of localRecords) {
        if (rec.id) {
          activeLocalMap.set(rec.id, rec);
        }
      }
      localCounts[store] = activeLocalMap.size;

      let activeRemoteCount = 0;
      for (const change of storeRemoteMap.values()) {
        if (!change.deleted && change.record) {
          activeRemoteCount++;
        }
      }
      remoteCounts[store] = activeRemoteCount;

      for (const [id, localRec] of activeLocalMap.entries()) {
        const remoteChange = storeRemoteMap.get(id);
        if (!remoteChange || remoteChange.deleted || !remoteChange.record) {
          localOnlyCount++;
        } else {
          if (areRecordsSemanticallyEqual(localRec, remoteChange.record)) {
            sameIdSameContentCount++;
          } else {
            sameIdDifferentContentCount++;
          }
        }
      }

      for (const [id, remoteChange] of storeRemoteMap.entries()) {
        if (!remoteChange.deleted && remoteChange.record) {
          if (!activeLocalMap.has(id)) {
            remoteOnlyCount++;
          }
        }
      }
    }

    return {
      localCounts,
      remoteCounts,
      localOnlyCount,
      remoteOnlyCount,
      sameIdSameContentCount,
      sameIdDifferentContentCount,
      canMerge: true,
    };
  }

  async executeMerge(adapter?: RemoteSyncAdapter): Promise<SyncResult> {
    const supabase = getSupabaseClient();
    let userId: string | null = null;
    if (supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        userId = data.session?.user?.id ?? null;
      } catch {
        userId = null;
      }
    }

    if (!adapter) {
      if (!cloudSyncAvailable()) {
        return { success: false, pulledCount: 0, pushedCount: 0, conflictsCount: 0, error: "Chưa cấu hình Supabase" };
      }
      if (!supabase || !userId) {
        return { success: false, pulledCount: 0, pushedCount: 0, conflictsCount: 0, error: "Chưa đăng nhập" };
      }
      const { data } = await supabase.auth.getSession();
      adapter = new SupabaseRemoteSyncAdapter(supabase, data.session!.user);
    }

    const meta = await this.getMeta();
    if (meta.localDatasetOwnerUserId && meta.localDatasetOwnerUserId !== userId) {
      return {
        success: false,
        pulledCount: 0,
        pushedCount: 0,
        conflictsCount: 0,
        error: "Dữ liệu trên máy này thuộc về tài khoản khác. Không thể hợp nhất.",
      };
    }

    this.isSyncing = true;
    this.setStatus("SYNCING");

    try {
      // 1. Pull full remote snapshot
      const pullResult = await this.pullAll(adapter, undefined);

      const remoteMap = new Map<SyncableStore, Map<string, SyncChange>>();
      for (const store of SYNCABLE_STORES) {
        remoteMap.set(store, new Map());
      }
      for (const change of pullResult.changes) {
        const storeMap = remoteMap.get(change.store);
        if (storeMap) {
          storeMap.set(change.id, change);
        }
      }

      let conflictsCount = 0;
      let appliedRemoteCount = 0;

      // 2. Deterministic merge per Store & Record ID
      for (const store of SYNCABLE_STORES) {
        const localRecords = await this.persistence.getAll<StoredRecord>(store);
        const storeRemoteMap = remoteMap.get(store) ?? new Map<string, SyncChange>();
        const localMap = new Map<string, StoredRecord>();

        for (const rec of localRecords) {
          if (rec.id) {
            localMap.set(rec.id, rec);
          }
        }

        // Process all local records
        for (const [id, localRec] of localMap.entries()) {
          const remoteChange = storeRemoteMap.get(id);

          if (!remoteChange || remoteChange.deleted || !remoteChange.record) {
            // CASE A: Local only -> keep local and ensure queued
            await this.queueLocalChange(store, id, localRec, false);
          } else {
            // Both exist
            if (areRecordsSemanticallyEqual(localRec, remoteChange.record)) {
              // CASE C: Identical content -> keep local, no conflict
            } else {
              // CASE D: Different content -> create SyncConflict
              const conflict: SyncConflict = {
                id: syncKey(store, id),
                store,
                recordId: id,
                localRecord: localRec,
                localDeleted: false,
                remoteRecord: remoteChange.record,
                conflictAt: new Date().toISOString(),
                resolution: "local",
              };
              await this.persistence.put("syncConflicts", conflict);
              conflictsCount++;
            }
          }
        }

        // Process remote-only records
        for (const [id, remoteChange] of storeRemoteMap.entries()) {
          if (!remoteChange.deleted && remoteChange.record) {
            if (!localMap.has(id)) {
              // CASE B: Remote only -> write locally without creating new local queue item
              await this.persistence.put(store, remoteChange.record);
              appliedRemoteCount++;
            }
          }
        }
      }

      await this.queueUntrackedCustomizedSettings();

      // 3. ATOMIC OWNERSHIP COMMIT POINT
      await this.saveMeta({
        localDatasetOwnerUserId: userId,
        lastCursor: pullResult.cursor ?? null,
        lastSyncStatus: "PENDING_CHANGES",
        lastSyncError: null,
      });

      this.isSyncing = false;

      // 4. Trigger sync to push queued local mutations and finalize state
      const syncResult = await this.sync(adapter);
      return {
        success: syncResult.success,
        pulledCount: appliedRemoteCount + syncResult.pulledCount,
        pushedCount: syncResult.pushedCount,
        conflictsCount: conflictsCount + syncResult.conflictsCount,
        error: syncResult.error,
      };
    } catch (err: any) {
      console.error("Execute merge failed:", err);
      const errorMessage = err?.message || "Lỗi khi hợp nhất dữ liệu";
      await this.saveMeta({
        lastSyncStatus: "ERROR",
        lastSyncError: errorMessage,
      });
      this.setStatus("ERROR");
      return {
        success: false,
        pulledCount: 0,
        pushedCount: 0,
        conflictsCount: 0,
        error: errorMessage,
      };
    } finally {
      this.isSyncing = false;
    }
  }

  private async recordConflict(
    store: SyncableStore,
    recordId: string,
    localRecord?: StoredRecord,
    remoteRecord?: StoredRecord,
    resolution: "local" | "remote" | "last-write-wins" = "last-write-wins",
    localDeleted = false,
  ): Promise<void> {
    const conflict: SyncConflict = {
      id: syncKey(store, recordId),
      store,
      recordId,
      localRecord,
      localDeleted,
      remoteRecord,
      conflictAt: new Date().toISOString(),
      resolution,
    };
    await this.persistence.put("syncConflicts", conflict);
  }
}

function cleanRecordForComparison(record: StoredRecord | undefined): Record<string, unknown> | null {
  if (!record || typeof record !== "object") return null;
  const clean: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(record)) {
    if (key === "updatedAt" || key === "changeSeq" || key === "revision" || key === "createdAt") continue;
    clean[key] = val;
  }
  return clean;
}

function areRecordsSemanticallyEqual(a: StoredRecord | undefined, b: StoredRecord | undefined): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  const cleanA = cleanRecordForComparison(a);
  const cleanB = cleanRecordForComparison(b);
  return JSON.stringify(cleanA) === JSON.stringify(cleanB);
}

let defaultSyncCoordinator: LocalFirstSyncCoordinator | undefined;

export function getSyncCoordinator(): LocalFirstSyncCoordinator {
  defaultSyncCoordinator ??= new LocalFirstSyncCoordinator();
  return defaultSyncCoordinator;
}
