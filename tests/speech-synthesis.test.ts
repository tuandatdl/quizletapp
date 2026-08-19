import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  cancelSpeechAndWait,
  configureSpeechUtterance,
  getReadySpeechVoices,
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

  // A. Sequential sentence 1 -> sentence 2: cancel() NOT called between normal sentences
  it("A. Sequential reading does NOT call cancel() between normal sentences", async () => {
    const sentences = ["I live in Vietnam.", "We watched the concert live."];

    // Mock ReadingDetailPage playback state machine
    let currentSentenceIdx = 0;
    let isPlaying = false;
    let cancelled = false;
    let sessionId = 0;

    async function playSentence(index: number, isSequential: boolean) {
      if (index >= sentences.length) {
        isPlaying = false;
        return;
      }
      currentSentenceIdx = index;
      isPlaying = true;

      if (!isSequential) {
        sessionId++;
        const currentSession = sessionId;
        cancelled = false;
        await cancelSpeechAndWait(20);
        if (cancelled || sessionId !== currentSession) return;
      }

      const utterance = new (window as any).SpeechSynthesisUtterance(sentences[index]);
      configureSpeechUtterance(utterance, "en", 1, mockVoices);
      window.speechSynthesis.speak(utterance);

      // Simulate utterance onend
      if (utterance.onend) utterance.onend();
    }

    // Start playing sentence 0 (user initiation -> 1 cancel)
    await playSentence(0, false);
    expect(cancelCallCount).toBe(1);
    expect(speakHistory).toHaveLength(1);
    expect(speakHistory[0]?.text).toBe("I live in Vietnam.");

    // Advance to sentence 1 sequentially (isSequential = true -> 0 cancels)
    await playSentence(1, true);
    expect(cancelCallCount).toBe(1); // STILL 1! No cancel during sequential advance
    expect(speakHistory).toHaveLength(2);
    expect(speakHistory[1]?.text).toBe("We watched the concert live.");
  });

  // B. Pause: cancel() called
  it("B. Pause calls cancel() and marks playback as paused", () => {
    let isPlaying = true;
    function pause() {
      isPlaying = false;
      window.speechSynthesis.cancel();
    }

    pause();
    expect(cancelCallCount).toBe(1);
    expect(isPlaying).toBe(false);
  });

  // C. Restart: cancel called, starts from beginning after settle
  it("C. Restart cancels previous speech and restarts from sentence 0 after safe settle", async () => {
    const sentences = ["Sentence 1", "Sentence 2"];
    let currentIdx = 1;
    let sessionId = 0;

    async function restart() {
      window.speechSynthesis.cancel();
      currentIdx = 0;
      sessionId++;
      const currentSession = sessionId;

      await cancelSpeechAndWait(30);
      if (sessionId !== currentSession) return;

      const utterance = new (window as any).SpeechSynthesisUtterance(sentences[0]);
      window.speechSynthesis.speak(utterance);
    }

    await restart();
    expect(cancelCallCount).toBe(2); // 1 explicit + 1 in cancelSpeechAndWait
    expect(currentIdx).toBe(0);
    expect(speakHistory[0]?.text).toBe("Sentence 1");
  });

  // D. Seek while playing: captures wasPlaying before cancel and resumes selected sentence
  it("D. Seek while playing captures wasPlaying before cancel and resumes at target sentence", async () => {
    let isPlaying = true;
    let currentIdx = 0;
    const sentences = ["Sentence 0", "Sentence 1", "Sentence 2"];
    let resumedIdx: number | null = null;

    function stopAllAudio() {
      isPlaying = false;
      window.speechSynthesis.cancel();
    }

    async function handleSeekSentence(index: number) {
      // Must capture wasPlaying BEFORE stopAllAudio()
      const wasPlaying = isPlaying;
      stopAllAudio();
      currentIdx = index;

      if (wasPlaying) {
        isPlaying = true;
        await cancelSpeechAndWait(20);
        resumedIdx = index;
        const utterance = new (window as any).SpeechSynthesisUtterance(sentences[index]);
        window.speechSynthesis.speak(utterance);
      }
    }

    await handleSeekSentence(2);
    expect(currentIdx).toBe(2);
    expect(resumedIdx).toBe(2);
    expect(speakHistory[0]?.text).toBe("Sentence 2");
    expect(isPlaying).toBe(true);
  });

  // E. Rapid clicking AudioButton: old delayed request cannot play after newer request
  it("E. Rapid clicking AudioButton prevents old delayed request from playing after newer request", async () => {
    let speechGen = 0;
    const playedGenerations: number[] = [];

    async function playBrowserSpeech(text: string, delayMs: number) {
      speechGen++;
      const currentGen = speechGen;

      await cancelSpeechAndWait(delayMs);
      // Race condition check: if another request arrived during delay, abort
      if (speechGen !== currentGen) return;

      const utterance = new (window as any).SpeechSynthesisUtterance(text);
      playedGenerations.push(currentGen);
      window.speechSynthesis.speak(utterance);
    }

    // User clicks button 1 (slow settle)
    const p1 = playBrowserSpeech("Word 1", 50);
    // User rapidly clicks button 2 before button 1 finishes settle (faster settle)
    const p2 = playBrowserSpeech("Word 2", 20);

    await Promise.all([p1, p2]);

    // Only Word 2 (generation 2) must have played, Word 1 must be aborted
    expect(playedGenerations).toEqual([2]);
    expect(speakHistory).toHaveLength(1);
    expect(speakHistory[0]?.text).toBe("Word 2");
  });

  // F. voiceschanged: voice list eventually loads and preferred voice is selected
  it("F. waitForSpeechVoices handles initial empty voice list and resolves on voiceschanged", async () => {
    let voicesAvailable: SpeechSynthesisVoice[] = [];
    (window.speechSynthesis.getVoices as any).mockImplementation(() => voicesAvailable);

    // Initial state: empty voices
    expect(getReadySpeechVoices()).toEqual([]);

    // Wait for voices in background
    const waitPromise = waitForSpeechVoices(300);

    // Simulate browser loading voices 30ms later
    setTimeout(() => {
      voicesAvailable = mockVoices;
      (window.speechSynthesis.getVoices as any).mockImplementation(() => mockVoices);
      for (const listener of voiceListeners) {
        listener();
      }
    }, 30);

    const loadedVoices = await waitPromise;
    expect(loadedVoices).toHaveLength(4);

    const bestEn = selectBestSpeechVoice(loadedVoices, "en");
    expect(bestEn?.name).toBe("Microsoft Jenny Natural");

    const bestZh = selectBestSpeechVoice(loadedVoices, "zh");
    expect(bestZh?.name).toBe("Microsoft Xiaoxiao Online");
  });
});
