import { errors } from "../shared/errors.js";
import type { Language } from "../shared/schemas.js";

export interface VocabularySenseSuggestion {
  partOfSpeech?: string;
  meaningVi?: string;
  synonyms?: string[];
}

export interface VocabularyEnrichmentSuggestion {
  term: string;
  pronunciation?: string;
  ipa?: string;
  pinyin?: string;
  simplified?: string;
  traditional?: string;
  partOfSpeech?: string;
  meaningVi?: string;
  synonyms?: string[];
  example?: string;
  exampleTranslation?: string;
  topic?: string;
  cefr?: string;
  toeicLevel?: string;
  hskLevel?: number;
  toneData?: Array<0 | 1 | 2 | 3 | 4>;
  senses?: VocabularySenseSuggestion[];
}

export interface VocabularyEnrichmentService {
  readonly configured: boolean;
  readonly provider: string | null;
  enrich(input: {
    language: Language;
    term: string;
    nativeLanguage: "vi";
  }): Promise<VocabularyEnrichmentSuggestion>;
}

export class UnconfiguredVocabularyEnrichmentService implements VocabularyEnrichmentService {
  readonly configured = false;
  readonly provider = null;

  async enrich(): Promise<VocabularyEnrichmentSuggestion> {
    throw errors.notConfigured("vocabulary enrichment");
  }
}
