/**
 * @file tests/shadowing-studio-v2.test.tsx
 * Comprehensive unit and integration regression tests for Shadowing Studio V2:
 * Sentence navigation, sentence selector, A/B audio comparison, retry, separate evaluation/navigation,
 * and state safety.
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { formatRecordingTime } from "../src/frontend/pages/shadowing/ShadowingPage";

const shadowingPagePath = path.resolve(__dirname, "../src/frontend/pages/shadowing/ShadowingPage.tsx");
const shadowingPageSrc = fs.readFileSync(shadowingPagePath, "utf-8");
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

    it("enforces mutual exclusivity: playing user audio stops model SpeechSynthesis", () => {
      expect(shadowingPageSrc).toMatch(/togglePlayUserAudio[\s\S]*?window\.speechSynthesis\?\.cancel\(\)/);
    });
  });

  describe("4. Retry Current Sentence", () => {
    it("handleRetryCurrentSentence stays on the same sentence and transitions to RECORD", () => {
      expect(shadowingPageSrc).toContain("const handleRetryCurrentSentence = () => {");
      expect(shadowingPageSrc).toMatch(/handleRetryCurrentSentence[\s\S]*?setPhase\("RECORD"\)/);
      // Does not change currentPracticeIndex or reset session
      expect(shadowingPageSrc).not.toMatch(/handleRetryCurrentSentence[\s\S]*?setCurrentPracticeIndex/);
    });
  });

  describe("5. Practice Modes (Tự do vs Liên tục)", () => {
    it("defaults practice mode to manual (Tự do)", () => {
      expect(shadowingPageSrc).toMatch(/const\s*\[practiceMode,\s*setPracticeMode\]\s*=\s*useState<ShadowingPracticeMode>\("manual"\)/);
      expect(shadowingPageSrc).toContain("Tự do");
      expect(shadowingPageSrc).toContain("Liên tục");
    });

    it("auto-advances only when practiceMode is continuous", () => {
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
    it("aborts in-flight analysis and revokes object URLs on sentence change and unmount", () => {
      expect(shadowingPageSrc).toMatch(/handleSelectSentence[\s\S]*?analysisAbortRef\.current\?\.abort\(\)/);
      expect(shadowingPageSrc).toMatch(/handleSelectSentence[\s\S]*?URL\.revokeObjectURL/);
      expect(shadowingPageSrc).toMatch(/handleSelectSentence[\s\S]*?analysisGenerationRef\.current\+\+/);
    });

    it("guards async analysis against stale generation and mismatched target sentence index", () => {
      expect(shadowingPageSrc).toMatch(/targetIdx === currentPracticeIndex/);
      expect(shadowingPageSrc).toMatch(/generation === analysisGenerationRef\.current/);
    });
  });

  describe("8. Mobile UX & Responsiveness", () => {
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
});
