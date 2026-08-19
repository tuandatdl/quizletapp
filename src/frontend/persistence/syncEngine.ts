import type { PersistenceAdapter, StoredRecord } from "./types.js";
import { getIndexedDbAdapter } from "./indexedDb.js";
import {
  SYNCABLE_STORES,
  isSyncableStore,
  type RemoteSyncAdapter,
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
import { SupabaseRemoteSyncAdapter } from "./supabaseAdapter.js";

const DEFAULT_SYNC_META: SyncMeta = {
  id: "sync-meta",
  localDatasetOwnerUserId: null,
  lastCursor: null,
  lastSyncAt: null,
  lastSyncStatus: "SIGNED_OUT",
  lastSyncError: null,
};

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
    this.setStatus(meta.lastSyncStatus === "SYNCING" ? "IDLE" : meta.lastSyncStatus || "IDLE");
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

    const queueId = `${store}:${recordId}`;
    const queueItem: SyncQueueItem = {
      id: queueId,
      store,
      recordId,
      updatedAt: new Date().toISOString(),
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

    if (choice === "local" && conflict.localRecord) {
      await this.persistence.put(conflict.store, conflict.localRecord);
      await this.queueLocalChange(conflict.store, conflict.recordId, conflict.localRecord, false);
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
    await this.saveMeta({
      localDatasetOwnerUserId: null,
      lastCursor: null,
      lastSyncStatus: "SIGNED_OUT",
      lastSyncError: null,
    });
    this.setStatus("SIGNED_OUT");
  }

  /**
   * Performs a safe first-device initial seed:
   * Gathers existing local records in syncable stores and enqueues them for upload.
   */
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
        const queueId = `${store}:${record.id}`;
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

    if (!adapter) {
      if (!cloudSyncAvailable()) {
        this.setStatus("UNCONFIGURED");
        return { success: false, pulledCount: 0, pushedCount: 0, conflictsCount: 0, error: "Chưa cấu hình Supabase" };
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        this.setStatus("UNCONFIGURED");
        return { success: false, pulledCount: 0, pushedCount: 0, conflictsCount: 0, error: "Supabase client không khả dụng" };
      }

      const { data, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !data.session?.user) {
        this.setStatus("SIGNED_OUT");
        return { success: false, pulledCount: 0, pushedCount: 0, conflictsCount: 0, error: "Chưa đăng nhập" };
      }

      userId = data.session.user.id;
      adapter = new SupabaseRemoteSyncAdapter(supabase, data.session.user);
    }

    this.isSyncing = true;
    this.setStatus("SYNCING");

    let pulledCount = 0;
    let pushedCount = 0;
    let conflictsCount = 0;

    try {
      const meta = await this.getMeta();

      // Account Switch Protection Check
      if (userId) {
        if (!meta.localDatasetOwnerUserId) {
          // First time sign-in on this device: seed existing local records into sync queue
          await this.seedInitialUpload(userId);
        } else if (meta.localDatasetOwnerUserId !== userId) {
          // Dangerous: Local dataset belongs to another user
          this.setStatus("ACCOUNT_MISMATCH");
          this.isSyncing = false;
          return {
            success: false,
            pulledCount: 0,
            pushedCount: 0,
            conflictsCount: 0,
            error: "Dữ liệu trên máy này thuộc về tài khoản khác. Vui lòng xác nhận trước khi đồng bộ.",
          };
        }
      }

      // ================= 1. PULL REMOTE CHANGES =================
      const cursor = force ? undefined : meta.lastCursor ?? undefined;
      const pullResult = await adapter.pull(cursor);
      const remoteChanges = pullResult.changes;

      if (remoteChanges.length > 0) {
        for (const change of remoteChanges) {
          if (!isSyncableStore(change.store)) continue;

          const queueId = `${change.store}:${change.id}`;
          const pendingItem = await this.persistence.get<SyncQueueItem>("syncQueue", queueId);
          const localRecord = await this.persistence.get<StoredRecord>(change.store, change.id);

          if (change.deleted) {
            // Remote deleted
            if (pendingItem && !pendingItem.deleted) {
              // Local was edited while remote was deleted -> conflict
              conflictsCount++;
              await this.recordConflict(change.store, change.id, localRecord, undefined, "last-write-wins");
            }
            await this.persistence.delete(change.store, change.id);
            if (pendingItem) {
              await this.persistence.delete("syncQueue", queueId);
            }
            pulledCount++;
          } else if (change.record) {
            // Remote updated
            if (pendingItem) {
              // Conflict: both local and remote changed since last sync
              conflictsCount++;
              const localTime = Date.parse(pendingItem.updatedAt || "0");
              const remoteTime = Date.parse(change.updatedAt || "0");

              await this.recordConflict(change.store, change.id, localRecord, change.record, "last-write-wins");

              if (remoteTime >= localTime) {
                // Remote wins
                await this.persistence.put(change.store, change.record);
                await this.persistence.delete("syncQueue", queueId);
              }
              // If localTime > remoteTime, keep pendingItem in syncQueue to push back
            } else {
              // Clean remote merge
              await this.persistence.put(change.store, change.record);
            }
            pulledCount++;
          }
        }
      }

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
        const acknowledgedSet = new Set(pushResult.acknowledgedIds);

        for (const item of pendingQueue) {
          if (acknowledgedSet.has(item.recordId)) {
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
        lastCursor: pullResult.cursor ?? meta.lastCursor ?? now,
        lastSyncAt: now,
        lastSyncStatus: updatedStatus,
        lastSyncError: null,
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

  private async recordConflict(
    store: SyncableStore,
    recordId: string,
    localRecord?: StoredRecord,
    remoteRecord?: StoredRecord,
    resolution: "local" | "remote" | "last-write-wins" = "last-write-wins",
  ): Promise<void> {
    const conflict: SyncConflict = {
      id: `${store}:${recordId}`,
      store,
      recordId,
      localRecord,
      remoteRecord,
      conflictAt: new Date().toISOString(),
      resolution,
    };
    await this.persistence.put("syncConflicts", conflict);
  }
}

let defaultSyncCoordinator: LocalFirstSyncCoordinator | undefined;

export function getSyncCoordinator(): LocalFirstSyncCoordinator {
  defaultSyncCoordinator ??= new LocalFirstSyncCoordinator();
  return defaultSyncCoordinator;
}
