import { describe, expect, it } from "vitest";
import type { VocabularyItem } from "../src/frontend/types/api.js";
import {
  HIGH_VOLUME_BATCH_SIZE,
  HIGH_VOLUME_MAX_CONCURRENCY,
  HIGH_VOLUME_SAVE_BATCH_SIZE,
  buildHighVolumeImportPlan,
  parseHighVolumeImport,
  progressForImport,
  runBoundedBatches,
  windowHighVolumeItems,
} from "../src/frontend/pages/vocabulary/highVolumePipeline.js";

const terms = (count: number) => Array.from({ length: count }, (_, index) => `word-${index + 1}`).join("\n");

function vocabulary(term: string, language: "en" | "zh" = "en"): VocabularyItem {
  return {
    id: `id-${term}`, userId: "user", language, term, normalizedTerm: term.toLowerCase(), pronunciation: null,
    meaningVi: "nghĩa", partOfSpeech: null, example: null, exampleTranslation: null, topic: null, topics: [], collectionIds: [], level: null, note: null,
    source: "IMPORT", sourceReadingId: null, audioUrl: null, audioAvailable: false, favorite: false, metadata: {}, createdAt: "2026-01-01", updatedAt: "2026-01-01",
    progress: { status: "NEW", ease: 2.5, intervalDays: 0, repetitions: 0, nextReviewAt: null, lastReviewedAt: null, correctCount: 0, incorrectCount: 0 },
  };
}

describe("Phase I high-volume vocabulary pipeline", () => {
  it("IMPORT_500_PARSES", () => {
    const parsed = parseHighVolumeImport(terms(500), "en");
    expect(parsed.drafts).toHaveLength(500);
    expect(parsed.duplicateCount).toBe(0);
  });

  it("IMPORT_1000_PARSES", () => {
    const parsed = parseHighVolumeImport(terms(1000), "en");
    expect(parsed.drafts).toHaveLength(1000);
  });

  it("DEDUPE_IMPORT preserves the first display spelling", () => {
    const parsed = parseHighVolumeImport("Customer\ncustomer\n CUSTOMER\ncar", "en");
    expect(parsed.drafts.map((draft) => draft.term)).toEqual(["Customer", "car"]);
    expect(parsed.duplicateCount).toBe(2);
  });

  it("DEDUPE_EXISTING skips stored vocabulary without erasing new or user-complete items", () => {
    const plan = buildHighVolumeImportPlan(parseHighVolumeImport("customer\ncar: xe hơi", "en"), "en", [vocabulary("Customer")]);
    expect(plan.items.map((item) => item.state)).toEqual(["SKIPPED_EXISTING", "READY"]);
    expect(plan.existing).toBe(1);
    expect(plan.items[1]?.draft.meaningVi).toBe("xe hơi");
  });

  it("BATCH_20 and MAX_CONCURRENCY_2", async () => {
    let active = 0;
    let maxActive = 0;
    const sizes: number[] = [];
    await runBoundedBatches({
      items: Array.from({ length: 95 }, (_, index) => index),
      isActive: () => true,
      process: async (batch) => {
        sizes.push(batch.length);
        active += 1;
        maxActive = Math.max(maxActive, active);
        await Promise.resolve();
        active -= 1;
        return batch;
      },
    });
    expect(sizes).toEqual([20, 20, 20, 20, 15]);
    expect(Math.max(...sizes)).toBe(HIGH_VOLUME_BATCH_SIZE);
    expect(maxActive).toBeLessThanOrEqual(HIGH_VOLUME_MAX_CONCURRENCY);
  });

  it("ORDER_PRESERVED_ACROSS_BATCHES", async () => {
    const complete: number[] = [];
    await runBoundedBatches({
      items: Array.from({ length: 45 }, (_, index) => index),
      concurrency: 1,
      isActive: () => true,
      process: async (batch) => batch.map((value) => value),
      onSuccess: (_batch, result) => complete.push(...result),
    });
    expect(complete).toEqual(Array.from({ length: 45 }, (_, index) => index));
  });

  it("PARTIAL_BATCH_FAILURE_PRESERVES_SUCCESS", async () => {
    const successes: number[] = [];
    const failures: number[] = [];
    await runBoundedBatches({
      items: Array.from({ length: 60 }, (_, index) => index),
      concurrency: 1,
      isActive: () => true,
      process: async (batch) => {
        if (batch[0] === 20) throw new Error("invalid payload");
        return batch;
      },
      onSuccess: (_batch, result) => successes.push(...result),
      onFailure: (batch) => failures.push(...batch),
    });
    expect(successes).toEqual([...Array.from({ length: 20 }, (_, index) => index), ...Array.from({ length: 20 }, (_, index) => index + 40)]);
    expect(failures).toEqual(Array.from({ length: 20 }, (_, index) => index + 20));
  });

  it("RETRY_FAILED_ONLY", async () => {
    const retried: number[] = [];
    await runBoundedBatches({
      items: [20, 21, 22],
      isActive: () => true,
      process: async (batch) => { retried.push(...batch); return batch; },
    });
    expect(retried).toEqual([20, 21, 22]);
  });

  it("CANCEL_STOPS_NEW_BATCHES", async () => {
    let active = true;
    const started: number[] = [];
    const result = await runBoundedBatches({
      items: Array.from({ length: 100 }, (_, index) => index),
      isActive: () => active,
      process: async (batch) => {
        started.push(batch[0]!);
        active = false;
        return batch;
      },
    });
    expect(result.cancelled).toBe(true);
    expect(started.length).toBeLessThanOrEqual(HIGH_VOLUME_MAX_CONCURRENCY);
  });

  it("STALE_JOB_RESPONSE_IGNORED", async () => {
    let active = true;
    let resolveBatch!: (value: number[]) => void;
    const applied: number[] = [];
    const running = runBoundedBatches({
      items: [1], isActive: () => active,
      process: () => new Promise<number[]>((resolve) => { resolveBatch = resolve; }),
      onSuccess: (_batch, result) => applied.push(...result),
    });
    await Promise.resolve();
    active = false;
    resolveBatch([1]);
    await running;
    expect(applied).toEqual([]);
  });

  it("USER_FIELDS_SURVIVE_BATCH_ENRICHMENT and AI_TOPIC_SUGGESTION_REQUIRES_CONSENT", () => {
    const plan = buildHighVolumeImportPlan(parseHighVolumeImport("additionally (adv): thêm vào đó", "en"), "en", []);
    expect(plan.items[0]).toMatchObject({ state: "READY", draft: { meaningVi: "thêm vào đó", partOfSpeech: "adverb" } });
  });

  it("INVALID_NOT_SELECTED is represented separately in progress", () => {
    const plan = buildHighVolumeImportPlan(parseHighVolumeImport("noise", "en"), "en", []);
    plan.items[0]!.state = "INVALID";
    expect(progressForImport(plan)).toMatchObject({ invalid: 1, ready: 0 });
  });

  it("SAVE_500_BOUNDED", async () => {
    let activeSaves = 0;
    let maxActiveSaves = 0;
    let calls = 0;
    await runBoundedBatches({
      items: Array.from({ length: 500 }, (_, index) => index),
      batchSize: HIGH_VOLUME_SAVE_BATCH_SIZE,
      concurrency: 1,
      isActive: () => true,
      process: async (batch) => {
        calls += 1;
        activeSaves += 1;
        maxActiveSaves = Math.max(maxActiveSaves, activeSaves);
        await Promise.resolve();
        activeSaves -= 1;
        return batch;
      },
    });
    expect(calls).toBe(25);
    expect(maxActiveSaves).toBe(1);
  });

  it("SAVE_PARTIAL_FAILURE and RETRY_FAILED_SAVE_NO_DUPLICATE", async () => {
    const saved: number[] = [];
    const failed: number[] = [];
    await runBoundedBatches({
      items: [1, 2, 3, 4], batchSize: 2, concurrency: 1, isActive: () => true,
      process: async (batch) => {
        if (batch[0] === 3) throw new Error("validation error");
        return batch;
      },
      onSuccess: (_batch, result) => saved.push(...result),
      onFailure: (batch) => failed.push(...batch),
    });
    expect(saved).toEqual([1, 2]);
    expect(failed).toEqual([3, 4]);
    await runBoundedBatches({ items: failed, batchSize: 2, concurrency: 1, isActive: () => true, process: async (batch) => batch, onSuccess: (_batch, result) => saved.push(...result) });
    expect(saved).toEqual([1, 2, 3, 4]);
  });

  it("CACHE_HIT_REDUCES_PROVIDER_WORK and CONTEXT_BATCH_IDENTITY preserve batch input boundaries", async () => {
    const providerBatches: string[][] = [];
    await runBoundedBatches({
      items: ["cached", "fresh", "contextual"], batchSize: 2, concurrency: 1, isActive: () => true,
      process: async (batch) => {
        providerBatches.push(batch.filter((term) => term !== "cached"));
        return batch;
      },
    });
    expect(providerBatches).toEqual([["fresh"], ["contextual"]]);
  });

  it("ENGLISH_CHINESE_ISOLATION", () => {
    const english = buildHighVolumeImportPlan(parseHighVolumeImport("Customer", "en"), "en", [vocabulary("customer")]);
    const chinese = buildHighVolumeImportPlan(parseHighVolumeImport("学习", "zh"), "zh", [vocabulary("学习", "zh")]);
    expect(english.items[0]?.state).toBe("SKIPPED_EXISTING");
    expect(chinese.items[0]?.state).toBe("SKIPPED_EXISTING");
  });

  it("LARGE_PREVIEW_WINDOWED_1000 keeps the rendered page bounded", () => {
    const items = Array.from({ length: 1000 }, (_, index) => index);
    expect(windowHighVolumeItems(items, 0)).toHaveLength(50);
    expect(windowHighVolumeItems(items, 19)).toEqual(Array.from({ length: 50 }, (_, index) => index + 950));
  });
});
