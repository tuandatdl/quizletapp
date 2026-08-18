import { api } from "./client";
import type { UserSettings } from "../types/api";

export const settingsApi = {
  getSettings: () => api.get<UserSettings>("/api/settings"),

  updateSettings: (data: Partial<UserSettings>) =>
    api.patch<UserSettings>("/api/settings", data),
};
