import type { Language } from "../types/api";
import type { PersistenceAdapter, StoredRecord } from "../persistence/types";
import { getLanguageApiUrl } from "../runtime/runtime";
import { normalizeCefrLevel, type LexicalStatus, normalizeVocabularyTopics } from "../../shared/vocabularyIntelligence.js";

export const ENRICHMENT_VERSION = "vocabulary-enrichment-v5";
export const MAX_ENRICHMENT_BATCH_SIZE = 25;

export interface VocabularyContext {
  sentence: string;
  previousSentence?: string;
  nextSentence?: string;
}

export interface VocabularySense {
  partOfSpeech?: string;
  meaningVi: string;
  ipa?: string;
  pronunciation?: string;
  pinyin?: string;
  synonyms?: string[];
  example?: string;
  exampleTranslation?: string;
}

export interface VocabularyEnrichment {
  term: string;
  language: Language;
  pronunciation?: string;
  ipa?: string;
  partOfSpeech?: string;
  meaningVi?: string;
  lexicalStatus: LexicalStatus;
  lexicalConfidence?: number;
  lexicalReason?: string;
  enrichmentProvider?: "primary" | "fallback";
  cefr?: string;
  suggestedTopics?: string[];
  synonyms?: string[];
  example?: string;
  exampleTranslation?: string;
  senses?: VocabularySense[];
  simplified?: string;
  traditional?: string;
  pinyin?: string;
  toneData?: Array<0 | 1 | 2 | 3 | 4>;
  partial?: boolean;
}

export interface CacheRecord extends StoredRecord {
  version: string;
  language: Language;
  normalizedTerm: string;
  value: VocabularyEnrichment;
  updatedAt: string;
}

export function normalizeTerm(term: string, language: Language): string {
  return term.normalize("NFKC").trim().replace(/\s+/gu, " ").toLocaleLowerCase(language === "zh" ? "zh-CN" : "en-US");
}

export function cacheKey(language: Language, term: string): string {
  return `${ENRICHMENT_VERSION}:${language}:${normalizeTerm(term, language)}`;
}

export function isValidEnrichmentCacheRecord(
  cached: unknown,
  expectedLanguage: Language,
  expectedTerm: string
): cached is CacheRecord {
  if (!cached || typeof cached !== "object" || Array.isArray(cached)) return false;
  const record = cached as Partial<CacheRecord>;
  if (record.version !== ENRICHMENT_VERSION) return false;
  if (record.language !== expectedLanguage) return false;
  const normalizedExpected = normalizeTerm(expectedTerm, expectedLanguage);
  if (record.normalizedTerm !== normalizedExpected) return false;
  if (!record.value || typeof record.value !== "object" || Array.isArray(record.value)) return false;
  if (record.value.language !== expectedLanguage) return false;
  if (normalizeTerm(record.value.term, expectedLanguage) !== normalizedExpected) return false;
  if (!record.value.lexicalStatus || !["VALID", "UNCERTAIN", "INVALID"].includes(record.value.lexicalStatus)) return false;
  if (record.value.lexicalStatus === "VALID" && (!record.value.meaningVi || typeof record.value.meaningVi !== "string")) return false;
  if (expectedLanguage === "en" && record.value.lexicalStatus === "VALID" && !normalizeCefrLevel(record.value.cefr)) return false;
  if (expectedLanguage === "en") {
    const ipa = record.value.ipa || record.value.pronunciation;
    if (ipa && typeof ipa === "string") {
      if (normalizedExpected !== "go" && ipa.trim() === "/ɡoʊ/") return false;
    }
  }
  return true;
}

function optionalString(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value.trim();
  return clean && clean.length <= max ? clean : undefined;
}

function stringArray(value: unknown, maxItems = 30): string[] | undefined {
  if (!Array.isArray(value) || value.length > maxItems) return undefined;
  const clean = value.map((item) => optionalString(item, 200)).filter((item): item is string => Boolean(item));
  return clean.length ? clean : undefined;
}

export function validateEnrichment(value: unknown, expectedLanguage?: Language): VocabularyEnrichment {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("AI trả về dữ liệu từ vựng không hợp lệ.");
  const item = value as Record<string, unknown>;
  const term = optionalString(item.term, 200);
  const lexicalStatus: LexicalStatus = item.lexicalStatus === "INVALID" || item.lexicalStatus === "UNCERTAIN" ? item.lexicalStatus : "VALID";
  const meaningVi = optionalString(item.meaningVi, 1000);
  const language = item.language === "en" || item.language === "zh" ? item.language : expectedLanguage;
  if (!term || !language || (lexicalStatus === "VALID" && !meaningVi) || (expectedLanguage && language !== expectedLanguage)) {
    throw new Error("AI trả về dữ liệu từ vựng thiếu trường bắt buộc.");
  }
  const senses = Array.isArray(item.senses)
    ? item.senses.slice(0, 20).flatMap((raw) => {
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
        const sense = raw as Record<string, unknown>;
        const meaning = optionalString(sense.meaningVi, 1000);
        return meaning ? [{
          meaningVi: meaning,
          partOfSpeech: optionalString(sense.partOfSpeech, 50),
          ipa: optionalString(sense.ipa, 200),
          pronunciation: optionalString(sense.pronunciation, 200),
          pinyin: optionalString(sense.pinyin, 200),
          synonyms: stringArray(sense.synonyms),
          example: optionalString(sense.example, 2000),
          exampleTranslation: optionalString(sense.exampleTranslation, 2000),
        }] : [];
      })
    : undefined;
  const toneData = Array.isArray(item.toneData)
    ? item.toneData.filter((tone): tone is 0 | 1 | 2 | 3 | 4 => [0, 1, 2, 3, 4].includes(Number(tone))).slice(0, 200)
    : undefined;
  const common: VocabularyEnrichment = {
    term,
    language,
    meaningVi,
    lexicalStatus,
    lexicalConfidence: typeof item.lexicalConfidence === "number" ? Math.max(0, Math.min(1, item.lexicalConfidence)) : undefined,
    lexicalReason: optionalString(item.lexicalReason, 300),
    cefr: language === "en" ? normalizeCefrLevel(item.cefr) ?? undefined : undefined,
    suggestedTopics: language === "en" ? normalizeVocabularyTopics(item.suggestedTopics).slice(0, 3) : undefined,
    pronunciation: optionalString(item.pronunciation, 200),
    ipa: optionalString(item.ipa, 200),
    partOfSpeech: optionalString(item.partOfSpeech, 50),
    synonyms: stringArray(item.synonyms),
    example: optionalString(item.example, 2000),
    exampleTranslation: optionalString(item.exampleTranslation, 2000),
    senses,
    partial: item.partial === true,
  };
  return language === "zh" ? {
    ...common,
    simplified: optionalString(item.simplified, 200),
    traditional: optionalString(item.traditional, 200),
    pinyin: optionalString(item.pinyin, 200),
    toneData,
  } : common;
}

async function fetchJson<T>(path: string, body: unknown): Promise<T> {
  const baseUrl = getLanguageApiUrl();
  if (!baseUrl) throw new Error("VITE_LANGUAGE_API_URL chưa được cấu hình.");
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new Error(typeof navigator !== "undefined" && navigator.onLine === false ? "Không có kết nối để dịch tự động." : "Không thể kết nối dịch vụ ngôn ngữ.", { cause: error });
  }
  const payload = await response.json().catch(() => null) as any;
  if (!response.ok) throw new Error(payload?.error?.message || "Dịch vụ ngôn ngữ tạm thời không khả dụng.");
  return payload?.data as T;
}

export class LanguageApiClient {
  constructor(private readonly persistence: PersistenceAdapter) {}

  get configured(): boolean {
    return Boolean(getLanguageApiUrl());
  }

  async translate(text: string, sourceLanguage: Language): Promise<string> {
    const data = await fetchJson<{ translation: string }>("/v1/translate", {
      text,
      sourceLanguage,
      targetLanguage: "vi",
    });
    const translation = optionalString(data?.translation, 50_000);
    if (!translation) throw new Error("Dịch vụ trả về bản dịch không hợp lệ.");
    return translation;
  }

  async enrichTerms(language: Language, terms: string[], refresh = false): Promise<VocabularyEnrichment[]> {
    const seen = new Set<string>();
    const uniqueTerms = terms.map((term) => term.trim()).filter((term) => {
      const normalized = normalizeTerm(term, language);
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
    const results = new Map<string, VocabularyEnrichment>();
    const missing: string[] = [];
    for (const term of uniqueTerms) {
      const key = cacheKey(language, term);
      const cached = refresh ? undefined : await this.persistence.get<CacheRecord>("enrichmentCache", key);
      if (isValidEnrichmentCacheRecord(cached, language, term)) {
        results.set(normalizeTerm(term, language), validateEnrichment(cached.value, language));
      } else {
        if (cached) {
          await this.persistence.delete("enrichmentCache", key).catch(() => {});
        }
        missing.push(term);
      }
    }

    for (let offset = 0; offset < missing.length; offset += MAX_ENRICHMENT_BATCH_SIZE) {
      const batch = missing.slice(offset, offset + MAX_ENRICHMENT_BATCH_SIZE);
      let enriched: VocabularyEnrichment[];
      try {
        const data = await fetchJson<{ items: unknown[] }>("/v1/vocabulary/enrich", {
          language,
          targetLanguage: "vi",
          terms: batch,
          enrichmentVersion: ENRICHMENT_VERSION,
        });
        if (!Array.isArray(data?.items)) throw new Error("Dịch vụ trả về danh sách không hợp lệ.");
        enriched = data.items.map((item) => validateEnrichment(item, language));
      } catch (richError) {
        enriched = [];
        for (const term of batch) {
          try {
            const meaningVi = await this.translate(term, language);
            enriched.push({ term, language, meaningVi, lexicalStatus: "UNCERTAIN", partial: true });
          } catch {
            throw richError;
          }
        }
      }
      const byTerm = new Map(enriched.map((item) => [normalizeTerm(item.term, language), item]));
      for (const term of batch) {
        const normalized = normalizeTerm(term, language);
        const item = byTerm.get(normalized);
        if (!item) throw new Error(`Dịch vụ không trả về kết quả cho “${term}”.`);
        results.set(normalized, item);
        await this.persistence.put<CacheRecord>("enrichmentCache", {
          id: cacheKey(language, term),
          version: ENRICHMENT_VERSION,
          language,
          normalizedTerm: normalized,
          value: item,
          updatedAt: new Date().toISOString(),
        });
      }
    }
    return uniqueTerms.map((term) => results.get(normalizeTerm(term, language))!);
  }
  async enrichTermWithContext(language: Language, term: string, context: VocabularyContext): Promise<VocabularyEnrichment> {
    // Context-aware enrichment: NEVER reads or writes the generic enrichmentCache.
    // This ensures contextual results never pollute the generic Quick Add cache.
    const data = await fetchJson<{ items: unknown[] }>("/v1/vocabulary/enrich", {
      language,
      targetLanguage: "vi",
      terms: [term],
      enrichmentVersion: ENRICHMENT_VERSION,
      contexts: [{
        sentence: context.sentence,
        ...(context.previousSentence ? { previousSentence: context.previousSentence } : {}),
        ...(context.nextSentence ? { nextSentence: context.nextSentence } : {}),
      }],
    });
    if (!Array.isArray(data?.items) || data.items.length === 0) {
      throw new Error("Dịch vụ trả về danh sách không hợp lệ.");
    }
    return validateEnrichment(data.items[0], language);
  }
}
