import type { Language, ReadingSentence, ReviewAction, VocabularyItem } from "../types/api.js";

export function createLocalId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    return `local-${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
  }
  return `local-${Date.now()}`;
}

export function normalizeLocalTerm(value: string, language: Language): string {
  return language === "en"
    ? value.normalize("NFKC").trim().replace(/\s+/gu, " ").toLocaleLowerCase("en-US")
    : value.normalize("NFKC").replace(/\s+/gu, "").trim();
}

export function matchesLocalVocabularyIdentity(item: Pick<VocabularyItem, "language" | "term">, term: string, language: Language): boolean {
  return item.language === language && normalizeLocalTerm(item.term, language) === normalizeLocalTerm(term, language);
}

export interface ParsedQuickVocabularyDraft {
  term: string;
  meaningVi?: string;
  partOfSpeech?: string;
  synonyms?: string[];
}

export interface ParsedHighVolumeQuickVocabularyInput {
  drafts: ParsedQuickVocabularyDraft[];
  duplicateCount: number;
}

export const HIGH_VOLUME_MAX_QUICK_INPUT_LENGTH = 300_000;
export const HIGH_VOLUME_MAX_QUICK_TERMS = 3_000;

const QUICK_PART_OF_SPEECH = new Map<string, string>([
  ["n", "noun"], ["noun", "noun"],
  ["v", "verb"], ["verb", "verb"],
  ["adj", "adjective"], ["adjective", "adjective"],
  ["adv", "adverb"], ["adverb", "adverb"],
  ["prep", "preposition"], ["preposition", "preposition"],
  ["conj", "conjunction"], ["conjunction", "conjunction"],
  ["pron", "pronoun"], ["pronoun", "pronoun"],
  ["det", "determiner"], ["determiner", "determiner"],
  ["interj", "interjection"], ["interjection", "interjection"],
  ["phr v", "phrasal verb"], ["phrasal verb", "phrasal verb"],
]);

export function normalizeQuickPartOfSpeech(value: string): string {
  const display = value.normalize("NFKC").trim().replace(/\s+/gu, " ");
  return QUICK_PART_OF_SPEECH.get(display.toLocaleLowerCase("en-US")) ?? display;
}

function importIdentity(term: string, language: Language): string {
  // English identity is case-insensitive. Chinese deliberately preserves
  // internal spacing so import dedupe never collapses a potentially distinct
  // lexical form; persistence-level identity still protects actual saves.
  return language === "en"
    ? normalizeLocalTerm(term, language)
    : term.normalize("NFKC").trim();
}

function validateQuickDrafts(
  drafts: ParsedQuickVocabularyDraft[],
  language: Language,
  maxTerms: number,
): ParsedHighVolumeQuickVocabularyInput {
  const seen = new Set<string>();
  let duplicateCount = 0;
  const unique = drafts.flatMap((draft) => {
    const normalized = importIdentity(draft.term, language);
    if (!normalized || seen.has(normalized)) {
      duplicateCount += 1;
      return [];
    }
    seen.add(normalized);
    return [draft];
  });
  if (unique.some((draft) => draft.term.length > 200)) throw new Error("Mỗi từ hoặc cụm từ không được vượt quá 200 ký tự.");
  if (unique.length > maxTerms) throw new Error(`Mỗi lần Quick Add hỗ trợ tối đa ${maxTerms.toLocaleString("vi-VN")} từ hoặc cụm từ.`);
  return { drafts: unique, duplicateCount };
}

function hasStructuredQuickSyntax(line: string): boolean {
  return /[:=]/u.test(line) || /\([^()]+\)\s*$/u.test(line);
}

function looksLikeQuickLexicalHeader(line: string, language: Language): boolean {
  const lexicalPart = line
    .split(":", 1)[0]!
    .split("=", 1)[0]!
    .replace(/\([^()]+\)\s*$/u, "")
    .trim();
  if (!lexicalPart || /[.!?。！？;,]$/u.test(lexicalPart)) return false;
  return language === "zh"
    ? /\p{Script=Han}/u.test(lexicalPart)
    : /^[A-Za-z][A-Za-z'’\- ]*$/u.test(lexicalPart);
}

function normalizeQuickSynonyms(values: string[]): string[] {
  const seen = new Set<string>();
  return values.flatMap((value) => {
    const display = value.normalize("NFKC").trim().replace(/\s+/gu, " ");
    const key = display.toLocaleLowerCase("en-US");
    if (!display || seen.has(key)) return [];
    seen.add(key);
    return [display];
  });
}

function parseStructuredHeader(line: string): ParsedQuickVocabularyDraft & { structured: boolean } {
  const colonIndex = line.indexOf(":");
  let header = (colonIndex >= 0 ? line.slice(0, colonIndex) : line).trim();
  const meaningVi = colonIndex >= 0 ? line.slice(colonIndex + 1).trim() : "";
  const posMatch = header.match(/\(([^()]+)\)\s*$/u);
  const partOfSpeech = posMatch ? normalizeQuickPartOfSpeech(posMatch[1]!) : "";
  if (posMatch) header = header.slice(0, posMatch.index).trim();
  const equalsIndex = header.indexOf("=");
  const term = (equalsIndex >= 0 ? header.slice(0, equalsIndex) : header).trim();
  const synonyms = equalsIndex >= 0
    ? normalizeQuickSynonyms(header.slice(equalsIndex + 1).split(","))
    : [];
  return {
    term,
    ...(meaningVi ? { meaningVi } : {}),
    ...(partOfSpeech ? { partOfSpeech } : {}),
    ...(synonyms.length ? { synonyms } : {}),
    structured: colonIndex >= 0 || Boolean(posMatch) || equalsIndex >= 0,
  };
}

function parseQuickVocabularyInput(
  input: string,
  language: Language,
  maxInputLength: number,
  maxTerms: number,
): ParsedHighVolumeQuickVocabularyInput {
  if (!input.trim()) throw new Error("Vui lòng nhập ít nhất một từ vựng.");
  if (input.length > maxInputLength) throw new Error(`Nội dung Quick Add không được vượt quá ${maxInputLength.toLocaleString("vi-VN")} ký tự.`);
  const normalizedInput = input.replace(/\r\n?/gu, "\n");
  const nonEmptyLines = normalizedInput.split("\n").map((line) => line.trim()).filter(Boolean);
  const structuredMode = nonEmptyLines.some(hasStructuredQuickSyntax);

  if (!structuredMode) {
    const drafts = normalizedInput
      .split(/[,;\n]+/u)
      .map((term) => term.trim())
      .filter(Boolean)
      .map((term) => ({ term }));
    return validateQuickDrafts(drafts, language, maxTerms);
  }

  const lines = normalizedInput.split("\n");
  const drafts: ParsedQuickVocabularyDraft[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!.trim();
    if (!line) continue;
    const parsed = parseStructuredHeader(line);
    if (!parsed.term) continue;

    if (parsed.structured && !parsed.meaningVi) {
      const nextLine = lines[index + 1]?.trim() ?? "";
      if (nextLine && !looksLikeQuickLexicalHeader(nextLine, language)) {
        parsed.meaningVi = nextLine;
        index += 1;
      }
    }
    const { structured: _structured, ...draft } = parsed;
    drafts.push(draft);
  }
  return validateQuickDrafts(drafts, language, maxTerms);
}

export function parseStructuredQuickVocabularyInput(input: string, language: Language): ParsedQuickVocabularyDraft[] {
  return parseQuickVocabularyInput(input, language, 10_000, 100).drafts;
}

export function parseHighVolumeQuickVocabularyInput(input: string, language: Language): ParsedHighVolumeQuickVocabularyInput {
  return parseQuickVocabularyInput(input, language, HIGH_VOLUME_MAX_QUICK_INPUT_LENGTH, HIGH_VOLUME_MAX_QUICK_TERMS);
}

export function parseLocalQuickInput(input: string, language: Language): string[] {
  return parseStructuredQuickVocabularyInput(input, language).map((draft) => draft.term);
}

export function splitLocalSentences(content: string, language: Language): string[] {
  const normalized = content.replace(/\r\n/gu, "\n").replace(/[ \t]+/gu, " ").trim();
  if (!normalized) return [];
  const pattern = language === "zh" ? /[^。！？!?；;\n]+[。！？!?；;]?/gu : /[^.!?\n]+(?:[.!?]+["'”’)]*)?|[^.!?\n]+$/gu;
  const protectedText = language === "en"
    ? normalized.replace(/\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|etc)\./giu, (value) => `${value.slice(0, -1)}\uE000`)
    : normalized;
  return (protectedText.match(pattern) ?? [protectedText]).map((sentence) => sentence.replaceAll("\uE000", ".").trim()).filter(Boolean);
}

export function tokenizeLocal(text: string, language: Language): ReadingSentence["tokens"] {
  if (language === "en") {
    return (text.match(/[\p{L}\p{M}]+(?:['’-][\p{L}\p{M}]+)*|\s+|[^\p{L}\p{M}\s]/gu) ?? []).map((part) => ({
      text: part,
      type: /^\s+$/u.test(part) ? "space" : /^\p{L}/u.test(part) ? "word" : "punctuation",
      clickable: /^\p{L}/u.test(part),
    }));
  }
  return (text.match(/[\p{Script=Han}]{1,2}|[A-Za-z0-9]+|\s+|./gu) ?? []).map((part) => ({
    text: part,
    type: /^\s+$/u.test(part) ? "space" : /^[\p{Script=Han}A-Za-z0-9]/u.test(part) ? "word" : "punctuation",
    clickable: /^[\p{Script=Han}A-Za-z0-9]/u.test(part),
  }));
}

export function localWordCount(text: string, language: Language): number {
  return tokenizeLocal(text, language).filter((token) => token.type === "word").length;
}

export function reviewLocalVocabulary(item: VocabularyItem, action: ReviewAction, reviewedAt = new Date()): VocabularyItem {
  const progress = { ...item.progress };
  if (action === "AGAIN") {
    progress.repetitions = 0;
    progress.intervalDays = 1;
    progress.ease = Math.max(1.3, progress.ease - 0.2);
    progress.incorrectCount += 1;
  } else {
    progress.repetitions += 1;
    progress.correctCount += 1;
    if (action === "HARD") {
      progress.ease = Math.max(1.3, progress.ease - 0.15);
      progress.intervalDays = Math.max(1, Math.round((progress.intervalDays || 1) * 1.2));
    } else if (action === "GOOD") {
      progress.intervalDays = progress.repetitions === 1 ? 1 : progress.repetitions === 2 ? 3 : Math.max(4, Math.round(progress.intervalDays * progress.ease));
    } else {
      progress.ease = Math.min(3, progress.ease + 0.15);
      progress.intervalDays = progress.repetitions === 1 ? 4 : Math.max(7, Math.round((progress.intervalDays || 3) * progress.ease * 1.3));
    }
  }
  progress.status = progress.repetitions >= 8 && progress.intervalDays >= 60 ? "MASTERED" : progress.repetitions >= 2 ? "REVIEW" : "LEARNING";
  const next = new Date(reviewedAt);
  next.setUTCDate(next.getUTCDate() + progress.intervalDays);
  progress.lastReviewedAt = reviewedAt.toISOString();
  progress.nextReviewAt = next.toISOString();
  return { ...item, progress, updatedAt: reviewedAt.toISOString() };
}

export function classifyLocalSelection(text: string, language: Language): "word" | "phrase" | "sentence" {
  const trimmed = text.trim();
  if (/[.!?。！？]$/u.test(trimmed)) return "sentence";
  const count = language === "en"
    ? trimmed.match(/[\p{L}\p{M}]+/gu)?.length ?? 0
    : tokenizeLocal(trimmed, "zh").filter((token) => token.type === "word").length;
  return count <= 1 ? "word" : count <= 8 ? "phrase" : "sentence";
}

export { isLikelyIpa, needsExistingVocabularyRepair } from "../../shared/schemas.js";
