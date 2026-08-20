/** @vitest-environment jsdom */

import React, { act, useCallback, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EditablePreviewItem } from "../src/frontend/pages/vocabulary/AddVocabularyPage.js";
import type { BulkVocabularyPreview } from "../src/frontend/types/api.js";

const apiMocks = vi.hoisted(() => ({
  bulkPreview: vi.fn(),
  bulkCreate: vi.fn(),
  create: vi.fn(),
  list: vi.fn(),
}));

const toastMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}));

vi.mock("../src/frontend/api/vocabulary.api.js", () => ({
  vocabularyApi: apiMocks,
  collectionApi: {
    list: vi.fn(),
    create: vi.fn(),
    rename: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../src/frontend/context/LanguageContext.js", () => ({
  useLanguage: () => ({ language: "en", settings: null }),
}));

vi.mock("../src/frontend/context/ToastContext.js", () => ({
  useToast: () => toastMocks,
}));

import { AddVocabularyPage, mergeQuickTopics, updatePreviewItemField } from "../src/frontend/pages/vocabulary/AddVocabularyPage.js";
import { QuickAddPreviewRow } from "../src/frontend/pages/vocabulary/QuickAddPreviewRows.js";
import { VocabularyGridCard } from "../src/frontend/pages/vocabulary/VocabularyListPage.js";
import type { VocabularyItem } from "../src/frontend/types/api.js";

let container: HTMLDivElement;
let root: Root;

const previewItem = (index: number): EditablePreviewItem => ({
  id: `preview-${index}`,
  repairAccepted: false,
  term: `term-${index}`,
  normalizedTerm: `term-${index}`,
  duplicate: false,
  meaningVi: `nghĩa ${index}`,
  partOfSpeech: "noun",
  pronunciation: `/term-${index}/`,
  synonyms: "",
  example: "",
  exampleTranslation: "",
  topic: "",
  topics: [],
  suggestedTopics: [],
  level: "",
  toeicLevel: "",
  tone: "",
  traditional: "",
  selected: true,
  expandedDetails: false,
  senses: [],
  enrichmentState: "ready",
});

function PreviewHarness({ count, onRender }: { count: number; onRender: (id: string) => void }): React.ReactElement {
  const [items, setItems] = useState(() => Array.from({ length: count }, (_, index) => previewItem(index + 1)));
  const update = useCallback(<K extends keyof EditablePreviewItem>(id: string, field: K, value: EditablePreviewItem[K]) => {
    setItems((current) => updatePreviewItemField(current, id, field, value));
  }, []);
  const noopId = useCallback((_id: string) => undefined, []);
  const noopRetry = useCallback((_terms: string[]) => undefined, []);
  const noopSense = useCallback((_id: string, _senseIndex: number) => undefined, []);
  const noopTopic = useCallback((_id: string, _topic: string) => undefined, []);

  return (
    <>
      {items.map((item) => (
        <QuickAddPreviewRow
          key={item.id}
          item={item}
          isZh={false}
          onToggleSelect={noopId}
          onUpdateField={update}
          onToggleDetails={noopId}
          onRemove={noopId}
          onRetry={noopRetry}
          onAcceptRepair={noopId}
          onChooseSense={noopSense}
          onOpenTopics={noopId}
          onRemoveTopic={noopTopic}
          onAcceptSuggestedTopic={noopTopic}
          onDismissSuggestedTopic={noopTopic}
          onRender={onRender}
        />
      ))}
    </>
  );
}

const vocabularyItem = (index: number): VocabularyItem => ({
  id: `vocabulary-${index}`,
  userId: "local-user",
  language: "en",
  term: `term-${index}`,
  normalizedTerm: `term-${index}`,
  pronunciation: `/term-${index}/`,
  meaningVi: `nghĩa ${index}`,
  partOfSpeech: "noun",
  example: null,
  exampleTranslation: null,
  topic: null,
  topics: [],
  collectionIds: [],
  level: null,
  note: null,
  source: "MANUAL",
  sourceReadingId: null,
  audioUrl: null,
  audioAvailable: false,
  favorite: false,
  metadata: { ipa: `/term-${index}/` },
  createdAt: "2026-08-20T00:00:00.000Z",
  updatedAt: "2026-08-20T00:00:00.000Z",
  progress: { status: "NEW", ease: 2.5, intervalDays: 0, repetitions: 0, nextReviewAt: null, lastReviewedAt: null, correctCount: 0, incorrectCount: 0 },
});

function VocabularyGridHarness({ onRender }: { onRender: (id: string) => void }): React.ReactElement {
  const [draft, setDraft] = useState("");
  const [items] = useState(() => Array.from({ length: 100 }, (_, index) => vocabularyItem(index + 1)));
  const noopItem = useCallback((_item: VocabularyItem) => undefined, []);
  const noopEvent = useCallback((_item: VocabularyItem, _event: React.MouseEvent) => undefined, []);
  return (
    <>
      <input aria-label="collection draft" value={draft} onChange={(event) => setDraft(event.target.value)} />
      {items.map((item) => (
        <VocabularyGridCard key={item.id} item={item} onFavorite={noopEvent} onEdit={noopEvent} onDelete={noopItem} onRender={onRender} />
      ))}
    </>
  );
}

function setNativeInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(input, value);
}

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void; reject: (reason: unknown) => void } {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

const previewResponse = (term: string, meaningVi = `nghĩa ${term}`): BulkVocabularyPreview => ({
  enrichment: { configured: true, provider: "test" },
  items: [{
    term,
    normalizedTerm: term,
    duplicate: false,
    status: "READY",
    suggestion: { meaningVi, partOfSpeech: "noun", pronunciation: `/${term}/`, ipa: `/${term}/` },
  }],
});

const previewResponseMany = (terms: string[]): BulkVocabularyPreview => ({
  enrichment: { configured: true, provider: "test" },
  items: terms.map((term) => ({
    term,
    normalizedTerm: term.toLocaleLowerCase(),
    duplicate: false,
    status: "READY" as const,
    suggestion: { meaningVi: `nghĩa ${term}`, partOfSpeech: "noun", pronunciation: `/${term}ə/`, ipa: `/${term}ə/` },
  })),
});

const previewResponseWithSuggestedTopics = (term: string, suggestedTopics: string[], legacyTopic?: string): BulkVocabularyPreview => ({
  enrichment: { configured: true, provider: "test" },
  items: [{
    term,
    normalizedTerm: term.toLocaleLowerCase(),
    duplicate: false,
    status: "READY",
    suggestion: {
      meaningVi: `nghĩa ${term}`,
      partOfSpeech: "noun",
      pronunciation: `/${term}/`,
      ipa: `/${term}/`,
      suggestedTopics,
      topic: legacyTopic ?? null,
    },
  }],
});

async function renderAddPage(): Promise<void> {
  await act(async () => root.render(<MemoryRouter><AddVocabularyPage /></MemoryRouter>));
}

function quickInput(): HTMLTextAreaElement {
  return container.querySelector<HTMLTextAreaElement>("#quick-vocab-input")!;
}

async function changeQuickInput(value: string): Promise<void> {
  const input = quickInput();
  await act(async () => {
    setNativeInputValue(input, value);
    input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
  });
}

function analyzeButton(): HTMLButtonElement {
  return Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find((button) => (
    button.textContent?.includes("Phân tích") || button.textContent?.includes("Đang tự động bổ sung")
  ))!;
}

async function analyze(): Promise<void> {
  await act(async () => analyzeButton().click());
}

function previewTerm(value: string): HTMLInputElement | undefined {
  return Array.from(container.querySelectorAll<HTMLInputElement>('input[type="text"]')).find((input) => input.value === value);
}

function saveButton(): HTMLButtonElement {
  return Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find((button) => button.textContent?.includes("vào kho"))!;
}

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  vi.clearAllMocks();
  apiMocks.bulkPreview.mockReset();
  apiMocks.bulkCreate.mockReset();
  apiMocks.create.mockReset();
  apiMocks.list.mockReset();
  apiMocks.list.mockResolvedValue([]);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("Quick Add render isolation", () => {
  it.each([1, 10, 25])("renders exactly %i preview rows initially", async (count) => {
    const onRender = vi.fn();
    await act(async () => root.render(<PreviewHarness count={count} onRender={onRender} />));
    expect(onRender).toHaveBeenCalledTimes(count);
  });

  it("preserves unchanged item references and rerenders only edited row 12", async () => {
    const items = Array.from({ length: 25 }, (_, index) => previewItem(index + 1));
    const updated = updatePreviewItemField(items, "preview-12", "meaningVi", "nghĩa mới");
    expect(updated[11]).not.toBe(items[11]);
    expect(updated.filter((item, index) => item === items[index])).toHaveLength(24);

    const renders = new Map<string, number>();
    const onRender = (id: string) => renders.set(id, (renders.get(id) ?? 0) + 1);
    await act(async () => root.render(<PreviewHarness count={25} onRender={onRender} />));
    const meaning = Array.from(container.querySelectorAll<HTMLInputElement>('input[required]'))[11];
    await act(async () => {
      setNativeInputValue(meaning, "nghĩa mới");
      meaning.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "mới" }));
    });

    expect(renders.get("preview-12")).toBe(2);
    expect(Array.from(renders.entries()).filter(([id, count]) => id !== "preview-12" && count !== 1)).toEqual([]);
  });

  it("keeps Quick Add typing local and performs no network call before Analyze", async () => {
    await renderAddPage();
    await changeQuickInput("go, car, live, total");

    expect(quickInput().value).toBe("go, car, live, total");
    expect(apiMocks.bulkPreview).not.toHaveBeenCalled();
    expect(apiMocks.bulkCreate).not.toHaveBeenCalled();
    expect(apiMocks.create).not.toHaveBeenCalled();
  });
});

describe("Quick Add analysis correctness", () => {
  it("sends extracted terms only and keeps structured user fields ahead of reordered AI fields", async () => {
    apiMocks.bulkPreview.mockResolvedValue({
      enrichment: { configured: true, provider: "test" },
      items: [
        { term: "barely", normalizedTerm: "barely", duplicate: false, status: "READY", suggestion: { meaningVi: "AI barely", partOfSpeech: "adjective", ipa: "/ˈberli/" } },
        { term: "abundantly", normalizedTerm: "abundantly", duplicate: false, status: "READY", suggestion: { meaningVi: "AI abundantly", partOfSpeech: "noun", synonyms: ["richly", "PLENTIFULLY"], ipa: "/əˈbʌndəntli/" } },
      ],
    } satisfies BulkVocabularyPreview);
    await renderAddPage();
    await changeQuickInput("abundantly = plentifully (adv)\nmột cách dồi dào.\n\nbarely: vừa đủ.");
    await analyze();
    await act(async () => { await Promise.resolve(); });

    expect(apiMocks.bulkPreview).toHaveBeenCalledWith("en", "abundantly\nbarely");
    const termInputs = Array.from(container.querySelectorAll<HTMLInputElement>(".quick-vocab-row input[type=text]"));
    expect(termInputs.filter((input) => ["abundantly", "barely"].includes(input.value)).map((input) => input.value)).toEqual(["abundantly", "barely"]);
    expect(Array.from(container.querySelectorAll<HTMLInputElement>("input[required]")).map((input) => input.value)).toEqual(["một cách dồi dào.", "vừa đủ."]);
    expect(container.querySelector<HTMLSelectElement>(".quick-vocab-row select")?.value).toBe("adverb");

    const details = Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find((button) => button.textContent?.includes("Chi tiết"))!;
    await act(async () => details.click());
    expect(container.querySelector<HTMLInputElement>('input[aria-label="Từ đồng nghĩa cho abundantly"]')?.value).toBe("plentifully, richly");
  });

  it("retains structured values when enrichment fails without weakening invalid classification", async () => {
    apiMocks.bulkPreview.mockRejectedValueOnce(new Error("quota exhausted"));
    await renderAddPage();
    await changeQuickInput("barely (adv): vừa đủ.");
    await analyze();
    await act(async () => { await Promise.resolve(); });
    expect(container.querySelector<HTMLInputElement>("input[required]")?.value).toBe("vừa đủ.");
    expect(container.querySelector<HTMLSelectElement>(".quick-vocab-row select")?.value).toBe("adverb");

    apiMocks.bulkPreview.mockResolvedValueOnce({
      enrichment: { configured: true, provider: "test" },
      items: [{ term: "noise", normalizedTerm: "noise", duplicate: false, status: "INVALID", suggestion: { meaningVi: "nhiễu", lexicalStatus: "INVALID", lexicalReason: "not lexical" } }],
    } satisfies BulkVocabularyPreview);
    await changeQuickInput("noise: nghĩa do người dùng nhập");
    await analyze();
    await act(async () => { await Promise.resolve(); });
    expect(container.querySelector<HTMLInputElement>('input[aria-label="Chọn từ noise"]')?.checked).toBe(false);
    expect(container.textContent).toContain("Không được chọn để lưu tự động");
  });

  it("invalidates an analyzed go preview and stale save action when source changes to car", async () => {
    apiMocks.bulkPreview.mockResolvedValue(previewResponse("go"));
    await renderAddPage();
    await changeQuickInput("go");
    await analyze();
    await act(async () => { await Promise.resolve(); });
    expect(previewTerm("go")).toBeDefined();
    expect(analyzeButton().textContent).toContain("Phân tích");

    await changeQuickInput("car");
    expect(previewTerm("go")).toBeUndefined();
    expect(Array.from(container.querySelectorAll("button")).some((button) => button.textContent?.includes("Lưu 1 từ"))).toBe(false);
    expect(apiMocks.bulkPreview).toHaveBeenCalledTimes(1);
  });

  it("invalidates an existing preview when learning language changes", async () => {
    apiMocks.bulkPreview.mockResolvedValue(previewResponse("go"));
    await renderAddPage();
    await changeQuickInput("go");
    await analyze();
    await act(async () => { await Promise.resolve(); });
    expect(previewTerm("go")).toBeDefined();

    const chinese = Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find((button) => button.textContent?.includes("Tiếng Trung"))!;
    await act(async () => chinese.click());
    expect(previewTerm("go")).toBeUndefined();
    expect(apiMocks.bulkPreview).toHaveBeenCalledTimes(1);
  });

  it("applies the latest response and ignores a late older success and its toast", async () => {
    const oldRequest = deferred<BulkVocabularyPreview>();
    const latestRequest = deferred<BulkVocabularyPreview>();
    apiMocks.bulkPreview.mockImplementationOnce(() => oldRequest.promise).mockImplementationOnce(() => latestRequest.promise);
    await renderAddPage();
    await changeQuickInput("go");
    await analyze();
    await changeQuickInput("car");
    await analyze();

    await act(async () => latestRequest.resolve(previewResponse("car", "xe hơi")));
    expect(previewTerm("car")).toBeDefined();
    expect(toastMocks.success).toHaveBeenCalledTimes(1);
    expect(toastMocks.success).toHaveBeenLastCalledWith("Đã nhận diện thành công 1 từ!");

    await act(async () => oldRequest.resolve(previewResponse("go", "đi")));
    expect(previewTerm("car")).toBeDefined();
    expect(previewTerm("go")).toBeUndefined();
    expect(toastMocks.success).toHaveBeenCalledTimes(1);
  });

  it("keeps only environment across rapid go, car, customer, environment analyses", async () => {
    const requests = Array.from({ length: 4 }, () => deferred<BulkVocabularyPreview>());
    for (const request of requests) apiMocks.bulkPreview.mockImplementationOnce(() => request.promise);
    await renderAddPage();
    for (const term of ["go", "car", "customer", "environment"]) {
      await changeQuickInput(term);
      await analyze();
    }

    await act(async () => requests[3].resolve(previewResponse("environment", "môi trường")));
    await act(async () => requests[1].resolve(previewResponse("car", "xe hơi")));
    await act(async () => requests[0].resolve(previewResponse("go", "đi")));
    await act(async () => requests[2].resolve(previewResponse("customer", "khách hàng")));

    expect(previewTerm("environment")).toBeDefined();
    expect(previewTerm("go")).toBeUndefined();
    expect(previewTerm("car")).toBeUndefined();
    expect(previewTerm("customer")).toBeUndefined();
    expect(toastMocks.success).toHaveBeenCalledTimes(1);
  });

  it("ignores a late older error without replacing the latest result or showing an error toast", async () => {
    const oldRequest = deferred<BulkVocabularyPreview>();
    const latestRequest = deferred<BulkVocabularyPreview>();
    apiMocks.bulkPreview.mockImplementationOnce(() => oldRequest.promise).mockImplementationOnce(() => latestRequest.promise);
    await renderAddPage();
    await changeQuickInput("go");
    await analyze();
    await changeQuickInput("car");
    await analyze();
    await act(async () => latestRequest.resolve(previewResponse("car", "xe hơi")));
    await act(async () => oldRequest.reject(new Error("old go failed")));

    expect(previewTerm("car")).toBeDefined();
    expect(previewTerm("go")).toBeUndefined();
    expect(toastMocks.error).not.toHaveBeenCalled();
  });

  it("does not let an older finally stop the newer loading indicator", async () => {
    const oldRequest = deferred<BulkVocabularyPreview>();
    const latestRequest = deferred<BulkVocabularyPreview>();
    apiMocks.bulkPreview.mockImplementationOnce(() => oldRequest.promise).mockImplementationOnce(() => latestRequest.promise);
    await renderAddPage();
    await changeQuickInput("go");
    await analyze();
    await changeQuickInput("car");
    await analyze();
    expect(analyzeButton().textContent).toContain("Đang tự động bổ sung");

    await act(async () => oldRequest.reject(new Error("old go failed")));
    expect(analyzeButton().textContent).toContain("Đang tự động bổ sung");

    await act(async () => latestRequest.resolve(previewResponse("car", "xe hơi")));
    expect(analyzeButton().textContent).toContain("Phân tích");
    expect(previewTerm("car")).toBeDefined();
  });

  it("applies a normal latest response", async () => {
    apiMocks.bulkPreview.mockResolvedValue(previewResponse("customer", "khách hàng"));
    await renderAddPage();
    await changeQuickInput("customer");
    await analyze();
    await act(async () => { await Promise.resolve(); });

    expect(previewTerm("customer")).toBeDefined();
    expect(Array.from(container.querySelectorAll<HTMLInputElement>('input[required]')).some((input) => input.value === "khách hàng")).toBe(true);
    expect(toastMocks.success).toHaveBeenCalledTimes(1);
  });

  it("keeps manual preview-row editing within the current analysis", async () => {
    apiMocks.bulkPreview.mockResolvedValue(previewResponse("go", "đi"));
    await renderAddPage();
    await changeQuickInput("go");
    await analyze();
    await act(async () => { await Promise.resolve(); });
    const meaning = container.querySelector<HTMLInputElement>('input[required]')!;
    await act(async () => {
      setNativeInputValue(meaning, "di chuyển");
      meaning.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "di chuyển" }));
    });

    expect(previewTerm("go")).toBeDefined();
    expect(container.querySelector<HTMLInputElement>('input[required]')?.value).toBe("di chuyển");
    expect(apiMocks.bulkPreview).toHaveBeenCalledTimes(1);
  });
});

describe("Quick Add topics", () => {
  it("normalizes topic labels case-insensitively", () => {
    expect(mergeQuickTopics(["Business"], [" business ", "BUSINESS", "TOEIC"])).toEqual(["Business", "TOEIC"]);
  });

  it("searches and assigns one existing topic to an individual word", async () => {
    apiMocks.bulkPreview.mockResolvedValue(previewResponse("go"));
    apiMocks.list.mockResolvedValue([{ ...vocabularyItem(1), topics: ["Business"] }]);
    await renderAddPage();
    await changeQuickInput("go");
    await analyze();
    await act(async () => { await Promise.resolve(); });
    await act(async () => container.querySelector<HTMLButtonElement>('button[aria-label="Thêm chủ đề cho go"]')!.click());
    await act(async () => { await Promise.resolve(); });

    const search = container.querySelector<HTMLInputElement>('input[aria-label="Tìm hoặc tạo chủ đề"]')!;
    await act(async () => {
      setNativeInputValue(search, "bus");
      search.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "bus" }));
    });
    await act(async () => container.querySelector<HTMLInputElement>('input[aria-label="Chọn chủ đề Business"]')!.click());
    await act(async () => Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find((button) => button.textContent?.trim() === "Áp dụng chủ đề")!.click());
    expect(container.querySelector('button[aria-label="Gỡ chủ đề Business khỏi go"]')).not.toBeNull();
  });

  it("creates and assigns multiple topics only to selected rows, removes one, and saves topics[]", async () => {
    apiMocks.bulkPreview.mockResolvedValue(previewResponseMany(["go", "car", "live"]));
    apiMocks.bulkCreate.mockResolvedValue({ mode: "PARTIAL", created: [], existing: [], failed: [] });
    await renderAddPage();
    await changeQuickInput("go, car, live");
    await analyze();
    await act(async () => { await Promise.resolve(); });

    await act(async () => container.querySelector<HTMLInputElement>('input[aria-label="Chọn từ car"]')!.click());
    const batchTopicButton = Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find((button) => button.textContent?.trim() === "Thêm vào chủ đề")!;
    await act(async () => batchTopicButton.click());
    await act(async () => { await Promise.resolve(); });

    const topicInput = container.querySelector<HTMLInputElement>('input[aria-label="Tìm hoặc tạo chủ đề"]')!;
    await act(async () => {
      setNativeInputValue(topicInput, "Business");
      topicInput.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "Business" }));
    });
    expect(apiMocks.bulkCreate).not.toHaveBeenCalled();
    expect(apiMocks.create).not.toHaveBeenCalled();
    await act(async () => Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find((button) => button.textContent?.includes("Tạo chủ đề mới"))!.click());

    const refreshedTopicInput = container.querySelector<HTMLInputElement>('input[aria-label="Tìm hoặc tạo chủ đề"]')!;
    await act(async () => {
      setNativeInputValue(refreshedTopicInput, "TOEIC");
      refreshedTopicInput.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "TOEIC" }));
    });
    await act(async () => Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find((button) => button.textContent?.includes("Tạo chủ đề mới"))!.click());
    await act(async () => Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find((button) => button.textContent?.trim() === "Áp dụng chủ đề")!.click());

    expect(container.querySelector('button[aria-label="Gỡ chủ đề Business khỏi go"]')).not.toBeNull();
    expect(container.querySelector('button[aria-label="Gỡ chủ đề TOEIC khỏi go"]')).not.toBeNull();
    expect(container.querySelector('button[aria-label="Gỡ chủ đề Business khỏi live"]')).not.toBeNull();
    expect(container.querySelector('button[aria-label="Gỡ chủ đề Business khỏi car"]')).toBeNull();

    await act(async () => container.querySelector<HTMLButtonElement>('button[aria-label="Gỡ chủ đề Business khỏi go"]')!.click());
    expect(container.querySelector('button[aria-label="Gỡ chủ đề Business khỏi go"]')).toBeNull();
    expect(container.querySelector('button[aria-label="Gỡ chủ đề TOEIC khỏi go"]')).not.toBeNull();

    const saveButton = Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find((button) => button.textContent?.includes("Lưu 2 từ vào kho"))!;
    await act(async () => saveButton.click());
    await act(async () => { await Promise.resolve(); });
    const [, payload] = apiMocks.bulkCreate.mock.calls[0]!;
    expect(payload).toHaveLength(2);
    expect(payload[0]).toMatchObject({ term: "go", topic: "TOEIC", topics: ["TOEIC"] });
    expect(payload[1]).toMatchObject({ term: "live", topic: "Business", topics: ["Business", "TOEIC"] });
  });

  it("keeps AI topic suggestions out of assigned topics and the save payload until accepted", async () => {
    apiMocks.bulkPreview.mockResolvedValue(previewResponseWithSuggestedTopics("go", ["Business"], "TOEIC"));
    apiMocks.bulkCreate.mockResolvedValue({ mode: "PARTIAL", created: [], existing: [], failed: [] });
    await renderAddPage();
    await changeQuickInput("go");
    await analyze();
    await act(async () => { await Promise.resolve(); });

    expect(container.querySelector('button[aria-label="Gỡ chủ đề Business khỏi go"]')).toBeNull();
    expect(container.querySelector('button[aria-label="Gỡ chủ đề TOEIC khỏi go"]')).toBeNull();
    expect(container.querySelector('button[aria-label="Thêm gợi ý chủ đề Business cho go"]')).not.toBeNull();
    expect(container.querySelector('button[aria-label="Thêm gợi ý chủ đề TOEIC cho go"]')).not.toBeNull();

    await act(async () => saveButton().click());
    const [, payload] = apiMocks.bulkCreate.mock.calls[0]!;
    expect(payload).toHaveLength(1);
    expect(payload[0]).toMatchObject({ term: "go", topics: [] });
    expect(payload[0].topic).toBeUndefined();
  });

  it("accepts a suggested topic locally and includes it only after the normal Save flow", async () => {
    apiMocks.bulkPreview.mockResolvedValue(previewResponseWithSuggestedTopics("go", ["Business"]));
    apiMocks.bulkCreate.mockResolvedValue({ mode: "PARTIAL", created: [], existing: [], failed: [] });
    await renderAddPage();
    await changeQuickInput("go");
    await analyze();
    await act(async () => { await Promise.resolve(); });

    await act(async () => container.querySelector<HTMLButtonElement>('button[aria-label="Thêm gợi ý chủ đề Business cho go"]')!.click());
    expect(container.querySelector('button[aria-label="Gỡ chủ đề Business khỏi go"]')).not.toBeNull();
    expect(container.querySelector('button[aria-label="Thêm gợi ý chủ đề Business cho go"]')).toBeNull();
    expect(apiMocks.bulkCreate).not.toHaveBeenCalled();
    expect(apiMocks.create).not.toHaveBeenCalled();

    await act(async () => saveButton().click());
    const [, payload] = apiMocks.bulkCreate.mock.calls[0]!;
    expect(payload[0]).toMatchObject({ term: "go", topic: "Business", topics: ["Business"] });
  });

  it("lets a user dismiss or ignore a suggestion without changing assigned-topic payload", async () => {
    apiMocks.bulkPreview.mockResolvedValue(previewResponseWithSuggestedTopics("go", ["Business"]));
    apiMocks.bulkCreate.mockResolvedValue({ mode: "PARTIAL", created: [], existing: [], failed: [] });
    await renderAddPage();
    await changeQuickInput("go");
    await analyze();
    await act(async () => { await Promise.resolve(); });

    await act(async () => container.querySelector<HTMLButtonElement>('button[aria-label="Bỏ gợi ý chủ đề Business cho go"]')!.click());
    expect(container.querySelector('button[aria-label="Thêm gợi ý chủ đề Business cho go"]')).toBeNull();
    expect(apiMocks.bulkCreate).not.toHaveBeenCalled();
    expect(apiMocks.create).not.toHaveBeenCalled();

    await act(async () => saveButton().click());
    const [, payload] = apiMocks.bulkCreate.mock.calls[0]!;
    expect(payload[0]).toMatchObject({ term: "go", topics: [] });
    expect(payload[0].topic).toBeUndefined();
  });

  it("preserves assigned and accepted topics while retrying enrichment, and refreshes deduped suggestions", async () => {
    apiMocks.bulkPreview
      .mockResolvedValueOnce({
        enrichment: { configured: true, provider: "test" },
        items: [{
          term: "go", normalizedTerm: "go", duplicate: true, status: "EXISTS",
          suggestion: { meaningVi: "đi", partOfSpeech: "verb", ipa: "/ɡoʊ/", needsRepair: true, suggestedTopics: ["Business"] },
        }],
      } satisfies BulkVocabularyPreview)
      .mockResolvedValueOnce(previewResponseWithSuggestedTopics("go", ["Business", "Work", "TOEIC"]));
    apiMocks.bulkCreate.mockResolvedValue({ mode: "PARTIAL", created: [], existing: [], failed: [] });
    await renderAddPage();
    await changeQuickInput("go");
    await analyze();
    await act(async () => { await Promise.resolve(); });

    await act(async () => container.querySelector<HTMLButtonElement>('button[aria-label="Thêm gợi ý chủ đề Business cho go"]')!.click());
    await act(async () => container.querySelector<HTMLButtonElement>('button[aria-label="Thêm chủ đề cho go"]')!.click());
    const topicInput = container.querySelector<HTMLInputElement>('input[aria-label="Tìm hoặc tạo chủ đề"]')!;
    await act(async () => {
      setNativeInputValue(topicInput, "Work");
      topicInput.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "Work" }));
    });
    await act(async () => Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find((button) => button.textContent?.includes("Tạo chủ đề mới"))!.click());
    await act(async () => Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find((button) => button.textContent?.trim() === "Áp dụng chủ đề")!.click());
    expect(container.querySelector('button[aria-label="Gỡ chủ đề Business khỏi go"]')).not.toBeNull();
    expect(container.querySelector('button[aria-label="Gỡ chủ đề Work khỏi go"]')).not.toBeNull();

    await act(async () => Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find((button) => button.textContent?.includes("Cập nhật bằng AI"))!.click());
    await act(async () => { await Promise.resolve(); });

    expect(apiMocks.bulkPreview).toHaveBeenLastCalledWith("en", "go", true);
    expect(container.querySelector('button[aria-label="Gỡ chủ đề Business khỏi go"]')).not.toBeNull();
    expect(container.querySelector('button[aria-label="Gỡ chủ đề Work khỏi go"]')).not.toBeNull();
    expect(container.querySelector('button[aria-label="Thêm gợi ý chủ đề Business cho go"]')).toBeNull();
    expect(container.querySelector('button[aria-label="Thêm gợi ý chủ đề Work cho go"]')).toBeNull();
    expect(container.querySelector('button[aria-label="Thêm gợi ý chủ đề TOEIC cho go"]')).not.toBeNull();

    await act(async () => saveButton().click());
    const [, payload] = apiMocks.bulkCreate.mock.calls[0]!;
    expect(payload[0]).toMatchObject({ term: "go", topic: "Business", topics: ["Business", "Work"] });
  });
});

describe("Vocabulary card render isolation", () => {
  it("does not rerender 100 unchanged cards while a collection draft is typed", async () => {
    const onRender = vi.fn();
    await act(async () => root.render(<VocabularyGridHarness onRender={onRender} />));
    expect(onRender).toHaveBeenCalledTimes(100);
    const draft = container.querySelector<HTMLInputElement>('input[aria-label="collection draft"]')!;
    await act(async () => {
      setNativeInputValue(draft, "Business words");
      draft.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "words" }));
    });
    expect(draft.value).toBe("Business words");
    expect(onRender).toHaveBeenCalledTimes(100);
  });
});
