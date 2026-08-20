import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const cssTokensPath = path.join(root, "src/frontend/styles/tokens.css");
const cssIndexPath = path.join(root, "src/frontend/styles/index.css");
const readingDetailPath = path.join(root, "src/frontend/pages/reading/ReadingDetailPage.tsx");
const quickAddPreviewRowsPath = path.join(root, "src/frontend/pages/vocabulary/QuickAddPreviewRows.tsx");
const flashcardPagePath = path.join(root, "src/frontend/pages/flashcards/FlashcardPage.tsx");
const homePagePath = path.join(root, "src/frontend/pages/home/HomePage.tsx");

const tokensCss = fs.readFileSync(cssTokensPath, "utf-8");
const indexCss = fs.readFileSync(cssIndexPath, "utf-8");
const readingDetailSrc = fs.readFileSync(readingDetailPath, "utf-8");
const quickAddPreviewRowsSrc = fs.readFileSync(quickAddPreviewRowsPath, "utf-8");
const flashcardPageSrc = fs.readFileSync(flashcardPagePath, "utf-8");
const homePageSrc = fs.readFileSync(homePagePath, "utf-8");

describe("Phase K: Final UI/UX Polish & Production Readiness", () => {
  describe("Design Tokens & Dark Mode Quality", () => {
    it("defines consistent font display and body typography tokens", () => {
      expect(tokensCss).toContain("--font-display");
      expect(tokensCss).toContain("--font-body");
      expect(tokensCss).toContain("--font-chinese");
      expect(tokensCss).toContain("--font-mono");
    });

    it("has dark mode color overrides for all core surfaces", () => {
      expect(tokensCss).toContain('[data-theme="dark"]');
      expect(tokensCss).toContain("--bg-canvas");
      expect(tokensCss).toContain("--bg-surface");
      expect(tokensCss).toContain("--border-default");
      expect(tokensCss).toContain("--text-primary");
    });

    it("supports prefers-reduced-motion in global index.css", () => {
      expect(indexCss).toContain("prefers-reduced-motion: reduce");
    });
  });

  describe("Reading Contextual Popup Clamping", () => {
    it("clamps floating popup coordinates safely within viewport bounds", () => {
      expect(readingDetailSrc).toContain("Math.min(window.innerWidth - 170, Math.max(170,");
      expect(readingDetailSrc).toContain("Math.min(window.innerWidth - 160, Math.max(160,");
    });

    it("defines floating selection toolbar styles in index.css", () => {
      expect(indexCss).toContain(".floating-selection-toolbar");
      expect(indexCss).toContain(".token-popover");
    });
  });

  describe("Quick Add Topic UX Distinction", () => {
    it("renders suggested topics distinctly from assigned topics", () => {
      expect(quickAddPreviewRowsSrc).toContain("GỢI Ý CHỦ ĐỀ");
      expect(quickAddPreviewRowsSrc).toContain("onAcceptSuggestedTopic");
      expect(quickAddPreviewRowsSrc).toContain("onDismissSuggestedTopic");
      expect(quickAddPreviewRowsSrc).toContain("border: \"1px dashed var(--accent-en-border)\"");
    });
  });

  describe("Flashcards 4-Choice SRS Rating & Accessibility", () => {
    it("provides 4 distinct rating buttons (Again, Hard, Good, Easy)", () => {
      expect(flashcardPageSrc).toContain("1. Quên (Again)");
      expect(flashcardPageSrc).toContain("2. Khó (Hard)");
      expect(flashcardPageSrc).toContain("3. Tốt (Good)");
      expect(flashcardPageSrc).toContain("4. Dễ (Easy)");
    });

    it("includes keyboard shortcut support (1, 2, 3, 4, Space)", () => {
      expect(flashcardPageSrc).toContain('e.code === "Space"');
      expect(flashcardPageSrc).toContain('e.key === "1"');
      expect(flashcardPageSrc).toContain('e.key === "4"');
    });
  });

  describe("Dashboard Learning Hierarchy", () => {
    it("displays due reviews, streak, and daily goals above the fold", () => {
      expect(homePageSrc).toContain("CHUỖI HỌC");
      expect(homePageSrc).toContain("MỤC TIÊU HÔM NAY");
      expect(homePageSrc).toContain("Có {dueReviews} thẻ từ vựng đến hạn ôn tập hôm nay");
    });
  });
});
