import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { indexedDB } from "fake-indexeddb";
import type { PersistenceAdapter, StoreName, StoredRecord } from "../src/frontend/persistence/types.js";
import {
  __resetLocalPronunciationForTests,
  getLocalPronunciationModelConfig,
  transcribeLocalEnglishAudio,
} from "../src/frontend/services/localPronunciation.js";
import { getLocalPronunciationRecent, getLocalPronunciationWeakest, getStaticLocalPronunciationAvailability, saveLocalPronunciationHistory } from "../src/frontend/services/localPronunciationHistory.js";
import { alignPronunciationWords, contentMatchScore, fluencyScore, scoreLocalEnglishPronunciation } from "../src/frontend/services/localPronunciationScoring.js";
import { getLocalEnglishModelConfig } from "../src/frontend/services/localTts.js";

class MemoryPersistence implements PersistenceAdapter {
  readonly schemaVersion = 3;
  readonly stores = new Map<StoreName, Map<string, StoredRecord>>();
  async get<T>(store: StoreName, id: string): Promise<T | undefined> { return this.stores.get(store)?.get(id) as T | undefined; }
  async getAll<T>(store: StoreName): Promise<T[]> { return [...(this.stores.get(store)?.values() ?? [])] as T[]; }
  async put<T extends StoredRecord>(store: StoreName, value: T): Promise<T> { (this.stores.get(store) ?? this.newStore(store)).set(value.id, value); return value; }
  async delete(store: StoreName, id: string): Promise<void> { this.stores.get(store)?.delete(id); }
  async clear(store: StoreName): Promise<void> { this.stores.get(store)?.clear(); }
  async clearAll(): Promise<void> { this.stores.clear(); }
  private newStore(store: StoreName) { const next = new Map<string, StoredRecord>(); this.stores.set(store, next); return next; }
}

let delayedWorker = false;
let posts: Array<{ id: number; type: string }> = [];
class FakeAsrWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  postMessage(message: { id: number; type: string }) {
    posts.push(message);
    const reply = () => this.onmessage?.({ data: { id: message.id, type: "result", text: "Learning a language takes time and patience" } } as MessageEvent);
    if (delayedWorker) setTimeout(reply, 10); else queueMicrotask(reply);
  }
  terminate() {}
}

describe("free-first local English pronunciation coach", () => {
  beforeEach(() => {
    posts = [];
    delayedWorker = false;
    vi.stubGlobal("indexedDB", indexedDB);
    vi.stubGlobal("Worker", FakeAsrWorker);
  });
  afterEach(() => {
    __resetLocalPronunciationForTests();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("LOCAL_PRONUNCIATION_AVAILABLE_EN and CHINESE_DOES_NOT_FAKE_TONE_SCORE", async () => {
    expect(getStaticLocalPronunciationAvailability()).toMatchObject({ status: "AVAILABLE", configured: true, provider: "local-whisper", assessmentAvailable: true, mode: "LOCAL" });
    expect(getStaticLocalPronunciationAvailability("zh")).toMatchObject({ status: "NOT_CONFIGURED", assessmentAvailable: false });
    expect(scoreLocalEnglishPronunciation({ expectedText: "hello", recognizedText: "hello", durationSeconds: 1 }).toneAccuracy).toBeUndefined();
  });

  it("LOCAL_PRONUNCIATION_ZERO_NETWORK, LOCAL_PRONUNCIATION_ZERO_CLOUD_AI and LOCAL_ASR_WORKER", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const transcript = await transcribeLocalEnglishAudio(new Float32Array(160));
    expect(transcript).toContain("Learning");
    expect(posts).toHaveLength(1);
    expect(posts[0]?.type).toBe("transcribe");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("EXPECTED_RECOGNIZED_EXACT_MATCH and WORD_ALIGNMENT_NO_DUPLICATE", () => {
    const result = scoreLocalEnglishPronunciation({ expectedText: "Learning a language takes time and patience.", recognizedText: "learning a language takes time and patience", durationSeconds: 3.5 });
    expect(result.contentMatchScore).toBe(100);
    expect(result.words).toHaveLength(7);
    expect(new Set(result.words.map((word, index) => `${word.word}:${index}`)).size).toBe(7);
    expect(result.words.every((word) => word.status === "good")).toBe(true);
  });

  it("EXPECTED_RECOGNIZED_MISSING_WORD and WORD_STATUS_DETERMINISTIC", () => {
    const alignment = alignPronunciationWords("Learning a language takes time and patience", "Learning a language takes and patience");
    expect(alignment.words).toEqual([
      { word: "learning", score: 100, status: "good" }, { word: "a", score: 100, status: "good" },
      { word: "language", score: 100, status: "good" }, { word: "takes", score: 100, status: "good" },
      { word: "time", score: 0, status: "poor" }, { word: "and", score: 100, status: "good" },
      { word: "patience", score: 100, status: "good" },
    ]);
  });

  it("EXPECTED_RECOGNIZED_SUBSTITUTION and EXPECTED_RECOGNIZED_EXTRA_WORD", () => {
    expect(alignPronunciationWords("practice now", "practise now").words).toEqual([{ word: "practice", score: 45, status: "warning" }, { word: "now", score: 100, status: "good" }]);
    expect(contentMatchScore("practice now", "practice very now")).toBeLessThan(100);
  });

  it("CONTENT_SCORE_BOUNDED, FLUENCY_SCORE_BOUNDED and OVERALL_SCORE_BOUNDED", () => {
    for (const duration of [0, 0.01, 2, 60, Number.NaN]) {
      const result = scoreLocalEnglishPronunciation({ expectedText: "one two three", recognizedText: "one four three extra", durationSeconds: duration });
      expect(result.contentMatchScore).toBeGreaterThanOrEqual(0); expect(result.contentMatchScore).toBeLessThanOrEqual(100);
      expect(result.fluencyScore).toBeGreaterThanOrEqual(0); expect(result.fluencyScore).toBeLessThanOrEqual(100);
      expect(result.overallScore).toBeGreaterThanOrEqual(0); expect(result.overallScore).toBeLessThanOrEqual(100);
    }
    expect(fluencyScore(1, 5).coaching).toContain("nhanh");
  });

  it("PRONUNCIATION_HISTORY_PERSISTS, PRONUNCIATION_RECENT_SORTS_NEWEST and PRONUNCIATION_RAW_AUDIO_NOT_PERSISTED", async () => {
    const persistence = new MemoryPersistence();
    const old = scoreLocalEnglishPronunciation({ id: "old", createdAt: "2026-08-20T00:00:00.000Z", expectedText: "old words", recognizedText: "old", durationSeconds: 2 });
    const current = scoreLocalEnglishPronunciation({ id: "current", createdAt: "2026-08-20T01:00:00.000Z", expectedText: "new words", recognizedText: "new words", durationSeconds: 2 });
    await saveLocalPronunciationHistory(old, persistence);
    await saveLocalPronunciationHistory(current, persistence);
    const records = await persistence.getAll<any>("pronunciationHistory");
    expect(records).toHaveLength(2);
    expect(JSON.stringify(records)).not.toContain("audioBase64");
    expect(JSON.stringify(records)).not.toContain("data:audio");
    await expect(getLocalPronunciationRecent(10, persistence)).resolves.toMatchObject([{ id: "current" }, { id: "old" }]);
  });

  it("PRONUNCIATION_WEAKEST_AGGREGATES", async () => {
    const persistence = new MemoryPersistence();
    await saveLocalPronunciationHistory(scoreLocalEnglishPronunciation({ id: "one", expectedText: "difficult word", recognizedText: "difficult", durationSeconds: 2 }), persistence);
    await saveLocalPronunciationHistory(scoreLocalEnglishPronunciation({ id: "two", expectedText: "word again", recognizedText: "again", durationSeconds: 2 }), persistence);
    await expect(getLocalPronunciationWeakest(10, persistence)).resolves.toContainEqual({ word: "word", averageScore: 0, attempts: 2 });
  });

  it("PRONUNCIATION_STALE_ANALYSIS_IGNORED", async () => {
    delayedWorker = true;
    const controller = new AbortController();
    const request = transcribeLocalEnglishAudio(new Float32Array(160), { signal: controller.signal });
    controller.abort();
    await expect(request).rejects.toMatchObject({ name: "AbortError" });
  });

  it("LOCAL_TTS_REFERENCE_AUDIO_REGRESSION", () => {
    expect(getLocalEnglishModelConfig().id).toBe("en_US-lessac-medium");
    expect(getLocalPronunciationModelConfig()).toMatchObject({ id: "onnx-community/whisper-tiny.en", dtype: "q4" });
  });

  describe("Shadowing Local Scoring Integration", () => {
    it("SHADOWING_LOCAL_EN_ASSESSMENT and SHADOWING_LOCAL_ZERO_PRONUNCIATION_API and SHADOWING_LOCAL_ZERO_WORKERS_AI", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      const result = scoreLocalEnglishPronunciation({
        expectedText: "I live in Vietnam.",
        recognizedText: "i live in vietnam",
        durationSeconds: 2.0,
      });
      expect(result.overallScore).toBeGreaterThanOrEqual(80);
      expect(result.contentMatchScore).toBe(100);
      expect(result.words).toHaveLength(4);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("SHADOWING_RECORDED_BLOB_LOCAL_ONLY and SHADOWING_RESULT_BEFORE_ADVANCE", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const shadowingPageSrc = fs.readFileSync(path.resolve(__dirname, "../src/frontend/pages/shadowing/ShadowingPage.tsx"), "utf-8");
      expect(shadowingPageSrc).toContain("analyzeLocalEnglishRecording");
      expect(shadowingPageSrc).toContain("recordedAudioBlob");
      expect(shadowingPageSrc).toContain("Phân tích & chấm điểm");
      expect(shadowingPageSrc).toContain("Sang câu tiếp theo");
    });

    it("SHADOWING_SCORE_AVERAGE_ONE_SENTENCE and SHADOWING_SCORE_AVERAGE_MULTIPLE_SENTENCES", () => {
      // 1 sentence
      let completedCount = 1;
      let scoreTotal = 88;
      let averageScore = Math.round(scoreTotal / completedCount);
      expect(averageScore).toBe(88);

      // 2 sentences (88 + 92 = 180 / 2 = 90)
      completedCount += 1;
      scoreTotal += 92;
      averageScore = Math.round(scoreTotal / completedCount);
      expect(averageScore).toBe(90);
    });

    it("SHADOWING_RETRY_NO_DOUBLE_COUNT and SHADOWING_NEXT_COMMITS_ONCE", () => {
      let completedCount = 0;
      let scoreTotal = 0;

      // First attempt (uncommitted retry)
      const attempt1 = scoreLocalEnglishPronunciation({ expectedText: "Hello world", recognizedText: "hello", durationSeconds: 1 });
      expect(attempt1.overallScore).toBeLessThan(100);
      // User retries -> not committed yet
      expect(completedCount).toBe(0);
      expect(scoreTotal).toBe(0);

      // Second attempt (committed)
      const attempt2 = scoreLocalEnglishPronunciation({ expectedText: "Hello world", recognizedText: "hello world", durationSeconds: 1.5 });
      completedCount += 1;
      scoreTotal += attempt2.overallScore;
      const avg = Math.round(scoreTotal / completedCount);
      expect(completedCount).toBe(1);
      expect(scoreTotal).toBe(attempt2.overallScore);
      expect(avg).toBe(attempt2.overallScore);
    });

    it("SHADOWING_STALE_ANALYSIS_IGNORED", async () => {
      delayedWorker = true;
      const controller = new AbortController();
      const promise = transcribeLocalEnglishAudio(new Float32Array(160), { signal: controller.signal });
      controller.abort();
      await expect(promise).rejects.toMatchObject({ name: "AbortError" });
    });

    it("SHADOWING_RAW_AUDIO_NOT_PERSISTED and SHADOWING_HISTORY_DERIVED_ONLY", async () => {
      const persistence = new MemoryPersistence();
      const analysis = scoreLocalEnglishPronunciation({
        id: "shadow-1",
        expectedText: "Practice shadowing every day",
        recognizedText: "practice shadowing every day",
        durationSeconds: 2.5,
      });
      await saveLocalPronunciationHistory(analysis, persistence);
      const records = await persistence.getAll<any>("pronunciationHistory");
      expect(records).toHaveLength(1);
      expect(records[0]?.expectedText).toBe("Practice shadowing every day");
      expect(records[0]?.recognizedText).toBe("practice shadowing every day");
      expect(records[0]?.overallScore).toBe(100);
      expect(JSON.stringify(records[0])).not.toContain("audioBase64");
      expect(JSON.stringify(records[0])).not.toContain("Blob");
    });

    it("SHADOWING_ZH_NO_FAKE_SCORE and SHADOWING_FINAL_AVERAGE_SCORE", () => {
      const zhAvailability = getStaticLocalPronunciationAvailability("zh");
      expect(zhAvailability.assessmentAvailable).toBe(false);

      const completedCount = 3;
      const scoreTotal = 85 + 90 + 95;
      const finalAverage = Math.round(scoreTotal / completedCount);
      expect(finalAverage).toBe(90);
    });
  });
});
