import type { Language } from "../types/api.js";
import { DEFAULT_CLOUD_VOICE_EN } from "./cloudTts.js";

export type AudioEngine = "AUTO" | "CLOUD" | "BROWSER";
export type HtmlAudioFallbackMode = "NONE" | "BROWSER";
export type TtsSource = "cloud" | "browser" | "static";

/** CLOUD is the safe default for records without an explicit engine selection. */
export function resolveAudioEngine(engine: AudioEngine | undefined | null): AudioEngine {
  return engine === "AUTO" || engine === "BROWSER" || engine === "CLOUD" ? engine : "CLOUD";
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
 * Small, testable orchestration boundary. CLOUD intentionally rethrows rather
 * than calling browser speech; only AUTO may take that fallback path.
 */
export async function runAudioEnginePolicy<T>(options: {
  engine: AudioEngine;
  playCloud: () => Promise<T>;
  playBrowser: () => Promise<T>;
}): Promise<{ source: "cloud" | "browser"; value: T }> {
  if (options.engine === "BROWSER") return { source: "browser", value: await options.playBrowser() };
  try {
    return { source: "cloud", value: await options.playCloud() };
  } catch (caught) {
    if (options.engine === "AUTO") return { source: "browser", value: await options.playBrowser() };
    throw caught;
  }
}
