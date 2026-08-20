import { z } from "zod";

export const languageSchema = z.enum(["en", "zh"]);
export type Language = z.infer<typeof languageSchema>;
export const vocabularyStatusSchema = z.enum(["NEW", "LEARNING", "REVIEW", "MASTERED"]);
export type VocabularyStatus = z.infer<typeof vocabularyStatusSchema>;
export const reviewActionSchema = z.enum(["AGAIN", "HARD", "GOOD", "EASY"]);
export type ReviewAction = z.infer<typeof reviewActionSchema>;

export const registerSchema = z.object({ name: z.string().trim().min(1).max(100), email: z.string().trim().email().max(254), password: z.string().min(8).max(128) });
export const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1).max(128) });

const metadataSchema = z.record(z.string(), z.unknown()).default({});
export const vocabularyInputSchema = z.object({
  language: languageSchema,
  term: z.string().trim().min(1).max(200),
  pronunciation: z.string().trim().max(200).nullable().optional(),
  meaningVi: z.string().trim().min(1).max(1000),
  partOfSpeech: z.string().trim().max(50).nullable().optional(),
  example: z.string().trim().max(2000).nullable().optional(),
  exampleTranslation: z.string().trim().max(2000).nullable().optional(),
  topic: z.string().trim().max(100).nullable().optional(),
  level: z.string().trim().max(30).nullable().optional(),
  note: z.string().trim().max(2000).nullable().optional(),
  source: z.enum(["MANUAL", "READING_SELECTION", "IMPORT"]).default("MANUAL"),
  sourceReadingId: z.string().uuid().nullable().optional(),
  audioUrl: z.string().url().nullable().optional(),
  metadata: metadataSchema
});
export const vocabularyPatchSchema = vocabularyInputSchema.partial().omit({ language: true, term: true });

export const vocabularySenseSchema = z.object({
  partOfSpeech: z.string().trim().max(50).optional(),
  meaningVi: z.string().trim().max(1000).optional(),
  synonyms: z.array(z.string().trim().min(1).max(200)).max(30).default([])
});

export const bulkPreviewSchema = z.object({
  language: languageSchema,
  input: z.string().min(1).max(10_000)
});

export function isLikelyIpa(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (!/^\/([^\/]+)\/$/u.test(trimmed) && !/^\[([^\]]+)\]$/u.test(trimmed)) {
    return false;
  }
  const content = trimmed.slice(1, -1).trim();
  if (!content) return false;
  if (/^[a-zA-Z]+$/u.test(content)) return false;
  if (/^[A-Z]{2,}(-[A-Za-z]+)+$/u.test(content) || /^[A-Za-z]+(-[A-Z]{2,})+$/u.test(content)) {
    return false;
  }
  return true;
}

export function needsExistingVocabularyRepair(item: {
  language: Language;
  pronunciation?: string | null;
  meaningVi?: string | null;
  partOfSpeech?: string | null;
  metadata?: Record<string, unknown>;
}): boolean {
  if (item.language === "en") {
    const meta = (item.metadata || {}) as Record<string, unknown>;
    const hasValidIpa = isLikelyIpa(meta.ipa) || isLikelyIpa(item.pronunciation);
    const hasPos = Boolean(item.partOfSpeech?.trim());
    const hasMeaning = Boolean(item.meaningVi?.trim());
    return !hasValidIpa || !hasPos || !hasMeaning;
  }
  if (item.language === "zh") {
    const meta = (item.metadata || {}) as Record<string, unknown>;
    const hasPinyin = Boolean(item.pronunciation?.trim() || (typeof meta.pinyin === "string" && meta.pinyin.trim()));
    const hasMeaning = Boolean(item.meaningVi?.trim());
    const hasPos = Boolean(item.partOfSpeech?.trim());
    return !hasPinyin || !hasMeaning || !hasPos;
  }
  return false;
}

export const bulkVocabularyItemSchema = z.object({
  existingId: z.string().optional(),
  term: z.string().trim().min(1).max(200),
  meaningVi: z.string().trim().min(1).max(1000),
  pronunciation: z.string().trim().max(200).nullable().optional(),
  ipa: z.string().trim().max(200).optional(),
  pinyin: z.string().trim().max(200).optional(),
  partOfSpeech: z.string().trim().max(50).nullable().optional(),
  synonyms: z.array(z.string().trim().min(1).max(200)).max(30).default([]),
  example: z.string().trim().max(2000).nullable().optional(),
  exampleTranslation: z.string().trim().max(2000).nullable().optional(),
  topic: z.string().trim().max(100).nullable().optional(),
  cefr: z.string().trim().max(30).optional(),
  toeicLevel: z.string().trim().max(30).optional(),
  simplified: z.string().trim().max(200).optional(),
  traditional: z.string().trim().max(200).optional(),
  hskLevel: z.number().int().min(1).max(9).optional(),
  toneData: z.array(z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)])).max(200).optional(),
  senses: z.array(vocabularySenseSchema).max(20).optional()
});

export const bulkVocabularySchema = z.object({
  language: languageSchema,
  items: z.array(z.unknown()).min(1).max(100)
});

export type BulkVocabularyItem = z.infer<typeof bulkVocabularyItemSchema>;
const queryBooleanSchema = z.preprocess((value) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return value;
}, z.boolean());
export const vocabularyQuerySchema = z.object({
  language: languageSchema.optional(), topic: z.string().optional(), status: vocabularyStatusSchema.optional(),
  due: queryBooleanSchema.optional(), random: queryBooleanSchema.optional(), limit: z.coerce.number().int().min(1).max(100).default(50)
});

export const readingInputSchema = z.object({
  language: languageSchema, title: z.string().trim().min(1).max(200), content: z.string().trim().min(1).max(50_000),
  translationVi: z.string().trim().max(50_000).nullable().optional(), topic: z.string().trim().max(100).nullable().optional(), level: z.string().trim().max(30).nullable().optional()
});
export const readingPatchSchema = readingInputSchema.partial();
export const vocabularyContextSchema = z.object({
  sentence: z.string().trim().min(1).max(600),
  previousSentence: z.string().trim().max(600).optional(),
  nextSentence: z.string().trim().max(600).optional(),
});
export type VocabularyContext = z.infer<typeof vocabularyContextSchema>;

export const enrichContextSchema = z.object({
  term: z.string().trim().min(1).max(200),
  language: languageSchema,
  sentence: z.string().trim().min(1).max(600),
  previousSentence: z.string().trim().max(600).optional(),
  nextSentence: z.string().trim().max(600).optional(),
});
export type EnrichContextInput = z.infer<typeof enrichContextSchema>;

export const translationSelectionSchema = z.object({
  text: z.string().trim().min(1).max(1000), sourceLanguage: languageSchema, targetLanguage: z.literal("vi"), readingId: z.string().uuid().optional()
});
export const saveSelectionSchema = translationSelectionSchema.extend({
  meaningVi: z.string().trim().max(1000).optional().default(""),
  pronunciation: z.string().trim().max(200).optional(),
  partOfSpeech: z.string().trim().max(50).optional(),
  context: vocabularyContextSchema.optional()
});
export const ttsRequestSchema = z.object({
  text: z.string().trim().min(1).max(5000), language: languageSchema, voice: z.string().max(100).optional(), speed: z.union([z.literal(0.75), z.literal(1), z.literal(1.25)]).default(1)
});

export const pronunciationRequestSchema = z.object({
  expectedText: z.string().trim().min(1).max(5000), language: languageSchema, audioBase64: z.string().min(1).max(15_000_000),
  audioMimeType: z.string().regex(/^audio\/(webm|ogg|mp4|mpeg|wav)(;.*)?$/i).max(100).optional(),
  readingId: z.string().uuid().optional(), sentenceId: z.string().uuid().optional()
}).refine((input) => !input.sentenceId || Boolean(input.readingId), { message: "readingId is required when sentenceId is provided", path: ["readingId"] })
  .refine((input) => /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(input.audioBase64), { message: "audioBase64 must be valid base64", path: ["audioBase64"] });

export const englishQuizTypes = ["TERM_TO_MEANING", "MEANING_TO_TERM", "FILL_BLANK", "LISTENING", "CONTEXT", "READING_COMPREHENSION"] as const;
export const chineseQuizTypes = ["HANZI_TO_MEANING", "MEANING_TO_HANZI", "HANZI_TO_PINYIN", "PINYIN_TO_HANZI", "TONE_SELECTION", "LISTENING", "CONTEXT"] as const;
export const quizStartSchema = z.object({ language: languageSchema, type: z.enum([...englishQuizTypes, ...chineseQuizTypes]), count: z.number().int().min(1).max(50).default(10) });
export const quizAnswerSchema = z.object({ answer: z.string().max(1000) });
export const gameStartSchema = z.object({ language: languageSchema, type: z.enum(["MATCHING", "MEMORY", "LISTENING_CHOICE", "FILL_WORD", "SPEED_CHALLENGE"]), count: z.number().int().min(2).max(30).default(10), timerSeconds: z.number().int().min(10).max(600).optional() });
export const gameAnswerSchema = z.object({ itemId: z.string(), answer: z.string().max(1000) });

export interface AuthUser { id: string; name: string; email: string; avatar: string | null }
export interface AsyncResource<T> { state: "success" | "empty"; data: T }
