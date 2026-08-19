import type { Language } from "../types/api";

const NATURAL_VOICE = /natural|neural|online|enhanced|premium|google|microsoft/iu;
const LOW_QUALITY_VOICE = /compact|espeak|festival|default/iu;

export function preferredSpeechLocales(language: Language): string[] {
  return language === "zh" ? ["zh-CN", "zh-TW", "zh-HK", "zh"] : ["en-US", "en-GB", "en-AU", "en"];
}

export function selectBestSpeechVoice(voices: readonly SpeechSynthesisVoice[], language: Language): SpeechSynthesisVoice | undefined {
  const locales = preferredSpeechLocales(language);
  return voices
    .map((voice) => {
      const normalized = voice.lang.toLocaleLowerCase();
      const localeIndex = locales.findIndex((locale) => normalized === locale.toLocaleLowerCase());
      const languageMatch = normalized.startsWith(language);
      const score = (localeIndex === -1 ? languageMatch ? 40 : 0 : 100 - localeIndex * 10)
        + (NATURAL_VOICE.test(voice.name) ? 25 : 0)
        - (LOW_QUALITY_VOICE.test(voice.name) ? 35 : 0)
        + (voice.localService ? 2 : 0);
      return { voice, score };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.voice.name.localeCompare(right.voice.name))[0]?.voice;
}

export function configureSpeechUtterance(utterance: SpeechSynthesisUtterance, language: Language, speed: number, voices: readonly SpeechSynthesisVoice[]): void {
  utterance.lang = preferredSpeechLocales(language)[0]!;
  utterance.rate = speed === 1 ? language === "zh" ? 0.9 : 0.95 : speed;
  utterance.pitch = 1;
  utterance.volume = 1;
  const voice = selectBestSpeechVoice(voices, language);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }
}
