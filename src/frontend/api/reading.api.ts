import { api } from "./client";
import type {
  CreateVocabularyResult,
  Language,
  ReadingPassage,
  ReadingPassageSummary,
  ProviderStatus,
  TranslationResult,
} from "../types/api";

export interface CreateReadingInput {
  language: Language;
  title: string;
  content: string;
  translationVi?: string | null;
  topic?: string | null;
  level?: string | null;
}

export interface TranslateSelectionInput {
  text: string;
  sourceLanguage: Language;
  targetLanguage: "vi";
  readingId?: string;
}

export interface SaveSelectionInput extends TranslateSelectionInput {
  meaningVi: string;
  pronunciation?: string;
  partOfSpeech?: string;
}

export const readingApi = {
  create: (data: CreateReadingInput) =>
    api.post<ReadingPassage>("/api/readings", data),

  list: (language?: Language) => {
    const qs = language ? `?language=${language}` : "";
    return api.get<ReadingPassageSummary[]>(`/api/readings${qs}`);
  },

  get: (id: string) => api.get<ReadingPassage>(`/api/readings/${id}`),

  update: (id: string, patch: Partial<CreateReadingInput>) =>
    api.patch<ReadingPassage>(`/api/readings/${id}`, patch),

  delete: (id: string) => api.delete<void>(`/api/readings/${id}`),

  translatePassage: (id: string) =>
    api.post<TranslationResult>(`/api/readings/${id}/translate`),

  getTranslationAvailability: () =>
    api.get<ProviderStatus>("/api/translation/availability"),

  translateSelection: (data: TranslateSelectionInput) =>
    api.post<TranslationResult>("/api/translate-selection", data),

  saveFromSelection: (data: SaveSelectionInput) =>
    api.post<CreateVocabularyResult>("/api/vocabulary/from-selection", data),
};
