import type { Language } from "../types/api.js";

const NATURAL_VOICE = /natural|neural|online|enhanced|premium|google|microsoft/iu;
const LOW_QUALITY_VOICE = /compact|espeak|festival|default/iu;

export function preferredSpeechLocales(language: Language): string[] {
  return language === "zh" ? ["zh-CN", "zh-TW", "zh-HK", "zh"] : ["en-US", "en-GB", "en-AU", "en"];
}

export function scoreVoice(voice: SpeechSynthesisVoice, language: Language): number {
  const locales = preferredSpeechLocales(language);
  const normalized = voice.lang.toLocaleLowerCase();
  const localeIndex = locales.findIndex((locale) => normalized === locale.toLocaleLowerCase());
  const languageMatch = normalized.startsWith(language);
  if (localeIndex === -1 && !languageMatch) return 0;

  const base = localeIndex === -1 ? 40 : 100 - localeIndex * 10;
  return base
    + (NATURAL_VOICE.test(voice.name) ? 25 : 0)
    - (LOW_QUALITY_VOICE.test(voice.name) ? 35 : 0)
    + (voice.localService ? 2 : 0);
}

export function selectBestSpeechVoice(voices: readonly SpeechSynthesisVoice[], language: Language): SpeechSynthesisVoice | undefined {
  return voices
    .map((voice) => ({ voice, score: scoreVoice(voice, language) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.voice.name.localeCompare(right.voice.name))[0]?.voice;
}

export function getAvailableVoicesForLanguage(voices: readonly SpeechSynthesisVoice[], language: Language): SpeechSynthesisVoice[] {
  return voices
    .map((voice) => ({ voice, score: scoreVoice(voice, language) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.voice.name.localeCompare(right.voice.name))
    .map(({ voice }) => voice);
}

export function configureSpeechUtterance(
  utterance: SpeechSynthesisUtterance,
  language: Language,
  speed: number,
  voices: readonly SpeechSynthesisVoice[],
  preferredVoiceName?: string
): void {
  utterance.lang = preferredSpeechLocales(language)[0]!;
  utterance.rate = speed === 1 ? (language === "zh" ? 0.9 : 0.95) : speed;
  utterance.pitch = 1;
  utterance.volume = 1;

  let voice: SpeechSynthesisVoice | undefined;
  if (preferredVoiceName && preferredVoiceName !== "AUTO") {
    voice = voices.find((v) => v.name === preferredVoiceName);
  }
  if (!voice) {
    voice = selectBestSpeechVoice(voices, language);
  }

  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }
}

let cachedVoices: SpeechSynthesisVoice[] = [];
let voiceListenersInitialized = false;

export function initSpeechVoices(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    cachedVoices = window.speechSynthesis.getVoices();
    if (!voiceListenersInitialized) {
      voiceListenersInitialized = true;
      window.speechSynthesis.addEventListener("voiceschanged", () => {
        try {
          cachedVoices = window.speechSynthesis.getVoices();
        } catch {}
      });
    }
  } catch {}
}

export function getReadySpeechVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  try {
    if (cachedVoices.length === 0) {
      cachedVoices = window.speechSynthesis.getVoices();
    }
  } catch {}
  return cachedVoices;
}

export async function waitForSpeechVoices(timeoutMs = 500): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const ready = getReadySpeechVoices();
  if (ready.length > 0) return ready;

  return new Promise((resolve) => {
    let resolved = false;
    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        try {
          window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
          cachedVoices = window.speechSynthesis.getVoices();
        } catch {}
        resolve(cachedVoices);
      }
    };
    const onVoices = () => cleanup();
    try {
      window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    } catch {}
    setTimeout(cleanup, timeoutMs);
  });
}

export async function cancelSpeechAndWait(delayMs = 100): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {}
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

// Auto-initialize on browser load
if (typeof window !== "undefined") {
  initSpeechVoices();
}
