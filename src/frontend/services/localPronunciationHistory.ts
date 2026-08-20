import type { PersistenceAdapter, StoredRecord } from "../persistence/types.js";
import { getIndexedDbAdapter } from "../persistence/indexedDb.js";
import type { PronunciationAvailability, RecentPronunciationAttempt, WeakestWord } from "../types/api.js";
import type { LocalPronunciationAnalysis } from "./localPronunciationScoring.js";

export interface LocalPronunciationHistoryRecord extends StoredRecord {
  language: "en";
  expectedText: string;
  recognizedText: string;
  overallScore: number;
  contentMatchScore: number;
  fluencyScore: number;
  durationSeconds: number;
  words: LocalPronunciationAnalysis["words"];
  createdAt: string;
}

export function getStaticLocalPronunciationAvailability(language?: string | null): PronunciationAvailability {
  return language === "zh"
    ? { configured: false, provider: null, status: "NOT_CONFIGURED", assessmentAvailable: false }
    : { configured: true, provider: "local-whisper", status: "AVAILABLE", assessmentAvailable: true, mode: "LOCAL" };
}

export async function saveLocalPronunciationHistory(
  result: LocalPronunciationAnalysis,
  persistence: PersistenceAdapter = getIndexedDbAdapter(),
): Promise<LocalPronunciationHistoryRecord> {
  const record: LocalPronunciationHistoryRecord = {
    id: result.attemptId,
    language: "en",
    expectedText: result.expectedText,
    recognizedText: result.recognizedText,
    overallScore: result.overallScore,
    contentMatchScore: result.contentMatchScore,
    fluencyScore: result.fluencyScore,
    durationSeconds: result.durationSeconds,
    words: result.words.map((word) => ({ ...word })),
    createdAt: result.createdAt,
  };
  await persistence.put("pronunciationHistory", record);
  return record;
}

export async function getLocalPronunciationRecent(
  limit = 20,
  persistence: PersistenceAdapter = getIndexedDbAdapter(),
): Promise<RecentPronunciationAttempt[]> {
  return (await persistence.getAll<LocalPronunciationHistoryRecord>("pronunciationHistory"))
    .filter((record) => record.language === "en")
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, Math.max(0, limit))
    .map((record) => ({
      id: record.id,
      language: record.language,
      readingId: null,
      sentenceId: null,
      text: record.expectedText,
      score: record.overallScore,
      pronunciationScore: record.contentMatchScore,
      fluencyScore: record.fluencyScore,
      rhythmScore: null,
      toneAccuracy: null,
      createdAt: record.createdAt,
    }));
}

export async function getLocalPronunciationWeakest(
  limit = 20,
  persistence: PersistenceAdapter = getIndexedDbAdapter(),
): Promise<WeakestWord[]> {
  const aggregate = new Map<string, { word: string; total: number; attempts: number }>();
  for (const record of await persistence.getAll<LocalPronunciationHistoryRecord>("pronunciationHistory")) {
    if (record.language !== "en") continue;
    for (const item of record.words) {
      const normalized = item.word.normalize("NFKC").toLocaleLowerCase("en-US").trim();
      if (!normalized) continue;
      const current = aggregate.get(normalized) ?? { word: item.word, total: 0, attempts: 0 };
      current.total += item.score;
      current.attempts += 1;
      aggregate.set(normalized, current);
    }
  }
  return [...aggregate.values()]
    .map((item) => ({ word: item.word, averageScore: Math.round(item.total / item.attempts * 10) / 10, attempts: item.attempts }))
    .filter((item) => item.averageScore < 75)
    .sort((left, right) => left.averageScore - right.averageScore || right.attempts - left.attempts || left.word.localeCompare(right.word))
    .slice(0, Math.max(0, limit));
}
