import { describe, expect, it, vi } from "vitest";
import { AiGateway, AiGatewayExhaustedError, AiProviderError, GeminiProvider, gatewayCacheKey, type AiGatewayCache, type AiProvider } from "../cloudflare/worker/src/aiGateway.js";
import {
  assessEnrichmentQuality,
  estimateGeminiCost,
  parseGeminiUsageMetadata,
  safeAiLog,
} from "../cloudflare/worker/src/aiQuality.js";
import { validateEnrichmentItems } from "../cloudflare/worker/src/index.js";
import { buildHighVolumeImportPlan, parseHighVolumeImport, summarizeHighVolumeJob } from "../src/frontend/pages/vocabulary/highVolumePipeline.js";
import type { VocabularyItem } from "../src/frontend/types/api.js";

const request = { operation: "enrichment" as const, systemPrompt: "json", userPrompt: "customer", schema: { type: "object" }, maxTokens: 100, workersModel: "workers-test" };

function provider(complete: () => Promise<unknown>): AiProvider {
  return { name: "gemini", isConfigured: () => true, complete: complete as AiProvider["complete"] };
}

function validEnglish(term = "customer") {
  return { term, language: "en", lexicalStatus: "VALID", lexicalConfidence: 0.8, meaningVi: "khách hàng", partOfSpeech: "noun", ipa: "/ˈkʌstəmər/", pronunciation: "/ˈkʌstəmər/", cefr: "B1", senses: [{ meaningVi: "khách hàng", partOfSpeech: "noun" }] };
}

function vocabulary(term: string): VocabularyItem {
  return {
    id: term, userId: "user", language: "en", term, normalizedTerm: term.toLowerCase(), pronunciation: null, meaningVi: "nghĩa", partOfSpeech: null,
    example: null, exampleTranslation: null, topic: null, topics: [], collectionIds: [], level: null, note: null, source: "IMPORT", sourceReadingId: null,
    audioUrl: null, audioAvailable: false, favorite: false, metadata: {}, createdAt: "2026-01-01", updatedAt: "2026-01-01",
    progress: { status: "NEW", ease: 2.5, intervalDays: 0, repetitions: 0, nextReviewAt: null, lastReviewedAt: null, correctCount: 0, incorrectCount: 0 },
  };
}

describe("Phase J quality signal", () => {
  it("QUALITY_VALID_ENGLISH preserves provider confidence and produces an accepted quality signal", () => {
    const [item] = validateEnrichmentItems({ items: [validEnglish()] }, ["customer"], "en");
    const quality = assessEnrichmentQuality([item!], "en");
    expect(item?.lexicalConfidence).toBe(0.8);
    expect(quality).toMatchObject({ status: "accepted", applicationQualityScore: 100, providerConfidenceCount: 1, validCount: 1 });
  });

  it("QUALITY_VALID_CHINESE keeps normalized Chinese fields without fabricating confidence", () => {
    const [item] = validateEnrichmentItems({ items: [{ term: "学习", language: "zh", lexicalStatus: "VALID", meaningVi: "học", partOfSpeech: "verb", pinyin: "xué xí", simplified: "学习", traditional: "學習", toneData: [2, 2], senses: [{ meaningVi: "học" }] }] }, ["学习"], "zh");
    const quality = assessEnrichmentQuality([item!], "zh");
    expect(item).toMatchObject({ pinyin: "xué xí", simplified: "学习", traditional: "學習", toneData: [2, 2], lexicalConfidence: undefined });
    expect(quality).toMatchObject({ status: "accepted", providerConfidenceCount: 0, validCount: 1 });
  });

  it("QUALITY_IDENTITY_FAILURE_REJECTED and QUALITY_MISSING_REQUIRED_REJECTED", () => {
    expect(() => validateEnrichmentItems({ items: [validEnglish("car")] }, ["customer"], "en")).toThrow(/identity/u);
    expect(() => validateEnrichmentItems({ items: [{ term: "customer", lexicalStatus: "VALID", meaningVi: "khách hàng", ipa: "/x/", cefr: "B1" }] }, ["customer"], "en")).toThrow(/required lexical fields/u);
  });

  it("NO_FAKE_PROVIDER_CONFIDENCE rejects invalid confidence instead of inventing a value", () => {
    const [item] = validateEnrichmentItems({ items: [{ ...validEnglish(), lexicalConfidence: Number.NaN }] }, ["customer"], "en");
    expect(item?.lexicalConfidence).toBeUndefined();
  });

  it("QUALITY_UNCERTAIN_NOT_RETRY_STORM does not retry a successful uncertain response", async () => {
    const complete = vi.fn().mockResolvedValue({ term: "customer", meaningVi: "khách hàng", lexicalStatus: "UNCERTAIN" });
    const result = await new AiGateway([provider(complete)]).run(request, (value) => value);
    expect(result.provider).toBe("gemini");
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it("deterministic provider validation errors do not consume a fallback call", async () => {
    const workers = vi.fn();
    const gateway = new AiGateway([
      provider(async () => { throw new AiProviderError("gemini", "VALIDATION_ERROR", "schema"); }),
      { name: "workers-ai", isConfigured: () => true, complete: workers },
    ]);
    await expect(gateway.run(request, (value) => value)).rejects.toBeInstanceOf(AiGatewayExhaustedError);
    expect(workers).not.toHaveBeenCalled();
  });
});

describe("Phase J usage, cache and safe diagnostics", () => {
  it("GEMINI_USAGE_METADATA_PARSED and GEMINI_USAGE_METADATA_OPTIONAL", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ term: "customer", meaningVi: "khách hàng" }) }] } }], usageMetadata: { promptTokenCount: 12, candidatesTokenCount: 8, totalTokenCount: 20 } })));
    const result = await new AiGateway([new GeminiProvider({ apiKey: "test", model: "gemini-test", fetcher: fetcher as typeof fetch })]).run(request, (value) => value);
    expect(result.usage).toEqual({ unit: "tokens", inputTokens: 12, outputTokens: 8, totalTokens: 20 });
    expect(parseGeminiUsageMetadata({})).toBeUndefined();
    expect(estimateGeminiCost(result.usage, { version: "test", geminiInputPricePerMillion: 1, geminiOutputPricePerMillion: 2 })).toBeCloseTo(0.000028);
    expect(estimateGeminiCost(undefined, { geminiInputPricePerMillion: 1, geminiOutputPricePerMillion: 2 })).toBeUndefined();
  });

  it("CACHE_HIT_AI_CALLS_ZERO and CACHE_METRIC_CORRECT", async () => {
    const cache: AiGatewayCache = { get: async () => ({ term: "customer" }), put: async () => undefined };
    const complete = vi.fn();
    const result = await new AiGateway([provider(complete)], cache).run({ ...request, cacheKey: "cached" }, (value) => value);
    expect(result).toMatchObject({ provider: "cache", cacheHit: true, cacheMiss: false, cacheReadFailure: false, cacheWriteFailure: false });
    expect(complete).not.toHaveBeenCalled();
  });

  it("METRICS_FAILURE_FAIL_OPEN", () => {
    expect(() => safeAiLog("test", { itemCount: 1 }, () => { throw new Error("logger down"); })).not.toThrow();
  });

  it("CONTEXT_QUALITY_ISOLATION retains separate safe cache identities", () => {
    const river = gatewayCacheKey({ operation: "enrichment", terms: ["bank"], contexts: [{ sentence: "river" }] });
    const financial = gatewayCacheKey({ operation: "enrichment", terms: ["bank"], contexts: [{ sentence: "financial" }] });
    expect(river).not.toBe(financial);
  });
});

describe("Phase J high-volume intelligence", () => {
  it("USER_COMPLETE_AI_NOT_REQUIRED, DEDUPE_AI_CALL_REDUCTION, EXISTING_AI_CALL_REDUCTION and HIGH_VOLUME_JOB_METRICS", () => {
    const parsed = parseHighVolumeImport("Customer\ncustomer\nknown\nmanual: nhập tay\nfresh", "en");
    const plan = buildHighVolumeImportPlan(parsed, "en", [vocabulary("known")]);
    const metrics = summarizeHighVolumeJob(plan, { enrichmentBatchCount: 1, cacheHitBatchCount: 1 });
    expect(metrics).toMatchObject({ inputCount: 5, uniqueCount: 4, duplicateCount: 1, existingSkipped: 1, userCompleteSkipped: 1, enrichmentItemCount: 2, enrichmentBatchCount: 1, cacheHitBatchCount: 1 });
  });
});
