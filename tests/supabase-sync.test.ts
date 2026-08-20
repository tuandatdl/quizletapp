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
import { DEFAULT_LOCAL_SETTINGS, isDefaultLocalSettingsRecord, LOCAL_SETTINGS_RECORD_ID } from "../src/frontend/persistence/settingsDefaults.js";
import { isChangeSeqCursor, SupabaseRemoteSyncAdapter } from "../src/frontend/persistence/supabaseAdapter.js";
import {
  cloudSyncAvailable,
  getSupabaseClient,
  resetSupabaseClientForTesting,
  isAuthCallbackUrl,
  handleAuthRedirect,
} from "../src/frontend/persistence/supabaseClient.js";

const acknowledgedKeysFor = (changes: SyncChange[]) => changes.map((change) => `${change.store}:${change.id}`);

const remoteRow = (store: string, recordId: string, payload: Record<string, unknown>, changeSeq = "1") => ({
  store,
  record_id: recordId,
  payload,
  revision: 1,
  change_seq: changeSeq,
  updated_at: "2026-08-20T00:00:00.000Z",
  deleted_at: null,
});

function mockSignedInSupabase(remoteRows: Record<string, unknown>[], userId = "user-cloud") {
  const query: Record<string, any> = {};
  query.select = vi.fn(() => query);
  query.eq = vi.fn(() => query);
  query.order = vi.fn(() => query);
  query.limit = vi.fn(() => query);
  query.gt = vi.fn(() => query);
  query.then = (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
    Promise.resolve({ data: remoteRows, error: null }).then(resolve, reject);

  const upsert = vi.fn((rows: Array<{ store: string; record_id: string }>) => ({
    select: vi.fn(async () => ({
      data: rows.map((row) => ({ store: row.store, record_id: row.record_id })),
      error: null,
    })),
  }));
  query.upsert = upsert;

  return {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: { user: { id: userId } } }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => query),
    upsert,
  };
}

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
      pull: vi.fn(async () => ({ changes: [], cursor: "1" })),
      push: vi.fn(async (changes: SyncChange[]) => {
        remoteRecords.push(...changes);
        return { acknowledgedKeys: acknowledgedKeysFor(changes) };
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
      pull: vi.fn(async () => ({ changes: remoteChanges, cursor: "2" })),
      push: vi.fn(async () => ({ acknowledgedKeys: [] })),
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
    expect(meta.lastCursor).toBe("2");
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
        return { acknowledgedKeys: acknowledgedKeysFor(changes) };
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
      push: vi.fn(async () => ({ acknowledgedKeys: [] })),
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

    // The local device clock is deliberately later. Conflict choice must still
    // be deterministic from server order, not a browser timestamp.
    const remoteItem = { id: "v-conflict", term: "book", meaningVi: "quyển sách (đám mây)", updatedAt: "2026-08-19T10:05:00.000Z" };
    const mockAdapter: RemoteSyncAdapter = {
      pull: vi.fn(async () => ({
        changes: [
          {
            store: "vocabulary" as const,
            id: "v-conflict",
            updatedAt: "2026-08-19T10:05:00.000Z",
            deleted: false,
            record: remoteItem,
          },
        ],
      })),
      push: vi.fn(async () => ({ acknowledgedKeys: [] })),
    };

    const result = await coordinator.sync(mockAdapter);
    expect(result.success).toBe(true);
    expect(result.conflictsCount).toBe(1);

    // Verify remote wins deterministically despite the newer local clock.
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
        return { acknowledgedKeys: acknowledgedKeysFor(changes) };
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
      push: vi.fn(async () => ({ acknowledgedKeys: [] })),
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

    // Sign-out preserves ownership so a later different account cannot seed
    // this local dataset as though the browser were a fresh device.
    await coordinator.disconnect();
    const metaAfter = await coordinator.getMeta();
    expect(metaAfter.localDatasetOwnerUserId).toBe("user-A");
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

  it("10. syncs every syncable store including collections", async () => {
    const coordinator = new LocalFirstSyncCoordinator(adapter);
    await coordinator.saveMeta({ localDatasetOwnerUserId: "user-123" });

    for (const store of SYNCABLE_STORES) {
      await coordinator.queueLocalChange(store, `${store}-item-1`, { id: `${store}-item-1`, testData: true });
    }

    expect(await coordinator.getPendingCount()).toBe(SYNCABLE_STORES.length);

    const pushedStores: string[] = [];
    const mockAdapter: RemoteSyncAdapter = {
      pull: vi.fn(async () => ({ changes: [] })),
      push: vi.fn(async (changes: SyncChange[]) => {
        pushedStores.push(...changes.map((c: SyncChange) => c.store));
        return { acknowledgedKeys: acknowledgedKeysFor(changes) };
      }),
    };

    const result = await coordinator.sync(mockAdapter);
    expect(result.success).toBe(true);
    expect(result.pushedCount).toBe(SYNCABLE_STORES.length);
    expect(pushedStores.sort()).toEqual([...SYNCABLE_STORES].sort());
  });

  it("11. drains 550 server-sequenced changes with the same timestamp without skips", async () => {
    const allChanges: SyncChange[] = Array.from({ length: 550 }, (_, index) => ({
      store: "vocabulary" as const,
      id: `bulk-${index + 1}`,
      changeSeq: String(index + 1),
      updatedAt: "2026-08-20T00:00:00.000Z",
      record: { id: `bulk-${index + 1}`, term: `term-${index + 1}` },
    }));
    const pull = vi.fn(async (cursor?: string) => {
      const offset = cursor ? Number(cursor) : 0;
      const changes = allChanges.slice(offset, offset + 200);
      const next = offset + changes.length;
      return { changes, cursor: changes.length ? String(next) : cursor, hasMore: next < allChanges.length };
    });
    const mockAdapter: RemoteSyncAdapter = {
      pull,
      push: vi.fn(async () => ({ acknowledgedKeys: [] })),
    };
    const coordinator = new LocalFirstSyncCoordinator(adapter);
    await coordinator.saveMeta({ localDatasetOwnerUserId: "user-123" });

    const result = await coordinator.sync(mockAdapter);

    expect(result).toMatchObject({ success: true, pulledCount: 550 });
    expect(pull.mock.calls.map(([cursor]) => cursor)).toEqual([undefined, "200", "400"]);
    expect((await adapter.getAll("vocabulary"))).toHaveLength(550);
    expect((await coordinator.getMeta()).lastCursor).toBe("550");
  });

  it("12. acknowledges queue items by store and record identity", async () => {
    const coordinator = new LocalFirstSyncCoordinator(adapter);
    await coordinator.saveMeta({ localDatasetOwnerUserId: "user-123" });
    await coordinator.queueLocalChange("vocabulary", "shared", { id: "shared", term: "vocabulary" });
    await coordinator.queueLocalChange("readings", "shared", { id: "shared", title: "reading" });

    const mockAdapter: RemoteSyncAdapter = {
      pull: vi.fn(async () => ({ changes: [] })),
      push: vi.fn(async () => ({ acknowledgedKeys: ["vocabulary:shared"] })),
    };

    const result = await coordinator.sync(mockAdapter);
    expect(result).toMatchObject({ success: true, pushedCount: 1 });
    expect(await coordinator.getPendingCount()).toBe(1);
    expect(await adapter.get("syncQueue", "readings:shared")).toBeDefined();
  });

  it("13. rejects a non-advancing paginated response without losing queued writes", async () => {
    const coordinator = new LocalFirstSyncCoordinator(adapter);
    await coordinator.saveMeta({ localDatasetOwnerUserId: "user-123", lastCursor: "15" });
    await coordinator.queueLocalChange("vocabulary", "safe-retry", { id: "safe-retry", term: "retry" });
    const mockAdapter: RemoteSyncAdapter = {
      pull: vi.fn(async () => ({ changes: [], cursor: "15", hasMore: true })),
      push: vi.fn(async () => ({ acknowledgedKeys: [] })),
    };

    const result = await coordinator.sync(mockAdapter);
    expect(result.success).toBe(false);
    expect(result.error).toContain("không tiến được cursor");
    expect(await coordinator.getPendingCount()).toBe(1);
    expect((await coordinator.getMeta()).lastCursor).toBe("15");
  });

  it("14. drains 501 changes across a short final page", async () => {
    const allChanges: SyncChange[] = Array.from({ length: 501 }, (_, index) => ({
      store: "readings" as const,
      id: `reading-${index + 1}`,
      changeSeq: String(index + 1),
      updatedAt: "2026-08-20T00:00:00.000Z",
      record: { id: `reading-${index + 1}`, title: `Reading ${index + 1}` },
    }));
    const pull = vi.fn(async (cursor?: string) => {
      const offset = cursor ? Number(cursor) : 0;
      const changes = allChanges.slice(offset, offset + 200);
      const next = offset + changes.length;
      return { changes, cursor: String(next), hasMore: next < allChanges.length };
    });
    const coordinator = new LocalFirstSyncCoordinator(adapter);
    await coordinator.saveMeta({ localDatasetOwnerUserId: "user-123" });

    const result = await coordinator.sync({ pull, push: vi.fn(async () => ({ acknowledgedKeys: [] })) });

    expect(result).toMatchObject({ success: true, pulledCount: 501 });
    expect(pull).toHaveBeenCalledTimes(3);
    expect((await adapter.getAll("readings"))).toHaveLength(501);
  });

  it("15. clean second device downloads nonempty cloud data before any seed upload", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "sb_test_key");
    const supabase = mockSignedInSupabase([
      {
        store: "vocabulary",
        record_id: "cloud-only",
        payload: { id: "cloud-only", term: "cloud" },
        revision: 3,
        change_seq: "25",
        updated_at: "2026-08-20T00:00:00.000Z",
        deleted_at: null,
      },
    ]);
    resetSupabaseClientForTesting(supabase as any);
    const coordinator = new LocalFirstSyncCoordinator(adapter);

    const result = await coordinator.sync();

    expect(result).toMatchObject({ success: true, pulledCount: 1, pushedCount: 0 });
    expect(await adapter.get("vocabulary", "cloud-only")).toMatchObject({ term: "cloud" });
    expect((await coordinator.getMeta()).localDatasetOwnerUserId).toBe("user-cloud");
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });

  it("16. blocks an unowned browser with local data from mixing with a nonempty cloud account", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "sb_test_key");
    await adapter.put("vocabulary", { id: "local-only", term: "local" });
    const supabase = mockSignedInSupabase([
      {
        store: "vocabulary",
        record_id: "cloud-only",
        payload: { id: "cloud-only", term: "cloud" },
        revision: 1,
        change_seq: "1",
        updated_at: "2026-08-20T00:00:00.000Z",
        deleted_at: null,
      },
    ]);
    resetSupabaseClientForTesting(supabase as any);
    const coordinator = new LocalFirstSyncCoordinator(adapter);

    const result = await coordinator.sync();

    expect(result.success).toBe(false);
    expect(result.error).toContain("dữ liệu cục bộ");
    expect(await adapter.get("vocabulary", "local-only")).toBeDefined();
    expect(await adapter.get("vocabulary", "cloud-only")).toBeUndefined();
    expect((await coordinator.getMeta()).localDatasetOwnerUserId).toBeNull();
  });

  it("16a. treats generated default settings as app state and pulls remote settings on first login", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "sb_test_key");
    const localDefaults = { id: LOCAL_SETTINGS_RECORD_ID, ...DEFAULT_LOCAL_SETTINGS };
    await adapter.put("settings", localDefaults);
    expect(isDefaultLocalSettingsRecord(localDefaults)).toBe(true);
    expect(isDefaultLocalSettingsRecord({ ...localDefaults, updatedAt: "2026-08-20T00:00:00.000Z" })).toBe(true);
    expect(isDefaultLocalSettingsRecord({ ...localDefaults, theme: "dark" })).toBe(false);
    const remoteSettings = { id: LOCAL_SETTINGS_RECORD_ID, ...DEFAULT_LOCAL_SETTINGS, themePreference: "dark" };
    const supabase = mockSignedInSupabase([remoteRow("settings", LOCAL_SETTINGS_RECORD_ID, remoteSettings, "12")]);
    resetSupabaseClientForTesting(supabase as any);
    const coordinator = new LocalFirstSyncCoordinator(adapter);

    const result = await coordinator.sync();

    expect(result).toMatchObject({ success: true, pulledCount: 1, pushedCount: 0, conflictsCount: 0 });
    expect(coordinator.getStatus()).toBe("IDLE");
    expect(await adapter.get("settings", LOCAL_SETTINGS_RECORD_ID)).toEqual(remoteSettings);
    expect((await coordinator.getMeta()).localDatasetOwnerUserId).toBe("user-cloud");
  });

  it("16b. allows default settings only to pull remote vocabulary without mixing a local dataset", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "sb_test_key");
    await adapter.put("settings", { id: LOCAL_SETTINGS_RECORD_ID, ...DEFAULT_LOCAL_SETTINGS });
    const cloudVocabulary = { id: "cloud-first-login", term: "cloud", meaningVi: "đám mây" };
    const supabase = mockSignedInSupabase([remoteRow("vocabulary", cloudVocabulary.id, cloudVocabulary, "13")]);
    resetSupabaseClientForTesting(supabase as any);
    const coordinator = new LocalFirstSyncCoordinator(adapter);

    const result = await coordinator.sync();

    expect(result).toMatchObject({ success: true, pulledCount: 1, pushedCount: 0 });
    expect(await adapter.get("vocabulary", cloudVocabulary.id)).toEqual(cloudVocabulary);
    expect((await coordinator.getMeta()).localDatasetOwnerUserId).toBe("user-cloud");
  });

  it.each([
    ["readings", { id: "local-reading", title: "Local reading" }],
    ["collections", { id: "local-collection", name: "Local collection" }],
    ["activities", { id: "local-activity", studySeconds: 60 }],
    ["quizHistory", { id: "local-quiz-history", score: 1 }],
  ] as const)("16c. blocks unknown local %s from mixing with remote account data", async (store, localRecord) => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "sb_test_key");
    await adapter.put(store, localRecord);
    const cloudVocabulary = { id: "cloud-protected", term: "cloud" };
    const supabase = mockSignedInSupabase([remoteRow("vocabulary", cloudVocabulary.id, cloudVocabulary)]);
    resetSupabaseClientForTesting(supabase as any);
    const coordinator = new LocalFirstSyncCoordinator(adapter);

    const result = await coordinator.sync();

    expect(result.success).toBe(false);
    expect(coordinator.getStatus()).toBe("ACCOUNT_MISMATCH");
    expect(await adapter.get(store, localRecord.id)).toEqual(localRecord);
    expect(await adapter.get("vocabulary", cloudVocabulary.id)).toBeUndefined();
    expect((await coordinator.getMeta()).localDatasetOwnerUserId).toBeNull();
  });

  it("16d. treats a pending learning-content tombstone as meaningful local ownership evidence", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "sb_test_key");
    await adapter.put("syncQueue", {
      id: "vocabulary:deleted-local",
      store: "vocabulary",
      recordId: "deleted-local",
      updatedAt: "2026-08-20T00:00:00.000Z",
      deleted: true,
    });
    const cloudVocabulary = { id: "cloud-protected", term: "cloud" };
    const supabase = mockSignedInSupabase([remoteRow("vocabulary", cloudVocabulary.id, cloudVocabulary)]);
    resetSupabaseClientForTesting(supabase as any);
    const coordinator = new LocalFirstSyncCoordinator(adapter);

    const result = await coordinator.sync();

    expect(result.success).toBe(false);
    expect(coordinator.getStatus()).toBe("ACCOUNT_MISMATCH");
    expect(await adapter.get("syncQueue", "vocabulary:deleted-local")).toBeDefined();
    expect(await adapter.get("vocabulary", cloudVocabulary.id)).toBeUndefined();
  });

  it("16e. preserves unqueued customized settings separately while allowing the first account pull", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "sb_test_key");
    const customSettings = { id: LOCAL_SETTINGS_RECORD_ID, ...DEFAULT_LOCAL_SETTINGS, themePreference: "dark" };
    await adapter.put("settings", customSettings);
    expect(isDefaultLocalSettingsRecord(customSettings)).toBe(false);
    const cloudVocabulary = { id: "cloud-with-custom-settings", term: "cloud" };
    const supabase = mockSignedInSupabase([remoteRow("vocabulary", cloudVocabulary.id, cloudVocabulary)]);
    resetSupabaseClientForTesting(supabase as any);
    const coordinator = new LocalFirstSyncCoordinator(adapter);

    const result = await coordinator.sync();

    expect(result).toMatchObject({ success: true, pulledCount: 1, pushedCount: 1, conflictsCount: 0 });
    expect(await adapter.get("settings", LOCAL_SETTINGS_RECORD_ID)).toEqual(customSettings);
    expect(await adapter.get("vocabulary", cloudVocabulary.id)).toEqual(cloudVocabulary);
    expect(supabase.upsert).toHaveBeenCalledOnce();
    expect((await coordinator.getMeta()).localDatasetOwnerUserId).toBe("user-cloud");
  });

  it("16f. records a conflict instead of silently deleting imported custom settings", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "sb_test_key");
    const customSettings = { id: LOCAL_SETTINGS_RECORD_ID, ...DEFAULT_LOCAL_SETTINGS, dailyGoal: 50 };
    const remoteSettings = { id: LOCAL_SETTINGS_RECORD_ID, ...DEFAULT_LOCAL_SETTINGS, dailyGoal: 30 };
    await adapter.put("settings", customSettings);
    const supabase = mockSignedInSupabase([remoteRow("settings", LOCAL_SETTINGS_RECORD_ID, remoteSettings)]);
    resetSupabaseClientForTesting(supabase as any);
    const coordinator = new LocalFirstSyncCoordinator(adapter);

    const result = await coordinator.sync();

    expect(result).toMatchObject({ success: true, pulledCount: 1, pushedCount: 0, conflictsCount: 1 });
    expect(await adapter.get("settings", LOCAL_SETTINGS_RECORD_ID)).toEqual(remoteSettings);
    expect(await coordinator.getConflicts()).toEqual([
      expect.objectContaining({ store: "settings", recordId: LOCAL_SETTINGS_RECORD_ID, localRecord: customSettings, remoteRecord: remoteSettings }),
    ]);
    expect((await coordinator.getMeta()).localDatasetOwnerUserId).toBe("user-cloud");
  });

  it("16g. existing USER_A ownership blocks USER_B even when every visible content store is empty", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "sb_test_key");
    const supabase = mockSignedInSupabase([remoteRow("vocabulary", "user-b-cloud", { id: "user-b-cloud", term: "private" })], "user-B");
    resetSupabaseClientForTesting(supabase as any);
    const coordinator = new LocalFirstSyncCoordinator(adapter);
    await adapter.put("settings", { id: LOCAL_SETTINGS_RECORD_ID, ...DEFAULT_LOCAL_SETTINGS });
    await coordinator.saveMeta({ localDatasetOwnerUserId: "user-A" });

    const result = await coordinator.sync();

    expect(result.success).toBe(false);
    expect(coordinator.getStatus()).toBe("ACCOUNT_MISMATCH");
    expect(supabase.from).not.toHaveBeenCalled();
    expect(await adapter.get("vocabulary", "user-b-cloud")).toBeUndefined();
    expect((await coordinator.getMeta()).localDatasetOwnerUserId).toBe("user-A");
  });

  it("17. lets the database own cloud write metadata and returns store-qualified acknowledgements", async () => {
    const select = vi.fn(async () => ({ data: [{ store: "vocabulary", record_id: "same" }], error: null }));
    const upsert = vi.fn(() => ({ select }));
    const remote = new SupabaseRemoteSyncAdapter({ from: vi.fn(() => ({ upsert })) } as any, { id: "user-123" } as any);

    const result = await remote.push([{
      store: "vocabulary",
      id: "same",
      updatedAt: "2099-01-01T00:00:00.000Z",
      record: { id: "same", term: "server owns timestamp" },
    }]);

    expect(upsert).toHaveBeenCalledOnce();
    const submitted = (upsert.mock.calls as unknown as Array<[Array<Record<string, unknown>>]>)[0]![0][0]!;
    expect(submitted).toEqual({
      user_id: "user-123",
      store: "vocabulary",
      record_id: "same",
      payload: { id: "same", term: "server owns timestamp" },
    });
    expect(result.acknowledgedKeys).toEqual(["vocabulary:same"]);
  });

  it("18. seeds a first device only after its complete cloud pull is empty", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "sb_test_key");
    await adapter.put("vocabulary", { id: "first-device", term: "only local" });
    const supabase = mockSignedInSupabase([]);
    resetSupabaseClientForTesting(supabase as any);
    const coordinator = new LocalFirstSyncCoordinator(adapter);

    const result = await coordinator.sync();

    expect(result).toMatchObject({ success: true, pulledCount: 0, pushedCount: 1 });
    expect(supabase.upsert).toHaveBeenCalledOnce();
    expect((await coordinator.getMeta()).localDatasetOwnerUserId).toBe("user-cloud");
  });

  it("19. detects only digit-only server cursors and translates a legacy timestamp before pull", async () => {
    expect(isChangeSeqCursor("0")).toBe(true);
    expect(isChangeSeqCursor("2048")).toBe(true);
    expect(isChangeSeqCursor("2026-08-19T18:20:17.744+00:00")).toBe(false);
    expect(isChangeSeqCursor("42.0")).toBe(false);
    expect(isChangeSeqCursor("")).toBe(false);

    const coordinator = new LocalFirstSyncCoordinator(adapter);
    await coordinator.saveMeta({
      localDatasetOwnerUserId: "user-123",
      lastCursor: "2026-08-19T18:20:17.744+00:00",
      syncDataSchemaVersion: 2,
    });
    const translateLegacyCursor = vi.fn(async () => "2048");
    const pull = vi.fn(async () => ({ changes: [] }));

    const result = await coordinator.sync({
      translateLegacyCursor,
      pull,
      push: vi.fn(async () => ({ acknowledgedKeys: [] })),
    });

    expect(result.success).toBe(true);
    expect(translateLegacyCursor).toHaveBeenCalledWith("2026-08-19T18:20:17.744+00:00");
    expect(pull).toHaveBeenCalledWith("2048");
    expect((await coordinator.getMeta()).lastCursor).toBe("2048");
  });

  it("20. translates a legacy timestamp with a user-scoped max change_seq query", async () => {
    const query: Record<string, any> = {};
    query.select = vi.fn(() => query);
    query.eq = vi.fn(() => query);
    query.lte = vi.fn(() => query);
    query.order = vi.fn(() => query);
    query.limit = vi.fn(() => query);
    query.then = (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve({ data: [{ change_seq: "2048" }], error: null }).then(resolve, reject);
    const client = { from: vi.fn(() => query) };
    const remote = new SupabaseRemoteSyncAdapter(client as any, { id: "user-123" } as any);

    await expect(remote.translateLegacyCursor("2026-08-19T18:20:17.744+00:00")).resolves.toBe("2048");
    expect(query.eq).toHaveBeenCalledWith("user_id", "user-123");
    expect(query.lte).toHaveBeenCalledWith("updated_at", "2026-08-19T18:20:17.744+00:00");
    expect(query.order).toHaveBeenCalledWith("change_seq", { ascending: false });
    expect(query.limit).toHaveBeenCalledWith(1);
  });

  it("21. never sends a legacy timestamp to the change_seq gt query", async () => {
    const from = vi.fn();
    const remote = new SupabaseRemoteSyncAdapter({ from } as any, { id: "user-123" } as any);

    await expect(remote.pull("2026-08-19T18:20:17.744+00:00")).rejects.toThrow("Cursor change_seq không hợp lệ");
    expect(from).not.toHaveBeenCalled();
  });

  it("22. uses an upgraded numeric cursor directly on later syncs", async () => {
    const coordinator = new LocalFirstSyncCoordinator(adapter);
    await coordinator.saveMeta({ localDatasetOwnerUserId: "user-123", lastCursor: "2048", syncDataSchemaVersion: 2 });
    const pull = vi.fn(async () => ({ changes: [] }));
    const translateLegacyCursor = vi.fn(async () => "should-not-run");

    const result = await coordinator.sync({
      translateLegacyCursor,
      pull,
      push: vi.fn(async () => ({ acknowledgedKeys: [] })),
    });

    expect(result.success).toBe(true);
    expect(translateLegacyCursor).not.toHaveBeenCalled();
    expect(pull).toHaveBeenCalledWith("2048");
  });

  it("23. does not create a false conflict for a settings record before the migrated boundary", async () => {
    const coordinator = new LocalFirstSyncCoordinator(adapter);
    const localSettings = { id: "local-settings", theme: "dark" };
    await adapter.put("settings", localSettings);
    await coordinator.saveMeta({
      localDatasetOwnerUserId: "user-123",
      lastCursor: "2026-08-19T18:20:17.744+00:00",
      syncDataSchemaVersion: 2,
    });
    const pull = vi.fn(async (cursor?: string) => {
      expect(cursor).toBe("42");
      // The already-seen settings row at sequence 42 is excluded by the
      // translated boundary, so it is not replayed as a concurrent change.
      return { changes: [] };
    });

    const result = await coordinator.sync({
      translateLegacyCursor: vi.fn(async () => "42"),
      pull,
      push: vi.fn(async () => ({ acknowledgedKeys: [] })),
    });

    expect(result).toMatchObject({ success: true, conflictsCount: 0 });
    expect(await coordinator.getConflicts()).toHaveLength(0);
    expect(await adapter.get("settings", "local-settings")).toEqual(localSettings);
  });

  it("24. preserves and pushes a pending new vocabulary record after cursor migration", async () => {
    const coordinator = new LocalFirstSyncCoordinator(adapter);
    const localVocabulary = { id: "new-local", term: "new local word" };
    await adapter.put("vocabulary", localVocabulary);
    await coordinator.saveMeta({
      localDatasetOwnerUserId: "user-123",
      lastCursor: "2026-08-19T18:20:17.744+00:00",
    });
    await coordinator.queueLocalChange("vocabulary", "new-local", localVocabulary);
    const push = vi.fn(async (changes: SyncChange[]) => ({ acknowledgedKeys: acknowledgedKeysFor(changes) }));

    const result = await coordinator.sync({
      translateLegacyCursor: vi.fn(async () => "42"),
      pull: vi.fn(async () => ({ changes: [] })),
      push,
    });

    expect(result).toMatchObject({ success: true, pushedCount: 1 });
    expect(push).toHaveBeenCalledWith([expect.objectContaining({ id: "new-local", store: "vocabulary" })]);
    expect(await coordinator.getPendingCount()).toBe(0);
  });

  it("25. fails closed when legacy cursor translation fails", async () => {
    const coordinator = new LocalFirstSyncCoordinator(adapter);
    const localVocabulary = { id: "retry-local", term: "retry" };
    await adapter.put("vocabulary", localVocabulary);
    await coordinator.saveMeta({
      localDatasetOwnerUserId: "user-123",
      lastCursor: "2026-08-19T18:20:17.744+00:00",
    });
    await coordinator.queueLocalChange("vocabulary", "retry-local", localVocabulary);
    const pull = vi.fn(async () => ({ changes: [] }));

    const result = await coordinator.sync({
      translateLegacyCursor: vi.fn(async () => { throw new Error("translation network failure"); }),
      pull,
      push: vi.fn(async () => ({ acknowledgedKeys: [] })),
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("translation network failure");
    expect(pull).not.toHaveBeenCalled();
    expect(await coordinator.getPendingCount()).toBe(1);
    expect(await adapter.get("vocabulary", "retry-local")).toEqual(localVocabulary);
    expect((await coordinator.getMeta()).lastCursor).toBe("2026-08-19T18:20:17.744+00:00");
  });

  it("26. preserves account isolation while a legacy cursor is present", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "sb_test_key");
    const supabase = mockSignedInSupabase([], "user-B");
    resetSupabaseClientForTesting(supabase as any);
    const coordinator = new LocalFirstSyncCoordinator(adapter);
    await coordinator.saveMeta({
      localDatasetOwnerUserId: "user-A",
      lastCursor: "2026-08-19T18:20:17.744+00:00",
    });

    const result = await coordinator.sync();

    expect(result.success).toBe(false);
    expect(result.error).toContain("tài khoản khác");
    expect(supabase.from).not.toHaveBeenCalled();
    expect((await coordinator.getMeta()).lastCursor).toBe("2026-08-19T18:20:17.744+00:00");
  });

  it("27. force sync upgrades a legacy boundary and skips that known remote base", async () => {
    const coordinator = new LocalFirstSyncCoordinator(adapter);
    const localVocabulary = { id: "force-local", term: "keep local edit" };
    await adapter.put("vocabulary", localVocabulary);
    await coordinator.saveMeta({
      localDatasetOwnerUserId: "user-123",
      lastCursor: "2026-08-19T18:20:17.744+00:00",
    });
    await coordinator.queueLocalChange("vocabulary", "force-local", localVocabulary);
    const pull = vi.fn(async (cursor?: string) => ({
      changes: [{
        store: "vocabulary" as const,
        id: "force-local",
        changeSeq: "42",
        updatedAt: "2026-08-19T18:20:00.000Z",
        record: { id: "force-local", term: "old cloud base" },
      }],
      cursor,
    }));
    const push = vi.fn(async (changes: SyncChange[]) => ({ acknowledgedKeys: acknowledgedKeysFor(changes) }));

    const result = await coordinator.sync({
      translateLegacyCursor: vi.fn(async () => "42"),
      pull,
      push,
    }, true);

    expect(result).toMatchObject({ success: true, conflictsCount: 0, pushedCount: 1 });
    expect(pull).toHaveBeenCalledWith(undefined);
    expect(await adapter.get("vocabulary", "force-local")).toEqual(localVocabulary);
    expect(await coordinator.getConflicts()).toHaveLength(0);
    expect((await coordinator.getMeta()).lastCursor).toBe("42");
  });
});

// ─── Regression: Magic Link button must call signInWithEmail without relying on form submit ───
describe("Magic Link button regression", () => {
  afterEach(() => {
    resetSupabaseClientForTesting();
    vi.unstubAllEnvs();
  });

  it("11. signInWithEmail returns error when Supabase is not configured", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");
    resetSupabaseClientForTesting();

    const { CloudAuthService } = await import("../src/frontend/services/cloudAuth.js");
    const service = new CloudAuthService();
    const res = await service.signInWithEmail("test@example.com");
    expect(res.success).toBe(false);
    expect(res.error).toContain("chưa được cấu hình");
  });

  it("12. signInWithEmail validates empty email", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "sb_test_key");
    // Use a mock client that has auth.signInWithOtp
    const mockClient = {
      auth: {
        signInWithOtp: vi.fn(async () => ({ error: null })),
        getSession: vi.fn(async () => ({ data: { session: null } })),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      },
    };
    resetSupabaseClientForTesting(mockClient as any);

    const { CloudAuthService } = await import("../src/frontend/services/cloudAuth.js");
    const service = new CloudAuthService();

    const resEmpty = await service.signInWithEmail("");
    expect(resEmpty.success).toBe(false);

    const resInvalid = await service.signInWithEmail("not-an-email");
    expect(resInvalid.success).toBe(false);
  });

  it("13. signInWithEmail calls signInWithOtp with correct email and returns success", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "sb_test_key");
    const signInWithOtp = vi.fn(async () => ({ error: null }));
    const mockClient = {
      auth: {
        signInWithOtp,
        getSession: vi.fn(async () => ({ data: { session: null } })),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      },
    };
    resetSupabaseClientForTesting(mockClient as any);

    const { CloudAuthService } = await import("../src/frontend/services/cloudAuth.js");
    const service = new CloudAuthService();
    const res = await service.signInWithEmail("trintran5555@gmail.com");

    expect(res.success).toBe(true);
    expect(signInWithOtp).toHaveBeenCalledOnce();
    const callArg = (signInWithOtp.mock.lastCall as unknown[])[0] as { email: string };
    expect(callArg.email).toBe("trintran5555@gmail.com");
  });
});

// ─── Regression: Auth callback routing — HashRouter must never see 404 ───────
describe("Auth callback routing regression", () => {
  afterEach(() => {
    resetSupabaseClientForTesting();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  function mockLocation(href: string) {
    const url = new URL(href);
    vi.stubGlobal("window", {
      location: {
        href,
        search: url.search,
        hash: url.hash,
        pathname: url.pathname,
        replace: vi.fn(),
      },
    });
  }

  it("14. isAuthCallbackUrl detects #access_token= as callback", () => {
    mockLocation("https://tuandatdl.github.io/quizletapp/#access_token=abc&refresh_token=xyz");
    expect(isAuthCallbackUrl()).toBe(true);
  });

  it("15. isAuthCallbackUrl detects ?code= as callback", () => {
    mockLocation("https://tuandatdl.github.io/quizletapp/?code=someCode#/");
    expect(isAuthCallbackUrl()).toBe(true);
  });

  it("16. isAuthCallbackUrl detects #error_description= as callback", () => {
    mockLocation("https://tuandatdl.github.io/quizletapp/#error_description=access+denied");
    expect(isAuthCallbackUrl()).toBe(true);
  });

  it("17. isAuthCallbackUrl returns false for normal #/settings load", () => {
    mockLocation("https://tuandatdl.github.io/quizletapp/#/settings");
    expect(isAuthCallbackUrl()).toBe(false);
  });

  it("18. handleAuthRedirect calls window.location.replace with #/settings on access_token callback", async () => {
    mockLocation("https://tuandatdl.github.io/quizletapp/#access_token=tok&refresh_token=ref&token_type=bearer");

    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "sb_test_key");

    const setSession = vi.fn(async () => ({ data: { session: { user: { email: "t@t.com" } } }, error: null }));
    const mockClient = {
      auth: {
        setSession,
        getSession: vi.fn(async () => ({ data: { session: null } })),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      },
    };
    resetSupabaseClientForTesting(mockClient as any);

    await handleAuthRedirect();

    expect(setSession).toHaveBeenCalledOnce();
    const replaceFn = window.location.replace as ReturnType<typeof vi.fn>;
    expect(replaceFn.mock.calls.length).toBe(1);
    const redirectArg = replaceFn.mock.calls[0][0] as string;
    expect(redirectArg).toContain("#/settings");
    // Must NOT contain raw token params
    expect(redirectArg).not.toContain("access_token");
  });
});
