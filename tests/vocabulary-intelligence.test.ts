import { beforeEach, describe, expect, it, vi } from "vitest";
import { indexedDB } from "fake-indexeddb";
import { validateEnrichmentItems } from "../cloudflare/worker/src/index.js";
import { exportBackup, importBackup } from "../src/frontend/persistence/backup.js";
import { IndexedDbAdapter } from "../src/frontend/persistence/indexedDb.js";
import { LocalFirstSyncCoordinator } from "../src/frontend/persistence/syncEngine.js";
import type { RemoteSyncAdapter, SyncChange } from "../src/frontend/persistence/sync.js";
import { StaticApiRouter } from "../src/frontend/static/staticApiRouter.js";
import { calculateCefrStatistics, filterVocabularyByScope, getVocabularyCefr, getVocabularyTopics, normalizeCefrLevel, normalizeVocabularyTopics } from "../src/shared/vocabularyIntelligence.js";

function vocab(id: string, level: string | null, progress: { status: string; lastReviewedAt: string | null; nextReviewAt: string | null } = { status: "NEW", lastReviewedAt: null, nextReviewAt: null }) {
  return { id, language: "en", level, metadata: {}, topic: null, topics: [], collectionIds: [], progress };
}

describe("Vocabulary intelligence domain", () => {
  it("normalizes CEFR and keeps legacy level compatible", () => {
    expect(["a1", " A2 ", "B1", "C2"].map(normalizeCefrLevel)).toEqual(["A1", "A2", "B1", "C2"]);
    expect(["A0", "A3", "B3", "Beginner", "HSK2", ""].map(normalizeCefrLevel)).toEqual([null, null, null, null, null, null]);
    expect(getVocabularyCefr(vocab("legacy", "B1"))).toBe("B1");
    expect(getVocabularyCefr({ ...vocab("metadata", null), metadata: { cefr: " a2 " } })).toBe("A2");
  });

  it("calculates learned/mastered CEFR statistics and filters reusable study scopes", () => {
    const items = [
      ...Array.from({ length: 10 }, (_, index) => vocab(`a1-${index}`, "A1", { status: index < 2 ? "MASTERED" : "NEW", lastReviewedAt: index < 4 ? "2026-01-01" : null, nextReviewAt: null })),
      ...Array.from({ length: 8 }, (_, index) => ({ ...vocab(`b1-${index}`, "B1", { status: index < 3 ? "MASTERED" : "NEW", lastReviewedAt: index < 5 ? "2026-01-01" : null, nextReviewAt: null }), topics: ["Business", " Finance "], collectionIds: ["toeic"] })),
      vocab("unknown", null, { status: "MASTERED", lastReviewedAt: null, nextReviewAt: null }),
    ];
    const stats = calculateCefrStatistics(items);
    expect(stats.cefr.A1).toEqual({ total: 10, learned: 4, mastered: 2 });
    expect(stats.cefr.B1).toEqual({ total: 8, learned: 5, mastered: 3 });
    expect(stats.cefr.unclassified).toEqual({ total: 1, learned: 1, mastered: 1 });
    expect(filterVocabularyByScope(items, { cefrLevels: ["B1"], topics: ["business"], collectionIds: ["toeic"], learned: true })).toHaveLength(5);
    expect(normalizeVocabularyTopics([" Travel ", "travel", "Business"])).toEqual(["Travel", "Business"]);
    expect(getVocabularyTopics({ ...vocab("topic", "A1"), topic: "Travel", topics: [" travel ", "Food"] })).toEqual(["travel", "Food"]);
  });

  it("does not expose Chinese-only fields on English enrichment and permits invalid without fabricated dictionary data", () => {
    const [english] = validateEnrichmentItems({ items: [{ term: "car", language: "en", lexicalStatus: "VALID", meaningVi: "xe hơi", partOfSpeech: "noun", ipa: "/kɑːr/", cefr: "A1", pinyin: "qì chē", traditional: "xe hơi", toneData: [1] }] }, ["car"], "en");
    expect(english).toMatchObject({ lexicalStatus: "VALID", cefr: "A1" });
    expect(english).not.toHaveProperty("pinyin");
    expect(english).not.toHaveProperty("traditional");
    expect(english).not.toHaveProperty("toneData");
    const [invalid] = validateEnrichmentItems({ items: [{ term: "syncgo", language: "en", lexicalStatus: "INVALID", lexicalReason: "fabricated concatenation" }] }, ["syncgo"], "en");
    expect(invalid).toEqual(expect.objectContaining({ term: "syncgo", lexicalStatus: "INVALID" }));
    expect(invalid!.meaningVi).toBeUndefined();
    expect(invalid!.ipa).toBeUndefined();
    expect(invalid!.cefr).toBeUndefined();
  });
});

describe("Collections persistence and sync upgrade", () => {
  let adapter: IndexedDbAdapter;
  beforeEach(() => {
    vi.stubGlobal("indexedDB", indexedDB);
    adapter = new IndexedDbAdapter(`intelligence-${crypto.randomUUID()}`, indexedDB);
  });

  it("creates, dedupes, deletes collections, cleans memberships, and round-trips backup", async () => {
    const router = new StaticApiRouter(adapter);
    const collection = await router.request<any>("/api/collections", { method: "POST", body: JSON.stringify({ name: "TOEIC 600" }) });
    await expect(router.request("/api/collections", { method: "POST", body: JSON.stringify({ name: "toeic 600" }) })).rejects.toThrow(/đã tồn tại/u);
    const created = await router.request<any>("/api/vocabulary", { method: "POST", body: JSON.stringify({ language: "en", term: "customer", meaningVi: "khách hàng", level: "a2", topics: [" Business ", "business"], collectionIds: [collection.id, collection.id], metadata: {} }) });
    expect(created.item).toMatchObject({ level: "A2", metadata: { cefr: "A2" }, topics: ["Business"], collectionIds: [collection.id] });
    const backup = await exportBackup(adapter);
    expect(backup.data.collections).toHaveLength(1);
    await router.request(`/api/collections/${collection.id}`, { method: "DELETE" });
    expect((await router.request<any[]>("/api/vocabulary"))[0]!.collectionIds).toEqual([]);
    const restored = new IndexedDbAdapter(`intelligence-restore-${crypto.randomUUID()}`, indexedDB);
    await importBackup(restored, backup, "replace");
    expect(await restored.getAll("collections")).toHaveLength(1);
  });

  it("recovers historical collection changes during v1 to v2 sync upgrade without dropping local queue", async () => {
    const coordinator = new LocalFirstSyncCoordinator(adapter);
    await coordinator.saveMeta({ localDatasetOwnerUserId: "user-1", lastCursor: "500", syncDataSchemaVersion: 1 });
    await adapter.put("vocabulary", { id: "local-word", term: "local" });
    await coordinator.queueLocalChange("vocabulary", "local-word", { id: "local-word", term: "local" });
    const remote: RemoteSyncAdapter = {
      pull: vi.fn(async (cursor?: string) => {
        expect(cursor).toBeUndefined();
        return { changes: [{ store: "collections" as const, id: "toeic", changeSeq: "450", updatedAt: "2026-08-20T00:00:00.000Z", record: { id: "toeic", name: "TOEIC 600" } }] satisfies SyncChange[], cursor: "500" };
      }),
      push: vi.fn(async (changes: SyncChange[]) => ({ acknowledgedKeys: changes.map((change) => `${change.store}:${change.id}`) })),
    };
    await expect(coordinator.sync(remote)).resolves.toMatchObject({ success: true });
    expect(await adapter.get("collections", "toeic")).toEqual({ id: "toeic", name: "TOEIC 600" });
    expect((await coordinator.getMeta()).syncDataSchemaVersion).toBe(2);
    expect(remote.push).toHaveBeenCalled();
  });

  it("does not mark the sync schema upgraded when the full pull fails", async () => {
    const coordinator = new LocalFirstSyncCoordinator(adapter);
    await coordinator.saveMeta({ localDatasetOwnerUserId: "user-1", lastCursor: "500", syncDataSchemaVersion: 1 });
    await expect(coordinator.sync({ pull: async () => { throw new Error("offline"); }, push: async () => ({ acknowledgedKeys: [] }) })).resolves.toMatchObject({ success: false });
    expect((await coordinator.getMeta()).syncDataSchemaVersion).toBe(1);
  });
});
