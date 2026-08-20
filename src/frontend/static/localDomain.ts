import type { Language, ReadingSentence, ReviewAction, VocabularyItem } from "../types/api";

export function createLocalId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function normalizeLocalTerm(value: string, language: Language): string {
  return language === "en"
    ? value.normalize("NFKC").trim().replace(/\s+/gu, " ").toLocaleLowerCase("en-US")
    : value.normalize("NFKC").replace(/\s+/gu, "").trim();
}

export function parseLocalQuickInput(input: string, language: Language): string[] {
  if (!input.trim()) throw new Error("Vui lòng nhập ít nhất một từ vựng.");
  if (input.length > 10_000) throw new Error("Nội dung Quick Add không được vượt quá 10.000 ký tự.");
  const values = input.split(/[,;\r\n]+/u).map((term) => term.trim()).filter(Boolean);
  const seen = new Set<string>();
  const terms = values.filter((term) => {
    const normalized = normalizeLocalTerm(term, language);
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
  if (terms.some((term) => term.length > 200)) throw new Error("Mỗi từ hoặc cụm từ không được vượt quá 200 ký tự.");
  if (terms.length > 100) throw new Error("Mỗi lần Quick Add hỗ trợ tối đa 100 từ hoặc cụm từ.");
  return terms;
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
