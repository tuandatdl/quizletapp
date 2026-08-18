import { api } from "./client";
import type { Dashboard, TodayPlan } from "../types/api";

export interface ActivityInput {
  readingMinutes?: number;
  shadowingMinutes?: number;
  studySeconds?: number;
}

export const progressApi = {
  getDashboard: () => api.get<Dashboard>("/api/progress/dashboard"),

  getStreak: () => api.get<{ streak: number }>("/api/progress/streak"),

  getTodayPlan: () => api.get<TodayPlan>("/api/today-plan"),

  recordActivity: (data: ActivityInput) =>
    api.post<{ date: string } & ActivityInput>("/api/activity", data),
};
