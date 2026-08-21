/**
 * @file tests/reading-mobile-selection-ux.test.tsx
 * Comprehensive unit and integration regression tests for mobile reading UI/UX stability,
 * layout shift elimination, popover non-collision, single-overlay invariant, and touch selection isolation.
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const cssPath = path.resolve(__dirname, "../src/frontend/styles/index.css");
const readingDetailPath = path.resolve(__dirname, "../src/frontend/pages/reading/ReadingDetailPage.tsx");

const indexCss = fs.readFileSync(cssPath, "utf-8");
const readingDetailSrc = fs.readFileSync(readingDetailPath, "utf-8");

describe("Reading Mobile Selection UI/UX & Layout Stability", () => {
  describe("1. CSS Animation Conflict Elimination (Zero Layout Snapping)", () => {
    it("animates floating toolbars and token popovers using opacity-only floatPopoverFadeIn", () => {
      expect(indexCss).toContain(".floating-selection-toolbar.animate-pop-in");
      expect(indexCss).toContain(".token-popover.animate-pop-in");
      expect(indexCss).toContain("floatPopoverFadeIn");
      expect(indexCss).toMatch(/@keyframes\s+floatPopoverFadeIn\s*\{\s*from\s*\{\s*opacity:\s*0;\s*\}\s*to\s*\{\s*opacity:\s*1;\s*\}\s*\}/);
    });

    it("does NOT override transform: translate(...) with scale during popover entry", () => {
      // The floatPopoverFadeIn keyframe must not include any transform properties
      const keyframeMatch = indexCss.match(/@keyframes\s+floatPopoverFadeIn\s*\{([\s\S]*?)\}/);
      expect(keyframeMatch).not.toBeNull();
      expect(keyframeMatch![1]).not.toContain("transform");
    });
  });

  describe("2. Mobile Bottom-Sheet Architecture (Non-Colliding Popovers)", () => {
    const mobileMediaMatch = indexCss.match(/@media\s*\(max-width:\s*600px\)\s*\{([\s\S]*?)\n\}/);
    const mobileBlock = mobileMediaMatch ? mobileMediaMatch[1] : "";

    it("positions reading-context-popover as a unified bottom-sheet above the mobile navigation bar", () => {
      expect(mobileBlock).toContain(".reading-context-popover");
      expect(mobileBlock).toMatch(/\.reading-context-popover\s*\{[^}]*bottom:\s*calc\(var\(--mobile-nav-height,\s*60px\)\s*\+\s*env\(safe-area-inset-bottom,\s*0px\)\s*\+\s*12px\)\s*!important/);
      expect(mobileBlock).toMatch(/\.reading-context-popover\s*\{[^}]*max-height:\s*50vh\s*!important/);
      expect(mobileBlock).toMatch(/\.reading-context-popover\s*\{[^}]*overflow-y:\s*auto\s*!important/);
      expect(mobileBlock).toMatch(/\.reading-context-popover\s*\{[^}]*overscroll-behavior:\s*contain\s*!important/);
      expect(mobileBlock).toMatch(/\.reading-context-popover\s*\{[^}]*-webkit-overflow-scrolling:\s*touch/);
      expect(mobileBlock).toMatch(/\.reading-context-popover\s*\{[^}]*z-index:\s*951\s*!important/);
    });

    it("positions reading-selection-actions safely above mobile bottom navigation bar", () => {
      expect(mobileBlock).toContain(".reading-selection-actions");
      expect(mobileBlock).toMatch(/\.reading-selection-actions\s*\{[^}]*bottom:\s*calc\(var\(--mobile-nav-height,\s*60px\)\s*\+\s*env\(safe-area-inset-bottom,\s*0px\)\s*\+\s*12px\)\s*!important/);
      expect(mobileBlock).toMatch(/\.reading-selection-actions\s*\{[^}]*flex-wrap:\s*nowrap\s*!important/);
      expect(mobileBlock).toMatch(/\.reading-selection-actions\s*\{[^}]*overflow-x:\s*auto\s*!important/);
      expect(mobileBlock).toMatch(/\.reading-selection-actions\s*\{[^}]*z-index:\s*950\s*!important/);
    });

    it("positions token-popover safely above mobile bottom navigation bar", () => {
      expect(mobileBlock).toContain(".token-popover");
      expect(mobileBlock).toMatch(/\.token-popover\s*\{[^}]*bottom:\s*calc\(var\(--mobile-nav-height,\s*60px\)\s*\+\s*env\(safe-area-inset-bottom,\s*0px\)\s*\+\s*12px\)\s*!important/);
      expect(mobileBlock).toMatch(/\.token-popover\s*\{[^}]*z-index:\s*950\s*!important/);
    });
  });

  describe("3. JSX Mutual Exclusivity (Single Active Card on Mobile)", () => {
    it("hides floating selection actions when contextual dictionary or translation popup is open", () => {
      expect(readingDetailSrc).toContain("!isContextPopoverOpen && !isTranslationPopoverOpen");
      expect(readingDetailSrc).toContain("const isContextPopoverOpen = Boolean(");
      expect(readingDetailSrc).toContain("const isTranslationPopoverOpen = Boolean(");
    });

    it("applies reading-context-popover class to classic translation popup for unified bottom-sheet behavior", () => {
      expect(readingDetailSrc).toMatch(/isTranslationPopoverOpen\s*&&\s*toolbarCoords\s*&&\s*\([\s\S]*?className="floating-selection-toolbar\s+reading-context-popover\s+animate-pop-in"/);
    });
  });

  describe("4. Touch & Click Event Isolation (Zero Jitter / Zero Unwanted Audio Seeks)", () => {
    it("guards handleSentenceClick against active text selection to prevent unwanted audio playback while selecting words", () => {
      expect(readingDetailSrc).toContain("const sel = window.getSelection()?.toString().trim();");
      expect(readingDetailSrc).toContain("if (sel) return;");
      expect(readingDetailSrc).toContain("handleSeekSentence(sIdx);");
    });

    it("stops onMouseDown and onTouchStart propagation on popovers to prevent accidental selection dismissal", () => {
      expect(readingDetailSrc).toMatch(/reading-selection-actions[\s\S]*?onMouseDown=\{\(e\)\s*=>\s*e\.stopPropagation\(\)\}[\s\S]*?onTouchStart=\{\(e\)\s*=>\s*e\.stopPropagation\(\)\}/);
      expect(readingDetailSrc).toMatch(/reading-context-popover[\s\S]*?onMouseDown=\{\(e\)\s*=>\s*e\.stopPropagation\(\)\}[\s\S]*?onTouchStart=\{\(e\)\s*=>\s*e\.stopPropagation\(\)\}/);
      expect(readingDetailSrc).toMatch(/token-popover[\s\S]*?onMouseDown=\{\(e\)\s*=>\s*e\.stopPropagation\(\)\}[\s\S]*?onTouchStart=\{\(e\)\s*=>\s*e\.stopPropagation\(\)\}/);
    });

    it("debounces selection updates with requestAnimationFrame and cleans up timer on unmount", () => {
      expect(readingDetailSrc).toContain("selectionTimerRef");
      expect(readingDetailSrc).toContain("requestAnimationFrame(");
      expect(readingDetailSrc).toContain("if (selectionTimerRef.current) clearTimeout(selectionTimerRef.current);");
    });
  });

  describe("5. Smart Desktop Positioning & Clamping", () => {
    it("calculates placement and popoverY based on available space above selection", () => {
      expect(readingDetailSrc).toContain("const placeAbove = rect.top >= 130;");
      expect(readingDetailSrc).toContain("const popoverY = placeAbove");
      expect(readingDetailSrc).toContain("Math.min(viewportH - 240, rect.bottom + 8)");
      expect(readingDetailSrc).toContain("Math.min(viewportH - 240, rect.bottom + 52)");
    });

    it("clamps horizontal coordinates cleanly within viewport bounds", () => {
      expect(readingDetailSrc).toContain("Math.min(window.innerWidth - 170, Math.max(170,");
      expect(readingDetailSrc).toContain("Math.min(window.innerWidth - 160, Math.max(160,");
    });
  });

  describe("6. Single Overlay State Invariant & Direct Token Translation", () => {
    it("A: token click invokes closeOverlays() first to abort enrichment and clear previous popovers before setting activeToken", () => {
      expect(readingDetailSrc).toMatch(/handleTokenClick\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?closeOverlays\(\);[\s\S]*?setActiveToken\(/);
    });

    it("B: handleMouseUp clears activeToken when a valid text selection is made", () => {
      expect(readingDetailSrc).toMatch(/handleMouseUp[\s\S]*?setActiveToken\(null\);[\s\S]*?setSelectedText\(text\);/);
    });

    it("C: closeOverlays() clears activeToken along with selection and context states", () => {
      expect(readingDetailSrc).toMatch(/function closeOverlays\(\)\s*\{[\s\S]*?setActiveToken\(null\);[\s\S]*?\}/);
    });

    it("D: triggerContextualEnrichment clears activeToken when contextual lookup starts", () => {
      expect(readingDetailSrc).toMatch(/triggerContextualEnrichment[\s\S]*?setActiveToken\(null\);/);
    });

    it("E: handleTranslateSelection accepts direct overrideText and clears activeToken", () => {
      expect(readingDetailSrc).toMatch(/handleTranslateSelection\s*=\s*async\s*\(\s*overrideText\?: string\s*\)\s*=>\s*\{/);
      expect(readingDetailSrc).toContain("const textToTranslate = overrideText || selectedText;");
      expect(readingDetailSrc).toContain("setActiveToken(null);");
    });

    it("F: token Translate button passes token text directly to handleTranslateSelection (avoids async state lag)", () => {
      expect(readingDetailSrc).toMatch(/handleTranslateSelection\(text\)/);
    });

    it("G: token popover rendering condition strictly enforces mutual exclusivity with selection and context popovers", () => {
      expect(readingDetailSrc).toContain("activeToken && !toolbarCoords && !isContextPopoverOpen && !isTranslationPopoverOpen");
    });
  });
});
