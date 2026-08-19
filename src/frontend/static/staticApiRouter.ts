import type {
  BulkVocabularyCreateResult,
  BulkVocabularyInputItem,
  BulkVocabularyPreview,
  CreateVocabularyResult,
  Dashboard,
  GameAnswerResult,
  GameSession,
  Language,
  QuizAnswerResult,
  QuizQuestion,
  QuizSession,
  ReadingPassage,
  ReadingPassageSummary,
  ReviewAction,
  TodayPlan,
  UserSettings,
  VocabularyInput,
  VocabularyItem,
} from "../types/api";
import { getIndexedDbAdapter } from "../persistence/indexedDb";
import type { PersistenceAdapter, StoredRecord } from "../persistence/types";
import { LocalFirstSyncCoordinator } from "../persistence/syncEngine";
import { STATIC_LOCAL_USER } from "../runtime/runtime";
import { LanguageApiClient, type VocabularyEnrichment, type VocabularyContext } from "../services/languageApi";
import { buildGameItems, isGameType, publicGameItem, scoreGameAnswer, type GeneratedGameItem } from "../../shared/gameModes";
import {
  classifyLocalSelection,
  createLocalId,
  localWordCount,
  normalizeLocalTerm,
  parseLocalQuickInput,
  reviewLocalVocabulary,
  splitLocalSentences,
  tokenizeLocal,
} from "./localDomain";

const DEFAULT_SETTINGS: UserSettings = {
  nativeLanguage: "vi",
  currentLearningLanguage: "en",
  englishEnabled: true,
  chineseEnabled: true,
  dailyGoal: 20,
  audioSpeed: 1,
  autoPlayAudio: false,
  showTranslation: true,
  showPinyin: true,
  showHanzi: true,
  showVietnamese: true,
  themePreference: "system",
  englishNewWordsTarget: 5,
  chineseNewWordsTarget: 5,
  reviewTarget: 20,
  quizTarget: 10,
  shadowingTarget: 10,
};

interface ActivityRecord extends StoredRecord {
  date: string;
  readingMinutes: number;
  shadowingMinutes: number;
  studySeconds: number;
  quizzes: number;
}

interface StoredQuizSession extends StoredRecord {
  public: QuizSession;
  questions: Array<QuizQuestion & { answer: string }>;
}

interface StoredGameSession extends StoredRecord {
  public: GameSession;
  items: GeneratedGameItem[];
}

function asBody(options: RequestInit): any {
  if (!options.body) return {};
  if (typeof options.body !== "string") throw new Error("Static request body must be JSON.");
  try { return JSON.parse(options.body); }
  catch { throw new Error("Dữ liệu JSON không hợp lệ."); }
}

function asVocabularyRecord(item: VocabularyItem): VocabularyItem & StoredRecord {
  return item as VocabularyItem & StoredRecord;
}

function suggestion(enriched?: VocabularyEnrichment) {
  return {
    pronunciation: enriched?.pronunciation ?? null,
    ipa: enriched?.ipa ?? null,
    pinyin: enriched?.pinyin ?? null,
    simplified: enriched?.simplified ?? null,
    traditional: enriched?.traditional ?? null,
    partOfSpeech: enriched?.partOfSpeech ?? null,
    meaningVi: enriched?.meaningVi ?? null,
    synonyms: enriched?.synonyms ?? [],
    example: enriched?.example ?? null,
    exampleTranslation: enriched?.exampleTranslation ?? null,
    topic: null,
    cefr: null,
    toeicLevel: null,
    hskLevel: null,
    toneData: enriched?.toneData ?? [],
    senses: enriched?.senses ?? [],
  };
}

function suggestionFromExisting(item: VocabularyItem) {
  const meta = (item.metadata || {}) as Record<string, unknown>;
  const clean = (val: unknown) => (typeof val === "string" && val.trim() ? val.trim() : null);
  return {
    pronunciation: clean(item.pronunciation) ?? clean(meta.pinyin) ?? clean(meta.ipa) ?? null,
    ipa: clean(meta.ipa) ?? (item.language === "en" ? clean(item.pronunciation) : null),
    pinyin: clean(meta.pinyin) ?? (item.language === "zh" ? clean(item.pronunciation) : null),
    simplified: clean(meta.simplified) ?? (item.language === "zh" ? clean(item.term) : null),
    traditional: clean(meta.traditional) ?? null,
    partOfSpeech: clean(item.partOfSpeech),
    meaningVi: clean(item.meaningVi),
    synonyms: Array.isArray(meta.synonyms) ? (meta.synonyms as string[]) : [],
    example: clean(item.example),
    exampleTranslation: clean(item.exampleTranslation),
    topic: clean(item.topic),
    cefr: clean(meta.cefr) ?? (item.language === "en" && item.level && !item.level.startsWith("HSK") ? clean(item.level) : null),
    toeicLevel: clean(meta.toeicLevel),
    hskLevel: typeof meta.hskLevel === "number" ? meta.hskLevel : (item.level?.match(/^HSK(\d+)$/)?.[1] ? Number(item.level.replace("HSK", "")) : null),
    toneData: Array.isArray(meta.toneData) ? (meta.toneData as Array<0 | 1 | 2 | 3 | 4>) : [],
    senses: Array.isArray(meta.senses) ? (meta.senses as VocabularyItem["metadata"]["senses"]) : [],
  };
}

export class StaticApiRouter {
  private readonly languageApi: LanguageApiClient;
  private readonly syncCoordinator: LocalFirstSyncCoordinator;

  constructor(private readonly persistence: PersistenceAdapter = getIndexedDbAdapter()) {
    this.languageApi = new LanguageApiClient(persistence);
    this.syncCoordinator = new LocalFirstSyncCoordinator(persistence);
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = new URL(endpoint, "https://local.invalid");
    const path = url.pathname;
    const method = options.method ?? "GET";
    const body = asBody(options);

    if (path === "/api/me") return STATIC_LOCAL_USER as T;
    if (["/api/auth/login", "/api/auth/register"].includes(path)) return { user: STATIC_LOCAL_USER, token: "local-profile" } as T;
    if (path === "/api/auth/logout") return { loggedOut: true } as T;

    if (path === "/api/settings") {
      const current = await this.getSettings();
      if (method === "PATCH") {
        const updated = { ...current, ...body, nativeLanguage: "vi" } as UserSettings;
        await this.persistence.put("settings", { id: "local-settings", ...updated });
        void this.syncCoordinator.queueLocalChange("settings", "local-settings", { id: "local-settings", ...updated }, false);
        return updated as T;
      }
      return current as T;
    }

    if (path === "/api/translation/availability") {
      return { configured: this.languageApi.configured, provider: this.languageApi.configured ? "cloudflare-workers-ai" : null } as T;
    }

    if (path === "/api/vocabulary/bulk-preview" && method === "POST") return this.bulkPreview(body.language, body.input, Boolean(body.refresh)) as Promise<T>;
    if (path === "/api/vocabulary/bulk" && method === "POST") return this.bulkCreate(body.language, body.items) as Promise<T>;
    if (path === "/api/vocabulary/enrich-context" && method === "POST") return this.enrichFromContext(body) as Promise<T>;
    if (path === "/api/vocabulary/from-selection" && method === "POST") return this.saveSelection(body) as Promise<T>;
    if (path === "/api/vocabulary" && method === "POST") return this.createVocabulary(body) as Promise<T>;
    if (path === "/api/vocabulary" && method === "GET") return this.listVocabulary(url.searchParams) as Promise<T>;
    if (path === "/api/flashcards" && method === "GET") return this.listVocabulary(url.searchParams) as Promise<T>;

    let match = path.match(/^\/api\/(?:vocabulary|flashcards)\/([^/]+)(?:\/(review|favorite|answer))?$/u);
    if (match) return this.vocabularyItemRequest(match[1]!, match[2], method, body) as Promise<T>;

    if (path === "/api/readings" && method === "POST") return this.createReading(body) as Promise<T>;
    if (path === "/api/readings" && method === "GET") return this.listReadings(url.searchParams.get("language") as Language | null) as Promise<T>;
    match = path.match(/^\/api\/readings\/([^/]+)(?:\/(translate))?$/u);
    if (match) return this.readingRequest(match[1]!, match[2], method, body) as Promise<T>;
    if (path === "/api/translate-selection" && method === "POST") {
      const translation = await this.languageApi.translate(body.text, body.sourceLanguage);
      return { original: body.text, translation, sourceLanguage: body.sourceLanguage, targetLanguage: "vi", type: classifyLocalSelection(body.text, body.sourceLanguage) } as T;
    }

    if (path === "/api/progress/dashboard") return this.dashboard() as Promise<T>;
    if (path === "/api/progress/streak") return { streak: await this.streak() } as T;
    if (path === "/api/today-plan") return this.todayPlan() as Promise<T>;
    if (path === "/api/activity" && method === "POST") return this.recordActivity(body) as Promise<T>;

    if (path === "/api/quizzes" && method === "POST") return this.startQuiz(body) as Promise<T>;
    match = path.match(/^\/api\/quizzes\/([^/]+)\/answer$/u);
    if (match && method === "POST") return this.answerQuiz(match[1]!, body.answer) as Promise<T>;
    if (path === "/api/games" && method === "POST") return this.startGame(body) as Promise<T>;
    match = path.match(/^\/api\/games\/([^/]+)(?:\/(answer))?$/u);
    if (match) return (match[2] ? this.answerGame(match[1]!, body.itemId, body.answer) : this.getGame(match[1]!)) as Promise<T>;

    if (path === "/api/pronunciation/availability") return { configured: false, provider: null, status: "NOT_CONFIGURED", assessmentAvailable: false } as T;
    if (path === "/api/pronunciation/recent" || path === "/api/pronunciation/weakest") return [] as T;
    if (path === "/api/tts" || path === "/api/pronunciation/assess") throw new Error("Trình duyệt sẽ dùng SpeechSynthesis; chấm phát âm chưa có trong bản static.");

    throw new Error(`Static mode chưa hỗ trợ endpoint ${method} ${path}.`);
  }

  private async getSettings(): Promise<UserSettings> {
    const saved = await this.persistence.get<Record<string, unknown>>("settings", "local-settings");
    if (!saved) {
      await this.persistence.put("settings", { id: "local-settings", ...DEFAULT_SETTINGS });
      return { ...DEFAULT_SETTINGS };
    }
    const { id: _, ...settings } = saved;
    return { ...DEFAULT_SETTINGS, ...settings } as UserSettings;
  }

  private async listVocabulary(params: URLSearchParams): Promise<VocabularyItem[]> {
    let items = await this.persistence.getAll<VocabularyItem>("vocabulary");
    const language = params.get("language");
    const topic = params.get("topic");
    const status = params.get("status");
    if (language) items = items.filter((item) => item.language === language);
    if (topic) items = items.filter((item) => item.topic === topic);
    if (status) items = items.filter((item) => item.progress.status === status);
    if (params.get("due") === "true") {
      const now = Date.now();
      items = items.filter((item) => !item.progress.nextReviewAt || Date.parse(item.progress.nextReviewAt) <= now);
    }
    if (params.get("random") === "true") items = [...items].sort(() => Math.random() - 0.5);
    const limit = Number(params.get("limit") || 50);
    return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, Number.isFinite(limit) ? limit : 50);
  }

  private async createVocabulary(input: VocabularyInput): Promise<CreateVocabularyResult> {
    const term = input.term.trim();
    const normalizedTerm = normalizeLocalTerm(term, input.language);
    const existing = (await this.persistence.getAll<VocabularyItem>("vocabulary")).find((item) => item.language === input.language && item.normalizedTerm === normalizedTerm);
    if (existing) return { item: existing, duplicate: true };
    if (!input.meaningVi?.trim()) throw new Error("Nghĩa tiếng Việt là bắt buộc.");
    const now = new Date().toISOString();
    const item: VocabularyItem = {
      id: createLocalId(), userId: STATIC_LOCAL_USER.id, language: input.language, term, normalizedTerm,
      pronunciation: input.pronunciation?.trim() || null, meaningVi: input.meaningVi.trim(), partOfSpeech: input.partOfSpeech?.trim() || null,
      example: input.example?.trim() || null, exampleTranslation: input.exampleTranslation?.trim() || null,
      topic: input.topic?.trim() || null, level: input.level?.trim() || null, note: input.note?.trim() || null,
      source: input.source ?? "MANUAL", sourceReadingId: input.sourceReadingId ?? null, audioUrl: input.audioUrl ?? null,
      audioAvailable: Boolean(input.audioUrl), favorite: false, metadata: input.metadata ?? {}, createdAt: now, updatedAt: now,
      progress: { status: "NEW", ease: 2.5, intervalDays: 0, repetitions: 0, nextReviewAt: null, lastReviewedAt: null, correctCount: 0, incorrectCount: 0 },
    };
    await this.persistence.put("vocabulary", asVocabularyRecord(item));
    void this.syncCoordinator.queueLocalChange("vocabulary", item.id, item as unknown as StoredRecord, false);
    return { item, duplicate: false };
  }

  private async bulkPreview(language: Language, input: string, refresh = false): Promise<BulkVocabularyPreview> {
    const terms = parseLocalQuickInput(input, language);
    const existing = await this.persistence.getAll<VocabularyItem>("vocabulary");
    const existingMap = new Map(
      existing
        .filter((item) => item.language === language)
        .map((item) => [item.normalizedTerm, item])
    );
    const newTerms = terms.filter((term) => !existingMap.has(normalizeLocalTerm(term, language)));
    let enrichment = new Map<string, VocabularyEnrichment>();
    let enrichmentError: Error | undefined;
    if (this.languageApi.configured && newTerms.length) {
      try {
        enrichment = new Map((await this.languageApi.enrichTerms(language, newTerms, refresh)).map((item) => [normalizeLocalTerm(item.term, language), item]));
      } catch (error) { enrichmentError = error as Error; }
    }
    return {
      enrichment: { configured: this.languageApi.configured, provider: this.languageApi.configured ? "cloudflare-workers-ai" : null },
      items: terms.map((term) => {
        const normalizedTerm = normalizeLocalTerm(term, language);
        const existingItem = existingMap.get(normalizedTerm);
        const duplicate = Boolean(existingItem);
        const enriched = enrichment.get(normalizedTerm);
        return {
          term, normalizedTerm, duplicate,
          status: duplicate ? "EXISTS" : enriched?.meaningVi ? "READY" : "NEEDS_ENRICHMENT",
          suggestion: duplicate && existingItem ? suggestionFromExisting(existingItem) : suggestion(enriched),
          ...(enrichmentError && !duplicate ? { error: { code: "EXTERNAL_SERVICE_ERROR" as const, message: enrichmentError.message } } : {}),
        };
      }),
    };
  }

  private async bulkCreate(language: Language, items: BulkVocabularyInputItem[]): Promise<BulkVocabularyCreateResult> {
    const result: BulkVocabularyCreateResult = { mode: "PARTIAL", created: [], existing: [], failed: [] };
    for (let index = 0; index < items.length; index += 1) {
      const input = items[index]!;
      try {
        const metadata: Record<string, unknown> = {};
        for (const key of ["ipa", "pinyin", "simplified", "traditional", "cefr", "toeicLevel", "hskLevel", "toneData", "synonyms", "senses"] as const) {
          if (input[key] !== undefined) metadata[key] = input[key];
        }
        const created = await this.createVocabulary({ ...input, language, source: "IMPORT", metadata });
        (created.duplicate ? result.existing : result.created).push(created.item);
      } catch (error) {
        result.failed.push({ index, term: input.term ?? null, code: "VALIDATION_ERROR", message: (error as Error).message });
      }
    }
    return result;
  }

  private async vocabularyItemRequest(id: string, action: string | undefined, method: string, body: any): Promise<unknown> {
    const item = await this.persistence.get<VocabularyItem>("vocabulary", id);
    if (!item) throw new Error("Không tìm thấy từ vựng.");
    if (method === "DELETE") {
      await this.persistence.delete("vocabulary", id);
      void this.syncCoordinator.queueLocalChange("vocabulary", id, undefined, true);
      return undefined;
    }
    if (action === "review" || action === "answer") {
      const reviewed = reviewLocalVocabulary(item, body.action as ReviewAction);
      await this.persistence.put("vocabulary", asVocabularyRecord(reviewed));
      void this.syncCoordinator.queueLocalChange("vocabulary", reviewed.id, reviewed as unknown as StoredRecord, false);
      await this.recordActivity({ studySeconds: 30 });
      return reviewed;
    }
    if (action === "favorite") {
      const updated = { ...item, favorite: Boolean(body.favorite), updatedAt: new Date().toISOString() };
      await this.persistence.put("vocabulary", asVocabularyRecord(updated));
      void this.syncCoordinator.queueLocalChange("vocabulary", updated.id, updated as unknown as StoredRecord, false);
      return updated;
    }
    if (method === "PATCH") {
      const updated = { ...item, ...body, id: item.id, language: item.language, term: item.term, normalizedTerm: item.normalizedTerm, updatedAt: new Date().toISOString() };
      await this.persistence.put("vocabulary", asVocabularyRecord(updated));
      void this.syncCoordinator.queueLocalChange("vocabulary", updated.id, updated as unknown as StoredRecord, false);
      return updated;
    }
    return item;
  }

  private async enrichFromContext(body: any): Promise<VocabularyEnrichment | null> {
    if (!this.languageApi.configured) return null;
    const context: VocabularyContext = {
      sentence: body.sentence,
      previousSentence: body.previousSentence,
      nextSentence: body.nextSentence,
    };
    try {
      return await this.languageApi.enrichTermWithContext(body.language, body.term, context);
    } catch {
      return null;
    }
  }

  private async saveSelection(body: any): Promise<CreateVocabularyResult & { contextualSense?: VocabularyEnrichment }> {
    let enriched: VocabularyEnrichment | undefined;
    const context: VocabularyContext | undefined = body.context && typeof body.context.sentence === "string"
      ? { sentence: body.context.sentence, previousSentence: body.context.previousSentence, nextSentence: body.context.nextSentence }
      : undefined;
    if (this.languageApi.configured) {
      try {
        if (context) {
          enriched = await this.languageApi.enrichTermWithContext(body.sourceLanguage, body.text, context);
        } else {
          enriched = (await this.languageApi.enrichTerms(body.sourceLanguage, [body.text]))[0];
        }
      } catch {}
    }
    const sourceContext = context ? { sentence: context.sentence, previousSentence: context.previousSentence, nextSentence: context.nextSentence } : undefined;
    const result = await this.createVocabulary({
      language: body.sourceLanguage, term: body.text, meaningVi: enriched?.meaningVi || body.meaningVi,
      pronunciation: enriched?.pronunciation || enriched?.ipa || enriched?.pinyin || body.pronunciation,
      partOfSpeech: enriched?.partOfSpeech || body.partOfSpeech,
      example: enriched?.example, exampleTranslation: enriched?.exampleTranslation,
      source: "READING_SELECTION", sourceReadingId: body.readingId,
      metadata: enriched ? {
        synonyms: enriched.synonyms ?? [], senses: enriched.senses ?? [],
        ipa: enriched.ipa, pinyin: enriched.pinyin,
        ...(context ? { sourceContext, contextAware: true } : {}),
      } : (context ? { sourceContext, contextAware: true } : {}),
    });
    // For duplicates: return the contextual enrichment so UI can display "Trong câu này: ..."
    if (result.duplicate && enriched) {
      return { ...result, contextualSense: enriched };
    }
    return result;
  }

  private async createReading(input: any): Promise<ReadingPassage> {
    if (!input.title?.trim() || !input.content?.trim()) throw new Error("Tiêu đề và nội dung bài đọc là bắt buộc.");
    const id = createLocalId();
    const now = new Date().toISOString();
    const sentences = splitLocalSentences(input.content, input.language).map((text, order) => ({ id: createLocalId(), passageId: id, order, text, translationVi: null, audioUrl: null, tokens: tokenizeLocal(text, input.language) }));
    const passage: ReadingPassage = {
      id, userId: STATIC_LOCAL_USER.id, language: input.language, title: input.title.trim(), content: input.content.trim(),
      translationVi: input.translationVi?.trim() || null, topic: input.topic?.trim() || null, level: input.level?.trim() || null,
      wordCount: localWordCount(input.content, input.language), createdAt: now, updatedAt: now, sentences,
    };
    await this.persistence.put("readings", passage as ReadingPassage & StoredRecord);
    void this.syncCoordinator.queueLocalChange("readings", passage.id, passage as unknown as StoredRecord, false);
    return passage;
  }

  private async listReadings(language: Language | null): Promise<ReadingPassageSummary[]> {
    return (await this.persistence.getAll<ReadingPassage>("readings"))
      .filter((item) => !language || item.language === language)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map(({ sentences: _, content: __, userId: ___, ...summary }) => summary);
  }

  private async readingRequest(id: string, action: string | undefined, method: string, body: any): Promise<unknown> {
    const passage = await this.persistence.get<ReadingPassage>("readings", id);
    if (!passage) throw new Error("Không tìm thấy bài đọc.");
    if (method === "DELETE") {
      await this.persistence.delete("readings", id);
      void this.syncCoordinator.queueLocalChange("readings", id, undefined, true);
      return undefined;
    }
    if (action === "translate") {
      const translation = await this.languageApi.translate(passage.content, passage.language);
      const updated = { ...passage, translationVi: translation, updatedAt: new Date().toISOString() };
      await this.persistence.put("readings", updated as ReadingPassage & StoredRecord);
      void this.syncCoordinator.queueLocalChange("readings", updated.id, updated as unknown as StoredRecord, false);
      return { passageId: id, original: passage.content, translation, sourceLanguage: passage.language, targetLanguage: "vi" };
    }
    if (method === "PATCH") {
      const language = body.language ?? passage.language;
      const content = body.content ?? passage.content;
      const updated: ReadingPassage = {
        ...passage, ...body, id: passage.id, userId: passage.userId, language, content,
        wordCount: localWordCount(content, language), updatedAt: new Date().toISOString(),
        sentences: body.content !== undefined || body.language !== undefined
          ? splitLocalSentences(content, language).map((text, order) => ({ id: createLocalId(), passageId: id, order, text, translationVi: null, audioUrl: null, tokens: tokenizeLocal(text, language) }))
          : passage.sentences,
      };
      await this.persistence.put("readings", updated as ReadingPassage & StoredRecord);
      void this.syncCoordinator.queueLocalChange("readings", updated.id, updated as unknown as StoredRecord, false);
      return updated;
    }
    return passage;
  }

  private async getActivity(date = new Date().toISOString().slice(0, 10)): Promise<ActivityRecord> {
    return await this.persistence.get<ActivityRecord>("activities", date) ?? { id: date, date, readingMinutes: 0, shadowingMinutes: 0, studySeconds: 0, quizzes: 0 };
  }

  private async recordActivity(input: Partial<ActivityRecord>): Promise<ActivityRecord> {
    const current = await this.getActivity();
    const updated = {
      ...current,
      readingMinutes: current.readingMinutes + Number(input.readingMinutes ?? 0),
      shadowingMinutes: current.shadowingMinutes + Number(input.shadowingMinutes ?? 0),
      studySeconds: current.studySeconds + Number(input.studySeconds ?? 0),
      quizzes: current.quizzes + Number(input.quizzes ?? 0),
    };
    await this.persistence.put("activities", updated);
    void this.syncCoordinator.queueLocalChange("activities", updated.id, updated, false);
    return updated;
  }

  private async streak(): Promise<number> {
    const active = new Set((await this.persistence.getAll<ActivityRecord>("activities")).filter((item) => item.studySeconds || item.readingMinutes || item.shadowingMinutes || item.quizzes).map((item) => item.date));
    let streak = 0;
    const cursor = new Date();
    while (active.has(cursor.toISOString().slice(0, 10))) { streak += 1; cursor.setUTCDate(cursor.getUTCDate() - 1); }
    return streak;
  }

  private async dashboard(): Promise<Dashboard> {
    const vocab = await this.persistence.getAll<VocabularyItem>("vocabulary");
    const readings = await this.persistence.getAll<ReadingPassage>("readings");
    const activities = await this.persistence.getAll<ActivityRecord>("activities");
    const buildLanguage = (language: Language) => {
      const words = vocab.filter((item) => item.language === language);
      return {
        totalWords: words.length, mastered: words.filter((item) => item.progress.status === "MASTERED").length,
        learning: words.filter((item) => ["LEARNING", "REVIEW"].includes(item.progress.status)).length,
        new: words.filter((item) => item.progress.status === "NEW").length,
        dueToday: words.filter((item) => !item.progress.nextReviewAt || Date.parse(item.progress.nextReviewAt) <= Date.now()).length,
        quizAccuracy: 0, pronunciationAverage: 0,
        shadowingMinutes: activities.reduce((sum, item) => sum + item.shadowingMinutes, 0),
        readingCompleted: readings.filter((item) => item.language === language).length,
      };
    };
    const settings = await this.getSettings();
    const today = await this.getActivity();
    return {
      languages: { en: buildLanguage("en"), zh: { ...buildLanguage("zh"), toneAccuracy: 0 } },
      global: { streak: await this.streak(), todayGoal: settings.dailyGoal, todayCompleted: Math.min(settings.dailyGoal, Math.round(today.studySeconds / 60)), totalStudyTimeSeconds: activities.reduce((sum, item) => sum + item.studySeconds, 0) },
    };
  }

  private async todayPlan(): Promise<TodayPlan> {
    const settings = await this.getSettings();
    const vocab = await this.persistence.getAll<VocabularyItem>("vocabulary");
    const plan = (language: Language) => {
      const words = vocab.filter((item) => item.language === language);
      return {
        newWords: { target: language === "en" ? settings.englishNewWordsTarget : settings.chineseNewWordsTarget, available: words.filter((item) => item.progress.status === "NEW").length },
        dueReviews: { target: settings.reviewTarget, available: words.filter((item) => !item.progress.nextReviewAt || Date.parse(item.progress.nextReviewAt) <= Date.now()).length },
        quiz: { target: settings.quizTarget }, shadowing: { targetMinutes: settings.shadowingTarget },
      };
    };
    return { date: new Date().toISOString().slice(0, 10), english: plan("en"), chinese: { ...plan("zh"), pinyin: { target: 5 } } };
  }

  private async startQuiz(body: any): Promise<QuizSession> {
    const vocab = (await this.persistence.getAll<VocabularyItem>("vocabulary")).filter((item) => item.language === body.language).slice(0, body.count ?? 10);
    if (!vocab.length) throw new Error("Chưa có từ vựng cho bài quiz.");
    const questions = vocab.map((item) => {
      const reversed = ["MEANING_TO_TERM", "MEANING_TO_HANZI"].includes(body.type);
      return { id: createLocalId(), prompt: reversed ? item.meaningVi : item.term, answer: reversed ? item.term : item.meaningVi, type: body.type, vocabularyId: item.id };
    });
    const id = createLocalId();
    const session: QuizSession = { id, language: body.language, type: body.type, totalQuestions: questions.length, currentIndex: 0, correct: 0, incorrect: 0, score: 0, status: "ACTIVE", startedAt: new Date().toISOString(), completedAt: null, currentQuestion: (({ answer: _, ...question }) => question)(questions[0]!) };
    await this.persistence.put("quizSessions", { id, public: session, questions } as StoredQuizSession);
    return session;
  }

  private async answerQuiz(id: string, answer: string): Promise<QuizAnswerResult> {
    const stored = await this.persistence.get<StoredQuizSession>("quizSessions", id);
    if (!stored || stored.public.status !== "ACTIVE") throw new Error("Phiên quiz không tồn tại hoặc đã kết thúc.");
    const current = stored.questions[stored.public.currentIndex]!;
    const correct = current.answer.normalize("NFKC").trim().toLocaleLowerCase() === answer.normalize("NFKC").trim().toLocaleLowerCase();
    const currentIndex = stored.public.currentIndex + 1;
    const correctCount = stored.public.correct + (correct ? 1 : 0);
    const done = currentIndex >= stored.questions.length;
    const next = stored.questions[currentIndex];
    const session: QuizSession = { ...stored.public, currentIndex, correct: correctCount, incorrect: stored.public.incorrect + (correct ? 0 : 1), score: Math.round(correctCount / stored.questions.length * 100), status: done ? "COMPLETED" : "ACTIVE", completedAt: done ? new Date().toISOString() : null, currentQuestion: next ? (({ answer: _, ...question }) => question)(next) : null };
    await this.persistence.put("quizSessions", { ...stored, public: session });
    if (done) {
      await this.persistence.put("quizHistory", { ...session });
      void this.syncCoordinator.queueLocalChange("quizHistory", session.id, { ...session }, false);
      await this.recordActivity({ quizzes: 1, studySeconds: 60 });
    }
    return { correct, expectedAnswer: current.answer, session };
  }

  private async startGame(body: any): Promise<GameSession> {
    if (!isGameType(body.type)) throw new Error("Loại trò chơi không hợp lệ.");
    const vocab = (await this.persistence.getAll<VocabularyItem>("vocabulary")).filter((item) => item.language === body.language).slice(0, body.count ?? 10);
    if (vocab.length < 2) throw new Error("Cần ít nhất hai từ vựng để bắt đầu trò chơi.");
    const items = buildGameItems(body.type, vocab.map((item) => ({ id: item.id, term: item.term, meaningVi: item.meaningVi })), createLocalId);
    const id = createLocalId();
    const session: GameSession = { id, language: body.language, type: body.type, score: 0, timerSeconds: body.timerSeconds ?? (body.type === "SPEED_CHALLENGE" ? 45 : null), status: "ACTIVE", startedAt: new Date().toISOString(), completedAt: null, currentItem: publicGameItem(items[0]!), completedCount: 0 };
    await this.persistence.put("gameSessions", { id, public: session, items } as StoredGameSession);
    return session;
  }

  private async getGame(id: string): Promise<GameSession> {
    const stored = await this.persistence.get<StoredGameSession>("gameSessions", id);
    if (!stored) throw new Error("Không tìm thấy phiên trò chơi.");
    return stored.public;
  }

  private async answerGame(id: string, itemId: string, answer: string): Promise<GameAnswerResult> {
    const stored = await this.persistence.get<StoredGameSession>("gameSessions", id);
    if (!stored || stored.public.status !== "ACTIVE") throw new Error("Phiên trò chơi không tồn tại hoặc đã kết thúc.");
    const item = stored.items[stored.public.completedCount];
    if (!item || item.id !== itemId) throw new Error("Câu trả lời không khớp lượt hiện tại.");
    const correct = scoreGameAnswer(item.answer, answer);
    item.answered = true;
    const completedCount = stored.public.completedCount + 1;
    const done = completedCount >= stored.items.length;
    const next = stored.items[completedCount];
    const nextPublic = next ? publicGameItem(next) : null;
    const session: GameSession = { ...stored.public, score: stored.public.score + (correct ? 10 : 0), completedCount, status: done ? "COMPLETED" : "ACTIVE", completedAt: done ? new Date().toISOString() : null, currentItem: nextPublic };
    await this.persistence.put("gameSessions", { ...stored, public: session, items: stored.items });
    if (done) await this.recordActivity({ studySeconds: 60 });
    return { correct, expectedAnswer: item.answer, session };
  }
}

let defaultRouter: StaticApiRouter | undefined;

export function getStaticApiRouter(): StaticApiRouter {
  defaultRouter ??= new StaticApiRouter();
  return defaultRouter;
}
