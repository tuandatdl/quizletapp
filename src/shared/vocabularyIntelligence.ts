import { normalizeCefrLevel, type CEFRLevel, type VocabularyStatus } from "./schemas.js";

export const CEFR_LEVELS: readonly CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
export { normalizeCefrLevel, type CEFRLevel } from "./schemas.js";
export type LexicalStatus = "VALID" | "UNCERTAIN" | "INVALID";

export interface VocabularyCollection {
  id: string;
  userId: string;
  name: string;
  normalizedName: string;
  description?: string | null;
  emoji?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyLike {
  language: string;
  level?: unknown;
  topic?: unknown;
  topics?: unknown;
  collectionIds?: unknown;
  metadata?: unknown;
  progress?: { status?: unknown; lastReviewedAt?: unknown };
}

export function normalizeVocabularyTopics(value: unknown, maxCount = 20): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const topics: string[] = [];
  for (const raw of value) {
    if (typeof raw !== "string") continue;
    const display = raw.normalize("NFKC").trim().replace(/\s+/gu, " ");
    const key = display.toLocaleLowerCase();
    if (!display || display.length > 60 || seen.has(key)) continue;
    seen.add(key);
    topics.push(display);
    if (topics.length >= maxCount) break;
  }
  return topics;
}

export function getVocabularyTopics(item: VocabularyLike): string[] {
  const current = normalizeVocabularyTopics(item.topics);
  return normalizeVocabularyTopics([...current, item.topic]);
}

export function normalizeCollectionIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap((raw) => {
    if (typeof raw !== "string") return [];
    const id = raw.trim();
    if (!id || seen.has(id)) return [];
    seen.add(id);
    return [id];
  });
}

export function getVocabularyCefr(item: VocabularyLike): CEFRLevel | null {
  if (item.language !== "en") return null;
  const metadata = item.metadata && typeof item.metadata === "object" && !Array.isArray(item.metadata)
    ? item.metadata as Record<string, unknown>
    : {};
  return normalizeCefrLevel(metadata.cefr) ?? normalizeCefrLevel(item.level);
}

export function isVocabularyLearned(item: VocabularyLike): boolean {
  return Boolean(item.progress?.lastReviewedAt) || item.progress?.status === "MASTERED";
}

export interface CefrStat { total: number; learned: number; mastered: number }
export interface CefrStatistics {
  cefr: Record<CEFRLevel, CefrStat> & { unclassified: CefrStat };
  totalLearned: number;
  totalMastered: number;
}

function stat(): CefrStat { return { total: 0, learned: 0, mastered: 0 }; }
export function calculateCefrStatistics(items: VocabularyLike[]): CefrStatistics {
  const cefr = Object.fromEntries([...CEFR_LEVELS, "unclassified"].map((level) => [level, stat()])) as CefrStatistics["cefr"];
  let totalLearned = 0;
  let totalMastered = 0;
  for (const item of items) {
    if (item.language !== "en") continue;
    const bucket = getVocabularyCefr(item) ?? "unclassified";
    const current = cefr[bucket];
    current.total++;
    if (isVocabularyLearned(item)) { current.learned++; totalLearned++; }
    if (item.progress?.status === "MASTERED") { current.mastered++; totalMastered++; }
  }
  return { cefr, totalLearned, totalMastered };
}

export interface VocabularyStudyScope {
  cefrLevels?: CEFRLevel[];
  topics?: string[];
  collectionIds?: string[];
  statuses?: VocabularyStatus[];
  learned?: boolean;
  mastered?: boolean;
  due?: boolean;
}

export function filterVocabularyByScope<T extends VocabularyLike>(items: T[], scope: VocabularyStudyScope = {}, now = Date.now()): T[] {
  const topics = new Set(normalizeVocabularyTopics(scope.topics).map((topic) => topic.toLocaleLowerCase()));
  const collectionIds = new Set(normalizeCollectionIds(scope.collectionIds));
  const levels = new Set(scope.cefrLevels ?? []);
  const statuses = new Set(scope.statuses ?? []);
  return items.filter((item) => {
    if (levels.size && (!getVocabularyCefr(item) || !levels.has(getVocabularyCefr(item)!))) return false;
    if (topics.size && !getVocabularyTopics(item).some((topic) => topics.has(topic.toLocaleLowerCase()))) return false;
    if (collectionIds.size && !normalizeCollectionIds(item.collectionIds).some((id) => collectionIds.has(id))) return false;
    if (statuses.size && (!item.progress?.status || !statuses.has(item.progress.status as VocabularyStatus))) return false;
    if (scope.learned !== undefined && isVocabularyLearned(item) !== scope.learned) return false;
    if (scope.mastered !== undefined && (item.progress?.status === "MASTERED") !== scope.mastered) return false;
    if (scope.due && typeof (item.progress as any)?.nextReviewAt === "string" && Date.parse((item.progress as any).nextReviewAt) > now) return false;
    return true;
  });
}
