import { api } from "./client";
import type {
  BulkVocabularyCreateResult,
  BulkVocabularyInputItem,
  BulkVocabularyPreview,
  CreateVocabularyResult,
  Language,
  ReviewAction,
  VocabularyInput,
  VocabularyItem,
  VocabularyStatus,
} from "../types/api";

export interface VocabularyQuery {
  language?: Language;
  topic?: string;
  status?: VocabularyStatus;
  due?: boolean;
  random?: boolean;
  limit?: number;
}

export const vocabularyApi = {
  create: (data: VocabularyInput) =>
    api.post<CreateVocabularyResult>("/api/vocabulary", data),

  bulkPreview: (language: Language, input: string, refresh = false) =>
    api.post<BulkVocabularyPreview>("/api/vocabulary/bulk-preview", { language, input, refresh }),

  bulkCreate: (language: Language, items: BulkVocabularyInputItem[]) =>
    api.post<BulkVocabularyCreateResult>("/api/vocabulary/bulk", { language, items }),

  list: (query: VocabularyQuery = {}) => {
    const params = new URLSearchParams();
    if (query.language) params.append("language", query.language);
    if (query.topic) params.append("topic", query.topic);
    if (query.status) params.append("status", query.status);
    if (query.due !== undefined) params.append("due", String(query.due));
    if (query.random !== undefined) params.append("random", String(query.random));
    if (query.limit) params.append("limit", String(query.limit));

    const qs = params.toString();
    return api.get<VocabularyItem[]>(`/api/vocabulary${qs ? `?${qs}` : ""}`);
  },

  get: (id: string) => api.get<VocabularyItem>(`/api/vocabulary/${id}`),

  update: (id: string, patch: Partial<Omit<VocabularyInput, "language" | "term">>) =>
    api.patch<VocabularyItem>(`/api/vocabulary/${id}`, patch),

  delete: (id: string) => api.delete<void>(`/api/vocabulary/${id}`),

  favorite: (id: string, favorite: boolean) =>
    api.put<VocabularyItem>(`/api/vocabulary/${id}/favorite`, { favorite }),

  review: (id: string, action: ReviewAction) =>
    api.post<VocabularyItem>(`/api/vocabulary/${id}/review`, { action }),

  getFlashcards: (query: VocabularyQuery = {}) => {
    const params = new URLSearchParams();
    if (query.language) params.append("language", query.language);
    if (query.topic) params.append("topic", query.topic);
    if (query.status) params.append("status", query.status);
    if (query.due !== undefined) params.append("due", String(query.due));
    if (query.random !== undefined) params.append("random", String(query.random));
    if (query.limit) params.append("limit", String(query.limit));

    const qs = params.toString();
    return api.get<VocabularyItem[]>(`/api/flashcards${qs ? `?${qs}` : ""}`);
  },

  answerFlashcard: (id: string, action: ReviewAction) =>
    api.post<VocabularyItem>(`/api/flashcards/${id}/answer`, { action }),
};
