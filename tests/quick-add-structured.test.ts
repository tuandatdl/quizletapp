import { describe, expect, it } from "vitest";
import {
  normalizeQuickPartOfSpeech,
  parseStructuredQuickVocabularyInput,
} from "../src/frontend/static/localDomain.js";

describe("Structured Quick Add parser", () => {
  it("parses a two-line term, POS, and comma-containing Vietnamese meaning", () => {
    expect(parseStructuredQuickVocabularyInput("additionally (adv)\nthêm vào đó, ngoài ra.", "en")).toEqual([
      { term: "additionally", partOfSpeech: "adverb", meaningVi: "thêm vào đó, ngoài ra." },
    ]);
  });

  it("extracts synonyms from the lexical header instead of retaining them in the term", () => {
    expect(parseStructuredQuickVocabularyInput("abundantly = plentifully (adv)\nmột cách dồi dào.", "en")).toEqual([
      { term: "abundantly", partOfSpeech: "adverb", synonyms: ["plentifully"], meaningVi: "một cách dồi dào." },
    ]);
  });

  it("parses an inline term and meaning", () => {
    expect(parseStructuredQuickVocabularyInput("barely: vừa đủ.", "en")).toEqual([
      { term: "barely", meaningVi: "vừa đủ." },
    ]);
  });

  it("parses inline POS and meaning", () => {
    expect(parseStructuredQuickVocabularyInput("barely (adv): vừa đủ.", "en")).toEqual([
      { term: "barely", partOfSpeech: "adverb", meaningVi: "vừa đủ." },
    ]);
  });

  it("preserves simple comma-list compatibility", () => {
    expect(parseStructuredQuickVocabularyInput("go, car, live, total", "en").map((draft) => draft.term)).toEqual([
      "go", "car", "live", "total",
    ]);
  });

  it("preserves newline-delimited phrases", () => {
    expect(parseStructuredQuickVocabularyInput("give up\nlook forward to", "en").map((draft) => draft.term)).toEqual([
      "give up", "look forward to",
    ]);
  });

  it("parses multiple structured entries separated by blank lines", () => {
    const input = "additionally (adv)\nthêm vào đó, ngoài ra.\n\nabundantly = plentifully (adv)\nmột cách dồi dào.\n\nbarely: vừa đủ.";
    expect(parseStructuredQuickVocabularyInput(input, "en")).toHaveLength(3);
    expect(parseStructuredQuickVocabularyInput(input, "en").map((draft) => draft.term)).toEqual(["additionally", "abundantly", "barely"]);
  });

  it("does not consume the next lexical header as a two-line meaning", () => {
    expect(parseStructuredQuickVocabularyInput("additionally (adv)\nbarely: vừa đủ.", "en")).toEqual([
      { term: "additionally", partOfSpeech: "adverb" },
      { term: "barely", meaningVi: "vừa đủ." },
    ]);
  });

  it("does not split commas or semicolons in a structured meaning", () => {
    expect(parseStructuredQuickVocabularyInput("barely: vừa đủ, chỉ vừa mới; gần như không.", "en")[0]?.meaningVi).toBe(
      "vừa đủ, chỉ vừa mới; gần như không.",
    );
  });

  it("parses comma-separated synonyms without creating extra entries", () => {
    expect(parseStructuredQuickVocabularyInput("abundantly = plentifully, richly, PLENTIFULLY (adv): một cách dồi dào.", "en")).toEqual([
      { term: "abundantly", partOfSpeech: "adverb", synonyms: ["plentifully", "richly"], meaningVi: "một cách dồi dào." },
    ]);
  });

  it("deduplicates terms using language-aware normalized identity", () => {
    expect(parseStructuredQuickVocabularyInput("Go\ngo\nGO", "en")).toEqual([{ term: "Go" }]);
  });

  it("normalizes supported POS abbreviations and safely preserves unknown values", () => {
    expect(["n", "v", "adj", "adv", "prep", "conj", "pron", "det", "interj", "phr v"].map(normalizeQuickPartOfSpeech)).toEqual([
      "noun", "verb", "adjective", "adverb", "preposition", "conjunction", "pronoun", "determiner", "interjection", "phrasal verb",
    ]);
    expect(normalizeQuickPartOfSpeech("modal auxiliary")).toBe("modal auxiliary");
  });
});
