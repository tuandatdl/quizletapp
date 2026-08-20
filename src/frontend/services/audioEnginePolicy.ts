import type { Language } from "../types/api.js";
import { DEFAULT_CLOUD_VOICE_EN } from "./cloudTts.js";

export type AudioEngine = "LOCAL" | "AUTO" | "CLOUD" | "BROWSER";
export type HtmlAudioFallbackMode = "NONE" | "BROWSER";
export type TtsSource = "local" | "cloud" | "browser" | "static";

/** LOCAL is the default for settings records that have no explicit choice yet. */
export function resolveAudioEngine(engine: AudioEngine | undefined | null): AudioEngine {
  return engine === "LOCAL" || engine === "AUTO" || engine === "BROWSER" || engine === "CLOUD" ? engine : "LOCAL";
}

export function cloudFallbackMode(engine: AudioEngine): HtmlAudioFallbackMode {
  return engine === "AUTO" ? "BROWSER" : "NONE";
}

export function cloudVoiceFor(language: Language, preferredCloudVoiceEn?: string): string | undefined {
  return language === "en" ? (preferredCloudVoiceEn || DEFAULT_CLOUD_VOICE_EN) : undefined;
}

export function safeTtsDiagnostic(event: "tts_engine_requested" | "tts_source_used" | "tts_browser_fallback", fields: Record<string, unknown>): void {
  try { console.info(JSON.stringify({ event, ...fields })); } catch { /* diagnostics are fail-open */ }
}

/**
 * Small, testable orchestration boundary. LOCAL and CLOUD are strict. AUTO is
 * deliberately the only policy that can advance through all fallback engines.
 */
export async function runAudioEnginePolicy<T>(options: {
  engine: AudioEngine;
  playLocal: () => Promise<T>;
  playCloud: () => Promise<T>;
  playBrowser: () => Promise<T>;
}): Promise<{ source: "local" | "cloud" | "browser"; value: T }> {
  if (options.engine === "BROWSER") return { source: "browser", value: await options.playBrowser() };
  if (options.engine === "LOCAL") return { source: "local", value: await options.playLocal() };
  if (options.engine === "CLOUD") return { source: "cloud", value: await options.playCloud() };
  try {
    return { source: "local", value: await options.playLocal() };
  } catch {
    try {
      return { source: "cloud", value: await options.playCloud() };
    } catch {
      return { source: "browser", value: await options.playBrowser() };
    }
  }
}
