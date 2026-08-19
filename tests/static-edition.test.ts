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
import { configureSpeechUtterance, getAvailableVoicesForLanguage, selectBestSpeechVoice } from "../src/frontend/services/speech.js";
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

    // Custom preferred voice override
    const customUtterance = { lang: "", rate: 0, pitch: 0, volume: 0, voice: null } as unknown as SpeechSynthesisUtterance;
    configureSpeechUtterance(customUtterance, "en", 1.25, voices, "Google UK English");
    expect(customUtterance).toMatchObject({ lang: "en-GB", rate: 1.25, pitch: 1, volume: 1, voice: voices[2] });

    // Fallback when custom voice doesn't exist
    const fallbackUtterance = { lang: "", rate: 0, pitch: 0, volume: 0, voice: null } as unknown as SpeechSynthesisUtterance;
    configureSpeechUtterance(fallbackUtterance, "en", 1, voices, "Nonexistent Voice");
    expect(fallbackUtterance).toMatchObject({ lang: "en-US", rate: 0.95, pitch: 1, volume: 1, voice: voices[1] });

    // Available voices listing for language
    const enAvailable = getAvailableVoicesForLanguage(voices, "en");
    expect(enAvailable.map((v) => v.name)).toEqual(["Microsoft Jenny Natural", "Google UK English", "System Default"]);
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

  it("populates duplicate suggestion from existing local vocabulary without calling enrichment API for duplicates", async () => {
    vi.stubEnv("VITE_LANGUAGE_API_URL", "https://worker.test");
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ data: { items: [
      { term: "car", language: "en", meaningVi: "xe hơi", partOfSpeech: "noun" },
    ] } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const persistence = adapter();
    await persistence.put("vocabulary", {
      id: "word-go",
      userId: "local-user",
      language: "en",
      term: "go",
      normalizedTerm: "go",
      pronunciation: "/ɡoʊ/",
      meaningVi: "đi",
      partOfSpeech: "verb",
      example: "I go to school",
      exampleTranslation: "Tôi đi học",
      topic: "daily",
      level: "A1",
      note: null,
      source: "MANUAL",
      sourceReadingId: null,
      audioUrl: null,
      audioAvailable: false,
      favorite: false,
      metadata: { ipa: "/ɡoʊ/", cefr: "A1", synonyms: ["move", "travel"] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: { status: "NEW", ease: 2.5, intervalDays: 0, repetitions: 0, nextReviewAt: null, lastReviewedAt: null, correctCount: 0, incorrectCount: 0 },
    });

    const router = new StaticApiRouter(persistence);
    const preview = await router.request<any>("/api/vocabulary/bulk-preview", {
      method: "POST",
      body: JSON.stringify({ language: "en", input: "go\ncar" }),
    });

    // 1. Existing word "go" must be marked duplicate=true, status=EXISTS, and have populated suggestion
    const goItem = preview.items.find((item: any) => item.normalizedTerm === "go");
    expect(goItem).toBeDefined();
    expect(goItem.duplicate).toBe(true);
    expect(goItem.status).toBe("EXISTS");
    expect(goItem.suggestion).toMatchObject({
      meaningVi: "đi",
      pronunciation: "/ɡoʊ/",
      partOfSpeech: "verb",
      example: "I go to school",
      exampleTranslation: "Tôi đi học",
      topic: "daily",
      cefr: "A1",
      synonyms: ["move", "travel"],
    });

    // 2. New word "car" is enriched via API
    const carItem = preview.items.find((item: any) => item.normalizedTerm === "car");
    expect(carItem).toBeDefined();
    expect(carItem.duplicate).toBe(false);
    expect(carItem.status).toBe("READY");
    expect(carItem.suggestion.meaningVi).toBe("xe hơi");

    // 3. API was ONLY called for "car", not "go"
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const bodySent = JSON.parse(String((fetchMock.mock.calls as any)[0][1].body));
    expect(bodySent.terms).toEqual(["car"]);
  });

  it("populates Chinese metadata in duplicate suggestion from existing local vocabulary", async () => {
    const persistence = adapter();
    await persistence.put("vocabulary", {
      id: "word-zh-1",
      userId: "local-user",
      language: "zh",
      term: "学习",
      normalizedTerm: "学习",
      pronunciation: "xuéxí",
      meaningVi: "học tập",
      partOfSpeech: "verb",
      example: "我喜欢学习中文",
      exampleTranslation: "Tôi thích học tiếng Trung",
      topic: null,
      level: "HSK1",
      note: null,
      source: "MANUAL",
      sourceReadingId: null,
      audioUrl: null,
      audioAvailable: false,
      favorite: false,
      metadata: { pinyin: "xuéxí", simplified: "学习", traditional: "學習", hskLevel: 1, toneData: [2, 2] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: { status: "NEW", ease: 2.5, intervalDays: 0, repetitions: 0, nextReviewAt: null, lastReviewedAt: null, correctCount: 0, incorrectCount: 0 },
    });

    const router = new StaticApiRouter(persistence);
    const preview = await router.request<any>("/api/vocabulary/bulk-preview", {
      method: "POST",
      body: JSON.stringify({ language: "zh", input: "学 习" }),
    });

    expect(preview.items[0]).toMatchObject({
      term: "学 习",
      normalizedTerm: "学习",
      duplicate: true,
      status: "EXISTS",
      suggestion: {
        meaningVi: "học tập",
        pinyin: "xuéxí",
        traditional: "學習",
        hskLevel: 1,
        toneData: [2, 2],
      },
    });
  });

  it("passes refresh=true on retry to re-enrich newly failed terms", async () => {
    vi.stubEnv("VITE_LANGUAGE_API_URL", "https://worker.test");
    const persistence = adapter();
    // Cache a previous enrichment in IndexedDB
    await persistence.put("enrichmentCache", {
      id: "vocabulary-enrichment-v2:en:car",
      version: "vocabulary-enrichment-v2",
      language: "en",
      normalizedTerm: "car",
      value: { term: "car", language: "en", meaningVi: "xe hơi cũ", partOfSpeech: "noun" },
      updatedAt: new Date().toISOString(),
    });

    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ data: { items: [
      { term: "car", language: "en", meaningVi: "xe ô tô mới", partOfSpeech: "noun" },
    ] } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const router = new StaticApiRouter(persistence);

    // Without refresh: should use cache, fetch not called
    const normalPreview = await router.request<any>("/api/vocabulary/bulk-preview", {
      method: "POST",
      body: JSON.stringify({ language: "en", input: "car", refresh: false }),
    });
    expect(normalPreview.items[0].suggestion.meaningVi).toBe("xe hơi cũ");
    expect(fetchMock).not.toHaveBeenCalled();

    // With refresh=true: should bypass cache and call worker API
    const refreshedPreview = await router.request<any>("/api/vocabulary/bulk-preview", {
      method: "POST",
      body: JSON.stringify({ language: "en", input: "car", refresh: true }),
    });
    expect(refreshedPreview.items[0].suggestion.meaningVi).toBe("xe ô tô mới");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("correctly filters retry candidates (excludes duplicates, includes new failed items)", () => {
    const needsEnrichmentRetry = (item: { duplicate: boolean; enrichmentState: string; meaningVi: string }) =>
      !item.duplicate &&
      (
        item.enrichmentState === "failed" ||
        !item.meaningVi.trim()
      );

    // Duplicate with meaning -> NO retry
    expect(needsEnrichmentRetry({ duplicate: true, enrichmentState: "exists", meaningVi: "đi" })).toBe(false);

    // Duplicate with empty meaning (legacy/corrupt) -> NO generic retry
    expect(needsEnrichmentRetry({ duplicate: true, enrichmentState: "exists", meaningVi: "" })).toBe(false);

    // New item failed -> MUST retry
    expect(needsEnrichmentRetry({ duplicate: false, enrichmentState: "failed", meaningVi: "" })).toBe(true);

    // New item with partial empty meaning -> MUST retry
    expect(needsEnrichmentRetry({ duplicate: false, enrichmentState: "partial", meaningVi: "" })).toBe(true);

    // New item ready with meaning -> NO retry
    expect(needsEnrichmentRetry({ duplicate: false, enrichmentState: "ready", meaningVi: "xe hơi" })).toBe(false);
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
    const response = await handleRequest(jsonRequest("/v1/vocabulary/enrich", enrichBody(["give up"])), env(async () => ({ response: JSON.stringify({ items: [{ term: "give up", language: "en", meaningVi: "từ bỏ", partOfSpeech: "phrasal verb", ipa: "/ɡɪv ʌp/" }] }) })));
    expect(response.status).toBe(200);
    expect((await response.json() as any).data.items[0]).toEqual(expect.objectContaining({ term: "give up", meaningVi: "từ bỏ", partOfSpeech: "phrasal verb", ipa: "/ɡɪv ʌp/" }));
  });

  it("enriches four terms in exact order with a cardinality-bound runtime schema", async () => {
    const terms = ["go", "car", "live", "total"];
    const run = vi.fn(async (_model: string, input: Record<string, unknown>) => {
      const schema = ((input.response_format as any).json_schema.properties.items);
      expect(schema.minItems).toBe(4);
      expect(schema.maxItems).toBe(4);
      return { response: { items: terms.map((term) => ({ term, language: "en", meaningVi: `nghĩa ${term}`, partOfSpeech: "noun", ipa: `/${term}-sound/` })) } };
    });
    const response = await handleRequest(jsonRequest("/v1/vocabulary/enrich", enrichBody(terms)), env(run));
    expect(response.status).toBe(200);
    expect((await response.json() as any).data.items.map((item: any) => item.term)).toEqual(terms);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("rejects a batch missing one output item", () => {
    expect(() => validateEnrichmentItems({ items: [
      { term: "go", meaningVi: "đi", partOfSpeech: "verb", ipa: "/ɡoʊ/" },
      { term: "car", meaningVi: "xe hơi", partOfSpeech: "noun", ipa: "/kɑːr/" },
      { term: "live", meaningVi: "sống", partOfSpeech: "verb", ipa: "/lɪv/" },
    ] }, ["go", "car", "live", "total"], "en")).toThrow(/item count/u);
  });

  it("rejects output items in the wrong order", () => {
    expect(() => validateEnrichmentItems({ items: [
      { term: "car", meaningVi: "xe hơi", partOfSpeech: "noun", ipa: "/kɑːr/" },
      { term: "go", meaningVi: "đi", partOfSpeech: "verb", ipa: "/ɡoʊ/" },
    ] }, ["go", "car"], "en")).toThrow(/index 0/u);
  });

  it("rejects a term that does not exactly match its input", () => {
    expect(() => validateEnrichmentItems({ items: [{ term: "Go", meaningVi: "đi", partOfSpeech: "verb", ipa: "/ɡoʊ/" }] }, ["go"], "en")).toThrow(/index 0/u);
  });

  it("rejects English items missing partOfSpeech or missing valid IPA", () => {
    expect(() => validateEnrichmentItems({ items: [{ term: "go", meaningVi: "đi", ipa: "/ɡoʊ/" }] }, ["go"], "en")).toThrow(/partOfSpeech/u);
    expect(() => validateEnrichmentItems({ items: [{ term: "go", meaningVi: "đi", partOfSpeech: "verb" }] }, ["go"], "en")).toThrow(/missing IPA/u);
    expect(() => validateEnrichmentItems({ items: [{ term: "go", meaningVi: "đi", partOfSpeech: "verb", ipa: "go" }] }, ["go"], "en")).toThrow(/invalid IPA/u);
  });

  it("supports heteronyms and multi-sense items with distinct POS and IPA per sense (live, record)", () => {
    const [liveItem] = validateEnrichmentItems({
      items: [{
        term: "live",
        language: "en",
        meaningVi: "sống",
        partOfSpeech: "verb",
        ipa: "/lɪv/",
        senses: [
          { partOfSpeech: "verb", ipa: "/lɪv/", meaningVi: "sống; sinh sống", example: "Where do you live?", exampleTranslation: "Bạn sống ở đâu?" },
          { partOfSpeech: "adjective", ipa: "/laɪv/", meaningVi: "trực tiếp", example: "live broadcast", exampleTranslation: "phát sóng trực tiếp" },
        ],
      }],
    }, ["live"], "en");

    expect(liveItem).toEqual(expect.objectContaining({
      term: "live",
      meaningVi: "sống",
      partOfSpeech: "verb",
      ipa: "/lɪv/",
    }));
    expect((liveItem.senses as any[])[0]).toEqual(expect.objectContaining({
      partOfSpeech: "verb",
      ipa: "/lɪv/",
      meaningVi: "sống; sinh sống",
    }));
    expect((liveItem.senses as any[])[1]).toEqual(expect.objectContaining({
      partOfSpeech: "adjective",
      ipa: "/laɪv/",
      meaningVi: "trực tiếp",
    }));

    const [recordItem] = validateEnrichmentItems({
      items: [{
        term: "record",
        language: "en",
        meaningVi: "hồ sơ; kỷ lục",
        partOfSpeech: "noun",
        ipa: "/ˈrek.ɚd/",
        senses: [
          { partOfSpeech: "noun", ipa: "/ˈrek.ɚd/", meaningVi: "hồ sơ; kỷ lục" },
          { partOfSpeech: "verb", ipa: "/rɪˈkɔːrd/", meaningVi: "ghi âm; ghi lại" },
        ],
      }],
    }, ["record"], "en");

    expect(recordItem.ipa).toBe("/ˈrek.ɚd/");
    expect((recordItem.senses as any[])[1].ipa).toBe("/rɪˈkɔːrd/");
    expect((recordItem.senses as any[])[1].partOfSpeech).toBe("verb");
  });

  it("strips Chinese-only fields from normalized English output", () => {
    const [item] = validateEnrichmentItems({ items: [{
      term: "car", language: "en", meaningVi: "xe hơi", partOfSpeech: "noun", ipa: "/kɑːr/",
      pinyin: "qiche", simplified: "汽车", traditional: "xe hơi", toneData: [1],
    }] }, ["car"], "en");
    expect(item).toEqual(expect.objectContaining({ term: "car", meaningVi: "xe hơi", partOfSpeech: "noun", ipa: "/kɑːr/" }));
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
      .mockResolvedValueOnce({ response: { items: terms.slice(0, 3).map((term) => ({ term, language: "en", meaningVi: `nghĩa ${term}`, partOfSpeech: "noun", ipa: `/${term}-sound/` })) } })
      .mockResolvedValueOnce({ response: { items: [{ term: "go", language: "en", meaningVi: "đi", partOfSpeech: "verb", ipa: "/ɡoʊ/" }] } })
      .mockResolvedValueOnce({ response: { items: [{ term: "car", language: "en", meaningVi: "xe hơi", partOfSpeech: "noun", ipa: "/kɑːr/" }] } })
      .mockResolvedValueOnce({ response: { items: [{ term: "live", language: "en", meaningVi: "sống", partOfSpeech: "verb", ipa: "/lɪv/" }] } })
      .mockResolvedValueOnce({ response: { items: [{ term: "total", language: "en", meaningVi: "tổng cộng", partOfSpeech: "noun", ipa: "/ˈtoʊ.t̬əl/" }] } });
    const response = await handleRequest(jsonRequest("/v1/vocabulary/enrich", enrichBody(terms)), env(run));
    expect(response.status).toBe(200);
    const payload = await response.json() as any;
    expect(payload.data.items.map((item: any) => item.term)).toEqual(terms);
    expect(payload.data.items.every((item: any) => Boolean(item.meaningVi) && Boolean(item.partOfSpeech) && Boolean(item.ipa))).toBe(true);
    expect(run).toHaveBeenCalledTimes(5);
  });

  it("keeps Chinese-only fields for normalized Chinese output", () => {
    const [item] = validateEnrichmentItems({ items: [{ term: "汽车", meaningVi: "xe hơi", partOfSpeech: "noun", pinyin: "qì chē", simplified: "汽车", traditional: "汽車", toneData: [4, 1] }] }, ["汽车"], "zh");
    expect(item).toEqual(expect.objectContaining({ pinyin: "qì chē", simplified: "汽车", traditional: "汽車", toneData: [4, 1], partOfSpeech: "noun" }));
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

  it("updates meaning, POS, and IPA synchronously when switching senses for heteronyms", () => {
    interface PreviewItem {
      term: string;
      meaningVi: string;
      partOfSpeech: string;
      pronunciation: string;
      ipa?: string;
      senses: Array<{ partOfSpeech?: string; meaningVi: string; ipa?: string; pronunciation?: string }>;
    }

    const liveItem: PreviewItem = {
      term: "live",
      meaningVi: "sống",
      partOfSpeech: "verb",
      pronunciation: "/lɪv/",
      ipa: "/lɪv/",
      senses: [
        { partOfSpeech: "verb", ipa: "/lɪv/", meaningVi: "sống; sinh sống" },
        { partOfSpeech: "adjective", ipa: "/laɪv/", meaningVi: "trực tiếp" },
      ],
    };

    const chooseSense = (item: PreviewItem, senseIndex: number): PreviewItem => {
      const sense = item.senses[senseIndex];
      if (!sense) return item;
      const newPron = sense.ipa || sense.pronunciation || item.pronunciation;
      return {
        ...item,
        meaningVi: sense.meaningVi || item.meaningVi,
        partOfSpeech: sense.partOfSpeech || item.partOfSpeech,
        pronunciation: newPron,
        ipa: sense.ipa || newPron,
      };
    };

    const switchedToAdj = chooseSense(liveItem, 1);
    expect(switchedToAdj.meaningVi).toBe("trực tiếp");
    expect(switchedToAdj.partOfSpeech).toBe("adjective");
    expect(switchedToAdj.pronunciation).toBe("/laɪv/");
    expect(switchedToAdj.ipa).toBe("/laɪv/");

    const switchedBackToVerb = chooseSense(switchedToAdj, 0);
    expect(switchedBackToVerb.meaningVi).toBe("sống; sinh sống");
    expect(switchedBackToVerb.partOfSpeech).toBe("verb");
    expect(switchedBackToVerb.pronunciation).toBe("/lɪv/");
    expect(switchedBackToVerb.ipa).toBe("/lɪv/");
  });
});
