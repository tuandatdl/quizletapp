import type { Language } from "../types/api";
import type { PersistenceAdapter, StoredRecord } from "../persistence/types";
import { getLanguageApiUrl } from "../runtime/runtime";

export const ENRICHMENT_VERSION = "vocabulary-enrichment-v1";
export const MAX_ENRICHMENT_BATCH_SIZE = 25;

export interface VocabularySense {
  partOfSpeech?: string;
  meaningVi: string;
  synonyms?: string[];
}

export interface VocabularyEnrichment {
  term: string;
  language: Language;
  pronunciation?: string;
  ipa?: string;
  partOfSpeech?: string;
  meaningVi: string;
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

interface CacheRecord extends StoredRecord {
  version: string;
  language: Language;
  normalizedTerm: string;
  value: VocabularyEnrichment;
  updatedAt: string;
}

function normalizeTerm(term: string, language: Language): string {
  return term.normalize("NFKC").trim().replace(/\s+/gu, " ").toLocaleLowerCase(language === "zh" ? "zh-CN" : "en-US");
}

function cacheKey(language: Language, term: string): string {
  return `${ENRICHMENT_VERSION}:${language}:${normalizeTerm(term, language)}`;
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
  const meaningVi = optionalString(item.meaningVi, 1000);
  const language = item.language === "en" || item.language === "zh" ? item.language : expectedLanguage;
  if (!term || !meaningVi || !language || (expectedLanguage && language !== expectedLanguage)) {
    throw new Error("AI trả về dữ liệu từ vựng thiếu trường bắt buộc.");
  }
  const senses = Array.isArray(item.senses)
    ? item.senses.slice(0, 20).flatMap((raw) => {
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
        const sense = raw as Record<string, unknown>;
        const meaning = optionalString(sense.meaningVi, 1000);
        return meaning ? [{ meaningVi: meaning, partOfSpeech: optionalString(sense.partOfSpeech, 50), synonyms: stringArray(sense.synonyms) }] : [];
      })
    : undefined;
  const toneData = Array.isArray(item.toneData)
    ? item.toneData.filter((tone): tone is 0 | 1 | 2 | 3 | 4 => [0, 1, 2, 3, 4].includes(Number(tone))).slice(0, 200)
    : undefined;
  return {
    term,
    language,
    meaningVi,
    pronunciation: optionalString(item.pronunciation, 200),
    ipa: optionalString(item.ipa, 200),
    partOfSpeech: optionalString(item.partOfSpeech, 50),
    synonyms: stringArray(item.synonyms),
    example: optionalString(item.example, 2000),
    exampleTranslation: optionalString(item.exampleTranslation, 2000),
    senses,
    simplified: optionalString(item.simplified, 200),
    traditional: optionalString(item.traditional, 200),
    pinyin: optionalString(item.pinyin, 200),
    toneData,
    partial: item.partial === true,
  };
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
      if (cached?.version === ENRICHMENT_VERSION) results.set(normalizeTerm(term, language), validateEnrichment(cached.value, language));
      else missing.push(term);
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
            enriched.push({ term, language, meaningVi, partial: true });
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
}
