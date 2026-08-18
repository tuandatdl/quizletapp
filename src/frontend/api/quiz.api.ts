import { api } from "./client";
import type { Language, QuizAnswerResult, QuizSession } from "../types/api";

export const quizApi = {
  start: (data: { language: Language; type: string; count?: number }) =>
    api.post<QuizSession>("/api/quizzes", {
      ...data,
      count: data.count ?? 10,
    }),

  answer: (id: string, answer: string) =>
    api.post<QuizAnswerResult>(`/api/quizzes/${id}/answer`, { answer }),
};
