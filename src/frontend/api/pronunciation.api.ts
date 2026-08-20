import { api } from "./client";
import type {
  Language,
  PronunciationResult,
  PronunciationAvailability,
  RecentPronunciationAttempt,
  WeakestWord,
} from "../types/api";

export interface PronunciationRequest {
  expectedText: string;
  language: Language;
  audioBase64: string;
  audioMimeType?: string;
  readingId?: string;
  sentenceId?: string;
}

export const pronunciationApi = {
  checkAvailability: (language?: Language) =>
    api.get<PronunciationAvailability>(`/api/pronunciation/availability${language ? `?language=${language}` : ""}`),

  assess: (data: PronunciationRequest) =>
    api.post<PronunciationResult>("/api/pronunciation/assess", data),

  getRecent: (limit = 20) =>
    api.get<RecentPronunciationAttempt[]>(`/api/pronunciation/recent?limit=${limit}`),

  getWeakest: (limit = 20) =>
    api.get<WeakestWord[]>(`/api/pronunciation/weakest?limit=${limit}`),
};
