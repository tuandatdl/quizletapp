import { afterEach, describe, expect, it, vi } from "vitest";
import { indexedDB } from "fake-indexeddb";
import { IndexedDbAdapter } from "../src/frontend/persistence/indexedDb.js";
import { INDEXED_DB_SCHEMA_VERSION, STORE_NAMES } from "../src/frontend/persistence/types.js";
import { exportBackup, importBackup, previewBackup, validateBackup } from "../src/frontend/persistence/backup.js";
import { LanguageApiClient, validateEnrichment } from "../src/frontend/services/languageApi.js";
import { parseLocalQuickInput } from "../src/frontend/static/localDomain.js";
import { StaticApiRouter } from "../src/frontend/static/staticApiRouter.js";
import { request as frontendRequest } from "../src/frontend/api/client.js";
import { toStaticHashRoute } from "../src/frontend/runtime/routes.js";
import { configureSpeechUtterance, selectBestSpeechVoice } from "../src/frontend/services/speech.js";
import { createEnrichmentSchema, handleRequest, validateEnrichmentItems, type Env } from "../cloudflare/worker/src/index.js";
import type { VocabularyItem } from "../src/frontend/types/api.js";

const databaseNames: string[] = [];

function adapter(): IndexedDbAdapter {
  const name = `tu-trinh-test-${crypto.randomUUID()}`;
  databaseNames.push(name);
  return new IndexedDbAdapter(name, indexedDB);
}

function jsonRequest(path: string, body: unknown, origin = "https://example.github.io"): Request {
  return new Request(`https://worker.test${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  for (const name of databaseNames.splice(0)) indexedDB.deleteDatabase(name);
});

describe("IndexedDB static persistence", () => {
  it("creates every versioned store and supports CRUD", async () => {
    const db = adapter();
    expect(db.schemaVersion).toBe(INDEXED_DB_SCHEMA_VERSION);
    await db.put("meta", { id: "schema", value: 1 });
    expect(await db.get("meta", "schema")).toEqual({ id: "schema", value: 1 });
    const opened = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(databaseNames[0]!);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    expect([...opened.objectStoreNames]).toEqual(expect.arrayContaining([...STORE_NAMES]));
    opened.close();
    await db.delete("meta", "schema");
    expect(await db.get("meta", "schema")).toBeUndefined();
  });

  it("persists vocabulary reviews, readings, settings and progress across router instances", async () => {
    const db = adapter();
    const first = new StaticApiRouter(db);
    const created = await first.request<{ item: VocabularyItem }>("/api/vocabulary", {
      method: "POST",
      body: JSON.stringify({ language: "en", term: "go", meaningVi: "đi" }),
    });
    await first.request(`/api/vocabulary/${created.item.id}/review`, { method: "POST", body: JSON.stringify({ action: "GOOD" }) });
    const reading = await first.request<any>("/api/readings", { method: "POST", body: JSON.stringify({ language: "en", title: "Morning", content: "I go. I learn." }) });
    await first.request("/api/settings", { method: "PATCH", body: JSON.stringify({ dailyGoal: 30 }) });

    const second = new StaticApiRouter(db);
    const reviewed = await second.request<VocabularyItem>(`/api/vocabulary/${created.item.id}`);
    expect(reviewed.progress.repetitions).toBe(1);
    expect(reviewed.progress.nextReviewAt).toBeTruthy();
    expect((await second.request<any>(`/api/readings/${reading.id}`)).sentences).toHaveLength(2);
    expect((await second.request<any>("/api/settings")).dailyGoal).toBe(30);
    expect((await second.request<any>("/api/progress/dashboard")).languages.en.totalWords).toBe(1);
  });

  it("runs quiz and games locally without exposing answers", async () => {
    const router = new StaticApiRouter(adapter());
    for (const [term, meaningVi] of [["go", "đi"], ["car", "xe hơi"]]) {
      await router.request("/api/vocabulary", { method: "POST", body: JSON.stringify({ language: "en", term, meaningVi }) });
    }
    const quiz = await router.request<any>("/api/quizzes", { method: "POST", body: JSON.stringify({ language: "en", type: "TERM_TO_MEANING", count: 2 }) });
    expect(quiz.currentQuestion).not.toHaveProperty("answer");
    const quizAnswer = await router.request<any>(`/api/quizzes/${quiz.id}/answer`, { method: "POST", body: JSON.stringify({ answer: "đi" }) });
    expect(quizAnswer.session.currentIndex).toBe(1);

    const game = await router.request<any>("/api/games", { method: "POST", body: JSON.stringify({ language: "en", type: "MATCHING", count: 2 }) });
    expect(game.currentItem).not.toHaveProperty("answer");
    const gameAnswer = await router.request<any>(`/api/games/${game.id}/answer`, { method: "POST", body: JSON.stringify({ itemId: game.currentItem.id, answer: "đi" }) });
    expect(gameAnswer.session.currentItem).not.toHaveProperty("answer");
  });

  it("generates a distinct prompt and interaction payload for every game mode", async () => {
    const router = new StaticApiRouter(adapter());
    for (const [term, meaningVi] of [["go", "đi"], ["car", "xe hơi"], ["live", "sống"], ["total", "tổng cộng"]]) {
      await router.request("/api/vocabulary", { method: "POST", body: JSON.stringify({ language: "en", term, meaningVi }) });
    }
    const start = (type: string) => router.request<any>("/api/games", { method: "POST", body: JSON.stringify({ language: "en", type, count: 4 }) });
    const [matching, memory, listening, fillWord, speed] = await Promise.all([
      start("MATCHING"), start("MEMORY"), start("LISTENING_CHOICE"), start("FILL_WORD"), start("SPEED_CHALLENGE"),
    ]);

    const terms = ["go", "car", "live", "total"];
    const meanings = ["đi", "xe hơi", "sống", "tổng cộng"];
    expect(matching.currentItem).toEqual(expect.objectContaining({ choices: expect.arrayContaining(meanings) }));
    expect(terms).toContain(matching.currentItem.prompt);
    expect(memory.currentItem).toEqual(expect.objectContaining({ prompt: "Lật thẻ để xem từ" }));
    expect(terms).toContain(memory.currentItem.revealText);
    expect(meanings).toContain(memory.currentItem.hint);
    expect(listening.currentItem).toEqual(expect.objectContaining({ prompt: "Nghe phát âm và chọn nghĩa đúng", choices: expect.arrayContaining(meanings) }));
    expect(terms).toContain(listening.currentItem.audioText);
    expect(fillWord.currentItem).toEqual(expect.objectContaining({ hint: expect.stringMatching(/^Nghĩa tiếng Việt:/u) }));
    expect(fillWord.currentItem.prompt).toMatch(/_/u);
    expect(speed.currentItem).toEqual(expect.objectContaining({ hint: expect.stringContaining("Nhập từ") }));
    expect(meanings).toContain(speed.currentItem.prompt);
    expect(speed.timerSeconds).toBe(45);
    for (const session of [matching, memory, listening, fillWord, speed]) expect(session.currentItem).not.toHaveProperty("answer");
  });

  it("routes static frontend requests without calling Fastify auth", async () => {
    vi.stubEnv("VITE_RUNTIME_MODE", "static");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("indexedDB", indexedDB);
    expect(await frontendRequest<any>("/api/me")).toEqual(expect.objectContaining({ id: "local-profile", name: "Tú Trinh" }));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("static navigation and speech", () => {
  it("generates a HashRouter-compatible vocabulary URL for Pages", () => {
    expect(toStaticHashRoute("/add")).toBe("#/add");
    expect(toStaticHashRoute("reading/new")).toBe("#/reading/new");
  });

  it("prefers natural matching-locale browser voices and applies safe defaults", () => {
    const voices = [
      { name: "System Default", lang: "en-US", localService: true },
      { name: "Microsoft Jenny Natural", lang: "en-US", localService: false },
      { name: "Google UK English", lang: "en-GB", localService: true },
      { name: "Microsoft Xiaoxiao Online", lang: "zh-CN", localService: false },
    ] as SpeechSynthesisVoice[];
    expect(selectBestSpeechVoice(voices, "en")?.name).toBe("Microsoft Jenny Natural");
    expect(selectBestSpeechVoice(voices, "zh")?.name).toBe("Microsoft Xiaoxiao Online");

    const utterance = { lang: "", rate: 0, pitch: 0, volume: 0, voice: null } as unknown as SpeechSynthesisUtterance;
    configureSpeechUtterance(utterance, "en", 1, voices);
    expect(utterance).toMatchObject({ lang: "en-US", rate: 0.95, pitch: 1, volume: 1, voice: voices[1] });
  });
});

describe("automatic enrichment", () => {
  it("preserves phrases and deduplicates normalized input", () => {
    expect(parseLocalQuickInput("go, give up\nlook forward to\nGO", "en")).toEqual(["go", "give up", "look forward to"]);
  });

  it("maps a batch, validates output and reuses IndexedDB cache", async () => {
    vi.stubEnv("VITE_LANGUAGE_API_URL", "https://worker.test");
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ data: { items: [
      { term: "go", language: "en", meaningVi: "đi", partOfSpeech: "verb", senses: [{ partOfSpeech: "verb", meaningVi: "đi" }] },
      { term: "live", language: "en", meaningVi: "sống", senses: [{ partOfSpeech: "verb", meaningVi: "sống" }, { partOfSpeech: "adjective", meaningVi: "trực tiếp" }] },
    ] } }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const client = new LanguageApiClient(adapter());
    const first = await client.enrichTerms("en", ["go", "live"]);
    const second = await client.enrichTerms("en", ["go", "live"]);
    expect(first[1]!.senses).toHaveLength(2);
    expect(second).toEqual(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const fetchOptions = (fetchMock.mock.calls as unknown as Array<[string, RequestInit]>)[0]![1];
    expect(JSON.parse(String(fetchOptions.body)).terms).toEqual(["go", "live"]);
  });

  it("populates automatic Vietnamese meanings through the Worker adapter", async () => {
    vi.stubEnv("VITE_LANGUAGE_API_URL", "https://worker.test");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ data: { items: [
      { term: "go", language: "en", meaningVi: "đi" },
      { term: "give up", language: "en", meaningVi: "từ bỏ", partOfSpeech: "phrase" },
    ] } }), { status: 200 })));
    const router = new StaticApiRouter(adapter());
    const preview = await router.request<any>("/api/vocabulary/bulk-preview", { method: "POST", body: JSON.stringify({ language: "en", input: "go\ngive up" }) });
    expect(preview.items.map((item: any) => item.suggestion.meaningVi)).toEqual(["đi", "từ bỏ"]);
  });

  it("does not lose a saved reading when translation is offline", async () => {
    vi.stubEnv("VITE_LANGUAGE_API_URL", "https://worker.test");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    vi.stubGlobal("navigator", { onLine: false });
    const router = new StaticApiRouter(adapter());
    const passage = await router.request<any>("/api/readings", { method: "POST", body: JSON.stringify({ language: "en", title: "Saved first", content: "Keep me." }) });
    await expect(router.request(`/api/readings/${passage.id}/translate`, { method: "POST" })).rejects.toThrow("Không có kết nối");
    expect((await router.request<any>(`/api/readings/${passage.id}`)).title).toBe("Saved first");
  });

  it("keeps translation-only partial results when rich enrichment fails", async () => {
    vi.stubEnv("VITE_LANGUAGE_API_URL", "https://worker.test");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { message: "rich failed" } }), { status: 502 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { translation: "đi" } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { translation: "xe hơi" } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await new LanguageApiClient(adapter()).enrichTerms("en", ["go", "car"]);
    expect(result).toEqual([
      expect.objectContaining({ term: "go", meaningVi: "đi", partial: true }),
      expect.objectContaining({ term: "car", meaningVi: "xe hơi", partial: true }),
    ]);
  });

  it("rejects malformed model fields", () => {
    expect(() => validateEnrichment({ term: "go", language: "en" }, "en")).toThrow(/thiếu trường bắt buộc/u);
  });
});

describe("backup and import", () => {
  it("exports only the portable schema, previews counts and supports merge/replace", async () => {
    const source = adapter();
    await source.put("vocabulary", { id: "word-1", term: "go" });
    await source.put("enrichmentCache", { id: "private-cache", value: "not-exported" });
    const backup = await exportBackup(source);
    expect(backup.data.vocabulary).toHaveLength(1);
    expect((backup.data as any).enrichmentCache).toBeUndefined();
    expect(previewBackup(backup).counts.vocabulary).toBe(1);

    const target = adapter();
    await target.put("vocabulary", { id: "old", term: "old" });
    await importBackup(target, backup, "merge");
    expect(await target.getAll("vocabulary")).toHaveLength(2);
    await importBackup(target, backup, "replace");
    expect(await target.getAll("vocabulary")).toEqual([{ id: "word-1", term: "go" }]);
  });

  it("rejects malformed JSON-shaped backups and unsupported versions", () => {
    expect(() => validateBackup({ format: "wrong" })).toThrow();
    expect(() => validateBackup({ format: "tu-trinh-language-backup", schemaVersion: 999, data: {} })).toThrow(/chưa được hỗ trợ/u);
  });
});

describe("Cloudflare Worker contract", () => {
  const env = (run: Env["AI"]["run"]): Env => ({ AI: { run }, ALLOWED_ORIGINS: "https://example.github.io,http://localhost:5173" });
  const enrichBody = (terms: string[], language: "en" | "zh" = "en") => ({ language, targetLanguage: "vi", terms, enrichmentVersion: "vocabulary-enrichment-v1" });

  it("enriches one term", async () => {
    const response = await handleRequest(jsonRequest("/v1/vocabulary/enrich", enrichBody(["give up"])), env(async () => ({ response: JSON.stringify({ items: [{ term: "give up", language: "en", meaningVi: "từ bỏ", partOfSpeech: "phrase" }] }) })));
    expect(response.status).toBe(200);
    expect((await response.json() as any).data.items[0]).toEqual(expect.objectContaining({ term: "give up", meaningVi: "từ bỏ" }));
  });

  it("enriches four terms in exact order with a cardinality-bound runtime schema", async () => {
    const terms = ["go", "car", "live", "total"];
    const run = vi.fn(async (_model: string, input: Record<string, unknown>) => {
      const schema = ((input.response_format as any).json_schema.properties.items);
      expect(schema.minItems).toBe(4);
      expect(schema.maxItems).toBe(4);
      return { response: { items: terms.map((term) => ({ term, language: "en", meaningVi: `nghĩa ${term}` })) } };
    });
    const response = await handleRequest(jsonRequest("/v1/vocabulary/enrich", enrichBody(terms)), env(run));
    expect(response.status).toBe(200);
    expect((await response.json() as any).data.items.map((item: any) => item.term)).toEqual(terms);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("rejects a batch missing one output item", () => {
    expect(() => validateEnrichmentItems({ items: [
      { term: "go", meaningVi: "đi" },
      { term: "car", meaningVi: "xe hơi" },
      { term: "live", meaningVi: "sống" },
    ] }, ["go", "car", "live", "total"], "en")).toThrow(/item count/u);
  });

  it("rejects output items in the wrong order", () => {
    expect(() => validateEnrichmentItems({ items: [
      { term: "car", meaningVi: "xe hơi" },
      { term: "go", meaningVi: "đi" },
    ] }, ["go", "car"], "en")).toThrow(/index 0/u);
  });

  it("rejects a term that does not exactly match its input", () => {
    expect(() => validateEnrichmentItems({ items: [{ term: "Go", meaningVi: "đi" }] }, ["go"], "en")).toThrow(/index 0/u);
  });

  it("strips Chinese-only fields from normalized English output", () => {
    const [item] = validateEnrichmentItems({ items: [{
      term: "car", language: "en", meaningVi: "xe hơi",
      pinyin: "qiche", simplified: "汽车", traditional: "xe hơi", toneData: [1],
    }] }, ["car"], "en");
    expect(item).toEqual(expect.objectContaining({ term: "car", meaningVi: "xe hơi" }));
    expect(item).not.toHaveProperty("pinyin");
    expect(item).not.toHaveProperty("simplified");
    expect(item).not.toHaveProperty("traditional");
    expect(item).not.toHaveProperty("toneData");
    const itemSchema = (((createEnrichmentSchema(["car"], "en") as any).properties.items.items.properties));
    expect(itemSchema.term.enum).toEqual(["car"]);
    expect(itemSchema).not.toHaveProperty("pinyin");
  });

  it("falls back to validated single-term calls when a multi-term response is invalid", async () => {
    const terms = ["go", "car", "live", "total"];
    const run = vi.fn()
      .mockResolvedValueOnce({ response: { items: terms.slice(0, 3).map((term) => ({ term, language: "en", meaningVi: `nghĩa ${term}` })) } })
      .mockResolvedValueOnce({ response: { items: [{ term: "go", language: "en", meaningVi: "đi" }] } })
      .mockResolvedValueOnce({ response: { items: [{ term: "car", language: "en", meaningVi: "xe hơi" }] } })
      .mockResolvedValueOnce({ response: { items: [{ term: "live", language: "en", meaningVi: "sống" }] } })
      .mockResolvedValueOnce({ response: { items: [{ term: "total", language: "en", meaningVi: "tổng cộng" }] } });
    const response = await handleRequest(jsonRequest("/v1/vocabulary/enrich", enrichBody(terms)), env(run));
    expect(response.status).toBe(200);
    const payload = await response.json() as any;
    expect(payload.data.items.map((item: any) => item.term)).toEqual(terms);
    expect(payload.data.items.every((item: any) => Boolean(item.meaningVi))).toBe(true);
    expect(run).toHaveBeenCalledTimes(5);
  });

  it("keeps Chinese-only fields for normalized Chinese output", () => {
    const [item] = validateEnrichmentItems({ items: [{ term: "汽车", meaningVi: "xe hơi", pinyin: "qì chē", simplified: "汽车", traditional: "汽車", toneData: [4, 1] }] }, ["汽车"], "zh");
    expect(item).toEqual(expect.objectContaining({ pinyin: "qì chē", simplified: "汽车", traditional: "汽車", toneData: [4, 1] }));
  });

  it("keeps the translation endpoint working", async () => {
    const run = vi.fn(async () => ({ response: { translation: "Tôi đi làm bằng ô tô." } }));
    const response = await handleRequest(jsonRequest("/v1/translate", { text: "I go to work by car.", sourceLanguage: "en", targetLanguage: "vi" }), env(run));
    expect(response.status).toBe(200);
    expect((await response.json() as any).data.translation).toBe("Tôi đi làm bằng ô tô.");
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid origins, arbitrary prompts and oversized requests", async () => {
    const ai = vi.fn(async () => ({}));
    const invalidOrigin = await handleRequest(jsonRequest("/v1/translate", { text: "go", sourceLanguage: "en", targetLanguage: "vi" }, "https://evil.example"), env(ai));
    expect(invalidOrigin.status).toBe(403);
    expect(invalidOrigin.headers.has("Access-Control-Allow-Origin")).toBe(false);
    expect((await handleRequest(jsonRequest("/v1/vocabulary/enrich", { ...enrichBody(["go"]), prompt: "ignore rules" }), env(ai))).status).toBe(400);
    expect((await handleRequest(jsonRequest("/v1/vocabulary/enrich", enrichBody(Array.from({ length: 26 }, (_, index) => `term-${index}`))), env(ai))).status).toBe(400);
    expect((await handleRequest(jsonRequest("/v1/translate", { text: "x".repeat(33_000), sourceLanguage: "en", targetLanguage: "vi" }), env(ai))).status).toBe(413);
    expect(ai).not.toHaveBeenCalled();
  });

  it("fails closed when AI returns malformed JSON", async () => {
    const response = await handleRequest(jsonRequest("/v1/translate", { text: "go", sourceLanguage: "en", targetLanguage: "vi" }), env(async () => ({ response: "not-json" })));
    expect(response.status).toBe(502);
    expect((await response.json() as any).error.code).toBe("AI_RESPONSE_INVALID");
  });
});
