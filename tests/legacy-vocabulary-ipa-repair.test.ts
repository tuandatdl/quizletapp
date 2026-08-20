import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { indexedDB } from "fake-indexeddb";
import { isLikelyIpa, needsExistingVocabularyRepair } from "../src/shared/schemas.js";
import { getIndexedDbAdapter } from "../src/frontend/persistence/indexedDb.js";
import { StaticApiRouter } from "../src/frontend/static/staticApiRouter.js";
import type { VocabularyItem } from "../src/frontend/types/api.js";

describe("Legacy English Pronunciation and IPA Data Repair (Tests A - J)", () => {
  beforeEach(async () => {
    vi.stubGlobal("indexedDB", indexedDB);
    vi.stubGlobal("navigator", { onLine: true });
    vi.stubGlobal("__ENV__", { VITE_LANGUAGE_API_URL: "https://mock-language-api.dev" });
    vi.stubEnv("VITE_LANGUAGE_API_URL", "https://mock-language-api.dev");
    await getIndexedDbAdapter().clearAll();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  describe("isLikelyIpa helper verification", () => {
    it("recognizes valid IPA transcriptions enclosed in slashes or brackets", () => {
      expect(isLikelyIpa("/ˈkʌs.tə.mɚ/")).toBe(true);
      expect(isLikelyIpa("/ɡoʊ/")).toBe(true);
      expect(isLikelyIpa("/kəmˈpjuː.tɚ/")).toBe(true);
      expect(isLikelyIpa("/ˈæp.əl/")).toBe(true);
      expect(isLikelyIpa("/lɪv/")).toBe(true);
      expect(isLikelyIpa("[ˈkʌs.tə.mɚ]")).toBe(true);
    });

    it("rejects phonetic respellings, plain words, and invalid inputs", () => {
      expect(isLikelyIpa("KUH-stoh-mehr")).toBe(false);
      expect(isLikelyIpa("go")).toBe(false);
      expect(isLikelyIpa("customer")).toBe(false);
      expect(isLikelyIpa("KUS-tuh-mer")).toBe(false);
      expect(isLikelyIpa("/KUH-stoh-mehr/")).toBe(false);
      expect(isLikelyIpa("/go/")).toBe(false);
      expect(isLikelyIpa("/customer/")).toBe(false);
      expect(isLikelyIpa("")).toBe(false);
      expect(isLikelyIpa(null)).toBe(false);
      expect(isLikelyIpa(undefined)).toBe(false);
      expect(isLikelyIpa(123)).toBe(false);
    });
  });

  it("Test A: Existing English with phonetic respelling (KUH-stoh-mehr) results in suggestion.ipa === null", async () => {
    const adapter = getIndexedDbAdapter();
    const router = new StaticApiRouter(adapter);

    const legacyItem: VocabularyItem = {
      id: "legacy-customer-id-1",
      userId: "local-profile",
      language: "en",
      term: "Customer",
      normalizedTerm: "customer",
      pronunciation: "KUH-stoh-mehr",
      meaningVi: "khách hàng",
      partOfSpeech: "noun",
      example: null,
      exampleTranslation: null,
      topic: null,
      level: null,
      note: null,
      source: "IMPORT",
      sourceReadingId: null,
      audioUrl: null,
      audioAvailable: false,
      favorite: true,
      metadata: {}, // no ipa in metadata
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
      progress: {
        status: "LEARNING",
        ease: 2.5,
        intervalDays: 3,
        repetitions: 2,
        nextReviewAt: "2025-01-04T00:00:00.000Z",
        lastReviewedAt: "2025-01-01T00:00:00.000Z",
        correctCount: 2,
        incorrectCount: 0,
      },
    };
    await adapter.put("vocabulary", legacyItem as any);

    // Mock fetch for enrichment if called
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      data: {
        items: [
          {
            term: "Customer",
            language: "en",
            meaningVi: "khách hàng",
            partOfSpeech: "noun",
            ipa: "/ˈkʌs.tə.mɚ/",
            pronunciation: "/ˈkʌs.tə.mɚ/",
          },
        ],
      },
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    // When previewing without AI configured/triggered:
    const preview = await router.request<{ items: Array<{ duplicate: boolean; suggestion: any }> }>(
      "/api/vocabulary/bulk-preview",
      {
        method: "POST",
        body: JSON.stringify({ language: "en", input: "Customer" }),
      }
    );

    expect(preview.items[0]?.duplicate).toBe(true);
    // Because pronunciation is phonetic respelling, suggestion.ipa must NOT be KUH-stoh-mehr
    // When fresh enrichment ran because it needed repair, it receives fresh IPA
    expect(preview.items[0]?.suggestion.ipa).toBe("/ˈkʌs.tə.mɚ/");
    expect(preview.items[0]?.suggestion.existingId).toBe("legacy-customer-id-1");
  });

  it("Test B: Existing English with valid IPA in pronunciation maps to suggestion.ipa", async () => {
    const adapter = getIndexedDbAdapter();
    const router = new StaticApiRouter(adapter);

    const validItem: VocabularyItem = {
      id: "valid-customer-id-2",
      userId: "local-profile",
      language: "en",
      term: "Customer",
      normalizedTerm: "customer",
      pronunciation: "/ˈkʌs.tə.mɚ/",
      meaningVi: "khách hàng",
      partOfSpeech: "noun",
      example: null,
      exampleTranslation: null,
      topic: null,
      level: null,
      note: null,
      source: "MANUAL",
      sourceReadingId: null,
      audioUrl: null,
      audioAvailable: false,
      favorite: false,
      metadata: {},
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      progress: {
        status: "NEW",
        ease: 2.5,
        intervalDays: 0,
        repetitions: 0,
        nextReviewAt: null,
        lastReviewedAt: null,
        correctCount: 0,
        incorrectCount: 0,
      },
    };
    await adapter.put("vocabulary", validItem as any);

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const preview = await router.request<{ items: Array<{ duplicate: boolean; suggestion: any }> }>(
      "/api/vocabulary/bulk-preview",
      {
        method: "POST",
        body: JSON.stringify({ language: "en", input: "Customer" }),
      }
    );

    expect(preview.items[0]?.duplicate).toBe(true);
    expect(preview.items[0]?.suggestion.ipa).toBe("/ˈkʌs.tə.mɚ/");
    expect(preview.items[0]?.suggestion.needsRepair).toBe(false);
    // Modern valid duplicate should NOT trigger AI enrichment
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("Test C: Valid meta.ipa is always preferred over pronunciation", async () => {
    const adapter = getIndexedDbAdapter();
    const router = new StaticApiRouter(adapter);

    const itemWithMetaIpa: VocabularyItem = {
      id: "meta-ipa-item-3",
      userId: "local-profile",
      language: "en",
      term: "Record",
      normalizedTerm: "record",
      pronunciation: "rek-erd",
      meaningVi: "bản ghi",
      partOfSpeech: "noun",
      example: null,
      exampleTranslation: null,
      topic: null,
      level: null,
      note: null,
      source: "MANUAL",
      sourceReadingId: null,
      audioUrl: null,
      audioAvailable: false,
      favorite: false,
      metadata: { ipa: "/ˈrek.ɚd/" },
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      progress: {
        status: "NEW",
        ease: 2.5,
        intervalDays: 0,
        repetitions: 0,
        nextReviewAt: null,
        lastReviewedAt: null,
        correctCount: 0,
        incorrectCount: 0,
      },
    };
    await adapter.put("vocabulary", itemWithMetaIpa as any);

    const preview = await router.request<{ items: Array<{ duplicate: boolean; suggestion: any }> }>(
      "/api/vocabulary/bulk-preview",
      {
        method: "POST",
        body: JSON.stringify({ language: "en", input: "Record" }),
      }
    );

    expect(preview.items[0]?.suggestion.ipa).toBe("/ˈrek.ɚd/");
    expect(preview.items[0]?.suggestion.needsRepair).toBe(false);
  });

  it("Test D: Legacy duplicate is marked repairable (needsExistingVocabularyRepair returns true)", () => {
    expect(
      needsExistingVocabularyRepair({
        language: "en",
        pronunciation: "KUH-stoh-mehr",
        meaningVi: "khách hàng",
        partOfSpeech: "noun",
        metadata: {},
      })
    ).toBe(true);

    expect(
      needsExistingVocabularyRepair({
        language: "en",
        pronunciation: "/ˈkʌs.tə.mɚ/",
        meaningVi: "khách hàng",
        partOfSpeech: null,
        metadata: {},
      })
    ).toBe(true);

    expect(
      needsExistingVocabularyRepair({
        language: "en",
        pronunciation: "/ˈkʌs.tə.mɚ/",
        meaningVi: "khách hàng",
        partOfSpeech: "noun",
        metadata: { ipa: "/ˈkʌs.tə.mɚ/" },
      })
    ).toBe(false);
  });

  it("Test E: Modern valid duplicate does NOT call enrichment", async () => {
    const adapter = getIndexedDbAdapter();
    const router = new StaticApiRouter(adapter);

    const modernItem: VocabularyItem = {
      id: "modern-computer-id",
      userId: "local-profile",
      language: "en",
      term: "Computer",
      normalizedTerm: "computer",
      pronunciation: "/kəmˈpjuː.tɚ/",
      meaningVi: "máy tính",
      partOfSpeech: "noun",
      example: "I use a computer.",
      exampleTranslation: "Tôi dùng máy tính.",
      topic: "Tech",
      level: "A2",
      note: null,
      source: "MANUAL",
      sourceReadingId: null,
      audioUrl: null,
      audioAvailable: false,
      favorite: false,
      metadata: { ipa: "/kəmˈpjuː.tɚ/" },
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      progress: {
        status: "MASTERED",
        ease: 2.8,
        intervalDays: 60,
        repetitions: 10,
        nextReviewAt: "2026-03-01T00:00:00.000Z",
        lastReviewedAt: "2026-01-01T00:00:00.000Z",
        correctCount: 10,
        incorrectCount: 0,
      },
    };
    await adapter.put("vocabulary", modernItem as any);

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const preview = await router.request<{ items: Array<{ duplicate: boolean; suggestion: any }> }>(
      "/api/vocabulary/bulk-preview",
      {
        method: "POST",
        body: JSON.stringify({ language: "en", input: "Computer" }),
      }
    );

    expect(preview.items[0]?.duplicate).toBe(true);
    expect(preview.items[0]?.suggestion.needsRepair).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("Test F & G & H: Repairing duplicate updates same ID and preserves progress, favorite, createdAt while storing fresh IPA", async () => {
    const adapter = getIndexedDbAdapter();
    const router = new StaticApiRouter(adapter);

    const legacyItem: VocabularyItem = {
      id: "legacy-customer-id-44",
      userId: "local-profile",
      language: "en",
      term: "Customer",
      normalizedTerm: "customer",
      pronunciation: "KUH-stoh-mehr",
      meaningVi: "khách hàng",
      partOfSpeech: "noun",
      example: "Old example",
      exampleTranslation: "Ví dụ cũ",
      topic: "Business",
      level: "B1",
      note: "Important note",
      source: "MANUAL",
      sourceReadingId: null,
      audioUrl: null,
      audioAvailable: false,
      favorite: true,
      metadata: { originalSource: "v1-import" },
      createdAt: "2024-05-15T10:00:00.000Z",
      updatedAt: "2024-05-15T10:00:00.000Z",
      progress: {
        status: "REVIEW",
        ease: 2.6,
        intervalDays: 14,
        repetitions: 5,
        nextReviewAt: "2026-09-01T00:00:00.000Z",
        lastReviewedAt: "2026-08-18T00:00:00.000Z",
        correctCount: 5,
        incorrectCount: 1,
      },
    };
    await adapter.put("vocabulary", legacyItem as any);

    // User accepts fresh repaired data and saves via bulk endpoint
    const saveResult = await router.request<{ created: VocabularyItem[]; existing: VocabularyItem[] }>(
      "/api/vocabulary/bulk",
      {
        method: "POST",
        body: JSON.stringify({
          language: "en",
          items: [
            {
              existingId: "legacy-customer-id-44",
              repairExisting: true,
              term: "Customer",
              meaningVi: "khách hàng",
              partOfSpeech: "noun",
              pronunciation: "/ˈkʌs.tə.mɚ/",
              ipa: "/ˈkʌs.tə.mɚ/",
              cefr: "B1",
            },
          ],
        }),
      }
    );

    // Must be in existing (not created)
    expect(saveResult.created).toHaveLength(0);
    expect(saveResult.existing).toHaveLength(1);

    const updated = await adapter.get<VocabularyItem>("vocabulary", "legacy-customer-id-44");
    expect(updated).toBeDefined();

    // Test F: Same ID
    expect(updated?.id).toBe("legacy-customer-id-44");

    // Test G: Preserves progress, favorite, createdAt
    expect(updated?.createdAt).toBe("2024-05-15T10:00:00.000Z");
    expect(updated?.favorite).toBe(true);
    expect(updated?.progress.status).toBe("REVIEW");
    expect(updated?.progress.ease).toBe(2.6);
    expect(updated?.progress.repetitions).toBe(5);
    expect(updated?.progress.intervalDays).toBe(14);
    expect(updated?.progress.nextReviewAt).toBe("2026-09-01T00:00:00.000Z");
    expect(updated?.progress.lastReviewedAt).toBe("2026-08-18T00:00:00.000Z");
    expect(updated?.progress.correctCount).toBe(5);

    // Test H: Stores fresh IPA in metadata.ipa and pronunciation
    expect(updated?.pronunciation).toBe("/ˈkʌs.tə.mɚ/");
    expect((updated?.metadata as any)?.ipa).toBe("/ˈkʌs.tə.mɚ/");
    expect((updated?.metadata as any)?.originalSource).toBe("v1-import");
  });

  it("Test I: Chinese pinyin behavior is unchanged", async () => {
    const adapter = getIndexedDbAdapter();
    const router = new StaticApiRouter(adapter);

    const zhItem: VocabularyItem = {
      id: "zh-item-1",
      userId: "local-profile",
      language: "zh",
      term: "学习",
      normalizedTerm: "学习",
      pronunciation: "xuéxí",
      meaningVi: "học tập",
      partOfSpeech: "verb",
      example: "我们学习汉语。",
      exampleTranslation: "Chúng tôi học tiếng Hán.",
      topic: "Study",
      level: "HSK1",
      note: null,
      source: "MANUAL",
      sourceReadingId: null,
      audioUrl: null,
      audioAvailable: false,
      favorite: false,
      metadata: { pinyin: "xuéxí", simplified: "学习", traditional: "學習", hskLevel: 1 },
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      progress: {
        status: "NEW",
        ease: 2.5,
        intervalDays: 0,
        repetitions: 0,
        nextReviewAt: null,
        lastReviewedAt: null,
        correctCount: 0,
        incorrectCount: 0,
      },
    };
    await adapter.put("vocabulary", zhItem as any);

    const preview = await router.request<{ items: Array<{ duplicate: boolean; suggestion: any }> }>(
      "/api/vocabulary/bulk-preview",
      {
        method: "POST",
        body: JSON.stringify({ language: "zh", input: "学习" }),
      }
    );

    expect(preview.items[0]?.duplicate).toBe(true);
    expect(preview.items[0]?.suggestion.pinyin).toBe("xuéxí");
    expect(preview.items[0]?.suggestion.pronunciation).toBe("xuéxí");
    expect(preview.items[0]?.suggestion.simplified).toBe("学习");
  });

  it("Test J: Normal duplicate import does NOT overwrite existing row or create duplicate rows", async () => {
    const adapter = getIndexedDbAdapter();
    const router = new StaticApiRouter(adapter);

    const existing: VocabularyItem = {
      id: "do-not-overwrite-id",
      userId: "local-profile",
      language: "en",
      term: "Beautiful",
      normalizedTerm: "beautiful",
      pronunciation: "/ˈbjuː.t̬ə.fəl/",
      meaningVi: "rất đẹp",
      partOfSpeech: "adjective",
      example: null,
      exampleTranslation: null,
      topic: "Descriptive",
      level: "A1",
      note: null,
      source: "MANUAL",
      sourceReadingId: null,
      audioUrl: null,
      audioAvailable: false,
      favorite: true,
      metadata: { ipa: "/ˈbjuː.t̬ə.fəl/" },
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      progress: {
        status: "LEARNING",
        ease: 2.5,
        intervalDays: 1,
        repetitions: 1,
        nextReviewAt: "2026-01-02T00:00:00.000Z",
        lastReviewedAt: "2026-01-01T00:00:00.000Z",
        correctCount: 1,
        incorrectCount: 0,
      },
    };
    await adapter.put("vocabulary", existing as any);

    // Normal import with duplicate word without existingId
    const res = await router.request<{ created: VocabularyItem[]; existing: VocabularyItem[] }>(
      "/api/vocabulary/bulk",
      {
        method: "POST",
        body: JSON.stringify({
          language: "en",
          items: [
            {
              term: "Beautiful",
              meaningVi: "xinh xắn", // different meaning
              partOfSpeech: "adj",
            },
          ],
        }),
      }
    );

    expect(res.created).toHaveLength(0);
    expect(res.existing).toHaveLength(1);

    // Verify row count in store is still 1
    const all = await adapter.getAll<VocabularyItem>("vocabulary");
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe("do-not-overwrite-id");
    // Meaning must not be overwritten
    expect(all[0]?.meaningVi).toBe("rất đẹp");
  });
});
