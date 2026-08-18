import { AppError, errors } from "../shared/errors.js";
import { bulkVocabularyItemSchema, type BulkVocabularyItem, type Language } from "../shared/schemas.js";
import { normalizeTerm, VocabularyService } from "./vocabulary.js";
import type { VocabularyEnrichmentService, VocabularyEnrichmentSuggestion } from "./vocabulary-enrichment.js";

export const MAX_BULK_TERMS = 100;
export const MAX_QUICK_INPUT_LENGTH = 10_000;
export const MAX_BULK_TERM_LENGTH = 200;

export function parseQuickVocabularyInput(input: string, language: Language): string[] {
  if (input.length > MAX_QUICK_INPUT_LENGTH) {
    throw errors.validation(`Quick vocabulary input must not exceed ${MAX_QUICK_INPUT_LENGTH} characters`);
  }

  const terms: string[] = [];
  const seen = new Set<string>();
  for (const candidate of input.split(/[,;\r\n]+/u)) {
    const term = candidate.trim();
    if (!term) continue;
    if (term.length > MAX_BULK_TERM_LENGTH) {
      throw errors.validation(`Vocabulary terms must not exceed ${MAX_BULK_TERM_LENGTH} characters`, { term });
    }
    const normalized = normalizeTerm(term, language);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      terms.push(term);
    }
  }

  if (!terms.length) throw errors.validation("Quick vocabulary input contains no terms");
  if (terms.length > MAX_BULK_TERMS) {
    throw errors.validation(`A bulk request may contain at most ${MAX_BULK_TERMS} terms`, { count: terms.length });
  }
  return terms;
}

const clean = (value: string | undefined): string | null => value?.trim() || null;
const emptySuggestion = () => ({
  pronunciation: null,
  ipa: null,
  pinyin: null,
  simplified: null,
  traditional: null,
  partOfSpeech: null,
  meaningVi: null,
  synonyms: [] as string[],
  example: null,
  exampleTranslation: null,
  topic: null,
  cefr: null,
  toeicLevel: null,
  hskLevel: null,
  toneData: [] as Array<0 | 1 | 2 | 3 | 4>,
  senses: [] as NonNullable<VocabularyEnrichmentSuggestion["senses"]>
});

function publicSuggestion(suggestion?: VocabularyEnrichmentSuggestion) {
  if (!suggestion) return emptySuggestion();
  return {
    pronunciation: clean(suggestion.pronunciation),
    ipa: clean(suggestion.ipa),
    pinyin: clean(suggestion.pinyin),
    simplified: clean(suggestion.simplified),
    traditional: clean(suggestion.traditional),
    partOfSpeech: clean(suggestion.partOfSpeech),
    meaningVi: clean(suggestion.meaningVi),
    synonyms: suggestion.synonyms ?? [],
    example: clean(suggestion.example),
    exampleTranslation: clean(suggestion.exampleTranslation),
    topic: clean(suggestion.topic),
    cefr: clean(suggestion.cefr),
    toeicLevel: clean(suggestion.toeicLevel),
    hskLevel: suggestion.hskLevel ?? null,
    toneData: suggestion.toneData ?? [],
    senses: suggestion.senses ?? []
  };
}

function enrichmentError(error: unknown) {
  if (error instanceof AppError && ["SERVICE_NOT_CONFIGURED", "EXTERNAL_SERVICE_ERROR"].includes(error.code)) {
    return { code: error.code, message: error.message };
  }
  return { code: "EXTERNAL_SERVICE_ERROR" as const, message: "Vocabulary enrichment request failed" };
}

function metadataFor(language: Language, item: BulkVocabularyItem): Record<string, unknown> {
  const metadata: Record<string, unknown> = {};
  if (item.synonyms.length) metadata.synonyms = item.synonyms;
  if (item.senses?.length) metadata.senses = item.senses;
  if (language === "en") {
    if (item.ipa) metadata.ipa = item.ipa;
    if (item.cefr) metadata.cefr = item.cefr;
    if (item.toeicLevel) metadata.toeicLevel = item.toeicLevel;
  } else {
    if (item.simplified) metadata.simplified = item.simplified;
    if (item.traditional) metadata.traditional = item.traditional;
    if (item.pinyin) metadata.pinyin = item.pinyin;
    if (item.hskLevel !== undefined) metadata.hskLevel = item.hskLevel;
    if (item.toneData) metadata.toneData = item.toneData;
  }
  return metadata;
}

export class VocabularyBulkService {
  constructor(
    private readonly vocabulary: VocabularyService,
    private readonly enrichment: VocabularyEnrichmentService
  ) {}

  enrichmentAvailability() {
    return { configured: this.enrichment.configured, provider: this.enrichment.provider };
  }

  async preview(userId: string, language: Language, input: string) {
    const terms = parseQuickVocabularyInput(input, language);
    const items = [];

    for (const term of terms) {
      const normalizedTerm = normalizeTerm(term, language);
      const duplicate = Boolean(this.vocabulary.findByNormalized(userId, language, normalizedTerm));
      if (duplicate) {
        items.push({ term, normalizedTerm, duplicate: true, status: "EXISTS" as const, suggestion: emptySuggestion() });
        continue;
      }
      if (!this.enrichment.configured) {
        items.push({ term, normalizedTerm, duplicate: false, status: "NEEDS_ENRICHMENT" as const, suggestion: emptySuggestion() });
        continue;
      }

      try {
        const enriched = await this.enrichment.enrich({ language, term, nativeLanguage: "vi" });
        const suggestion = publicSuggestion(enriched);
        items.push({
          term,
          normalizedTerm,
          duplicate: false,
          status: suggestion.meaningVi ? "READY" as const : "NEEDS_ENRICHMENT" as const,
          suggestion
        });
      } catch (error) {
        items.push({
          term,
          normalizedTerm,
          duplicate: false,
          status: "NEEDS_ENRICHMENT" as const,
          suggestion: emptySuggestion(),
          error: enrichmentError(error)
        });
      }
    }

    return { enrichment: this.enrichmentAvailability(), items };
  }

  create(
    userId: string,
    language: Language,
    rawItems: unknown[],
    sourceContext: { source: "IMPORT" | "READING_SELECTION"; sourceReadingId?: string } = { source: "IMPORT" }
  ) {
    const created: unknown[] = [];
    const existing: unknown[] = [];
    const failed: Array<{ index: number; term: string | null; code: string; message: string; details?: unknown }> = [];

    rawItems.forEach((rawItem, index) => {
      const parsed = bulkVocabularyItemSchema.safeParse(rawItem);
      if (!parsed.success) {
        const term = typeof rawItem === "object" && rawItem !== null && typeof (rawItem as { term?: unknown }).term === "string"
          ? (rawItem as { term: string }).term
          : null;
        failed.push({ index, term, code: "VALIDATION_ERROR", message: "Bulk vocabulary item is invalid", details: { issues: parsed.error.issues } });
        return;
      }

      const item = parsed.data;
      try {
        const result = this.vocabulary.create(userId, {
          language,
          term: item.term,
          meaningVi: item.meaningVi,
          pronunciation: item.pronunciation ?? item.ipa ?? item.pinyin ?? null,
          partOfSpeech: item.partOfSpeech ?? null,
          example: item.example ?? null,
          exampleTranslation: item.exampleTranslation ?? null,
          topic: item.topic ?? null,
          level: language === "en" ? item.cefr ?? null : item.hskLevel ? `HSK${item.hskLevel}` : null,
          source: sourceContext.source,
          sourceReadingId: sourceContext.sourceReadingId ?? null,
          metadata: metadataFor(language, item)
        });
        (result.duplicate ? existing : created).push(result.item);
      } catch {
        failed.push({ index, term: item.term, code: "CREATE_FAILED", message: "Vocabulary item could not be created" });
      }
    });

    return { mode: "PARTIAL" as const, created, existing, failed };
  }
}
