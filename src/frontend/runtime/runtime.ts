/// <reference types="vite/client" />
export type RuntimeMode = "server" | "static";

export function getRuntimeMode(): RuntimeMode {
  return import.meta.env.VITE_RUNTIME_MODE === "static" ? "static" : "server";
}

export function isStaticRuntime(): boolean {
  return getRuntimeMode() === "static";
}

export function getLanguageApiUrl(): string {
  return (import.meta.env.VITE_LANGUAGE_API_URL || "").replace(/\/$/u, "");
}

export const STATIC_LOCAL_USER = {
  id: "local-profile",
  name: "Khách",
  email: "local@device.invalid",
  avatar: null,
} as const;
