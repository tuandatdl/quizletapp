import { errors } from "../shared/errors.js";
import type { Language } from "../shared/schemas.js";

export interface TranslationResult { original: string; translation: string; sourceLanguage: Language; targetLanguage: "vi" }
export interface TranslationService { readonly configured: boolean; readonly provider: string | null; translate(text: string, sourceLanguage: Language, targetLanguage: "vi"): Promise<TranslationResult> }
export interface TtsResult { status: "READY"; mode: "audio"; audioUrl: string; durationMs?: number; provider: string }
export interface TTSService { readonly configured: boolean; readonly provider: string | null; synthesize(input: { text: string; language: Language; voice?: string; speed: 0.75 | 1 | 1.25 }): Promise<TtsResult> }
export interface PronunciationWord { word: string; score: number; status: "good" | "warning" | "poor" }
export interface PronunciationResult { status: "READY"; overallScore: number; pronunciationScore: number; fluencyScore: number; rhythmScore?: number; toneAccuracy?: number; words: PronunciationWord[] }
export interface PronunciationService { readonly configured: boolean; readonly provider: string | null; assess(input: { expectedText: string; language: Language; audioBase64: string; audioMimeType?: string }): Promise<PronunciationResult> }

export class UnconfiguredTranslationService implements TranslationService {
  readonly configured = false;
  readonly provider = null;
  async translate(): Promise<TranslationResult> { throw errors.notConfigured("translation"); }
}
export class UnconfiguredTTSService implements TTSService {
  readonly configured = false;
  readonly provider = null;
  async synthesize(): Promise<TtsResult> { throw errors.notConfigured("tts"); }
}
export class UnconfiguredPronunciationService implements PronunciationService {
  readonly configured = false;
  readonly provider = null;
  async assess(): Promise<PronunciationResult> { throw errors.notConfigured("pronunciation"); }
}

/** Deterministic adapters are injectable in tests; production never invents provider results. */
export class StaticTranslationService implements TranslationService {
  readonly configured = true;
  readonly provider = "static-test";
  constructor(private readonly translateFn: (text: string, language: Language) => string) {}
  async translate(text: string, sourceLanguage: Language): Promise<TranslationResult> {
    return { original: text, translation: this.translateFn(text, sourceLanguage), sourceLanguage, targetLanguage: "vi" };
  }
}
