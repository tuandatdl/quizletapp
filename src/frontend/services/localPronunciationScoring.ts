import type { PronunciationResult, PronunciationWord } from "../types/api.js";

export const LOCAL_PRONUNCIATION_MODEL_ID = "onnx-community/whisper-tiny.en";
export const LOCAL_PRONUNCIATION_MODEL_REVISION = "2575352d61be1bf7225cf8f8b268a4678025fc58";
export const LOCAL_PRONUNCIATION_MODEL_VERSION = "whisper-tiny-en-q4-2026-08";
// q4 merged decoder (~86.7 MB), q4 encoder (~9 MB), plus tokenizer/config files.
export const LOCAL_PRONUNCIATION_MODEL_DOWNLOAD_BYTES = 101_000_000;

export type LocalPronunciationWord = PronunciationWord;

export interface LocalPronunciationAnalysis extends PronunciationResult {
  recognizedText: string;
  expectedText: string;
  contentMatchScore: number;
  durationSeconds: number;
  wordsPerMinute: number;
  coaching: string[];
}

type AlignmentOp = "match" | "substitution" | "missing" | "extra";

interface AlignmentStep {
  operation: AlignmentOp;
  expected?: string;
  recognized?: string;
}

export function normalizePronunciationText(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}'\s]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

export function tokenizePronunciationText(value: string): string[] {
  const normalized = normalizePronunciationText(value);
  return normalized ? normalized.split(" ") : [];
}

function boundedScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(Number.isFinite(value) ? value : 0)));
}

/** A deterministic Levenshtein backtrace. Expected words are emitted once only. */
export function alignPronunciationWords(expectedText: string, recognizedText: string): {
  words: LocalPronunciationWord[];
  operations: AlignmentStep[];
  distance: number;
  expectedCount: number;
  recognizedCount: number;
} {
  const expected = tokenizePronunciationText(expectedText);
  const recognized = tokenizePronunciationText(recognizedText);
  const matrix = Array.from({ length: expected.length + 1 }, (_, row) =>
    Array.from({ length: recognized.length + 1 }, (_, column) => (row === 0 ? column : column === 0 ? row : 0)),
  );

  for (let row = 1; row <= expected.length; row += 1) {
    for (let column = 1; column <= recognized.length; column += 1) {
      const equal = expected[row - 1] === recognized[column - 1];
      matrix[row]![column] = equal
        ? matrix[row - 1]![column - 1]!
        : 1 + Math.min(matrix[row - 1]![column]!, matrix[row]![column - 1]!, matrix[row - 1]![column - 1]!);
    }
  }

  const reversed: AlignmentStep[] = [];
  let row = expected.length;
  let column = recognized.length;
  while (row > 0 || column > 0) {
    if (row > 0 && column > 0 && expected[row - 1] === recognized[column - 1]) {
      reversed.push({ operation: "match", expected: expected[row - 1], recognized: recognized[column - 1] });
      row -= 1;
      column -= 1;
      continue;
    }
    const current = matrix[row]![column]!;
    if (row > 0 && column > 0 && current === matrix[row - 1]![column - 1]! + 1) {
      reversed.push({ operation: "substitution", expected: expected[row - 1], recognized: recognized[column - 1] });
      row -= 1;
      column -= 1;
    } else if (row > 0 && current === matrix[row - 1]![column]! + 1) {
      reversed.push({ operation: "missing", expected: expected[row - 1] });
      row -= 1;
    } else {
      reversed.push({ operation: "extra", recognized: recognized[column - 1] });
      column -= 1;
    }
  }

  const operations = reversed.reverse();
  const words = operations.flatMap((step): LocalPronunciationWord[] => {
    if (!step.expected) return [];
    if (step.operation === "match") return [{ word: step.expected, score: 100, status: "good" }];
    if (step.operation === "substitution") return [{ word: step.expected, score: 45, status: "warning" }];
    return [{ word: step.expected, score: 0, status: "poor" }];
  });

  return { words, operations, distance: matrix[expected.length]![recognized.length]!, expectedCount: expected.length, recognizedCount: recognized.length };
}

export function contentMatchScore(expectedText: string, recognizedText: string): number {
  const alignment = alignPronunciationWords(expectedText, recognizedText);
  const denominator = Math.max(alignment.expectedCount, alignment.recognizedCount, 1);
  return boundedScore((1 - alignment.distance / denominator) * 100);
}

export function fluencyScore(durationSeconds: number, expectedWordCount: number): { score: number; wordsPerMinute: number; coaching: string } {
  const seconds = Math.max(0.1, Number.isFinite(durationSeconds) ? durationSeconds : 0.1);
  const wordsPerMinute = expectedWordCount / seconds * 60;
  if (expectedWordCount === 0) return { score: 0, wordsPerMinute: 0, coaching: "Hãy nhập câu mẫu trước khi luyện đọc." };
  if (wordsPerMinute < 55) return { score: boundedScore(35 + wordsPerMinute / 55 * 40), wordsPerMinute, coaching: "Bạn đang đọc hơi chậm." };
  if (wordsPerMinute < 80) return { score: boundedScore(75 + (wordsPerMinute - 55) / 25 * 20), wordsPerMinute, coaching: "Bạn có thể thử đọc liền mạch hơn một chút." };
  if (wordsPerMinute <= 180) return { score: 100, wordsPerMinute, coaching: "Nhịp đọc khá ổn." };
  if (wordsPerMinute <= 240) return { score: boundedScore(100 - (wordsPerMinute - 180) / 60 * 45), wordsPerMinute, coaching: "Bạn đang đọc hơi nhanh." };
  return { score: 35, wordsPerMinute, coaching: "Bạn đang đọc quá nhanh; hãy chậm lại để phát âm rõ hơn." };
}

export function scoreLocalEnglishPronunciation(input: {
  expectedText: string;
  recognizedText: string;
  durationSeconds: number;
  id?: string;
  createdAt?: string;
}): LocalPronunciationAnalysis {
  const expectedText = input.expectedText.normalize("NFKC").trim();
  const recognizedText = input.recognizedText.normalize("NFKC").trim();
  const alignment = alignPronunciationWords(expectedText, recognizedText);
  const contentScore = contentMatchScore(expectedText, recognizedText);
  const fluency = fluencyScore(input.durationSeconds, alignment.expectedCount);
  const missingCount = alignment.words.filter((word) => word.status === "poor").length;
  const coaching = [
    fluency.coaching,
    ...(missingCount ? [`Bạn bỏ sót ${missingCount} từ trong câu mẫu.`] : []),
    ...(alignment.operations.some((step) => step.operation === "extra") ? ["Bản ghi có thêm từ so với câu mẫu."] : []),
  ];
  return {
    attemptId: input.id ?? crypto.randomUUID(),
    createdAt: input.createdAt ?? new Date().toISOString(),
    status: "READY",
    expectedText,
    recognizedText,
    contentMatchScore: contentScore,
    pronunciationScore: contentScore,
    fluencyScore: fluency.score,
    overallScore: boundedScore(contentScore * 0.7 + fluency.score * 0.3),
    durationSeconds: Math.max(0, Number.isFinite(input.durationSeconds) ? input.durationSeconds : 0),
    wordsPerMinute: Math.round(fluency.wordsPerMinute),
    coaching,
    words: alignment.words,
  };
}
