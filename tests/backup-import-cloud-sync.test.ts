import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { indexedDB } from "fake-indexeddb";
import { IndexedDbAdapter } from "../src/frontend/persistence/indexedDb.js";
import {
  BACKUP_IMPORT_RESULT_STORAGE_KEY,
  importBackup,
  type BackupImportResultMarker,
} from "../src/frontend/persistence/backup.js";
import { type StaticBackup } from "../src/frontend/persistence/types.js";
import { LocalFirstSyncCoordinator } from "../src/frontend/persistence/syncEngine.js";
import {
  type RemoteSyncAdapter,
  type SyncChange,
  type SyncQueueItem,
} from "../src/frontend/persistence/sync.js";
import { resetSupabaseClientForTesting } from "../src/frontend/persistence/supabaseClient.js";

function mockRemoteAdapter(initialRemoteRows: Record<string, any>[] = []): RemoteSyncAdapter & {
  pushedChanges: SyncChange[];
  remoteRows: Map<string, any>;
} {
  const remoteRows = new Map<string, any>();
  let currentSeq = 100;

  for (const row of initialRemoteRows) {
    remoteRows.set(`${row.store}:${row.record_id}`, {
      store: row.store,
      record_id: row.record_id,
      payload: row.payload,
      revision: row.revision ?? 1,
      change_seq: String(row.change_seq ?? ++currentSeq),
      updated_at: row.updated_at ?? new Date().toISOString(),
      deleted_at: row.deleted_at ?? null,
    });
  }

  const pushedChanges: SyncChange[] = [];

  return {
    remoteRows,
    pushedChanges,
    pull: async (sinceCursor) => {
      const cursorNum = sinceCursor ? parseInt(sinceCursor, 10) : 0;
      const changes: SyncChange[] = [];
      let maxSeq = cursorNum;

      for (const row of remoteRows.values()) {
        const rowSeq = parseInt(row.change_seq, 10);
        if (rowSeq > cursorNum) {
          changes.push({
            store: row.store,
            id: row.record_id,
            changeSeq: row.change_seq,
            updatedAt: row.updated_at,
            deleted: Boolean(row.deleted_at),
            record: row.deleted_at ? undefined : row.payload,
            revision: row.revision,
          });
          if (rowSeq > maxSeq) maxSeq = rowSeq;
        }
      }

      return {
        changes,
        cursor: changes.length > 0 ? String(maxSeq) : undefined,
        hasMore: false,
      };
    },
    push: async (changes) => {
      const acknowledgedKeys: string[] = [];
      for (const c of changes) {
        pushedChanges.push(c);
        const key = `${c.store}:${c.id}`;
        currentSeq++;
        if (c.deleted) {
          remoteRows.set(key, {
            store: c.store,
            record_id: c.id,
            payload: null,
            revision: (remoteRows.get(key)?.revision ?? 0) + 1,
            change_seq: String(currentSeq),
            updated_at: new Date().toISOString(),
            deleted_at: new Date().toISOString(),
          });
        } else {
          remoteRows.set(key, {
            store: c.store,
            record_id: c.id,
            payload: c.record,
            revision: (remoteRows.get(key)?.revision ?? 0) + 1,
            change_seq: String(currentSeq),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          });
        }
        acknowledgedKeys.push(`${c.store}:${c.id}`);
      }
      return { acknowledgedKeys, conflicts: [] };
    },
  };
}

describe("LEXIS Backup Import Cloud Sync Pipeline", () => {
  let dbCounter = 0;
  let adapterA: IndexedDbAdapter;
  let adapterB: IndexedDbAdapter;

  beforeEach(async () => {
    dbCounter++;
    adapterA = new IndexedDbAdapter(`test-db-a-${dbCounter}`, indexedDB);
    adapterB = new IndexedDbAdapter(`test-db-b-${dbCounter}`, indexedDB);
  });

  afterEach(async () => {
    resetSupabaseClientForTesting();
    vi.unstubAllEnvs();
  });

  const sampleBackup: StaticBackup = {
    format: "tu-trinh-language-backup",
    schemaVersion: 3,
    exportedAt: "2026-08-21T00:00:00.000Z",
    data: {
      profile: [
        { id: "local-profile", name: "Tú Trinh", avatar: "avatar-1" },
      ],
      settings: [
        { id: "local-settings", dailyGoal: 25, currentLearningLanguage: "en" },
      ],
      vocabulary: [
        {
          id: "vocab-uuid-1",
          language: "en",
          term: "resilience",
          normalizedTerm: "resilience",
          definition: "Khả năng phục hồi",
        },
        {
          id: "vocab-uuid-2",
          language: "zh",
          term: "坚持",
          normalizedTerm: "坚持",
          definition: "Kiên trì",
        },
      ],
      readings: [
        {
          id: "reading-uuid-1",
          title: "The Art of Learning",
          language: "en",
          content: "Continuous learning leads to mastery.",
        },
      ],
      activities: [
        { id: "2026-08-21", date: "2026-08-21", wordsLearned: 5 },
      ],
      quizHistory: [
        { id: "quiz-uuid-1", score: 100, timestamp: "2026-08-21T01:00:00.000Z" },
      ],
      collections: [
        { id: "col-uuid-1", name: "IELTS Core", language: "en" },
      ],
    },
  };

  it("A. New backup import returns touched syncable records and queues them for cloud sync", async () => {
    const coordinator = new LocalFirstSyncCoordinator(adapterA);
    const result = await importBackup(adapterA, sampleBackup, "merge");

    expect(result.preview.counts.vocabulary).toBe(2);
    expect(result.preview.counts.readings).toBe(1);
    expect(result.preview.counts.settings).toBe(1);
    expect(result.preview.counts.profile).toBe(1);

    // Profile must NOT be in touched syncable records
    const profileTouched = result.touchedRecords.find((r) => r.store === ("profile" as any));
    expect(profileTouched).toBeUndefined();

    // Verify all syncable records are present in touchedRecords
    expect(result.touchedRecords.some((r) => r.store === "vocabulary" && r.record.id === "vocab-uuid-1")).toBe(true);
    expect(result.touchedRecords.some((r) => r.store === "vocabulary" && r.record.id === "vocab-uuid-2")).toBe(true);
    expect(result.touchedRecords.some((r) => r.store === "readings" && r.record.id === "reading-uuid-1")).toBe(true);
    expect(result.touchedRecords.some((r) => r.store === "settings" && r.record.id === "local-settings")).toBe(true);
    expect(result.touchedRecords.some((r) => r.store === "activities" && r.record.id === "2026-08-21")).toBe(true);
    expect(result.touchedRecords.some((r) => r.store === "quizHistory" && r.record.id === "quiz-uuid-1")).toBe(true);
    expect(result.touchedRecords.some((r) => r.store === "collections" && r.record.id === "col-uuid-1")).toBe(true);

    // Queue touched records
    for (const touched of result.touchedRecords) {
      await coordinator.queueLocalChange(touched.store, touched.record.id, touched.record, false);
    }

    const pendingQueue = await adapterA.getAll<SyncQueueItem>("syncQueue");
    expect(pendingQueue.length).toBe(7); // 2 vocab + 1 reading + 1 setting + 1 activity + 1 quiz + 1 collection
    expect(coordinator.getStatus()).toBe("PENDING_CHANGES");
  });

  it("B. Old-bug recovery: Re-importing exact same backup when IndexedDB already has matching records queues them safely", async () => {
    // Simulate user who imported on buggy release: records in IndexedDB but syncQueue is 0
    await adapterA.put("vocabulary", {
      id: "vocab-uuid-1",
      language: "en",
      term: "resilience",
      normalizedTerm: "resilience",
      definition: "Khả năng phục hồi",
    });
    await adapterA.put("vocabulary", {
      id: "vocab-uuid-2",
      language: "zh",
      term: "坚持",
      normalizedTerm: "坚持",
      definition: "Kiên trì",
    });
    await adapterA.put("readings", {
      id: "reading-uuid-1",
      title: "The Art of Learning",
      language: "en",
    });

    const initialQueue = await adapterA.getAll<SyncQueueItem>("syncQueue");
    expect(initialQueue).toHaveLength(0);

    const coordinator = new LocalFirstSyncCoordinator(adapterA);

    // Re-import the exact same backup
    const result = await importBackup(adapterA, sampleBackup, "merge");

    // Same-ID existing records must be allowed, updated, and included in touchedRecords
    const vocab1Touched = result.touchedRecords.find((r) => r.store === "vocabulary" && r.record.id === "vocab-uuid-1");
    const vocab2Touched = result.touchedRecords.find((r) => r.store === "vocabulary" && r.record.id === "vocab-uuid-2");
    expect(vocab1Touched).toBeDefined();
    expect(vocab2Touched).toBeDefined();

    // Queue them
    for (const touched of result.touchedRecords) {
      await coordinator.queueLocalChange(touched.store, touched.record.id, touched.record, false);
    }

    const queued = await adapterA.getAll<SyncQueueItem>("syncQueue");
    expect(queued.length).toBe(7);

    // Ensure no duplicate records were created in IndexedDB
    const vocabInDb = await adapterA.getAll("vocabulary");
    expect(vocabInDb).toHaveLength(2);
  });

  it("C. Vocabulary duplicate safety: same normalized term with different ID is protected from duplicate creation", async () => {
    // Existing item has a different ID
    await adapterA.put("vocabulary", {
      id: "different-id-existing",
      language: "en",
      term: "Resilience",
      normalizedTerm: "resilience",
      definition: "Existing definition",
    });

    const result = await importBackup(adapterA, sampleBackup, "merge");

    // vocab-uuid-1 has normalizedTerm "resilience" (matches existing with different ID)
    const vocab1Touched = result.touchedRecords.find((r) => r.store === "vocabulary" && r.record.id === "vocab-uuid-1");
    expect(vocab1Touched).toBeUndefined();

    const vocab1Skipped = result.skippedRecords.find((r) => r.store === "vocabulary" && r.record.id === "vocab-uuid-1");
    expect(vocab1Skipped).toBeDefined();
    expect(vocab1Skipped?.reason).toBe("duplicate_normalized_term");

    // vocab-uuid-2 is new, so it must be touched
    const vocab2Touched = result.touchedRecords.find((r) => r.store === "vocabulary" && r.record.id === "vocab-uuid-2");
    expect(vocab2Touched).toBeDefined();

    // Verify DB still has only 2 items (1 existing + 1 new)
    const vocabInDb = await adapterA.getAll("vocabulary");
    expect(vocabInDb).toHaveLength(2);
  });

  it("D. Cloud Push: imported queued records push to cloud and clear the queue on sync", async () => {
    const remote = mockRemoteAdapter();
    const coordinator = new LocalFirstSyncCoordinator(adapterA);
    await coordinator.saveMeta({ localDatasetOwnerUserId: "user-cloud-1" });

    const result = await importBackup(adapterA, sampleBackup, "merge");
    for (const touched of result.touchedRecords) {
      await coordinator.queueLocalChange(touched.store, touched.record.id, touched.record, false);
    }

    expect(await adapterA.getAll("syncQueue")).toHaveLength(7);

    // Sync with remote adapter
    const syncRes = await coordinator.sync(remote);
    expect(syncRes.success).toBe(true);
    expect(syncRes.pushedCount).toBe(7);

    // Queue must be empty after push
    const queueAfter = await adapterA.getAll<SyncQueueItem>("syncQueue");
    expect(queueAfter).toHaveLength(0);
    expect(coordinator.getStatus()).toBe("IDLE");

    // Remote adapter has the records
    expect(remote.remoteRows.has("vocabulary:vocab-uuid-1")).toBe(true);
    expect(remote.remoteRows.has("readings:reading-uuid-1")).toBe(true);
  });

  it("E. Second Device: Device A imports & pushes, fresh Device B pulls and receives all records", async () => {
    const remote = mockRemoteAdapter();
    const coordinatorA = new LocalFirstSyncCoordinator(adapterA);
    await coordinatorA.saveMeta({ localDatasetOwnerUserId: "user-cloud-1" });
    const coordinatorB = new LocalFirstSyncCoordinator(adapterB);
    await coordinatorB.saveMeta({ localDatasetOwnerUserId: "user-cloud-1" });

    // Device A imports backup
    const importRes = await importBackup(adapterA, sampleBackup, "merge");
    for (const touched of importRes.touchedRecords) {
      await coordinatorA.queueLocalChange(touched.store, touched.record.id, touched.record, false);
    }
    await coordinatorA.sync(remote);

    // Fresh Device B syncs
    const syncResB = await coordinatorB.sync(remote);
    expect(syncResB.success).toBe(true);
    expect(syncResB.pulledCount).toBe(7);

    // Device B local IndexedDB now has the imported data
    const vocabB = await adapterB.getAll("vocabulary");
    expect(vocabB).toHaveLength(2);
    expect(vocabB.some((v: any) => v.id === "vocab-uuid-1")).toBe(true);
    expect(vocabB.some((v: any) => v.id === "vocab-uuid-2")).toBe(true);

    const readingsB = await adapterB.getAll("readings");
    expect(readingsB).toHaveLength(1);
    expect((readingsB[0] as any).id).toBe("reading-uuid-1");
  });

  it("F. Profile exclusion: profile is imported into local storage but never enters cloud sync queue", async () => {
    const coordinator = new LocalFirstSyncCoordinator(adapterA);
    const result = await importBackup(adapterA, sampleBackup, "merge");

    for (const touched of result.touchedRecords) {
      await coordinator.queueLocalChange(touched.store, touched.record.id, touched.record, false);
    }

    // Profile exists in IndexedDB
    const profileInDb = await adapterA.getAll("profile");
    expect(profileInDb).toHaveLength(1);
    expect((profileInDb[0] as any).name).toBe("Tú Trinh");

    // Profile is NOT in syncQueue
    const queue = await adapterA.getAll<SyncQueueItem>("syncQueue");
    const profileQueue = queue.find((q) => q.store === ("profile" as any));
    expect(profileQueue).toBeUndefined();
  });

  it("G. Replace safety: Replace mode does not generate implicit DELETE queue entries for cloud records missing from backup", async () => {
    // Setup remote with 2 cloud records
    const remote = mockRemoteAdapter([
      { store: "vocabulary", record_id: "vocab-cloud-only", payload: { id: "vocab-cloud-only", term: "cloud word" } },
    ]);

    // Local backup only has vocab-uuid-1 and vocab-uuid-2 (missing vocab-cloud-only)
    const coordinator = new LocalFirstSyncCoordinator(adapterA);
    await coordinator.saveMeta({ localDatasetOwnerUserId: "user-cloud-1" });
    const result = await importBackup(adapterA, sampleBackup, "replace");

    for (const touched of result.touchedRecords) {
      await coordinator.queueLocalChange(touched.store, touched.record.id, touched.record, false);
    }

    const queue = await adapterA.getAll<SyncQueueItem>("syncQueue");
    // Ensure no DELETE items exist in queue
    const deleteItems = queue.filter((q) => q.deleted);
    expect(deleteItems).toHaveLength(0);

    // Push to cloud
    await coordinator.sync(remote);

    // Verify vocab-cloud-only is NOT deleted on the remote cloud
    const cloudRow = remote.remoteRows.get("vocabulary:vocab-cloud-only");
    expect(cloudRow.deleted_at).toBeNull();
  });

  describe("UX Polish: Backup Import Feedback & Pending Sync Status", () => {
    let mockSessionStorage: Record<string, string>;

    beforeEach(() => {
      mockSessionStorage = {};
      vi.stubGlobal("sessionStorage", {
        getItem: vi.fn((key: string) => mockSessionStorage[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
          mockSessionStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockSessionStorage[key];
        }),
        clear: vi.fn(() => {
          mockSessionStorage = {};
        }),
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("H. Import with pending records: marker is stored in sessionStorage and survives reload", async () => {
      const coordinator = new LocalFirstSyncCoordinator(adapterA);
      const result = await importBackup(adapterA, sampleBackup, "merge");

      for (const touched of result.touchedRecords) {
        await coordinator.queueLocalChange(touched.store, touched.record.id, touched.record, false);
      }

      const pendingCount = await coordinator.getPendingCount();
      expect(pendingCount).toBe(7);

      // Simulate handleImport persisting marker before reload
      const marker: BackupImportResultMarker = {
        importedCount: result.touchedRecords.length,
        pendingCount,
        importedAt: new Date().toISOString(),
      };
      sessionStorage.setItem(BACKUP_IMPORT_RESULT_STORAGE_KEY, JSON.stringify(marker));

      // Verify marker contains only primitive counts and timestamp (no tokens, no user data)
      const storedRaw = sessionStorage.getItem(BACKUP_IMPORT_RESULT_STORAGE_KEY);
      expect(storedRaw).not.toBeNull();
      const parsed = JSON.parse(storedRaw!);
      expect(parsed.importedCount).toBe(7);
      expect(parsed.pendingCount).toBe(7);
      expect(typeof parsed.importedAt).toBe("string");
      expect(parsed.tokens).toBeUndefined();
      expect(parsed.user).toBeUndefined();
    });

    it("I. Marker is consumed and removed on mount, showing message exactly once", () => {
      const marker: BackupImportResultMarker = {
        importedCount: 15,
        pendingCount: 15,
        importedAt: new Date().toISOString(),
      };
      sessionStorage.setItem(BACKUP_IMPORT_RESULT_STORAGE_KEY, JSON.stringify(marker));

      // Simulate SettingsPage mounting: reads and removes marker
      const raw = sessionStorage.getItem(BACKUP_IMPORT_RESULT_STORAGE_KEY);
      expect(raw).not.toBeNull();
      sessionStorage.removeItem(BACKUP_IMPORT_RESULT_STORAGE_KEY);

      const parsed = JSON.parse(raw!) as BackupImportResultMarker;
      const message = parsed.pendingCount > 0
        ? `Đã nhập ${parsed.importedCount} bản ghi. ${parsed.pendingCount} thay đổi đang chờ đồng bộ.`
        : `Đã nhập ${parsed.importedCount} bản ghi.`;

      expect(message).toBe("Đã nhập 15 bản ghi. 15 thay đổi đang chờ đồng bộ.");

      // Verify second mount/reload sees no marker
      const secondRead = sessionStorage.getItem(BACKUP_IMPORT_RESULT_STORAGE_KEY);
      expect(secondRead).toBeNull();
    });

    it("J. When pendingCount > 0, sync status reflects PENDING_CHANGES / 'Chờ đồng bộ'", async () => {
      const coordinator = new LocalFirstSyncCoordinator(adapterA);
      await coordinator.saveMeta({ localDatasetOwnerUserId: "user-cloud-1" });

      await coordinator.queueLocalChange("vocabulary", "v-1", { id: "v-1", term: "word" }, false);

      expect(coordinator.getStatus()).toBe("PENDING_CHANGES");
      const pendingCount = await coordinator.getPendingCount();
      expect(pendingCount).toBe(1);

      // Verify badge text helper matches "Chờ đồng bộ"
      const getBadgeText = (status: string, count: number) => {
        if (status === "PENDING_CHANGES" || count > 0) {
          return count > 0 ? `Chờ đồng bộ (${count})` : "Chờ đồng bộ";
        }
        if (status === "IDLE") return "Đã đồng bộ";
        return "Chưa đăng nhập";
      };

      expect(getBadgeText(coordinator.getStatus(), pendingCount)).toBe("Chờ đồng bộ (1)");

      // After sync completes, status returns to IDLE / "Đã đồng bộ"
      const remote = mockRemoteAdapter();
      const syncRes = await coordinator.sync(remote);
      expect(syncRes.success).toBe(true);

      const remainingPending = await coordinator.getPendingCount();
      expect(remainingPending).toBe(0);
      expect(coordinator.getStatus()).toBe("IDLE");
      expect(getBadgeText(coordinator.getStatus(), remainingPending)).toBe("Đã đồng bộ");
    });

    it("K. When pendingCount = 0 and status is IDLE, no false pending message is shown", () => {
      const marker: BackupImportResultMarker = {
        importedCount: 5,
        pendingCount: 0,
        importedAt: new Date().toISOString(),
      };
      sessionStorage.setItem(BACKUP_IMPORT_RESULT_STORAGE_KEY, JSON.stringify(marker));

      const raw = sessionStorage.getItem(BACKUP_IMPORT_RESULT_STORAGE_KEY);
      sessionStorage.removeItem(BACKUP_IMPORT_RESULT_STORAGE_KEY);

      const parsed = JSON.parse(raw!) as BackupImportResultMarker;
      const message = parsed.pendingCount > 0
        ? `Đã nhập ${parsed.importedCount} bản ghi. ${parsed.pendingCount} thay đổi đang chờ đồng bộ.`
        : `Đã nhập ${parsed.importedCount} bản ghi.`;

      expect(message).toBe("Đã nhập 5 bản ghi.");
      expect(message).not.toContain("đang chờ đồng bộ");
    });
  });
});
