import { afterEach, describe, expect, it, vi } from "vitest";
import { indexedDB } from "fake-indexeddb";
import { IndexedDbAdapter } from "../src/frontend/persistence/indexedDb.js";
import { StaticApiRouter } from "../src/frontend/static/staticApiRouter.js";
import { matchesLocalVocabularyIdentity } from "../src/frontend/static/localDomain.js";
import type { VocabularyItem } from "../src/frontend/types/api.js";
import { bulkVocabularyItemSchema } from "../src/shared/schemas.js";
import { testContext } from "./helpers.js";

const databaseNames: string[] = [];
const contexts: Array<Awaited<ReturnType<typeof testContext>>> = [];

function adapter(): IndexedDbAdapter {
  const name = `repair-integrity-${crypto.randomUUID()}`;
  databaseNames.push(name);
  return new IndexedDbAdapter(name, indexedDB);
}

function staticVocabulary(overrides: Partial<VocabularyItem> = {}): VocabularyItem {
  return {
    id: "customer-id", userId: "local-profile", language: "en", term: "customer", normalizedTerm: "customer",
    pronunciation: "KUH-stoh-mehr", meaningVi: "khách hàng", partOfSpeech: "noun", example: "Old example", exampleTranslation: "Ví dụ cũ",
    topic: "Business", level: "B1", note: "keep-note", source: "IMPORT", sourceReadingId: null, audioUrl: null, audioAvailable: false,
    favorite: true, metadata: { originalSource: "legacy" }, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-02T00:00:00.000Z",
    progress: { status: "REVIEW", ease: 2.2, intervalDays: 20, repetitions: 12, nextReviewAt: "2026-09-01T00:00:00.000Z", lastReviewedAt: "2026-08-18T00:00:00.000Z", correctCount: 9, incorrectCount: 3 },
    ...overrides,
  };
}

async function staticBulk(router: StaticApiRouter, language: "en" | "zh", item: Record<string, unknown>) {
  return router.request<any>("/api/vocabulary/bulk", { method: "POST", body: JSON.stringify({ language, items: [item] }) });
}

afterEach(async () => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  while (contexts.length) await contexts.pop()!.close();
  for (const name of databaseNames.splice(0)) indexedDB.deleteDatabase(name);
});

describe("legacy repair integrity — static Pages parity", () => {
  it("keeps healthy duplicates byte-for-byte unchanged when existingId has no repair intent", async () => {
    const db = adapter();
    const router = new StaticApiRouter(db);
    const apple = staticVocabulary({ id: "apple-id", term: "apple", normalizedTerm: "apple", pronunciation: "/ˈæp.əl/", meaningVi: "quả táo", metadata: { ipa: "/ˈæp.əl/", cefr: "A1" } });
    await db.put("vocabulary", apple as any);

    const result = await staticBulk(router, "en", { existingId: apple.id, term: "apple", meaningVi: "nghĩa không được ghi", pronunciation: "/ˈæp.əl/", ipa: "/ˈæp.əl/" });
    expect(result).toMatchObject({ created: [], existing: [expect.objectContaining({ id: apple.id })], failed: [] });
    expect(await db.get("vocabulary", apple.id)).toEqual(apple);
    expect(await db.getAll("syncQueue")).toEqual([]);
  });

  it("updates an explicitly accepted repair only, preserving identity, study state and queueing one sync update", async () => {
    const db = adapter();
    const router = new StaticApiRouter(db);
    const customer = staticVocabulary();
    await db.put("vocabulary", customer as any);

    const result = await staticBulk(router, "en", { existingId: customer.id, repairExisting: true, term: "Customer", meaningVi: "khách hàng mới", partOfSpeech: "noun", pronunciation: "/ˈkʌs.tə.mɚ/", ipa: "/ˈkʌs.tə.mɚ/", example: "A customer pays." });
    const updated = await db.get<VocabularyItem>("vocabulary", customer.id);
    expect(result).toMatchObject({ created: [], existing: [expect.objectContaining({ id: customer.id })], failed: [] });
    expect(updated).toMatchObject({ id: customer.id, createdAt: customer.createdAt, favorite: true, note: "keep-note", pronunciation: "/ˈkʌs.tə.mɚ/", meaningVi: "khách hàng mới", partOfSpeech: "noun", progress: customer.progress });
    expect(updated?.metadata).toMatchObject({ originalSource: "legacy", ipa: "/ˈkʌs.tə.mɚ/" });
    expect((await db.getAll<any>("syncQueue")).filter((entry) => entry.id === `vocabulary:${customer.id}`)).toHaveLength(1);
  });

  it("does not mutate a legacy repair proposal until repairExisting is explicitly accepted", async () => {
    const db = adapter();
    const router = new StaticApiRouter(db);
    const customer = staticVocabulary();
    await db.put("vocabulary", customer as any);

    const result = await staticBulk(router, "en", { existingId: customer.id, term: "customer", meaningVi: "khách hàng mới", pronunciation: "/ˈkʌs.tə.mɚ/", ipa: "/ˈkʌs.tə.mɚ/" });
    expect(result).toMatchObject({ created: [], existing: [expect.objectContaining({ id: customer.id })], failed: [] });
    expect(await db.get("vocabulary", customer.id)).toEqual(customer);
    expect(await db.getAll("syncQueue")).toEqual([]);
  });

  it("fails closed for mismatched IDs, language, missing IDs and foreign local records", async () => {
    const db = adapter();
    const router = new StaticApiRouter(db);
    const apple = staticVocabulary({ id: "apple-id", term: "apple", normalizedTerm: "apple", pronunciation: "/ˈæp.əl/", meaningVi: "quả táo", metadata: { ipa: "/ˈæp.əl/" } });
    const chinese = staticVocabulary({ id: "zh-id", language: "zh", term: "苹果", normalizedTerm: "苹果", pronunciation: "píngguǒ", meaningVi: "quả táo", metadata: { pinyin: "píngguǒ" } });
    const foreign = staticVocabulary({ id: "foreign-id", userId: "another-user" });
    await db.put("vocabulary", apple as any);
    await db.put("vocabulary", chinese as any);
    await db.put("vocabulary", foreign as any);

    for (const payload of [
      { existingId: apple.id, repairExisting: true, term: "customer", meaningVi: "khách hàng", pronunciation: "/ˈkʌs.tə.mɚ/", ipa: "/ˈkʌs.tə.mɚ/" },
      { existingId: chinese.id, repairExisting: true, term: "customer", meaningVi: "khách hàng", pronunciation: "/ˈkʌs.tə.mɚ/", ipa: "/ˈkʌs.tə.mɚ/" },
      { existingId: "missing-id", repairExisting: true, term: "customer", meaningVi: "khách hàng", pronunciation: "/ˈkʌs.tə.mɚ/", ipa: "/ˈkʌs.tə.mɚ/" },
      { existingId: foreign.id, repairExisting: true, term: "customer", meaningVi: "khách hàng", pronunciation: "/ˈkʌs.tə.mɚ/", ipa: "/ˈkʌs.tə.mɚ/" },
      { repairExisting: true, term: "customer", meaningVi: "khách hàng", pronunciation: "/ˈkʌs.tə.mɚ/", ipa: "/ˈkʌs.tə.mɚ/" },
    ]) {
      const result = await staticBulk(router, "en", payload);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0]).toMatchObject({ code: "VALIDATION_ERROR" });
    }
    expect(await db.get("vocabulary", apple.id)).toEqual(apple);
    expect(await db.get("vocabulary", chinese.id)).toEqual(chinese);
    expect(await db.getAll("syncQueue")).toEqual([]);
  });

  it("uses normalized identity matching for settings batch-repair mapping", () => {
    const apple = staticVocabulary({ term: "Apple", normalizedTerm: "apple" });
    expect(matchesLocalVocabularyIdentity(apple, " apple ", "en")).toBe(true);
    expect(matchesLocalVocabularyIdentity(apple, "customer", "en")).toBe(false);
  });
});

describe("legacy repair integrity — server API", () => {
  it("enforces explicit intent, owner and normalized term binding while preserving accepted repair progress", async () => {
    const context = await testContext();
    contexts.push(context);
    const request = (payload: Record<string, unknown>, token = context.token) => context.app.inject({ method: "POST", url: "/api/vocabulary/bulk", headers: { authorization: `Bearer ${token}` }, payload: { language: "en", items: [payload] } });
    const create = (payload: Record<string, unknown>) => context.app.inject({ method: "POST", url: "/api/vocabulary", headers: { authorization: `Bearer ${context.token}` }, payload });

    const apple = (await create({ language: "en", term: "apple", meaningVi: "quả táo", pronunciation: "/ˈæp.əl/", partOfSpeech: "noun", source: "MANUAL", metadata: { ipa: "/ˈæp.əl/" } })).json().data.item;
    const customer = (await create({ language: "en", term: "customer", meaningVi: "khách hàng", pronunciation: "KUH-stoh-mehr", partOfSpeech: "noun", source: "IMPORT", metadata: {} })).json().data.item;
    context.db.run("UPDATE vocabulary_items SET favorite=1,note=? WHERE id=?", "keep-note", customer.id);
    context.db.run("UPDATE vocabulary_progress SET status='REVIEW',ease=2.2,interval_days=20,repetitions=12,next_review_at=?,last_reviewed_at=?,correct_count=9,incorrect_count=3 WHERE vocabulary_id=?", "2026-09-01T00:00:00.000Z", "2026-08-18T00:00:00.000Z", customer.id);
    const beforeCustomer = (await context.app.inject({ method: "GET", url: `/api/vocabulary/${customer.id}`, headers: { authorization: `Bearer ${context.token}` } })).json().data;
    const beforeApple = structuredClone(apple);

    const healthyDuplicate = await request({ existingId: apple.id, term: "apple", meaningVi: "không ghi đè", pronunciation: "/ˈæp.əl/", ipa: "/ˈæp.əl/" });
    expect(healthyDuplicate.json().data.failed).toEqual([]);
    expect((await context.app.inject({ method: "GET", url: `/api/vocabulary/${apple.id}`, headers: { authorization: `Bearer ${context.token}` } })).json().data).toEqual(beforeApple);

    const mismatch = await request({ existingId: apple.id, repairExisting: true, term: "customer", meaningVi: "khách hàng", pronunciation: "/ˈkʌs.tə.mɚ/", ipa: "/ˈkʌs.tə.mɚ/" });
    expect(mismatch.json().data.failed[0]).toMatchObject({ code: "VALIDATION_ERROR" });
    expect((await context.app.inject({ method: "GET", url: `/api/vocabulary/${apple.id}`, headers: { authorization: `Bearer ${context.token}` } })).json().data).toEqual(beforeApple);

    const accepted = await request({ existingId: customer.id, repairExisting: true, term: "Customer", meaningVi: "khách hàng mới", partOfSpeech: "noun", pronunciation: "/ˈkʌs.tə.mɚ/", ipa: "/ˈkʌs.tə.mɚ/" });
    expect(accepted.json().data).toMatchObject({ created: [], existing: [expect.objectContaining({ id: customer.id })], failed: [] });
    const afterCustomer = (await context.app.inject({ method: "GET", url: `/api/vocabulary/${customer.id}`, headers: { authorization: `Bearer ${context.token}` } })).json().data;
    expect(afterCustomer).toMatchObject({ id: customer.id, createdAt: beforeCustomer.createdAt, favorite: true, note: "keep-note", pronunciation: "/ˈkʌs.tə.mɚ/", meaningVi: "khách hàng mới", progress: beforeCustomer.progress });

    const other = (await context.app.inject({ method: "POST", url: "/api/auth/register", payload: { name: "Other", email: "repair-integrity-other@example.com", password: "password123" } })).json().data;
    const foreign = await request({ existingId: customer.id, repairExisting: true, term: "customer", meaningVi: "khách hàng", pronunciation: "/ˈkʌs.tə.mɚ/", ipa: "/ˈkʌs.tə.mɚ/" }, other.token);
    expect(foreign.json().data.failed[0]).toMatchObject({ code: "VALIDATION_ERROR" });
    expect((await context.app.inject({ method: "GET", url: `/api/vocabulary/${customer.id}`, headers: { authorization: `Bearer ${context.token}` } })).json().data).toMatchObject({ meaningVi: "khách hàng mới" });
  });

  it("rejects repair intent without an existing ID at the shared schema boundary", () => {
    expect(bulkVocabularyItemSchema.safeParse({ repairExisting: true, term: "customer", meaningVi: "khách hàng" }).success).toBe(false);
  });
});
