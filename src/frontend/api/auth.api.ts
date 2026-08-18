import { api } from "./client";
import type { AuthResponse, AuthUser } from "../types/api";

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/login", data),

  logout: () => api.post<{ loggedOut: boolean }>("/api/auth/logout"),

  getMe: () => api.get<AuthUser>("/api/me"),
};
