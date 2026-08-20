export type AiQualityStatus = "accepted" | "accepted_with_warning" | "rejected";

/** Provider-reported token counts. A unit is explicit so unlike providers are never compared as tokens. */
export interface AiUsage {
  unit: "tokens" | "provider-native";
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

export interface AiQualitySignal {
  status: AiQualityStatus;
  /** Deterministic application score; it never authorizes an otherwise invalid result. */
  applicationQualityScore?: number;
  /** Count only; the provider's per-item confidence remains on the normalized item. */
  providerConfidenceCount: number;
  issues: string[];
  validationPasses: string[];
  validationFailures: string[];
}

export interface EnrichmentQualitySummary extends AiQualitySignal {
  validCount: number;
  uncertainCount: number;
  invalidCount: number;
}

export interface AiPricingConfiguration {
  version?: string;
  geminiInputPricePerMillion?: number;
  geminiOutputPricePerMillion?: number;
}

export function normalizeProviderConfidence(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1 ? value : undefined;
}

function hasText(item: Record<string, unknown>, key: string): boolean {
  return typeof item[key] === "string" && item[key].trim().length > 0;
}

/**
 * Scores only already-normalized output. This deliberately does not replace hard
 * schema/identity validation performed before it is called.
 */
export function assessEnrichmentQuality(items: Array<Record<string, unknown>>, language: "en" | "zh"): EnrichmentQualitySummary {
  const issues = new Set<string>();
  const validationPasses = new Set<string>(["term_identity", "batch_cardinality", "language_identity", "required_fields"]);
  let validCount = 0;
  let uncertainCount = 0;
  let invalidCount = 0;
  let providerConfidenceCount = 0;
  let score = 100;

  for (const item of items) {
    const lexicalStatus = item.lexicalStatus;
    if (normalizeProviderConfidence(item.lexicalConfidence) !== undefined) providerConfidenceCount += 1;
    if (lexicalStatus === "VALID") validCount += 1;
    else if (lexicalStatus === "UNCERTAIN") {
      uncertainCount += 1;
      score -= 12;
      issues.add("uncertain_lexical_classification");
    } else {
      invalidCount += 1;
      score -= 20;
      issues.add("invalid_lexical_classification");
    }

    if (language === "en") {
      validationPasses.add("english_ipa");
      validationPasses.add("english_cefr");
      if (lexicalStatus === "VALID" && (!hasText(item, "ipa") || !hasText(item, "cefr"))) {
        issues.add("english_optional_quality_fields_missing");
        score -= 8;
      }
    } else {
      validationPasses.add("chinese_normalization");
      // These fields are useful when supplied, but are not fabricated or treated as a hard failure.
      if (!hasText(item, "pinyin") || !hasText(item, "simplified") || !hasText(item, "traditional")) {
        issues.add("chinese_optional_fields_missing");
        score -= 4;
      }
    }
    if (!Array.isArray(item.senses) || item.senses.length === 0) {
      issues.add("senses_missing");
      score -= 2;
    }
  }

  const issueList = [...issues].sort();
  return {
    status: issueList.length ? "accepted_with_warning" : "accepted",
    applicationQualityScore: Math.max(0, Math.min(100, score)),
    providerConfidenceCount,
    issues: issueList,
    validationPasses: [...validationPasses].sort(),
    validationFailures: [],
    validCount,
    uncertainCount,
    invalidCount,
  };
}

export function parseGeminiUsageMetadata(value: unknown): AiUsage | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const metadata = value as Record<string, unknown>;
  const inputTokens = metadata.promptTokenCount;
  const outputTokens = metadata.candidatesTokenCount;
  const totalTokens = metadata.totalTokenCount;
  const normal = (count: unknown) => typeof count === "number" && Number.isSafeInteger(count) && count >= 0 ? count : undefined;
  const usage: AiUsage = { unit: "tokens", inputTokens: normal(inputTokens), outputTokens: normal(outputTokens), totalTokens: normal(totalTokens) };
  return usage.inputTokens !== undefined || usage.outputTokens !== undefined || usage.totalTokens !== undefined ? usage : undefined;
}

export function estimateGeminiCost(usage: AiUsage | undefined, pricing: AiPricingConfiguration): number | undefined {
  if (!usage || usage.unit !== "tokens" || usage.inputTokens === undefined || usage.outputTokens === undefined) return undefined;
  const input = pricing.geminiInputPricePerMillion;
  const output = pricing.geminiOutputPricePerMillion;
  if (typeof input !== "number" || !Number.isFinite(input) || input < 0 || typeof output !== "number" || !Number.isFinite(output) || output < 0) return undefined;
  return (usage.inputTokens * input + usage.outputTokens * output) / 1_000_000;
}

/** Observability must never affect an AI result. Only already-safe summaries are accepted here. */
export function safeAiLog(event: string, fields: Record<string, unknown>, logger: (message: string) => void = console.info): void {
  try { logger(JSON.stringify({ event, ...fields })); } catch { /* fail open */ }
}
