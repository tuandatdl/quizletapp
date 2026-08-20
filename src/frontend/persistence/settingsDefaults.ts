import type { UserSettings } from "../types/api.js";
import type { StoredRecord } from "./types.js";

export const LOCAL_SETTINGS_RECORD_ID = "local-settings";

export const DEFAULT_LOCAL_SETTINGS: Readonly<UserSettings> = {
  nativeLanguage: "vi",
  currentLearningLanguage: "en",
  englishEnabled: true,
  chineseEnabled: true,
  dailyGoal: 20,
  audioSpeed: 1,
  autoPlayAudio: false,
  audioEngine: "CLOUD",
  preferredCloudVoiceEn: "aura-asteria-en",
  showTranslation: true,
  showPinyin: true,
  showHanzi: true,
  showVietnamese: true,
  themePreference: "system",
  englishNewWordsTarget: 5,
  chineseNewWordsTarget: 5,
  reviewTarget: 20,
  quizTarget: 10,
  shadowingTarget: 10,
};

const USER_SETTING_KEYS = [
  "nativeLanguage",
  "currentLearningLanguage",
  "englishEnabled",
  "chineseEnabled",
  "dailyGoal",
  "audioSpeed",
  "autoPlayAudio",
  "audioEngine",
  "preferredCloudVoiceEn",
  "preferredCloudVoiceZh",
  "preferredVoiceEn",
  "preferredVoiceZh",
  "showTranslation",
  "showPinyin",
  "showHanzi",
  "showVietnamese",
  "themePreference",
  "englishNewWordsTarget",
  "chineseNewWordsTarget",
  "reviewTarget",
  "quizTarget",
  "shadowingTarget",
] as const satisfies readonly (keyof UserSettings)[];

const USER_SETTING_KEY_SET = new Set<string>(USER_SETTING_KEYS);
const SETTINGS_RECORD_METADATA_KEYS = new Set(["id", "createdAt", "updatedAt", "revision", "changeSeq"]);

/**
 * Settings are generated lazily on first read. Missing fields use defaults so
 * records created by an older release remain recognizable as generated state.
 */
export function isDefaultLocalSettingsRecord(record: StoredRecord): boolean {
  const hasUnknownCustomizedField = Object.keys(record).some((key) => (
    !USER_SETTING_KEY_SET.has(key) && !SETTINGS_RECORD_METADATA_KEYS.has(key)
  ));
  if (hasUnknownCustomizedField) return false;
  return USER_SETTING_KEYS.every((key) => {
    const savedValue = record[key];
    return savedValue === undefined || savedValue === DEFAULT_LOCAL_SETTINGS[key];
  });
}
