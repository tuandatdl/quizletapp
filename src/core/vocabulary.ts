import { randomUUID } from "node:crypto";
import type { Database, SqlValue } from "../db/database.js";
import { errors } from "../shared/errors.js";
import type { Language, ReviewAction } from "../shared/schemas.js";
import { getVocabularyTopics, normalizeCefrLevel, normalizeCollectionIds, normalizeVocabularyTopics } from "../shared/vocabularyIntelligence.js";
import { reviewSrs } from "./srs.js";

export interface VocabularyInput {
  language: Language; term: string; pronunciation?: string | null; meaningVi: string; partOfSpeech?: string | null;
  example?: string | null; exampleTranslation?: string | null; topic?: string | null; topics?: string[]; collectionIds?: string[]; level?: string | null; note?: string | null;
  source: "MANUAL" | "READING_SELECTION" | "IMPORT"; sourceReadingId?: string | null; audioUrl?: string | null; metadata: Record<string, unknown>;
}

interface VocabRow extends Record<string, SqlValue> {
  id: string; user_id: string; language: Language; term: string; normalized_term: string; pronunciation: string | null; meaning_vi: string;
  part_of_speech: string | null; example: string | null; example_translation: string | null; topic: string | null; level: string | null; note: string | null;
  source: string; source_reading_id: string | null; audio_url: string | null; favorite: number; metadata_json: string; created_at: string; updated_at: string;
  status: string; ease: number; interval_days: number; repetitions: number; next_review_at: string | null; last_reviewed_at: string | null; correct_count: number; incorrect_count: number;
}

export function normalizeTerm(term: string, language: Language): string {
  return language === "en" ? term.normalize("NFKC").trim().toLocaleLowerCase("en") : term.normalize("NFKC").replace(/\s+/g, "").trim();
}

function normalizedVocabularyMetadata(input: VocabularyInput): Record<string, unknown> {
  const metadata = { ...input.metadata };
  const topics = normalizeVocabularyTopics(input.topics ?? [input.topic]);
  const collectionIds = normalizeCollectionIds(input.collectionIds);
  if (input.topics !== undefined) metadata.topics = topics;
  if (input.collectionIds !== undefined) metadata.collectionIds = collectionIds;
  const cefr = input.language === "en" ? normalizeCefrLevel(metadata.cefr) ?? normalizeCefrLevel(input.level) : null;
  if (cefr) metadata.cefr = cefr;
  return metadata;
}

const selectVocab = `SELECT v.*,p.status,p.ease,p.interval_days,p.repetitions,p.next_review_at,p.last_reviewed_at,p.correct_count,p.incorrect_count FROM vocabulary_items v JOIN vocabulary_progress p ON p.vocabulary_id=v.id`;
function mapVocabulary(row: VocabRow) {
  const metadata = JSON.parse(row.metadata_json) as Record<string, unknown>;
  return {
    id: row.id, userId: row.user_id, language: row.language, term: row.term, normalizedTerm: row.normalized_term, pronunciation: row.pronunciation,
    meaningVi: row.meaning_vi, partOfSpeech: row.part_of_speech, example: row.example, exampleTranslation: row.example_translation, topic: row.topic,
    topics: getVocabularyTopics({ language: row.language, topic: row.topic, topics: metadata.topics }), collectionIds: normalizeCollectionIds(metadata.collectionIds),
    level: row.language === "en" ? normalizeCefrLevel(metadata.cefr) ?? normalizeCefrLevel(row.level) : row.level, note: row.note, source: row.source, sourceReadingId: row.source_reading_id, audioUrl: row.audio_url, audioAvailable: Boolean(row.audio_url), favorite: Boolean(row.favorite),
    metadata, createdAt: row.created_at, updatedAt: row.updated_at,
    progress: { status: row.status, ease: row.ease, intervalDays: row.interval_days, repetitions: row.repetitions, nextReviewAt: row.next_review_at, lastReviewedAt: row.last_reviewed_at, correctCount: row.correct_count, incorrectCount: row.incorrect_count }
  };
}

export class VocabularyService {
  constructor(private readonly db: Database) {}

  findByNormalized(userId: string, language: Language, normalizedTerm: string) {
    const row = this.db.get<VocabRow>(`${selectVocab} WHERE v.user_id=? AND v.language=? AND v.normalized_term=?`, userId, language, normalizedTerm);
    return row ? mapVocabulary(row) : null;
  }

  create(userId: string, input: VocabularyInput): { item: ReturnType<typeof mapVocabulary>; duplicate: boolean } {
    const normalized = normalizeTerm(input.term, input.language);
    const existing = this.findByNormalized(userId, input.language, normalized);
    if (existing) return { item: existing, duplicate: true };
    const id = randomUUID(); const now = new Date().toISOString(); const metadata = normalizedVocabularyMetadata(input);
    const level = input.language === "en" ? normalizeCefrLevel(metadata.cefr) : input.level ?? null;
    this.db.transaction(() => {
      this.db.run(`INSERT INTO vocabulary_items(id,user_id,language,term,normalized_term,pronunciation,meaning_vi,part_of_speech,example,example_translation,topic,level,note,source,source_reading_id,audio_url,metadata_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        id,userId,input.language,input.term,normalized,input.pronunciation ?? null,input.meaningVi,input.partOfSpeech ?? null,input.example ?? null,input.exampleTranslation ?? null,input.topic ?? null,level,input.note ?? null,input.source,input.sourceReadingId ?? null,input.audioUrl ?? null,JSON.stringify(metadata),now,now);
      this.db.run("INSERT INTO vocabulary_progress(vocabulary_id) VALUES(?)", id);
    });
    return { item: this.get(userId, id), duplicate: false };
  }

  get(userId: string, id: string) {
    const row = this.db.get<VocabRow>(`${selectVocab} WHERE v.user_id=? AND v.id=?`, userId, id);
    if (!row) throw errors.notFound("Vocabulary item");
    return mapVocabulary(row);
  }

  list(userId: string, query: { language?: Language; topic?: string; status?: string; due?: boolean; random?: boolean; limit: number }) {
    const clauses = ["v.user_id=?"]; const params: SqlValue[] = [userId];
    if (query.language) { clauses.push("v.language=?"); params.push(query.language); }
    if (query.topic) { clauses.push("v.topic=?"); params.push(query.topic); }
    if (query.status) { clauses.push("p.status=?"); params.push(query.status); }
    if (query.due) { clauses.push("p.next_review_at IS NOT NULL AND p.next_review_at<=?"); params.push(new Date().toISOString()); }
    const order = query.random ? "RANDOM()" : "v.created_at DESC";
    return this.db.all<VocabRow>(`${selectVocab} WHERE ${clauses.join(" AND ")} ORDER BY ${order} LIMIT ?`, ...params, query.limit).map(mapVocabulary);
  }

  update(userId: string, id: string, patch: Partial<Omit<VocabularyInput, "language" | "term">>) {
    const current = this.get(userId, id);
    const columns: string[] = []; const params: SqlValue[] = [];
    const mapping: Record<string, string> = { pronunciation:"pronunciation",meaningVi:"meaning_vi",partOfSpeech:"part_of_speech",example:"example",exampleTranslation:"example_translation",topic:"topic",level:"level",note:"note",source:"source",sourceReadingId:"source_reading_id",audioUrl:"audio_url" };
    for (const [key, column] of Object.entries(mapping)) if (key in patch) { columns.push(`${column}=?`); params.push((patch as Record<string, SqlValue>)[key] ?? null); }
    if (patch.metadata || patch.topics || patch.collectionIds || patch.level !== undefined) {
      const metadata = normalizedVocabularyMetadata({
        ...current,
        ...patch,
        language: current.language,
        term: current.term,
        source: (patch.source ?? current.source) as VocabularyInput["source"],
        metadata: { ...current.metadata, ...(patch.metadata ?? {}) },
        topics: patch.topics ?? getVocabularyTopics(current),
        collectionIds: patch.collectionIds ?? normalizeCollectionIds(current.collectionIds),
      });
      if (current.language === "en") {
        const cefr = normalizeCefrLevel(metadata.cefr) ?? normalizeCefrLevel(patch.level) ?? normalizeCefrLevel(current.level);
        if (cefr && !columns.includes("level=?")) { columns.push("level=?"); params.push(cefr); }
      }
      columns.push("metadata_json=?"); params.push(JSON.stringify(metadata));
    }
    if (columns.length) this.db.run(`UPDATE vocabulary_items SET ${columns.join(",")},updated_at=? WHERE id=? AND user_id=?`, ...params, new Date().toISOString(), id, userId);
    return this.get(userId, id);
  }

  remove(userId: string, id: string): void { if (!this.db.run("DELETE FROM vocabulary_items WHERE id=? AND user_id=?", id, userId).changes) throw errors.notFound("Vocabulary item"); }
  favorite(userId: string, id: string, favorite: boolean) { this.get(userId,id); this.db.run("UPDATE vocabulary_items SET favorite=?,updated_at=? WHERE id=?", favorite ? 1 : 0,new Date().toISOString(),id); return this.get(userId,id); }

  review(userId: string, id: string, action: ReviewAction, reviewedAt = new Date()) {
    const current = this.get(userId,id);
    const next = reviewSrs(current.progress as Parameters<typeof reviewSrs>[0], action, reviewedAt);
    this.db.run(`UPDATE vocabulary_progress SET status=?,ease=?,interval_days=?,repetitions=?,next_review_at=?,last_reviewed_at=?,correct_count=?,incorrect_count=? WHERE vocabulary_id=?`, next.status,next.ease,next.intervalDays,next.repetitions,next.nextReviewAt,next.lastReviewedAt,next.correctCount,next.incorrectCount,id);
    this.recordReview(userId, reviewedAt);
    return this.get(userId,id);
  }

  private recordReview(userId: string, at: Date): void {
    const date = at.toISOString().slice(0,10);
    this.db.run(`INSERT INTO study_activities(user_id,activity_date,vocabulary_reviews) VALUES(?,?,1) ON CONFLICT(user_id,activity_date) DO UPDATE SET vocabulary_reviews=vocabulary_reviews+1`,userId,date);
  }
}
