/** @vitest-environment jsdom */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { ReadingPlayer } from "../src/frontend/components/reading/ReadingPlayer";
import { formatRecordingTime } from "../src/frontend/pages/shadowing/ShadowingPage";
import type { ReadingPlaybackState } from "../src/frontend/types/api";
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const cssPath = path.join(root, "src/frontend/styles/index.css");
const readingDetailPath = path.join(root, "src/frontend/pages/reading/ReadingDetailPage.tsx");
const shadowingPagePath = path.join(root, "src/frontend/pages/shadowing/ShadowingPage.tsx");

const indexCss = fs.readFileSync(cssPath, "utf-8");
const readingDetailSrc = fs.readFileSync(readingDetailPath, "utf-8");
const shadowingPageSrc = fs.readFileSync(shadowingPagePath, "utf-8");

describe("Product Polish R1: Reading + Shadowing + TTS + Mobile UX", () => {
  let container: HTMLDivElement;
  let reactRoot: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    reactRoot = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      reactRoot.unmount();
    });
    container.remove();
  });

  describe("1. Reading TTS Source Labels", () => {
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

    it("displays SpeechSynthesis labels when engine is 'browser'", async () => {
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
    });
  });

  describe("2. Shadowing Timer Formatter", () => {
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

  describe("3. Mobile Selection Popup & CSS Architecture", () => {
    it("applies reading-selection-actions class to floating selection toolbar", () => {
      expect(readingDetailSrc).toContain("reading-selection-actions");
    });

    it("applies reading-context-popover class to contextual dictionary popup", () => {
      expect(readingDetailSrc).toContain("reading-context-popover");
    });

    it("defines mobile bottom-sheet rules for reading-selection-actions in index.css", () => {
      const mobileMatch = indexCss.match(/@media\s*\(max-width:\s*600px\)\s*\{([\s\S]*)\}/);
      expect(mobileMatch).not.toBeNull();
      const mobileBlock = mobileMatch![1];
      expect(mobileBlock).toContain(".reading-selection-actions");
      expect(mobileBlock).toMatch(/\.reading-selection-actions\s*\{[^}]*bottom:\s*calc\(/);
      expect(mobileBlock).toMatch(/\.reading-selection-actions\s*\{[^}]*left:\s*12px/);
      expect(mobileBlock).toMatch(/\.reading-selection-actions\s*\{[^}]*right:\s*12px/);
    });

    it("defines mobile placement for reading-context-popover in index.css", () => {
      const mobileMatch = indexCss.match(/@media\s*\(max-width:\s*600px\)\s*\{([\s\S]*)\}/);
      expect(mobileMatch).not.toBeNull();
      const mobileBlock = mobileMatch![1];
      expect(mobileBlock).toContain(".reading-context-popover");
      expect(mobileBlock).toMatch(/\.reading-context-popover\s*\{[^}]*max-height:\s*50vh/);
      expect(mobileBlock).toMatch(/\.reading-context-popover\s*\{[^}]*overflow-y:\s*auto/);
    });
  });

  describe("4. Shadowing Mobile UX & Responsiveness", () => {
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
});
