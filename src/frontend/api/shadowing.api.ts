import { api } from "./client";
import type { ShadowingSession } from "../types/api";

export const shadowingApi = {
  start: (readingId: string) =>
    api.post<ShadowingSession>("/api/shadowing", { readingId }),

  get: (id: string) => api.get<ShadowingSession>(`/api/shadowing/${id}`),

  advance: (id: string, attemptId: string) =>
    api.post<ShadowingSession>(`/api/shadowing/${id}/advance`, { attemptId }),
};
