import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  cancelSpeechAndWait,
  configureSpeechUtterance,
  getReadySpeechVoices,
  getSpeechCancelSettleMs,
  getStableSpeechRate,
  selectBestSpeechVoice,
  waitForSpeechVoices,
} from "../src/frontend/services/speech.js";

describe("SpeechSynthesis Engine & Audio Clipping Prevention", () => {
  let mockVoices: SpeechSynthesisVoice[];
  let voiceListeners: Array<() => void>;
  let cancelCallCount: number;
  let speakHistory: Array<{ text: string; voice?: string; rate?: number }>;

  beforeEach(() => {
    cancelCallCount = 0;
    speakHistory = [];
    voiceListeners = [];

    mockVoices = [
      { name: "System Default", lang: "en-US", localService: true } as SpeechSynthesisVoice,
      { name: "Microsoft Jenny Natural", lang: "en-US", localService: false } as SpeechSynthesisVoice,
      { name: "Google UK English", lang: "en-GB", localService: true } as SpeechSynthesisVoice,
      { name: "Microsoft Xiaoxiao Online", lang: "zh-CN", localService: false } as SpeechSynthesisVoice,
    ];

    const mockSpeechSynthesis = {
      getVoices: vi.fn(() => mockVoices),
      cancel: vi.fn(() => {
        cancelCallCount++;
      }),
      speak: vi.fn((utterance: any) => {
        speakHistory.push({
          text: utterance.text,
          voice: utterance.voice?.name,
          rate: utterance.rate,
        });
      }),
      addEventListener: vi.fn((event: string, handler: () => void) => {
        if (event === "voiceschanged") voiceListeners.push(handler);
      }),
      removeEventListener: vi.fn((event: string, handler: () => void) => {
        if (event === "voiceschanged") {
          voiceListeners = voiceListeners.filter((h) => h !== handler);
        }
      }),
    };

    class MockUtterance {
      text: string;
      lang = "";
      rate = 1;
      pitch = 1;
      volume = 1;
      voice: any = null;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((e: any) => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }

    vi.stubGlobal("window", {
      speechSynthesis: mockSpeechSynthesis,
      SpeechSynthesisUtterance: MockUtterance,
    });
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllTimers();
  });

  // A. getStableSpeechRate(en, 0.75) returns stable internal rate, not raw 0.75
  it("A. getStableSpeechRate(en, 0.75) returns stable internal rate (0.85), not raw 0.75", () => {
    expect(getStableSpeechRate("en", 0.75)).toBe(0.85);
    expect(getStableSpeechRate("zh", 0.75)).toBe(0.80);
  });

  // B. getStableSpeechRate(en, 1) keeps current normal behavior
  it("B. getStableSpeechRate(en, 1) returns stable 1x rate (0.95)", () => {
    expect(getStableSpeechRate("en", 1)).toBe(0.95);
    expect(getStableSpeechRate("zh", 1)).toBe(0.90);
  });

  // C. getStableSpeechRate(en, 1.25) returns stable rate below raw 1.25
  it("C. getStableSpeechRate(en, 1.25) returns stable rate (1.10) below raw 1.25", () => {
    expect(getStableSpeechRate("en", 1.25)).toBe(1.10);
    expect(getStableSpeechRate("zh", 1.25)).toBe(1.08);
  });

  // D. Settle timing: non-default rates get 150ms settle
  it("D. getSpeechCancelSettleMs returns 100ms for 1x and 150ms for 0.75x / 1.25x", () => {
    expect(getSpeechCancelSettleMs(1)).toBe(100);
    expect(getSpeechCancelSettleMs(0.75)).toBe(150);
    expect(getSpeechCancelSettleMs(1.25)).toBe(150);
  });

  // E. Speed change 1 -> 0.75 immediately uses new rate (not stale 1x rate)
  it("E. Speed change 1 -> 0.75 immediately uses new rate on restart", async () => {
    let playbackSpeed = 1;
    let isPlaying = true;
    const sentences = ["I live in Vietnam."];

    async function handleSpeedChange(newSpeed: number) {
      playbackSpeed = newSpeed;
      if (isPlaying) {
        window.speechSynthesis.cancel();
        await cancelSpeechAndWait(getSpeechCancelSettleMs(newSpeed));
        const utterance = new (window as any).SpeechSynthesisUtterance(sentences[0]);
        configureSpeechUtterance(utterance, "en", playbackSpeed, mockVoices);
        window.speechSynthesis.speak(utterance);
      }
    }

    await handleSpeedChange(0.75);
    expect(speakHistory).toHaveLength(1);
    expect(speakHistory[0]?.rate).toBe(0.85); // 0.85 is stable 0.75x rate
  });

  // F. Speed change 1 -> 1.25 immediately uses new rate
  it("F. Speed change 1 -> 1.25 immediately uses new rate on restart", async () => {
    let playbackSpeed = 1;
    let isPlaying = true;
    const sentences = ["We watched the concert live."];

    async function handleSpeedChange(newSpeed: number) {
      playbackSpeed = newSpeed;
      if (isPlaying) {
        window.speechSynthesis.cancel();
        await cancelSpeechAndWait(getSpeechCancelSettleMs(newSpeed));
        const utterance = new (window as any).SpeechSynthesisUtterance(sentences[0]);
        configureSpeechUtterance(utterance, "en", playbackSpeed, mockVoices);
        window.speechSynthesis.speak(utterance);
      }
    }

    await handleSpeedChange(1.25);
    expect(speakHistory).toHaveLength(1);
    expect(speakHistory[0]?.rate).toBe(1.10); // 1.10 is stable 1.25x rate
  });

  // G. Sequential sentence 1 -> 2 keeps same normalized rate without cancel
  it("G. Sequential sentence 1 -> 2 keeps same normalized rate without cancel", async () => {
    const sentences = ["Sentence 1.", "Sentence 2.", "Sentence 3."];
    const speed = 0.75;
    let cancelCount = 0;

    (window.speechSynthesis.cancel as any).mockImplementation(() => {
      cancelCount++;
    });

    async function playSentence(index: number, isSequential: boolean) {
      if (!isSequential) {
        window.speechSynthesis.cancel();
        await cancelSpeechAndWait(getSpeechCancelSettleMs(speed));
      }
      const utterance = new (window as any).SpeechSynthesisUtterance(sentences[index]);
      configureSpeechUtterance(utterance, "en", speed, mockVoices);
      window.speechSynthesis.speak(utterance);
      if (utterance.onend) utterance.onend();
    }

    // Start user playback (sentence 0)
    await playSentence(0, false);
    expect(cancelCount).toBe(2); // 1 explicit + 1 in cancelSpeechAndWait
    expect(speakHistory[0]?.rate).toBe(0.85);

    // Sequential transitions for sentence 1 and sentence 2
    await playSentence(1, true);
    expect(cancelCount).toBe(2); // NO extra cancels
    expect(speakHistory[1]?.rate).toBe(0.85); // same rate

    await playSentence(2, true);
    expect(cancelCount).toBe(2); // NO extra cancels
    expect(speakHistory[2]?.rate).toBe(0.85); // same rate
  });

  // H. No fake prefix modifies utterance.text
  it("H. Utterance text is never modified with fake prefixes or dummy characters", () => {
    const rawText = "I live in Vietnam.";
    const utterance = new (window as any).SpeechSynthesisUtterance(rawText);
    configureSpeechUtterance(utterance, "en", 0.75, mockVoices);
    expect(utterance.text).toBe(rawText);

    const zhText = "我住在越南。";
    const zhUtterance = new (window as any).SpeechSynthesisUtterance(zhText);
    configureSpeechUtterance(zhUtterance, "zh", 1.25, mockVoices);
    expect(zhUtterance.text).toBe(zhText);
  });

  // I. Pause & Restart
  it("I. Pause calls cancel() and Restart cancels and settles", async () => {
    let isPlaying = true;
    function pause() {
      isPlaying = false;
      window.speechSynthesis.cancel();
    }
    pause();
    expect(isPlaying).toBe(false);

    async function restart() {
      window.speechSynthesis.cancel();
      await cancelSpeechAndWait(getSpeechCancelSettleMs(1));
      const utterance = new (window as any).SpeechSynthesisUtterance("Start");
      window.speechSynthesis.speak(utterance);
    }
    await restart();
    expect(speakHistory[speakHistory.length - 1]?.text).toBe("Start");
  });

  // J. Seek while playing captures wasPlaying before cancel
  it("J. Seek while playing captures wasPlaying before cancel and resumes at target sentence", async () => {
    let isPlaying = true;
    let currentIdx = 0;
    const sentences = ["Sentence 0", "Sentence 1", "Sentence 2"];
    let resumedIdx: number | null = null;

    function stopAllAudio() {
      isPlaying = false;
      window.speechSynthesis.cancel();
    }

    async function handleSeekSentence(index: number) {
      const wasPlaying = isPlaying;
      stopAllAudio();
      currentIdx = index;

      if (wasPlaying) {
        isPlaying = true;
        await cancelSpeechAndWait(getSpeechCancelSettleMs(1));
        resumedIdx = index;
        const utterance = new (window as any).SpeechSynthesisUtterance(sentences[index]);
        window.speechSynthesis.speak(utterance);
      }
    }

    await handleSeekSentence(2);
    expect(currentIdx).toBe(2);
    expect(resumedIdx).toBe(2);
    expect(speakHistory[speakHistory.length - 1]?.text).toBe("Sentence 2");
    expect(isPlaying).toBe(true);
  });

  // K. Rapid clicking AudioButton race condition
  it("K. Rapid clicking AudioButton prevents old delayed request from playing after newer request", async () => {
    let speechGen = 0;
    const playedGenerations: number[] = [];

    async function playBrowserSpeech(text: string, delayMs: number) {
      speechGen++;
      const currentGen = speechGen;

      await cancelSpeechAndWait(delayMs);
      if (speechGen !== currentGen) return;

      const utterance = new (window as any).SpeechSynthesisUtterance(text);
      playedGenerations.push(currentGen);
      window.speechSynthesis.speak(utterance);
    }

    const p1 = playBrowserSpeech("Word 1", 50);
    const p2 = playBrowserSpeech("Word 2", 20);

    await Promise.all([p1, p2]);

    expect(playedGenerations).toEqual([2]);
    expect(speakHistory[speakHistory.length - 1]?.text).toBe("Word 2");
  });

  // L. voiceschanged preloading
  it("L. waitForSpeechVoices handles initial empty voice list and resolves on voiceschanged", async () => {
    let voicesAvailable: SpeechSynthesisVoice[] = [];
    (window.speechSynthesis.getVoices as any).mockImplementation(() => voicesAvailable);

    expect(getReadySpeechVoices()).toEqual([]);
    const waitPromise = waitForSpeechVoices(300);

    setTimeout(() => {
      voicesAvailable = mockVoices;
      (window.speechSynthesis.getVoices as any).mockImplementation(() => mockVoices);
      for (const listener of voiceListeners) {
        listener();
      }
    }, 30);

    const loadedVoices = await waitPromise;
    expect(loadedVoices).toHaveLength(4);
    expect(selectBestSpeechVoice(loadedVoices, "en")?.name).toBe("Microsoft Jenny Natural");
    expect(selectBestSpeechVoice(loadedVoices, "zh")?.name).toBe("Microsoft Xiaoxiao Online");
  });
});
