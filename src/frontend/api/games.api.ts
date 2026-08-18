import { api } from "./client";
import type { GameAnswerResult, GameSession, Language } from "../types/api";

export const gamesApi = {
  start: (data: {
    language: Language;
    type: "MATCHING" | "MEMORY" | "LISTENING_CHOICE" | "FILL_WORD" | "SPEED_CHALLENGE";
    count?: number;
    timerSeconds?: number;
  }) =>
    api.post<GameSession>("/api/games", {
      ...data,
      count: data.count ?? 10,
    }),

  get: (id: string) => api.get<GameSession>(`/api/games/${id}`),

  answer: (id: string, itemId: string, answer: string) =>
    api.post<GameAnswerResult>(`/api/games/${id}/answer`, { itemId, answer }),
};
