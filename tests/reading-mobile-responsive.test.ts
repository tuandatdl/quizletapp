import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const cssPath = path.join(root, "src/frontend/styles/index.css");
const playerPath = path.join(root, "src/frontend/components/reading/ReadingPlayer.tsx");
const pageDetailPath = path.join(root, "src/frontend/pages/reading/ReadingDetailPage.tsx");

const css = fs.readFileSync(cssPath, "utf-8");
const playerSrc = fs.readFileSync(playerPath, "utf-8");
const pageSrc = fs.readFileSync(pageDetailPath, "utf-8");

describe("Reading Mobile Responsive Layout", () => {
  describe("CSS: Player card", () => {
    it("reading-mini-player has box-sizing: border-box and min-width: 0 to prevent overflow", () => {
      expect(css).toContain(".reading-mini-player");
      expect(css).toMatch(/\.reading-mini-player\s*\{[^}]*box-sizing:\s*border-box/s);
      expect(css).toMatch(/\.reading-mini-player\s*\{[^}]*min-width:\s*0/s);
    });

    it("reading-mini-player has no fixed width that would cause mobile overflow", () => {
      // Ensure no 'width: Xpx' (fixed pixel width) on the player card
      const playerCardBlock = css.match(/\.reading-mini-player\s*\{([^}]+)\}/)?.[1] ?? "";
      expect(playerCardBlock).not.toMatch(/\bwidth:\s*\d+px/);
    });
  });

  describe("CSS: Speed controls mobile layout", () => {
    it("speed buttons use grid-template-columns: repeat(3, 1fr) on mobile", () => {
      expect(css).toContain("grid-template-columns: repeat(3, 1fr)");
    });

    it("speed button has height >= 40px on mobile for touch targets", () => {
      // rp-speed-btn inside @media (max-width: 600px) should have height: 40px
      const mobileBlock = css.match(/@media\s*\(max-width:\s*600px\)\s*\{([\s\S]*)\}/)?.[1] ?? "";
      expect(mobileBlock).toMatch(/\.rp-speed-btn\s*\{[^}]*height:\s*40px/s);
    });
  });

  describe("CSS: Progress row", () => {
    it("rp-slider has min-width: 0 to prevent range overflow", () => {
      expect(css).toMatch(/\.rp-slider\s*\{[^}]*min-width:\s*0/s);
    });

    it("progress row uses grid with minmax(0, 1fr) on mobile", () => {
      const mobileBlock = css.match(/@media\s*\(max-width:\s*600px\)\s*\{([\s\S]*)\}/)?.[1] ?? "";
      expect(mobileBlock).toContain("minmax(0, 1fr)");
    });
  });

  describe("CSS: Play button can shrink on mobile", () => {
    it("rp-play-btn has min-width: 0 in mobile override", () => {
      const mobileBlock = css.match(/@media\s*\(max-width:\s*600px\)\s*\{([\s\S]*)\}/)?.[1] ?? "";
      expect(mobileBlock).toMatch(/\.rp-play-btn\s*\{[^}]*min-width:\s*0/s);
    });

    it("rp-play-btn has width: 100% on mobile", () => {
      const mobileBlock = css.match(/@media\s*\(max-width:\s*600px\)\s*\{([\s\S]*)\}/)?.[1] ?? "";
      expect(mobileBlock).toMatch(/\.rp-play-btn\s*\{[^}]*width:\s*100%/s);
    });
  });

  describe("CSS: Reading passage text wrapping", () => {
    it("reading-passage-area has overflow-wrap: break-word", () => {
      expect(css).toMatch(/\.reading-passage-area\s*\{[^}]*overflow-wrap:\s*break-word/s);
    });

    it("reading-passage-area has overflow-x: hidden", () => {
      expect(css).toMatch(/\.reading-passage-area\s*\{[^}]*overflow-x:\s*hidden/s);
    });

    it("reading-passage-area has white-space: normal (no forced nowrap)", () => {
      expect(css).toMatch(/\.reading-passage-area\s*\{[^}]*white-space:\s*normal/s);
    });
  });

  describe("CSS: Bottom nav safe area", () => {
    it("reading-page-container padding-bottom includes mobile-nav-height and safe-area-inset-bottom", () => {
      expect(css).toContain("var(--mobile-nav-height)");
      expect(css).toContain("env(safe-area-inset-bottom");
    });
  });

  describe("ReadingPlayer component: no problematic inline fixed widths", () => {
    it("main play button does not use minWidth: '120px' inline (uses CSS class instead)", () => {
      // The old hardcoded minWidth: "120px" should be gone
      expect(playerSrc).not.toContain('minWidth: "120px"');
    });

    it("speed buttons use rp-speed-btn CSS class", () => {
      expect(playerSrc).toContain('className="rp-speed-btn"');
    });

    it("controls row uses rp-controls-row CSS class", () => {
      expect(playerSrc).toContain('className="rp-controls-row"');
    });

    it("progress slider uses rp-slider CSS class", () => {
      expect(playerSrc).toContain('className="rp-slider"');
    });

    it("rp-btn-label exists to allow text hiding on mobile", () => {
      expect(playerSrc).toContain('rp-btn-label');
    });
  });

  describe("ReadingDetailPage: CSS classes applied", () => {
    it("page container includes reading-page-container class", () => {
      expect(pageSrc).toContain("reading-page-container");
    });

    it("main card includes reading-main-card class", () => {
      expect(pageSrc).toContain("reading-main-card");
    });

    it("passage area includes reading-passage-area class", () => {
      expect(pageSrc).toContain("reading-passage-area");
    });
  });
});
