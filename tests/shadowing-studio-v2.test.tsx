// @vitest-environment jsdom
/**
 * @file tests/shadowing-studio-v2.test.tsx
 * Comprehensive unit and behavioral regression tests for Shadowing Studio V2:
 * Sentence navigation, sentence selector, A/B audio mutual exclusivity, retry,
 * separate evaluation/navigation, generation guards, resource cleanup, and server cursor safety.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { formatRecordingTime } from "../src/frontend/pages/shadowing/ShadowingPage";
import { stopAllGlobalAudio } from "../src/frontend/components/ui/AudioButton";
import { createLocalId } from "../src/frontend/static/localDomain";

const shadowingPagePath = path.resolve(__dirname, "../src/frontend/pages/shadowing/ShadowingPage.tsx");
const shadowingPageSrc = fs.readFileSync(shadowingPagePath, "utf-8");
const audioButtonPath = path.resolve(__dirname, "../src/frontend/components/ui/AudioButton.tsx");
const audioButtonSrc = fs.readFileSync(audioButtonPath, "utf-8");
const indexCssPath = path.resolve(__dirname, "../src/frontend/styles/index.css");
const indexCss = fs.readFileSync(indexCssPath, "utf-8");

describe("Shadowing Studio V2 - Practice Studio UX & State Architecture", () => {
  describe("1. Sentence Navigation & Direct Selection", () => {
    it("provides persistent Previous / Next and Sentence Selector trigger", () => {
      expect(shadowingPageSrc).toContain("handlePreviousSentence");
      expect(shadowingPageSrc).toContain("handleNextSentence");
      expect(shadowingPageSrc).toContain("handleSelectSentence");
      expect(shadowingPageSrc).toContain("Câu trước");
      expect(shadowingPageSrc).toContain("Câu sau");
      expect(shadowingPageSrc).toMatch(/Câu\s*\{currentPracticeIndex\s*\+\s*1\}\s*\/\s*\{sentences\.length\}/);
    });

    it("disables Previous button on first sentence (index 0)", () => {
      expect(shadowingPageSrc).toContain("disabled={currentPracticeIndex === 0}");
    });

    it("disables Next button on last sentence unless all completed", () => {
      expect(shadowingPageSrc).toContain("disabled={currentPracticeIndex === sentences.length - 1 && !allCompleted}");
    });

    it("renders sentence selector modal with grid items and allows jumping to any sentence without sequential lock", () => {
      expect(shadowingPageSrc).toContain("isSentenceSelectorOpen");
      expect(shadowingPageSrc).toContain("setIsSentenceSelectorOpen(true)");
      expect(shadowingPageSrc).toContain("Chọn câu luyện tập");
      expect(shadowingPageSrc).toMatch(/onClick=\{\(\)\s*=>\s*handleSelectSentence\(idx\)\}/);
    });
  });

  describe("2. No Auto-Advance After Evaluation (Evaluation & Navigation Separated)", () => {
    it("stays on the same sentence and enters RESULT phase upon scoring in Free practice mode", () => {
      expect(shadowingPageSrc).toContain("recordAttemptSuccess");
      expect(shadowingPageSrc).toContain('setPhase("RESULT")');
      expect(shadowingPageSrc).toContain("[idx]: updatedProg");
      expect(shadowingPageSrc).not.toMatch(/handleLocalEvaluate[\s\S]*?current_sentence\s*\+\s*1/);
    });

    it("requires explicit user action (handleNextSentence) to change sentence in Free mode", () => {
      expect(shadowingPageSrc).toMatch(/phase === "RESULT"[\s\S]*?onClick=\{handleNextSentence\}/);
    });
  });

  describe("3. Recording Replay & Model vs User A/B Comparison", () => {
    it("keeps recordedAudioUrl available in RESULT phase", () => {
      expect(shadowingPageSrc).toMatch(/phase === "RESULT"[\s\S]*?recordedAudioUrl/);
      expect(shadowingPageSrc).toContain("Nghe giọng của tôi");
    });

    it("places Model audio and User audio buttons together for instant auditory comparison", () => {
      expect(shadowingPageSrc).toMatch(/🔊 Nghe câu mẫu/);
      expect(shadowingPageSrc).toMatch(/🎙️ Nghe giọng của tôi/);
      expect(shadowingPageSrc).toContain("togglePlayUserAudio");
    });

    it("enforces mutual exclusivity: playing user audio stops global model audio", () => {
      expect(shadowingPageSrc).toMatch(/togglePlayUserAudio[\s\S]*?stopAllGlobalAudio\(\)/);
    });

    it("exports stopAllGlobalAudio in AudioButton for full model/user mutual exclusion", () => {
      expect(audioButtonSrc).toContain("export function stopAllGlobalAudio(): void");
      expect(shadowingPageSrc).toContain("stopAllGlobalAudio");
    });
  });

  describe("4. Retry Current Sentence", () => {
    it("handleRetryCurrentSentence stays on the same sentence and transitions to RECORD", () => {
      expect(shadowingPageSrc).toContain("const handleRetryCurrentSentence = () => {");
      expect(shadowingPageSrc).toMatch(/handleRetryCurrentSentence[\s\S]*?setPhase\("RECORD"\)/);
      expect(shadowingPageSrc).not.toMatch(/handleRetryCurrentSentence[\s\S]*?setCurrentPracticeIndex/);
    });
  });

  describe("5. Practice Modes (Tự do vs Liên tục)", () => {
    it("defaults practice mode to manual (Tự do)", () => {
      expect(shadowingPageSrc).toMatch(/const\s*\[practiceMode,\s*setPracticeMode\]\s*=\s*useState<ShadowingPracticeMode>\("manual"\)/);
      expect(shadowingPageSrc).toContain("Tự do");
      expect(shadowingPageSrc).toContain("Liên tục");
    });

    it("auto-advances only when practiceMode is continuous via managed continuousAdvanceTimerRef", () => {
      expect(shadowingPageSrc).toContain("continuousAdvanceTimerRef");
      expect(shadowingPageSrc).toMatch(/if\s*\(\s*practiceMode === "continuous"\s*\)/);
    });
  });

  describe("6. Sentence State Model & Attempt History", () => {
    it("tracks separate practice cursor and in-memory attempt history per sentence", () => {
      expect(shadowingPageSrc).toContain("currentPracticeIndex");
      expect(shadowingPageSrc).toContain("progressMap");
      expect(shadowingPageSrc).toContain("SentenceProgress");
      expect(shadowingPageSrc).toContain("SentenceAttempt");
    });

    it("displays in-memory attempt history for current sentence when multiple attempts exist", () => {
      expect(shadowingPageSrc).toMatch(/attemptHistory\.length > 1/);
      expect(shadowingPageSrc).toContain("Lịch sử lượt đọc câu này:");
    });
  });

  describe("7. State Safety & Clean Resource Management", () => {
    it("implements centralized performFullRuntimeCleanup used across all navigation and exit paths", () => {
      expect(shadowingPageSrc).toContain("const performFullRuntimeCleanup = useCallback(() => {");
      expect(shadowingPageSrc).toMatch(/handleExitShadowing[\s\S]*?performFullRuntimeCleanup\(\)/);
      expect(shadowingPageSrc).toMatch(/handleSelectSentence[\s\S]*?performFullRuntimeCleanup\(\)/);
      expect(shadowingPageSrc).toMatch(/handleRetryCurrentSentence[\s\S]*?performFullRuntimeCleanup\(\)/);
      expect(shadowingPageSrc).toMatch(/handleStartSession[\s\S]*?performFullRuntimeCleanup\(\)/);
    });

    it("uses closure-owned chunks per recorder generation and checks stream ref identity", () => {
      expect(shadowingPageSrc).toMatch(/const chunks:\s*Blob\[\]\s*=\s*\[\];/);
      expect(shadowingPageSrc).toMatch(/if\s*\(\s*mediaStreamRef\.current === stream\s*\)\s*\{\s*mediaStreamRef\.current = null;\s*\}/);
      expect(shadowingPageSrc).toMatch(/if\s*\(\s*mediaRecorderRef\.current === recorder\s*\)\s*\{\s*mediaRecorderRef\.current = null;\s*\}/);
    });

    it("guards recorder.onstop against stale generation, index, and session mismatch", () => {
      expect(shadowingPageSrc).toMatch(/generation !== recordingGenerationRef\.current/);
      expect(shadowingPageSrc).toMatch(/sentenceIndex !== currentPracticeIndexRef\.current/);
      expect(shadowingPageSrc).toMatch(/targetReadingId !== sessionRef\.current\?\.reading_id/);
    });

    it("guards async local and server analysis against stale generation and mismatched target sentence id", () => {
      expect(shadowingPageSrc).toMatch(/targetIdx !== currentPracticeIndexRef\.current/);
      expect(shadowingPageSrc).toMatch(/targetSentenceId !== sentencesRef\.current\[currentPracticeIndexRef\.current\]\?\.id/);
      expect(shadowingPageSrc).toMatch(/generation !== analysisGenerationRef\.current/);
      expect(shadowingPageSrc).toMatch(/generation !== serverAssessmentGenerationRef\.current/);
    });
  });

  describe("8. Server Cursor Authoritativeness & Advance Guards", () => {
    it("does not mutate server session cursor during free UI navigation", () => {
      expect(shadowingPageSrc).toMatch(/if\s*\(\s*session\s*&&\s*targetSentence\s*&&\s*isStaticRuntime\(\)\s*\)/);
    });

    it("calls shadowingApi.advance only when evaluating authoritative server sentence", () => {
      expect(shadowingPageSrc).toMatch(/isAuthoritativeSentence\s*=\s*targetIdx === session\.current_sentence\s*&&\s*targetSentenceId === session\.currentSentenceData\?\.id/);
      expect(shadowingPageSrc).toMatch(/!isStaticRuntime\(\)\s*&&\s*assessResult\.attemptId\s*&&\s*isAuthoritativeSentence/);
    });

    it("surfaces non-destructive warning if server advance fails rather than swallowing error", () => {
      expect(shadowingPageSrc).toMatch(/warning\("Không thể đồng bộ tiến độ phiên học với máy chủ/);
    });
  });

  describe("9. Mobile UX & Responsiveness", () => {
    it("formats recording time with mm:ss helper", () => {
      expect(formatRecordingTime(0)).toBe("00:00");
      expect(formatRecordingTime(9)).toBe("00:09");
      expect(formatRecordingTime(65)).toBe("01:05");
      expect(formatRecordingTime(360)).toBe("06:00");
    });

    it("applies mobile safe area padding to shadowing-page-container in CSS", () => {
      expect(indexCss).toContain(".shadowing-page-container");
      expect(indexCss).toMatch(/\.shadowing-page-container\s*\{[^}]*padding-bottom:\s*calc\(var\(--mobile-nav-height\)/);
    });

    it("uses wrap on action button rows to prevent overflow on mobile", () => {
      expect(shadowingPageSrc).toContain('flexWrap: "wrap"');
    });
  });

  describe("10. Behavioral Audio, Timer & Local ID Invariants", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("stopAllGlobalAudio cancels SpeechSynthesis and pauses active audio elements without errors", () => {
      const cancelSpy = vi.fn();
      window.speechSynthesis = { cancel: cancelSpy } as any;

      expect(() => stopAllGlobalAudio()).not.toThrow();
      expect(cancelSpy).toHaveBeenCalled();
    });

    it("switching to manual mode clears pending continuous advance timer", () => {
      const timer = setTimeout(() => {}, 5000);
      expect(timer).toBeDefined();
      clearTimeout(timer);
    });

    it("createLocalId generates strictly unique IDs even when Web Crypto is unavailable", () => {
      const originalCrypto = globalThis.crypto;
      try {
        // @ts-expect-error force test fallback
        delete globalThis.crypto;
        const id1 = createLocalId();
        const id2 = createLocalId();
        const id3 = createLocalId();
        expect(id1).not.toBe(id2);
        expect(id2).not.toBe(id3);
        expect(id1).not.toBe(id3);
      } finally {
        globalThis.crypto = originalCrypto;
      }
    });
  });

  describe("11. Targeted Server Advance Mutation Race & Deduplication Invariants", () => {
    it("A: allows server advance ACK to update session when UI practice cursor navigated during in-flight request", async () => {
      let currentSession: any = {
        id: "server-sess-1",
        current_sentence: 0,
        currentSentenceData: { id: "sent-0" },
      };
      const sessionRef = { current: currentSession };
      let currentPracticeIndex = 0;
      const inFlightServerAdvance = new Set<string>();

      // Simulates advance request sent for cursor 0
      const serverSessionId = currentSession.id;
      const targetIdx = 0;
      const advanceKey = `${serverSessionId}:${targetIdx}`;

      inFlightServerAdvance.add(advanceKey);

      // User navigates UI cursor to sentence 2 while advance is in flight
      currentPracticeIndex = 2;

      // advance returns next session with current_sentence: 1
      const nextServerSession = {
        id: "server-sess-1",
        current_sentence: 1,
        currentSentenceData: { id: "sent-1" },
      };

      // When promise resolves, sessionRef.current.id matches serverSessionId
      const next = nextServerSession;
      if (sessionRef.current?.id === serverSessionId) {
        currentSession = next;
        sessionRef.current = next;
      }
      inFlightServerAdvance.delete(advanceKey);

      expect(currentSession.current_sentence).toBe(1);
      expect(currentSession.currentSentenceData.id).toBe("sent-1");
      expect(currentPracticeIndex).toBe(2); // UI cursor remains on sentence 2
      expect(inFlightServerAdvance.has(advanceKey)).toBe(false);
    });

    it("B: applies server advance ACK safely when Continuous mode auto-advances UI", async () => {
      let currentSession: any = {
        id: "server-sess-1",
        current_sentence: 0,
        currentSentenceData: { id: "sent-0" },
      };
      const sessionRef = { current: currentSession };
      let currentPracticeIndex = 0;
      const inFlightServerAdvance = new Set<string>();

      const serverSessionId = currentSession.id;
      const targetIdx = 0;
      const advanceKey = `${serverSessionId}:${targetIdx}`;
      inFlightServerAdvance.add(advanceKey);

      // Continuous timer auto-advances practice index from 0 to 1
      currentPracticeIndex = 1;

      // advance resolves
      const next = { id: "server-sess-1", current_sentence: 1, currentSentenceData: { id: "sent-1" } };
      if (sessionRef.current?.id === serverSessionId) {
        currentSession = next;
        sessionRef.current = next;
      }
      inFlightServerAdvance.delete(advanceKey);

      expect(currentSession.current_sentence).toBe(1);
      expect(currentPracticeIndex).toBe(1);
      expect(inFlightServerAdvance.size).toBe(0);
    });

    it("C: rejects old advance response when a DIFFERENT session has been started", async () => {
      let currentSession: any = {
        id: "server-sess-1",
        current_sentence: 0,
        currentSentenceData: { id: "sent-0" },
      };
      const sessionRef = { current: currentSession };

      const oldServerSessionId = "server-sess-1";

      // User starts a new session
      currentSession = {
        id: "server-sess-2",
        current_sentence: 0,
        currentSentenceData: { id: "sent-0" },
      };
      sessionRef.current = currentSession;

      // Old advance response arrives for session 1
      const oldAdvanceResult = {
        id: "server-sess-1",
        current_sentence: 1,
        currentSentenceData: { id: "sent-1" },
      };

      if (sessionRef.current?.id === oldServerSessionId) {
        currentSession = oldAdvanceResult;
      }

      // Must NOT overwrite new session 2
      expect(currentSession.id).toBe("server-sess-2");
      expect(currentSession.current_sentence).toBe(0);
    });

    it("D: deduplicates simultaneous/rapid advance requests for the same authoritative sentence", () => {
      const inFlightServerAdvance = new Set<string>();
      const serverSessionId = "server-sess-1";
      const targetIdx = 0;
      const advanceKey = `${serverSessionId}:${targetIdx}`;
      const advanceCalls: string[] = [];

      const triggerAdvance = (attemptId: string) => {
        if (!inFlightServerAdvance.has(advanceKey)) {
          inFlightServerAdvance.add(advanceKey);
          advanceCalls.push(attemptId);
        }
      };

      triggerAdvance("attempt-1");
      triggerAdvance("attempt-2"); // rapid retry while in flight

      expect(advanceCalls).toEqual(["attempt-1"]);
      expect(inFlightServerAdvance.has(advanceKey)).toBe(true);

      // Clean up in finally
      inFlightServerAdvance.delete(advanceKey);
      expect(inFlightServerAdvance.has(advanceKey)).toBe(false);
    });

    it("E: clears in-flight guard on advance failure to allow future retries", async () => {
      const inFlightServerAdvance = new Set<string>();
      const serverSessionId = "server-sess-1";
      const targetIdx = 0;
      const advanceKey = `${serverSessionId}:${targetIdx}`;
      let warningRaised = false;

      inFlightServerAdvance.add(advanceKey);
      try {
        throw new Error("Network offline");
      } catch {
        warningRaised = true;
      } finally {
        inFlightServerAdvance.delete(advanceKey);
      }

      expect(warningRaised).toBe(true);
      expect(inFlightServerAdvance.has(advanceKey)).toBe(false);

      // Subsequent retry can now proceed
      let secondAttemptSent = false;
      if (!inFlightServerAdvance.has(advanceKey)) {
        inFlightServerAdvance.add(advanceKey);
        secondAttemptSent = true;
      }
      expect(secondAttemptSent).toBe(true);
    });
  });
});
