import type {
  Language as SharedLanguage,
  ReviewAction as SharedReviewAction,
  VocabularyStatus as SharedVocabularyStatus,
  CEFRLevel as SharedCEFRLevel,
} from "../../shared/schemas.js";
import type { LexicalStatus, VocabularyCollection as SharedVocabularyCollection } from "../../shared/vocabularyIntelligence.js";

export type Language = SharedLanguage;
export type TargetLanguage = "vi";
export type VocabularyStatus = SharedVocabularyStatus;
export type CEFRLevel = SharedCEFRLevel;
export type { LexicalStatus };
export type VocabularyCollection = SharedVocabularyCollection;
export type ReviewAction = SharedReviewAction;
export type SelectionType = "word" | "phrase" | "sentence";
export type ProviderAvailability = "AVAILABLE" | "NOT_CONFIGURED";
export type PronunciationWordStatus = "good" | "warning" | "poor";

export interface ProviderStatus {
  configured: boolean;
  provider: string | null;
}

export interface PronunciationAvailability extends ProviderStatus {
  status: ProviderAvailability;
  assessmentAvailable: boolean;
  mode?: "LOCAL" | "SERVER";
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: { issues?: Array<{ path?: string[]; message: string }> };
}

export interface ApiResponse<T> {
  state: "success" | "empty";
  data: T;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface UserSettings {
  nativeLanguage: "vi";
  currentLearningLanguage: Language;
  englishEnabled: boolean;
  chineseEnabled: boolean;
  dailyGoal: number;
  audioSpeed: 0.75 | 1 | 1.25;
  autoPlayAudio: boolean;
  audioEngine?: "LOCAL" | "AUTO" | "CLOUD" | "BROWSER";
  preferredCloudVoiceEn?: string;
  preferredCloudVoiceZh?: string;
  preferredVoiceEn?: string;
  preferredVoiceZh?: string;
  showTranslation: boolean;
  showPinyin: boolean;
  showHanzi: boolean;
  showVietnamese: boolean;
  themePreference: "light" | "dark" | "system";
  englishNewWordsTarget: number;
  chineseNewWordsTarget: number;
  reviewTarget: number;
  quizTarget: number;
  shadowingTarget: number;
}

export interface EnglishMetadata {
  ipa?: string;
  cefr?: string;
  toeicLevel?: string;
  synonyms?: string[];
}

export interface ChineseMetadata {
  simplified?: string;
  traditional?: string;
  pinyin?: string;
  toneData?: Array<1 | 2 | 3 | 4 | 0>;
  tone?: 1 | 2 | 3 | 4 | "neutral";
  hskLevel?: number;
  strokeCount?: number;
  sentencePinyin?: string;
}

export interface VocabularyItem {
  id: string;
  userId: string;
  language: Language;
  term: string;
  normalizedTerm: string;
  pronunciation: string | null;
  meaningVi: string;
  partOfSpeech: string | null;
  example: string | null;
  exampleTranslation: string | null;
  topic: string | null;
  topics?: string[];
  collectionIds?: string[];
  level: string | null;
  note: string | null;
  source: "MANUAL" | "READING_SELECTION" | "IMPORT";
  sourceReadingId: string | null;
  audioUrl: string | null;
  audioAvailable: boolean;
  favorite: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  progress: {
    status: VocabularyStatus;
    ease: number;
    intervalDays: number;
    repetitions: number;
    nextReviewAt: string | null;
    lastReviewedAt: string | null;
    correctCount: number;
    incorrectCount: number;
  };
}

export interface VocabularyInput {
  language: Language;
  term: string;
  pronunciation?: string | null;
  meaningVi: string;
  partOfSpeech?: string | null;
  example?: string | null;
  exampleTranslation?: string | null;
  topic?: string | null;
  topics?: string[];
  collectionIds?: string[];
  level?: string | null;
  note?: string | null;
  source?: "MANUAL" | "READING_SELECTION" | "IMPORT";
  sourceReadingId?: string | null;
  audioUrl?: string | null;
  metadata?: Record<string, any>;
}

export interface CreateVocabularyResult {
  item: VocabularyItem;
  duplicate: boolean;
}

export interface VocabularySenseSuggestion {
  partOfSpeech?: string;
  meaningVi?: string;
  ipa?: string;
  pronunciation?: string;
  pinyin?: string;
  synonyms?: string[];
  example?: string;
  exampleTranslation?: string;
}

export interface BulkVocabularySuggestion {
  existingId?: string;
  needsRepair?: boolean;
  hasUpdate?: boolean;
  pronunciation: string | null;
  ipa: string | null;
  pinyin: string | null;
  simplified: string | null;
  traditional: string | null;
  partOfSpeech: string | null;
  meaningVi: string | null;
  synonyms: string[];
  example: string | null;
  exampleTranslation: string | null;
  topic: string | null;
  cefr: string | null;
  lexicalStatus?: LexicalStatus;
  lexicalConfidence?: number;
  lexicalReason?: string;
  suggestedTopics?: string[];
  toeicLevel: string | null;
  hskLevel: number | null;
  toneData: Array<0 | 1 | 2 | 3 | 4>;
  senses: VocabularySenseSuggestion[];
}

export interface BulkVocabularyPreview {
  enrichment: ProviderStatus;
  items: Array<{
    term: string;
    normalizedTerm: string;
    duplicate: boolean;
    status: "READY" | "NEEDS_ENRICHMENT" | "INVALID" | "EXISTS";
    suggestion: BulkVocabularySuggestion;
    error?: { code: "SERVICE_NOT_CONFIGURED" | "EXTERNAL_SERVICE_ERROR"; message: string };
  }>;
}

export interface BulkVocabularyInputItem {
  existingId?: string;
  repairExisting?: boolean;
  term: string;
  meaningVi: string;
  pronunciation?: string | null;
  ipa?: string;
  pinyin?: string;
  partOfSpeech?: string | null;
  synonyms?: string[];
  example?: string | null;
  exampleTranslation?: string | null;
  topic?: string | null;
  cefr?: string;
  topics?: string[];
  collectionIds?: string[];
  toeicLevel?: string;
  simplified?: string;
  traditional?: string;
  hskLevel?: number;
  toneData?: Array<0 | 1 | 2 | 3 | 4>;
  senses?: VocabularySenseSuggestion[];
}

export interface BulkVocabularyCreateResult {
  mode: "PARTIAL";
  created: VocabularyItem[];
  existing: VocabularyItem[];
  failed: Array<{ index: number; term: string | null; code: string; message: string; details?: unknown }>;
}

export interface Token {
  text: string;
  type: "word" | "punctuation" | "space";
  clickable: boolean;
}

export interface ReadingSentence {
  id: string;
  passageId: string;
  order: number;
  text: string;
  translationVi: string | null;
  audioUrl: string | null;
  tokens: Token[];
}

export interface ReadingPassageSummary {
  id: string;
  language: Language;
  title: string;
  translationVi: string | null;
  topic: string | null;
  level: string | null;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingPassage extends ReadingPassageSummary {
  userId: string;
  content: string;
  sentences: ReadingSentence[];
}

export interface TranslationResult {
  passageId?: string;
  original: string;
  translation: string;
  sourceLanguage: Language;
  targetLanguage: "vi";
  type?: SelectionType;
}

export interface TtsResult {
  status: "READY";
  mode: "audio";
  audioUrl: string;
  durationMs?: number;
  provider: string;
}

export type ReadingPlaybackStatus = "idle" | "playing" | "paused" | "completed";

export interface SpeechSynthesisPlaybackState {
  mode: "speech-synthesis";
  status: ReadingPlaybackStatus;
  currentSentenceIndex: number;
  currentSentenceId: string | null;
  totalSentences: number;
  speed: 0.75 | 1 | 1.25;
  loading?: boolean;
  engine?: "local" | "cloud" | "browser";
}

export interface AudioPlaybackState {
  mode: "audio";
  status: ReadingPlaybackStatus;
  audioUrl: string;
  currentTimeMs: number;
  durationMs: number;
  speed: 0.75 | 1 | 1.25;
  currentSentenceIndex?: number;
  currentSentenceId?: string | null;
  totalSentences?: number;
}

export type ReadingPlaybackState = SpeechSynthesisPlaybackState | AudioPlaybackState;

export interface PronunciationWord {
  word: string;
  score: number;
  status: "good" | "warning" | "poor";
}

export interface PronunciationResult {
  attemptId: string;
  createdAt: string;
  status: "READY";
  overallScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  rhythmScore?: number;
  toneAccuracy?: number;
  /** LOCAL mode only: ASR transcript and deterministic coaching metadata. */
  expectedText?: string;
  recognizedText?: string;
  contentMatchScore?: number;
  durationSeconds?: number;
  wordsPerMinute?: number;
  coaching?: string[];
  words: PronunciationWord[];
}

export interface WeakestWord {
  word: string;
  averageScore: number;
  attempts: number;
}

export interface RecentPronunciationAttempt {
  id: string;
  language: Language;
  readingId: string | null;
  sentenceId: string | null;
  text: string;
  score: number;
  pronunciationScore: number;
  fluencyScore: number;
  rhythmScore: number | null;
  toneAccuracy: number | null;
  createdAt: string;
}

export interface ShadowingSession {
  id: string;
  user_id: string;
  reading_id: string;
  language: Language;
  current_sentence: number;
  completed_count: number;
  score_total: number;
  average_score: number;
  status: "ACTIVE" | "COMPLETED";
  created_at: string;
  completed_at: string | null;
  currentSentenceData: {
    id: string;
    order: number;
    text: string;
    translationVi: string | null;
    audioUrl: string | null;
  } | null;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  audioText?: string;
  options?: string[];
  type: string;
  vocabularyId?: string;
  contextText?: string;
  instruction?: string;
  answerMode: "MULTIPLE_CHOICE" | "TEXT" | "AUDIO_MULTIPLE_CHOICE";
}

export interface QuizSession {
  id: string;
  language: Language;
  type: string;
  totalQuestions: number;
  currentIndex: number;
  correct: number;
  incorrect: number;
  score: number;
  status: "ACTIVE" | "COMPLETED";
  startedAt: string;
  completedAt: string | null;
  currentQuestion: QuizQuestion | null;
}

export interface QuizAnswerResult {
  correct: boolean;
  expectedAnswer: string;
  feedback?: {
    term: string;
    meaningVi: string;
    completedSentence?: string;
  };
  session: QuizSession;
}

export interface GameItem {
  id: string;
  vocabularyId: string;
  prompt: string;
  audioText?: string;
  choices?: string[];
  hint?: string;
  revealText?: string;
  answer?: string;
  answered: boolean;
}

export interface GameSession {
  id: string;
  language: Language;
  type: string;
  score: number;
  timerSeconds: number | null;
  status: "ACTIVE" | "COMPLETED";
  startedAt: string;
  completedAt: string | null;
  currentItem: GameItem | null;
  completedCount: number;
}

export interface GameAnswerResult {
  correct: boolean;
  expectedAnswer: string;
  session: GameSession;
}

export interface LanguageProgress {
  totalWords: number;
  mastered: number;
  learning: number;
  new: number;
  dueToday: number;
  quizAccuracy: number;
  pronunciationAverage: number;
  shadowingMinutes: number;
  readingCompleted: number;
  toneAccuracy?: number;
}

export interface Dashboard {
  languages: {
    en: LanguageProgress;
    zh: LanguageProgress;
  };
  global: {
    streak: number;
    todayGoal: number;
    todayCompleted: number;
    totalStudyTimeSeconds: number;
  };
  cefr?: import("../../shared/vocabularyIntelligence.js").CefrStatistics;
}

export interface TodayPlan {
  date: string;
  english: {
    newWords: { target: number; available: number };
    dueReviews: { target: number; available: number };
    quiz: { target: number };
    shadowing: { targetMinutes: number };
  };
  chinese: {
    newWords: { target: number; available: number };
    dueReviews: { target: number; available: number };
    quiz: { target: number };
    shadowing: { targetMinutes: number };
    pinyin: { target: number };
  };
}

export interface ServiceHealth {
  status: string;
  service: string;
  providers: {
    translation: boolean;
    tts: boolean;
    pronunciation: boolean;
    vocabularyEnrichment: boolean;
  };
}
