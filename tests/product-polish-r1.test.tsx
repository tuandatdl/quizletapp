/** @vitest-environment jsdom */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { indexedDB } from "fake-indexeddb";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { ReadingPlayer } from "../src/frontend/components/reading/ReadingPlayer";
import { ReadingDetailPage } from "../src/frontend/pages/reading/ReadingDetailPage";
import { HomePage } from "../src/frontend/pages/home/HomePage";
import { formatRecordingTime } from "../src/frontend/pages/shadowing/ShadowingPage";
import { AuthProvider } from "../src/frontend/context/AuthContext";
import { CloudAccountProvider } from "../src/frontend/context/CloudAccountContext";
import { LanguageProvider } from "../src/frontend/context/LanguageContext";
import { ToastProvider } from "../src/frontend/context/ToastContext";
import { CloudAuthService } from "../src/frontend/services/cloudAuth";
import { resetSupabaseClientForTesting } from "../src/frontend/persistence/supabaseClient";
import { synthesizeCloudSpeech } from "../src/frontend/services/cloudTts";
import type { ReadingPlaybackState } from "../src/frontend/types/api";

globalThis.indexedDB = indexedDB;
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock speech synthesis
class MockSpeechSynthesisUtterance {
  text: string;
  lang: string = "en-US";
  rate: number = 1;
  voice: any = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}
globalThis.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance as any;

let spokenUtterances: MockSpeechSynthesisUtterance[] = [];
globalThis.speechSynthesis = {
  speak: vi.fn((utt: MockSpeechSynthesisUtterance) => {
    spokenUtterances.push(utt);
  }),
  cancel: vi.fn(),
  getVoices: vi.fn(() => [{ lang: "en-US", name: "Samantha", default: true }]),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
} as any;

// Mock static runtime
vi.mock("../src/frontend/runtime/runtime.js", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    isStaticRuntime: () => true,
    getLanguageApiUrl: () => "https://api.example.com",
    STATIC_LOCAL_USER: {
      id: "local-user",
      name: "Khách",
      email: "local@device.invalid",
      role: "student",
      createdAt: "2026-08-20T00:00:00.000Z",
    },
  };
});

vi.mock("../src/frontend/api/settings.api", () => ({
  settingsApi: {
    getSettings: vi.fn().mockResolvedValue({
      id: "settings-1",
      userId: "local-user",
      currentLearningLanguage: "en",
      audioEngine: "BROWSER",
      audioSpeed: 1,
      showTranslation: true,
      themePreference: "system",
      dailyGoalWords: 5,
      preferredVoiceEn: null,
      preferredVoiceZh: null,
      preferredCloudVoiceEn: "aura-asteria-en",
    }),
    updateSettings: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("../src/frontend/api/progress.api", () => ({
  progressApi: {
    getDashboard: vi.fn().mockResolvedValue({
      global: { streak: 3, totalWordsLearned: 50 },
      languages: { en: { dueToday: 4, learned: 30 }, zh: { dueToday: 0, learned: 20 } },
    }),
    getTodayPlan: vi.fn().mockResolvedValue({
      date: "2026-08-21",
      english: {
        newWords: { available: 0, target: 5 },
        dueReviews: { available: 0, target: 10 },
        quiz: { target: 5 },
        shadowing: { targetMinutes: 5 },
        items: [],
        estimatedMinutes: 10,
      },
      chinese: {
        newWords: { available: 0, target: 5 },
        dueReviews: { available: 0, target: 5 },
        quiz: { target: 5 },
        shadowing: { targetMinutes: 5 },
        pinyin: { target: 5 },
        items: [],
        estimatedMinutes: 0,
      },
    }),
  },
}));

vi.mock("../src/frontend/api/reading.api", () => ({
  readingApi: {
    list: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue({
      id: "passage-1",
      title: "Test Passage",
      language: "en",
      level: "A1",
      topic: "General",
      audioUrl: null,
      wordCount: 8,
      createdAt: "2026-08-21T00:00:00.000Z",
      updatedAt: "2026-08-21T00:00:00.000Z",
      sentences: [
        { id: "s1", passageId: "passage-1", order: 0, text: "First test sentence.", translationVi: "Câu một.", audioUrl: null, tokens: [] },
        { id: "s2", passageId: "passage-1", order: 1, text: "Second test sentence.", translationVi: "Câu hai.", audioUrl: null, tokens: [] },
      ],
    }),
    getTranslationAvailability: vi.fn().mockResolvedValue({ configured: true, provider: "workers-ai" }),
    getVocabularyContext: vi.fn().mockResolvedValue(null),
    enrichFromContext: vi.fn().mockResolvedValue(null),
  },
}));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const cssPath = path.join(root, "src/frontend/styles/index.css");
const readingDetailPath = path.join(root, "src/frontend/pages/reading/ReadingDetailPage.tsx");
const shadowingPagePath = path.join(root, "src/frontend/pages/shadowing/ShadowingPage.tsx");
const homePagePath = path.join(root, "src/frontend/pages/home/HomePage.tsx");

const indexCss = fs.readFileSync(cssPath, "utf-8");
const readingDetailSrc = fs.readFileSync(readingDetailPath, "utf-8");
const shadowingPageSrc = fs.readFileSync(shadowingPagePath, "utf-8");
const homePageSrc = fs.readFileSync(homePagePath, "utf-8");

describe("Product Polish R1: Reading + Shadowing + TTS + Mobile UX", () => {
  let container: HTMLDivElement;
  let reactRoot: Root;

  beforeEach(() => {
    spokenUtterances = [];
    container = document.createElement("div");
    document.body.appendChild(container);
    reactRoot = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      reactRoot.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  describe("1. Reading TTS Source Labels & Unresolved States", () => {
    const dummyHandlers = {
      onPlay: vi.fn(),
      onPause: vi.fn(),
      onResume: vi.fn(),
      onRestart: vi.fn(),
      onSeekSentence: vi.fn(),
      onPreviousSentence: vi.fn(),
      onNextSentence: vi.fn(),
      onSpeedChange: vi.fn(),
    };

    it("displays Local TTS labels when engine is 'local'", async () => {
      const state: ReadingPlaybackState = {
        mode: "speech-synthesis",
        status: "playing",
        currentSentenceIndex: 0,
        currentSentenceId: "s1",
        totalSentences: 5,
        speed: 1,
        engine: "local",
      };

      await act(async () => {
        reactRoot.render(
          <ReadingPlayer playbackState={state} language="en" {...dummyHandlers} />
        );
      });

      expect(container.textContent).toContain("Local TTS trên thiết bị");
      expect(container.textContent).toContain("Local TTS");
    });

    it("displays Cloud TTS labels when engine is 'cloud'", async () => {
      const state: ReadingPlaybackState = {
        mode: "speech-synthesis",
        status: "playing",
        currentSentenceIndex: 0,
        currentSentenceId: "s1",
        totalSentences: 5,
        speed: 1,
        engine: "cloud",
      };

      await act(async () => {
        reactRoot.render(
          <ReadingPlayer playbackState={state} language="en" {...dummyHandlers} />
        );
      });

      expect(container.textContent).toContain("Cloud TTS tự nhiên");
      expect(container.textContent).toContain("Cloud TTS");
    });

    it("displays SpeechSynthesis labels ONLY when engine is 'browser'", async () => {
      const state: ReadingPlaybackState = {
        mode: "speech-synthesis",
        status: "playing",
        currentSentenceIndex: 0,
        currentSentenceId: "s1",
        totalSentences: 5,
        speed: 1,
        engine: "browser",
      };

      await act(async () => {
        reactRoot.render(
          <ReadingPlayer playbackState={state} language="en" {...dummyHandlers} />
        );
      });

      expect(container.textContent).toContain("Giọng đọc của trình duyệt (SpeechSynthesis)");
      expect(container.textContent).toContain("SpeechSynthesis");
    });

    it("displays neutral state while resolving voice source during loading", async () => {
      const state: ReadingPlaybackState = {
        mode: "speech-synthesis",
        status: "playing",
        currentSentenceIndex: 0,
        currentSentenceId: "s1",
        totalSentences: 5,
        speed: 1,
        loading: true,
        engine: undefined,
      };

      await act(async () => {
        reactRoot.render(
          <ReadingPlayer playbackState={state} language="en" {...dummyHandlers} />
        );
      });

      expect(container.textContent).toContain("Đang chọn nguồn giọng đọc...");
      expect(container.textContent).not.toContain("SpeechSynthesis");
    });

    it("BLOCKER 1 & D: undefined engine without loading (e.g. sequential transition) MUST NOT display SpeechSynthesis", async () => {
      const state: ReadingPlaybackState = {
        mode: "speech-synthesis",
        status: "playing",
        currentSentenceIndex: 1,
        currentSentenceId: "s2",
        totalSentences: 5,
        speed: 1,
        loading: false, // isSequential sets loading = false
        engine: undefined, // engine remains unresolved until onplay
      };

      await act(async () => {
        reactRoot.render(
          <ReadingPlayer playbackState={state} language="en" {...dummyHandlers} />
        );
      });

      expect(container.textContent).toContain("Đang chọn nguồn giọng đọc...");
      expect(container.textContent).not.toContain("SpeechSynthesis");
      expect(container.textContent).not.toContain("Local TTS");
      expect(container.textContent).not.toContain("Cloud TTS");
    });
  });

  describe("2. Playback Source Transition Regressions in ReadingDetailPage", () => {
    it("A: initial non-browser playback sets engine: undefined initially until audio.onplay fires", () => {
      // In ReadingDetailPage, playSentenceAtIndex must initialize engine as undefined for non-browser mode
      expect(readingDetailSrc).toContain("engine: isCloudPreferred ? undefined : \"browser\"");
    });

    it("B & C: audio.onplay sets engine to source (local or cloud) only upon actual audio start", () => {
      expect(readingDetailSrc).toMatch(/audio\.onplay\s*=\s*\(\)\s*=>\s*\{[\s\S]*engine:\s*source/);
    });

    it("C: SpeechSynthesis utterance.onstart sets engine to browser only upon actual speech start", () => {
      expect(readingDetailSrc).toMatch(/utterance\.onstart\s*=\s*\(\)\s*=>\s*\{[\s\S]*engine:\s*"browser"/);
    });

    it("E & F: strict LOCAL / CLOUD failure resets engine to undefined and does not claim active source", () => {
      expect(readingDetailSrc).toMatch(/setPlaybackState\(\(prev\)\s*=>\s*\(\{[\s\S]*status:\s*"paused"[\s\S]*engine:\s*undefined/);
    });

    it("A & B: Browser first sentence onstart sets engine='browser' and onend schedules next sentence", async () => {
      const authService = new CloudAuthService();
      vi.spyOn(authService, "isAvailable").mockReturnValue(false);

      await act(async () => {
        reactRoot.render(
          <MemoryRouter initialEntries={["/reading/passage-1"]}>
            <AuthProvider>
              <CloudAccountProvider service={authService}>
                <LanguageProvider>
                  <ToastProvider>
                    <Routes>
                      <Route path="/reading/:id" element={<ReadingDetailPage />} />
                    </Routes>
                  </ToastProvider>
                </LanguageProvider>
              </CloudAccountProvider>
            </AuthProvider>
          </MemoryRouter>
        );
      });

      await act(async () => {
        await new Promise((r) => setTimeout(r, 100));
      });

      // Find and click the play button
      const playBtn = container.querySelector(".rp-play-btn") as HTMLButtonElement;
      expect(playBtn).not.toBeNull();

      await act(async () => {
        playBtn.click();
        await new Promise((r) => setTimeout(r, 400));
      });

      // A browser utterance was created for sentence 0
      expect(spokenUtterances.length).toBeGreaterThanOrEqual(1);
      const firstUtt = spokenUtterances[0];
      expect(firstUtt.text).toBe("First test sentence.");

      // Fire utterance.onstart
      await act(async () => {
        firstUtt.onstart?.();
      });

      // Active source label is now SpeechSynthesis
      expect(container.textContent).toContain("SpeechSynthesis");

      // Fire utterance.onend to advance to sentence 2
      await act(async () => {
        firstUtt.onend?.();
        await new Promise((r) => setTimeout(r, 400));
      });

      // Second sentence was spoken
      expect(spokenUtterances.length).toBeGreaterThanOrEqual(2);
      expect(spokenUtterances[1].text).toBe("Second test sentence.");
    });

    it("C: Duplicate onend events schedule next sentence exactly once", async () => {
      const authService = new CloudAuthService();
      vi.spyOn(authService, "isAvailable").mockReturnValue(false);

      await act(async () => {
        reactRoot.render(
          <MemoryRouter initialEntries={["/reading/passage-1"]}>
            <AuthProvider>
              <CloudAccountProvider service={authService}>
                <LanguageProvider>
                  <ToastProvider>
                    <Routes>
                      <Route path="/reading/:id" element={<ReadingDetailPage />} />
                    </Routes>
                  </ToastProvider>
                </LanguageProvider>
              </CloudAccountProvider>
            </AuthProvider>
          </MemoryRouter>
        );
      });

      await act(async () => {
        await new Promise((r) => setTimeout(r, 100));
      });

      const playBtn = container.querySelector(".rp-play-btn") as HTMLButtonElement;
      await act(async () => {
        playBtn.click();
        await new Promise((r) => setTimeout(r, 400));
      });

      const countBefore = spokenUtterances.length;
      expect(countBefore).toBeGreaterThanOrEqual(1);
      const firstUtt = spokenUtterances[0];

      await act(async () => {
        firstUtt.onend?.();
        firstUtt.onend?.(); // duplicate trigger
        await new Promise((r) => setTimeout(r, 400));
      });

      // Advanced to second sentence exactly once
      expect(spokenUtterances.length).toBe(countBefore + 1);
    });

    it("E: Stale / canceled browser utterance onend is inert and does not schedule next sentence", async () => {
      const authService = new CloudAuthService();
      vi.spyOn(authService, "isAvailable").mockReturnValue(false);

      await act(async () => {
        reactRoot.render(
          <MemoryRouter initialEntries={["/reading/passage-1"]}>
            <AuthProvider>
              <CloudAccountProvider service={authService}>
                <LanguageProvider>
                  <ToastProvider>
                    <Routes>
                      <Route path="/reading/:id" element={<ReadingDetailPage />} />
                    </Routes>
                  </ToastProvider>
                </LanguageProvider>
              </CloudAccountProvider>
            </AuthProvider>
          </MemoryRouter>
        );
      });

      await act(async () => {
        await new Promise((r) => setTimeout(r, 100));
      });

      const playBtn = container.querySelector(".rp-play-btn") as HTMLButtonElement;
      await act(async () => {
        playBtn.click();
        await new Promise((r) => setTimeout(r, 400));
      });

      const countBefore = spokenUtterances.length;
      expect(countBefore).toBeGreaterThanOrEqual(1);
      const firstUtt = spokenUtterances[0];

      // Pause / cancel playback
      await act(async () => {
        playBtn.click();
        await new Promise((r) => setTimeout(r, 100));
      });

      // Now trigger stale onend
      await act(async () => {
        firstUtt.onend?.();
        await new Promise((r) => setTimeout(r, 400));
      });

      // Next sentence was NOT scheduled
      expect(spokenUtterances.length).toBe(countBefore);
    });

    it("F: Browser utterance.onerror pauses playback and resets engine to undefined", async () => {
      const authService = new CloudAuthService();
      vi.spyOn(authService, "isAvailable").mockReturnValue(false);

      await act(async () => {
        reactRoot.render(
          <MemoryRouter initialEntries={["/reading/passage-1"]}>
            <AuthProvider>
              <CloudAccountProvider service={authService}>
                <LanguageProvider>
                  <ToastProvider>
                    <Routes>
                      <Route path="/reading/:id" element={<ReadingDetailPage />} />
                    </Routes>
                  </ToastProvider>
                </LanguageProvider>
              </CloudAccountProvider>
            </AuthProvider>
          </MemoryRouter>
        );
      });

      await act(async () => {
        await new Promise((r) => setTimeout(r, 100));
      });

      const playBtn = container.querySelector(".rp-play-btn") as HTMLButtonElement;
      await act(async () => {
        playBtn.click();
        await new Promise((r) => setTimeout(r, 400));
      });

      const initialCount = spokenUtterances.length;
      expect(initialCount).toBeGreaterThanOrEqual(1);
      const firstUtt = spokenUtterances[0];

      // Trigger error
      await act(async () => {
        firstUtt.onerror?.({ error: "audio-busy" });
        await new Promise((r) => setTimeout(r, 100));
      });

      // Does NOT schedule next sentence
      expect(spokenUtterances.length).toBe(initialCount);
      // Engine is cleared to neutral
      expect(container.textContent).toContain("Đang chọn nguồn giọng đọc...");
    });
  });

  describe("3. HomePage Identity & Greeting Fix", () => {
    it("G: cloud-authenticated HomePage uses cloud display name in greeting", async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: {
              session: {
                user: {
                  id: "cloud-uid-999",
                  email: "tuandat@example.com",
                  user_metadata: { full_name: "Tuấn Đạt Google" },
                  app_metadata: { provider: "google" },
                },
              },
            },
          }),
          onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
      } as any;
      resetSupabaseClientForTesting(mockSupabase);

      const authService = new CloudAuthService();
      vi.spyOn(authService, "isAvailable").mockReturnValue(true);

      const { AuthProvider } = await import("../src/frontend/context/AuthContext");
      const { LanguageProvider } = await import("../src/frontend/context/LanguageContext");

      await act(async () => {
        reactRoot.render(
          <MemoryRouter>
            <AuthProvider>
              <CloudAccountProvider service={authService}>
                <LanguageProvider>
                  <HomePage />
                </LanguageProvider>
              </CloudAccountProvider>
            </AuthProvider>
          </MemoryRouter>
        );
      });

      await act(async () => {
        await new Promise((r) => setTimeout(r, 60));
      });

      expect(container.textContent).toContain("Tuấn Đạt Google");
      expect(container.textContent).not.toContain("Khách");
    });

    it("H: guest / signed-out HomePage uses neutral fallback ('Khách')", async () => {
      const mockSupabase = {
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
          onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
      } as any;
      resetSupabaseClientForTesting(mockSupabase);

      const authService = new CloudAuthService();
      vi.spyOn(authService, "isAvailable").mockReturnValue(true);

      const { AuthProvider } = await import("../src/frontend/context/AuthContext");
      const { LanguageProvider } = await import("../src/frontend/context/LanguageContext");

      await act(async () => {
        reactRoot.render(
          <MemoryRouter>
            <AuthProvider>
              <CloudAccountProvider service={authService}>
                <LanguageProvider>
                  <HomePage />
                </LanguageProvider>
              </CloudAccountProvider>
            </AuthProvider>
          </MemoryRouter>
        );
      });

      await act(async () => {
        await new Promise((r) => setTimeout(r, 60));
      });

      expect(container.textContent).toContain("Khách");
      expect(container.textContent).not.toContain("Tú Trinh");
    });

    it("I: HomePage source code imports useCloudAccount and applies cloud precedence", () => {
      expect(homePageSrc).toContain("useCloudAccount");
      expect(homePageSrc).toContain("isCloudAuth && cloudDisplayName?.trim()");
    });
  });

  describe("4. Shadowing Timer Formatter", () => {
    it("formats 0 as 00:00", () => {
      expect(formatRecordingTime(0)).toBe("00:00");
    });

    it("formats 9 as 00:09", () => {
      expect(formatRecordingTime(9)).toBe("00:09");
    });

    it("formats 59 as 00:59", () => {
      expect(formatRecordingTime(59)).toBe("00:59");
    });

    it("formats 60 as 01:00", () => {
      expect(formatRecordingTime(60)).toBe("01:00");
    });

    it("formats 65 as 01:05 (fixes previous 00:65 bug)", () => {
      expect(formatRecordingTime(65)).toBe("01:05");
    });

    it("formats 125 as 02:05", () => {
      expect(formatRecordingTime(125)).toBe("02:05");
    });
  });

  describe("5. Mobile Selection Popup & CSS Architecture Hardening", () => {
    it("applies reading-selection-actions class to floating selection toolbar", () => {
      expect(readingDetailSrc).toContain("reading-selection-actions");
    });

    it("applies reading-context-popover class to contextual dictionary popup", () => {
      expect(readingDetailSrc).toContain("reading-context-popover");
    });

    it("defines mobile bottom-sheet rules with flex-wrap: nowrap and overflow-x: auto in index.css", () => {
      const mobileMatch = indexCss.match(/@media\s*\(max-width:\s*600px\)\s*\{([\s\S]*)\}/);
      expect(mobileMatch).not.toBeNull();
      const mobileBlock = mobileMatch![1];
      expect(mobileBlock).toContain(".reading-selection-actions");
      expect(mobileBlock).toMatch(/\.reading-selection-actions\s*\{[^}]*flex-wrap:\s*nowrap\s*!important/);
      expect(mobileBlock).toMatch(/\.reading-selection-actions\s*\{[^}]*overflow-x:\s*auto\s*!important/);
      expect(mobileBlock).toMatch(/\.reading-selection-actions\s*\{[^}]*bottom:\s*calc\(/);
    });

    it("defines mobile placement for reading-context-popover safely above selection actions in index.css", () => {
      const mobileMatch = indexCss.match(/@media\s*\(max-width:\s*600px\)\s*\{([\s\S]*)\}/);
      expect(mobileMatch).not.toBeNull();
      const mobileBlock = mobileMatch![1];
      expect(mobileBlock).toContain(".reading-context-popover");
      expect(mobileBlock).toMatch(/\.reading-context-popover\s*\{[^}]*max-height:\s*50vh/);
      expect(mobileBlock).toMatch(/\.reading-context-popover\s*\{[^}]*overflow-y:\s*auto/);
    });
  });

  describe("6. Shadowing Mobile UX & Responsiveness", () => {
    it("uses responsive width and max-width for recorded audio element", () => {
      expect(shadowingPageSrc).toContain('maxWidth: "440px"');
      expect(shadowingPageSrc).toMatch(/<audio[^>]*aria-label="Nghe lại bản ghi shadowing"/);
    });

    it("allows wrapping on Shadowing action rows to prevent overflow on mobile", () => {
      expect(shadowingPageSrc).toContain('flexWrap: "wrap"');
    });

    it("uses formatRecordingTime in ShadowingPage recording status", () => {
      expect(shadowingPageSrc).toContain("formatRecordingTime(recordingSeconds)");
    });
  });

  describe("7. Cloud TTS Timeout Message Accuracy", () => {
    it("returns truthful timeout error message without hardcoded (15s)", async () => {
      let abortedSignal: AbortSignal | undefined;
      vi.spyOn(globalThis, "fetch").mockImplementation((_url, init) => {
        abortedSignal = (init as any)?.signal;
        return new Promise((_, reject) => {
          abortedSignal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        });
      });

      const p = synthesizeCloudSpeech({
        text: "Truthful timeout sentence",
        language: "en",
        timeoutMs: 30,
      });

      await expect(p).rejects.toThrow("Cloud TTS quá thời gian chờ.");
    });
  });
});
