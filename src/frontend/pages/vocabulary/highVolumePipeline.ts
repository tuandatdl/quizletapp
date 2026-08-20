import type { Language, VocabularyItem } from "../../types/api.js";
import {
  normalizeLocalTerm,
  parseHighVolumeQuickVocabularyInput,
  type ParsedHighVolumeQuickVocabularyInput,
  type ParsedQuickVocabularyDraft,
} from "../../static/localDomain.js";

export const HIGH_VOLUME_BATCH_SIZE = 20;
export const HIGH_VOLUME_MAX_CONCURRENCY = 2;
export const HIGH_VOLUME_SAVE_BATCH_SIZE = 20;
export const HIGH_VOLUME_MAX_ATTEMPTS = 3;

export type HighVolumeItemState =
  | "QUEUED"
  | "PROCESSING"
  | "READY"
  | "INVALID"
  | "FAILED"
  | "SKIPPED_EXISTING"
  | "SAVED";

export interface HighVolumeImportItem {
  id: string;
  index: number;
  draft: ParsedQuickVocabularyDraft;
  normalizedTerm: string;
  state: HighVolumeItemState;
  failurePhase?: "analysis" | "save";
  error?: string;
}

export interface HighVolumeImportPlan {
  parsed: number;
  duplicates: number;
  existing: number;
  items: HighVolumeImportItem[];
}

export interface HighVolumeProgress {
  total: number;
  parsed: number;
  duplicates: number;
  existing: number;
  queued: number;
  processing: number;
  ready: number;
  invalid: number;
  failed: number;
  saved: number;
}

export interface BoundedBatchOptions<T, R> {
  items: T[];
  batchSize?: number;
  concurrency?: number;
  maxAttempts?: number;
  isActive: () => boolean;
  process: (batch: T[]) => Promise<R>;
  onStart?: (batch: T[]) => void;
  onSuccess?: (batch: T[], result: R) => void;
  onFailure?: (batch: T[], error: Error) => void;
  wait?: (ms: number) => Promise<void>;
}

export interface BoundedBatchResult {
  launched: number;
  completed: number;
  failed: number;
  cancelled: boolean;
}

export function windowHighVolumeItems<T>(items: T[], page: number, pageSize = 50): T[] {
  const safePageSize = Math.max(1, pageSize);
  const pageCount = Math.max(1, Math.ceil(items.length / safePageSize));
  const safePage = Math.min(Math.max(0, page), pageCount - 1);
  return items.slice(safePage * safePageSize, (safePage + 1) * safePageSize);
}

export function parseHighVolumeImport(input: string, language: Language): ParsedHighVolumeQuickVocabularyInput {
  return parseHighVolumeQuickVocabularyInput(input, language);
}

function importIdentity(term: string, language: Language): string {
  return language === "en"
    ? normalizeLocalTerm(term, language)
    : term.normalize("NFKC").trim();
}

export function buildHighVolumeImportPlan(
  input: ParsedHighVolumeQuickVocabularyInput,
  language: Language,
  existingVocabulary: VocabularyItem[],
): HighVolumeImportPlan {
  const existing = new Set(existingVocabulary
    .filter((item) => item.language === language)
    .map((item) => normalizeLocalTerm(item.term, language)));
  let existingCount = 0;
  const items = input.drafts.map((draft, index) => {
    const normalizedTerm = importIdentity(draft.term, language);
    const alreadyExists = existing.has(normalizeLocalTerm(draft.term, language));
    if (alreadyExists) existingCount += 1;
    const userComplete = Boolean(draft.meaningVi?.trim());
    return {
      id: `import-${index}-${normalizedTerm}`,
      index,
      draft,
      normalizedTerm,
      state: alreadyExists ? "SKIPPED_EXISTING" : userComplete ? "READY" : "QUEUED",
    } satisfies HighVolumeImportItem;
  });
  return { parsed: input.drafts.length, duplicates: input.duplicateCount, existing: existingCount, items };
}

export function progressForImport(plan: Pick<HighVolumeImportPlan, "parsed" | "duplicates" | "existing" | "items">): HighVolumeProgress {
  const counts: Record<HighVolumeItemState, number> = {
    QUEUED: 0, PROCESSING: 0, READY: 0, INVALID: 0, FAILED: 0, SKIPPED_EXISTING: 0, SAVED: 0,
  };
  for (const item of plan.items) counts[item.state] += 1;
  return {
    total: plan.parsed + plan.duplicates,
    parsed: plan.parsed,
    duplicates: plan.duplicates,
    existing: plan.existing,
    queued: counts.QUEUED,
    processing: counts.PROCESSING,
    ready: counts.READY,
    invalid: counts.INVALID,
    failed: counts.FAILED,
    saved: counts.SAVED,
  };
}

export function isRetryableBatchError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /429|AI_PROVIDER_EXHAUSTED|network|kết nối|timeout|timed out|5\d\d|temporarily unavailable/iu.test(message);
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function runBoundedBatches<T, R>(options: BoundedBatchOptions<T, R>): Promise<BoundedBatchResult> {
  const batchSize = options.batchSize ?? HIGH_VOLUME_BATCH_SIZE;
  const concurrency = options.concurrency ?? HIGH_VOLUME_MAX_CONCURRENCY;
  const maxAttempts = options.maxAttempts ?? HIGH_VOLUME_MAX_ATTEMPTS;
  const batches: T[][] = [];
  for (let offset = 0; offset < options.items.length; offset += batchSize) batches.push(options.items.slice(offset, offset + batchSize));
  let nextBatch = 0;
  let launched = 0;
  let completed = 0;
  let failed = 0;

  const worker = async () => {
    while (options.isActive()) {
      const batch = batches[nextBatch++];
      if (!batch) return;
      launched += 1;
      options.onStart?.(batch);
      let attempt = 0;
      while (options.isActive()) {
        try {
          const result = await options.process(batch);
          if (!options.isActive()) return;
          completed += 1;
          options.onSuccess?.(batch, result);
          break;
        } catch (caught) {
          const error = caught instanceof Error ? caught : new Error(String(caught));
          attempt += 1;
          if (!isRetryableBatchError(error) || attempt >= maxAttempts) {
            if (options.isActive()) {
              failed += 1;
              options.onFailure?.(batch, error);
            }
            break;
          }
          await (options.wait ?? delay)(1_000 * 2 ** (attempt - 1));
        }
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, batches.length) }, worker));
  return { launched, completed, failed, cancelled: !options.isActive() };
}
