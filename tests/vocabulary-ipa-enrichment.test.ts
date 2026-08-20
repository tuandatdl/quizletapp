import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { indexedDB } from "fake-indexeddb";
import {
  LanguageApiClient,
  ENRICHMENT_VERSION,
  isValidEnrichmentCacheRecord,
  validateEnrichment,
  cacheKey,
} from "../src/frontend/services/languageApi.js";
import {
  validateEnrichmentItems,
  createEnrichmentSchema,
  handleRequest,
  type Env,
} from "../cloudflare/worker/src/index.js";
import { getIndexedDbAdapter } from "../src/frontend/persistence/indexedDb.js";
import { StaticApiRouter } from "../src/frontend/static/staticApiRouter.js";

describe("English IPA Vocabulary Enrichment & Cache Safety (Tests A - H)", () => {
  beforeEach(() => {
    vi.stubGlobal("indexedDB", indexedDB);
    vi.stubGlobal("navigator", { onLine: true });
    vi.stubGlobal("__ENV__", { VITE_LANGUAGE_API_URL: "https://mock-language-api.dev" });
    vi.stubEnv("VITE_LANGUAGE_API_URL", "https://mock-language-api.dev");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  describe("Test A: Model & Validation rejects wrong prompt-copied IPA on customer", () => {
    it("rejects fixture where customer receives /ɡoʊ/ (IPA for 'go')", () => {
      expect(() =>
        validateEnrichmentItems(
          {
            items: [
              {
                term: "customer",
                language: "en",
                meaningVi: "khách hàng",
                partOfSpeech: "noun",
                ipa: "/ɡoʊ/",
              },
            ],
          },
          ["customer"],
          "en"
        )
      ).toThrow(/anomalous IPA/u);
    });

    it("accepts valid General American IPA for customer", () => {
      const [item] = validateEnrichmentItems(
        {
          items: [
            {
              term: "customer",
              language: "en",
              meaningVi: "khách hàng",
              partOfSpeech: "noun",
              ipa: "/ˈkʌs.tə.mɚ/",
            },
          ],
        },
        ["customer"],
        "en"
      );
      expect(item).toEqual(
        expect.objectContaining({
          term: "customer",
          meaningVi: "khách hàng",
          partOfSpeech: "noun",
          ipa: "/ˈkʌs.tə.mɚ/",
          pronunciation: "/ˈkʌs.tə.mɚ/",
        })
      );
    });
  });

  describe("Test B: Batch field isolation across distinct terms", () => {
    it("detects cross-item IPA contamination in batch (e.g. go and customer sharing /ɡoʊ/)", () => {
      expect(() =>
        validateEnrichmentItems(
          {
            items: [
              { term: "go", language: "en", meaningVi: "đi", partOfSpeech: "verb", ipa: "/ɡoʊ/" },
              { term: "customer", language: "en", meaningVi: "khách hàng", partOfSpeech: "noun", ipa: "/ɡoʊ/" },
              { term: "apple", language: "en", meaningVi: "quả táo", partOfSpeech: "noun", ipa: "/ˈæp.əl/" },
              { term: "computer", language: "en", meaningVi: "máy tính", partOfSpeech: "noun", ipa: "/kəmˈpjuː.tɚ/" },
            ],
          },
          ["go", "customer", "apple", "computer"],
          "en"
        )
      ).toThrow();
    });

    it("accepts clean batch with distinct, correct IPAs for all items", () => {
      const items = validateEnrichmentItems(
        {
          items: [
            { term: "go", language: "en", meaningVi: "đi", partOfSpeech: "verb", ipa: "/ɡoʊ/" },
            { term: "customer", language: "en", meaningVi: "khách hàng", partOfSpeech: "noun", ipa: "/ˈkʌs.tə.mɚ/" },
            { term: "apple", language: "en", meaningVi: "quả táo", partOfSpeech: "noun", ipa: "/ˈæp.əl/" },
            { term: "computer", language: "en", meaningVi: "máy tính", partOfSpeech: "noun", ipa: "/kəmˈpjuː.tɚ/" },
          ],
        },
        ["go", "customer", "apple", "computer"],
        "en"
      );
      expect(items[0]!.ipa).toBe("/ɡoʊ/");
      expect(items[1]!.ipa).toBe("/ˈkʌs.tə.mɚ/");
      expect(items[2]!.ipa).toBe("/ˈæp.əl/");
      expect(items[3]!.ipa).toBe("/kəmˈpjuː.tɚ/");
    });

    it("allows legitimate homophones in the same batch", () => {
      const items = validateEnrichmentItems(
        {
          items: [
            { term: "right", language: "en", meaningVi: "đúng", partOfSpeech: "adjective", ipa: "/raɪt/" },
            { term: "write", language: "en", meaningVi: "viết", partOfSpeech: "verb", ipa: "/raɪt/" },
          ],
        },
        ["right", "write"],
        "en"
      );
      expect(items[0]!.ipa).toBe("/raɪt/");
      expect(items[1]!.ipa).toBe("/raɪt/");
    });
  });

  describe("Test C: Cache safety against corrupted/mismatched terms", () => {
    it("discards cache record where normalizedTerm is 'customer' but value.term is 'go'", () => {
      const corruptRecord = {
        id: "vocabulary-enrichment-v3:en:customer",
        version: "vocabulary-enrichment-v3",
        language: "en" as const,
        normalizedTerm: "customer",
        value: {
          term: "go",
          language: "en" as const,
          meaningVi: "đi",
          partOfSpeech: "verb",
          ipa: "/ɡoʊ/",
        },
        updatedAt: new Date().toISOString(),
      };
      expect(isValidEnrichmentCacheRecord(corruptRecord, "en", "customer")).toBe(false);
    });

    it("discards cache record with anomalous /ɡoʊ/ for a word other than 'go'", () => {
      const badIpaRecord = {
        id: "vocabulary-enrichment-v3:en:customer",
        version: "vocabulary-enrichment-v3",
        language: "en" as const,
        normalizedTerm: "customer",
        value: {
          term: "customer",
          language: "en" as const,
          meaningVi: "khách hàng",
          partOfSpeech: "noun",
          ipa: "/ɡoʊ/",
        },
        updatedAt: new Date().toISOString(),
      };
      expect(isValidEnrichmentCacheRecord(badIpaRecord, "en", "customer")).toBe(false);
    });

    it("accepts valid cache record matching term and language", () => {
      const validRecord = {
        id: "vocabulary-enrichment-v3:en:customer",
        version: "vocabulary-enrichment-v3",
        language: "en" as const,
        normalizedTerm: "customer",
        value: {
          term: "customer",
          language: "en" as const,
          meaningVi: "khách hàng",
          partOfSpeech: "noun",
          ipa: "/ˈkʌs.tə.mɚ/",
          pronunciation: "/ˈkʌs.tə.mɚ/",
        },
        updatedAt: new Date().toISOString(),
      };
      expect(isValidEnrichmentCacheRecord(validRecord, "en", "customer")).toBe(true);
    });
  });

  describe("Test D: Invalidate old vocabulary-enrichment-v2 cache after v3 bump", () => {
    it("ENRICHMENT_VERSION is vocabulary-enrichment-v3", () => {
      expect(ENRICHMENT_VERSION).toBe("vocabulary-enrichment-v3");
    });

    it("ignores old v2 cache record", () => {
      const v2Record = {
        id: "vocabulary-enrichment-v2:en:customer",
        version: "vocabulary-enrichment-v2",
        language: "en" as const,
        normalizedTerm: "customer",
        value: {
          term: "customer",
          language: "en" as const,
          meaningVi: "khách hàng",
          partOfSpeech: "noun",
          ipa: "/ɡoʊ/",
        },
        updatedAt: new Date().toISOString(),
      };
      expect(isValidEnrichmentCacheRecord(v2Record, "en", "customer")).toBe(false);
    });
  });

  describe("Test E: refresh=true bypasses cache and replaces stale data", async () => {
    it("fetches fresh data from API and updates cache when refresh=true", async () => {
      const persistence = getIndexedDbAdapter();
      // Put a stale record in cache
      await persistence.put("enrichmentCache", {
        id: cacheKey("en", "customer"),
        version: ENRICHMENT_VERSION,
        language: "en",
        normalizedTerm: "customer",
        value: {
          term: "customer",
          language: "en",
          meaningVi: "khách hàng cũ",
          partOfSpeech: "noun",
          ipa: "/ˈkʌs.tə.mɚ/",
          pronunciation: "/ˈkʌs.tə.mɚ/",
        },
        updatedAt: new Date().toISOString(),
      });

      const fetchMock = vi.fn(async () =>
        new Response(
          JSON.stringify({
            data: {
              items: [
                {
                  term: "customer",
                  language: "en",
                  meaningVi: "khách hàng mới",
                  partOfSpeech: "noun",
                  ipa: "/ˈkʌs.tə.mɚ/",
                  pronunciation: "/ˈkʌs.tə.mɚ/",
                },
              ],
            },
          }),
          { status: 200 }
        )
      );
      vi.stubGlobal("fetch", fetchMock);

      const client = new LanguageApiClient(persistence);

      // Without refresh: reads cache
      const cachedResult = await client.enrichTerms("en", ["customer"], false);
      expect(cachedResult[0]!.meaningVi).toBe("khách hàng cũ");
      expect(fetchMock).not.toHaveBeenCalled();

      // With refresh=true: calls API and updates cache
      const freshResult = await client.enrichTerms("en", ["customer"], true);
      expect(freshResult[0]!.meaningVi).toBe("khách hàng mới");
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("Test F & G: UI field precedence (English prefers ipa, Chinese prefers pinyin)", () => {
    it("English enrichment suggestion prioritizes ipa over pronunciation fallback", () => {
      const item = {
        term: "customer",
        language: "en" as const,
        meaningVi: "khách hàng",
        partOfSpeech: "noun",
        ipa: "/ˈkʌs.tə.mɚ/",
        pronunciation: "/ˈkʌs.tə.mɚ/",
      };
      const validated = validateEnrichment(item, "en");
      expect(validated.ipa).toBe("/ˈkʌs.tə.mɚ/");
      expect(validated.pronunciation).toBe("/ˈkʌs.tə.mɚ/");
    });

    it("Chinese enrichment suggestion prioritizes pinyin", () => {
      const item = {
        term: "汽车",
        language: "zh" as const,
        meaningVi: "xe hơi",
        partOfSpeech: "noun",
        pinyin: "qì chē",
        simplified: "汽车",
        traditional: "汽車",
      };
      const validated = validateEnrichment(item, "zh");
      expect(validated.pinyin).toBe("qì chē");
    });
  });

  describe("Test H: Sense switch updates IPA correctly", () => {
    it("switching to alternative sense updates IPA and meaning accordingly", () => {
      const heteronymEnrichment = {
        term: "live",
        language: "en" as const,
        meaningVi: "sống",
        partOfSpeech: "verb",
        ipa: "/lɪv/",
        pronunciation: "/lɪv/",
        senses: [
          {
            partOfSpeech: "verb",
            meaningVi: "sống; sinh sống",
            ipa: "/lɪv/",
            pronunciation: "/lɪv/",
          },
          {
            partOfSpeech: "adjective",
            meaningVi: "trực tiếp; sống động",
            ipa: "/laɪv/",
            pronunciation: "/laɪv/",
          },
        ],
      };

      const validated = validateEnrichment(heteronymEnrichment, "en");
      expect(validated.ipa).toBe("/lɪv/");
      expect(validated.senses![1]!.ipa).toBe("/laɪv/");
      expect(validated.senses![1]!.partOfSpeech).toBe("adjective");
    });
  });
});
