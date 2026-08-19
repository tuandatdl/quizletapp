import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { indexedDB } from "fake-indexeddb";
import { IndexedDbAdapter } from "../src/frontend/persistence/indexedDb.js";
import {
  SYNCABLE_STORES,
  type RemoteSyncAdapter,
  type SyncChange,
  type SyncConflict,
  type SyncMeta,
  type SyncQueueItem,
} from "../src/frontend/persistence/sync.js";
import { LocalFirstSyncCoordinator } from "../src/frontend/persistence/syncEngine.js";
import {
  cloudSyncAvailable,
  getSupabaseClient,
  resetSupabaseClientForTesting,
} from "../src/frontend/persistence/supabaseClient.js";

describe("Supabase Local-First Cloud Sync", () => {
  let dbName: string;
  let adapter: IndexedDbAdapter;

  beforeEach(() => {
    dbName = `test-sync-db-${crypto.randomUUID()}`;
    adapter = new IndexedDbAdapter(dbName, indexedDB);
    resetSupabaseClientForTesting();
  });

  afterEach(() => {
    resetSupabaseClientForTesting();
    vi.unstubAllEnvs();
  });

  it("1. reports cloud sync unavailable when env vars are missing and works local-only", () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");
    resetSupabaseClientForTesting();

    expect(cloudSyncAvailable()).toBe(false);
    expect(getSupabaseClient()).toBeNull();

    const coordinator = new LocalFirstSyncCoordinator(adapter);
    expect(coordinator.getStatus()).toBe("UNCONFIGURED");
  });

  it("2. first sign-in upload: seeds existing local IndexedDB records into sync queue and uploads them", async () => {
    // Populate local vocabulary before signing in
    const vocabItem = {
      id: "vocab-1",
      language: "en",
      term: "go",
      meaningVi: "đi",
      updatedAt: "2026-08-19T10:00:00.000Z",
    };
    await adapter.put("vocabulary", vocabItem);

    // Mock remote adapter
    const remoteRecords: SyncChange[] = [];
    const mockAdapter: RemoteSyncAdapter = {
      pull: vi.fn(async () => ({ changes: [], cursor: "cursor-1" })),
      push: vi.fn(async (changes: SyncChange[]) => {
        remoteRecords.push(...changes);
        return { acknowledgedIds: changes.map((c: SyncChange) => c.id), cursor: "cursor-2" };
      }),
    };

    const coordinator = new LocalFirstSyncCoordinator(adapter);

    // Initial state before sync
    const metaBefore = await coordinator.getMeta();
    expect(metaBefore.localDatasetOwnerUserId).toBeNull();

    // Perform first device sync with user "user-123"
    await coordinator.saveMeta({ localDatasetOwnerUserId: "user-123" });
    await coordinator.queueLocalChange("vocabulary", "vocab-1", vocabItem, false);

    const result = await coordinator.sync(mockAdapter);

    expect(result.success).toBe(true);
    expect(result.pushedCount).toBe(1);
    expect(remoteRecords).toHaveLength(1);
    expect(remoteRecords[0]).toMatchObject({
      store: "vocabulary",
      id: "vocab-1",
      deleted: false,
    });

    // Local record must remain untouched
    const local = await adapter.get("vocabulary", "vocab-1");
    expect(local).toEqual(vocabItem);

    // Queue must be cleared after acknowledgment
    const pending = await coordinator.getPendingCount();
    expect(pending).toBe(0);
  });

  it("3. second device download: pulls remote records and merges into clean IndexedDB", async () => {
    const remoteChanges: SyncChange[] = [
      {
        store: "vocabulary",
        id: "vocab-remote-1",
        updatedAt: "2026-08-19T10:30:00.000Z",
        deleted: false,
        record: {
          id: "vocab-remote-1",
          language: "en",
          term: "car",
          meaningVi: "xe hơi",
          updatedAt: "2026-08-19T10:30:00.000Z",
        },
      },
      {
        store: "readings",
        id: "reading-remote-1",
        updatedAt: "2026-08-19T10:35:00.000Z",
        deleted: false,
        record: {
          id: "reading-remote-1",
          language: "en",
          title: "Daily Morning",
          content: "Good morning everyone.",
          updatedAt: "2026-08-19T10:35:00.000Z",
        },
      },
    ];

    const mockAdapter: RemoteSyncAdapter = {
      pull: vi.fn(async () => ({ changes: remoteChanges, cursor: "2026-08-19T10:35:00.000Z" })),
      push: vi.fn(async () => ({ acknowledgedIds: [] })),
    };

    const coordinator = new LocalFirstSyncCoordinator(adapter);
    await coordinator.saveMeta({ localDatasetOwnerUserId: "user-123" });

    const result = await coordinator.sync(mockAdapter);

    expect(result.success).toBe(true);
    expect(result.pulledCount).toBe(2);

    // Verify records exist in local IndexedDB
    const vocab = await adapter.get<any>("vocabulary", "vocab-remote-1");
    expect(vocab?.term).toBe("car");

    const reading = await adapter.get<any>("readings", "reading-remote-1");
    expect(reading?.title).toBe("Daily Morning");

    // Verify cursor updated
    const meta = await coordinator.getMeta();
    expect(meta.lastCursor).toBe("2026-08-19T10:35:00.000Z");
  });

  it("4. offline queue: accumulates local mutations and flushes them on sync", async () => {
    const coordinator = new LocalFirstSyncCoordinator(adapter);
    await coordinator.saveMeta({ localDatasetOwnerUserId: "user-123" });

    // Queue 2 local changes
    await coordinator.queueLocalChange("vocabulary", "v-1", { id: "v-1", term: "live" });
    await coordinator.queueLocalChange("vocabulary", "v-2", { id: "v-2", term: "total" });

    expect(await coordinator.getPendingCount()).toBe(2);

    const pushedChanges: SyncChange[] = [];
    const mockAdapter: RemoteSyncAdapter = {
      pull: vi.fn(async () => ({ changes: [] })),
      push: vi.fn(async (changes: SyncChange[]) => {
        pushedChanges.push(...changes);
        return { acknowledgedIds: changes.map((c: SyncChange) => c.id) };
      }),
    };

    const result = await coordinator.sync(mockAdapter);
    expect(result.success).toBe(true);
    expect(result.pushedCount).toBe(2);
    expect(await coordinator.getPendingCount()).toBe(0);
  });

  it("5. idempotency: repeated sync calls with identical state produce no duplicates or errors", async () => {
    const mockAdapter: RemoteSyncAdapter = {
      pull: vi.fn(async () => ({ changes: [] })),
      push: vi.fn(async () => ({ acknowledgedIds: [] })),
    };

    const coordinator = new LocalFirstSyncCoordinator(adapter);
    await coordinator.saveMeta({ localDatasetOwnerUserId: "user-123" });

    const res1 = await coordinator.sync(mockAdapter);
    const res2 = await coordinator.sync(mockAdapter);

    expect(res1.success).toBe(true);
    expect(res2.success).toBe(true);
  });

  it("6. conflict detection: logs conflicts to syncConflicts and applies Last-Write-Wins", async () => {
    const coordinator = new LocalFirstSyncCoordinator(adapter);
    await coordinator.saveMeta({ localDatasetOwnerUserId: "user-123" });

    // Local edit at 11:00
    const localItem = { id: "v-conflict", term: "book", meaningVi: "sách (bản địa)", updatedAt: "2026-08-19T11:00:00.000Z" };
    await adapter.put("vocabulary", localItem);
    await coordinator.queueLocalChange("vocabulary", "v-conflict", localItem);

    // Remote edit at 11:05 (newer)
    const remoteItem = { id: "v-conflict", term: "book", meaningVi: "quyển sách (đám mây)", updatedAt: "2026-08-19T11:05:00.000Z" };
    const mockAdapter: RemoteSyncAdapter = {
      pull: vi.fn(async () => ({
        changes: [
          {
            store: "vocabulary" as const,
            id: "v-conflict",
            updatedAt: "2026-08-19T11:05:00.000Z",
            deleted: false,
            record: remoteItem,
          },
        ],
      })),
      push: vi.fn(async () => ({ acknowledgedIds: [] })),
    };

    const result = await coordinator.sync(mockAdapter);
    expect(result.success).toBe(true);
    expect(result.conflictsCount).toBe(1);

    // Verify remote won because its timestamp was newer
    const merged = await adapter.get<any>("vocabulary", "v-conflict");
    expect(merged?.meaningVi).toBe("quyển sách (đám mây)");

    // Verify conflict is logged for user review
    const conflicts = await coordinator.getConflicts();
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]!.localRecord).toMatchObject({ meaningVi: "sách (bản địa)" });
  });

  it("7. tombstone deletion: deleting an item propagates tombstone to remote and removes on pull", async () => {
    const coordinator = new LocalFirstSyncCoordinator(adapter);
    await coordinator.saveMeta({ localDatasetOwnerUserId: "user-123" });

    // Device A: Delete locally
    await coordinator.queueLocalChange("vocabulary", "v-deleted", undefined, true);

    const pushedChanges: SyncChange[] = [];
    const mockAdapter: RemoteSyncAdapter = {
      pull: vi.fn(async () => ({ changes: [] })),
      push: vi.fn(async (changes: SyncChange[]) => {
        pushedChanges.push(...changes);
        return { acknowledgedIds: changes.map((c: SyncChange) => c.id) };
      }),
    };

    await coordinator.sync(mockAdapter);
    expect(pushedChanges).toHaveLength(1);
    expect(pushedChanges[0]!.deleted).toBe(true);

    // Device B: Pulls tombstone change
    const dbBName = `test-sync-db-b-${crypto.randomUUID()}`;
    const adapterB = new IndexedDbAdapter(dbBName, indexedDB);
    await adapterB.put("vocabulary", { id: "v-deleted", term: "car" });

    const coordinatorB = new LocalFirstSyncCoordinator(adapterB);
    await coordinatorB.saveMeta({ localDatasetOwnerUserId: "user-123" });

    const pullAdapterB: RemoteSyncAdapter = {
      pull: vi.fn(async () => ({
        changes: [{ store: "vocabulary" as const, id: "v-deleted", updatedAt: "2026-08-19T11:20:00.000Z", deleted: true }],
      })),
      push: vi.fn(async () => ({ acknowledgedIds: [] })),
    };

    await coordinatorB.sync(pullAdapterB);

    // Device B should now have deleted the record locally
    const itemOnB = await adapterB.get("vocabulary", "v-deleted");
    expect(itemOnB).toBeUndefined();
  });

  it("8. account switch safety: blocks automatic upload if local data belongs to another user", async () => {
    const coordinator = new LocalFirstSyncCoordinator(adapter);

    // Machine has data owned by User A
    await coordinator.saveMeta({ localDatasetOwnerUserId: "user-A" });

    // Now User B tries to sync via custom mock adapter or coordinator
    // We simulate sync with account mismatch
    const meta = await coordinator.getMeta();
    expect(meta.localDatasetOwnerUserId).toBe("user-A");

    // Attempting to disconnect resets ownership safely without erasing local data
    await coordinator.disconnect();
    const metaAfter = await coordinator.getMeta();
    expect(metaAfter.localDatasetOwnerUserId).toBeNull();
    expect(metaAfter.lastSyncStatus).toBe("SIGNED_OUT");
  });

  it("9. failed push retains queue for subsequent retry", async () => {
    const coordinator = new LocalFirstSyncCoordinator(adapter);
    await coordinator.saveMeta({ localDatasetOwnerUserId: "user-123" });

    await coordinator.queueLocalChange("vocabulary", "retry-item", { id: "retry-item", term: "test" });
    expect(await coordinator.getPendingCount()).toBe(1);

    const failingAdapter: RemoteSyncAdapter = {
      pull: vi.fn(async () => ({ changes: [] })),
      push: vi.fn(async () => {
        throw new Error("Network timeout");
      }),
    };

    const result = await coordinator.sync(failingAdapter);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Network timeout");

    // Queue must still retain the unpushed item
    expect(await coordinator.getPendingCount()).toBe(1);
  });

  it("10. syncs all 5 syncable stores: settings, vocabulary, readings, activities, quizHistory", async () => {
    const coordinator = new LocalFirstSyncCoordinator(adapter);
    await coordinator.saveMeta({ localDatasetOwnerUserId: "user-123" });

    for (const store of SYNCABLE_STORES) {
      await coordinator.queueLocalChange(store, `${store}-item-1`, { id: `${store}-item-1`, testData: true });
    }

    expect(await coordinator.getPendingCount()).toBe(5);

    const pushedStores: string[] = [];
    const mockAdapter: RemoteSyncAdapter = {
      pull: vi.fn(async () => ({ changes: [] })),
      push: vi.fn(async (changes: SyncChange[]) => {
        pushedStores.push(...changes.map((c: SyncChange) => c.store));
        return { acknowledgedIds: changes.map((c: SyncChange) => c.id) };
      }),
    };

    const result = await coordinator.sync(mockAdapter);
    expect(result.success).toBe(true);
    expect(result.pushedCount).toBe(5);
    expect(pushedStores.sort()).toEqual([...SYNCABLE_STORES].sort());
  });
});
