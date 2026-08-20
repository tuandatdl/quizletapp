/** @vitest-environment jsdom */

import React, { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Modal } from "../src/frontend/components/ui/Modal.js";
import type { VocabularyCollection, VocabularyItem } from "../src/frontend/types/api.js";

const apiMocks = vi.hoisted(() => ({
  list: vi.fn(),
  update: vi.fn(),
  favorite: vi.fn(),
  deleteVocabulary: vi.fn(),
  listCollections: vi.fn(),
  createCollection: vi.fn(),
  renameCollection: vi.fn(),
  deleteCollection: vi.fn(),
}));

vi.mock("../src/frontend/api/vocabulary.api.js", () => ({
  vocabularyApi: {
    list: apiMocks.list,
    update: apiMocks.update,
    favorite: apiMocks.favorite,
    delete: apiMocks.deleteVocabulary,
  },
  collectionApi: {
    list: apiMocks.listCollections,
    create: apiMocks.createCollection,
    rename: apiMocks.renameCollection,
    delete: apiMocks.deleteCollection,
  },
}));

vi.mock("../src/frontend/context/LanguageContext.js", () => ({
  useLanguage: () => ({ language: "en", settings: null }),
}));

vi.mock("../src/frontend/context/ToastContext.js", () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}));

import { VocabularyListPage } from "../src/frontend/pages/vocabulary/VocabularyListPage.js";

let container: HTMLDivElement;
let root: Root;
let nextFrameId: number;

function setNativeInputValue(input: HTMLInputElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
}

async function enterContinuously(input: HTMLInputElement, text: string, composing = false): Promise<void> {
  input.focus();
  await act(async () => {
    setNativeInputValue(input, "");
    input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "deleteContentBackward", data: null }));
  });
  expect(document.activeElement).toBe(input);

  if (composing) input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true, data: "" }));
  let value = "";
  for (const character of text) {
    value += character;
    await act(async () => {
      setNativeInputValue(input, value);
      input.dispatchEvent(new InputEvent("input", {
        bubbles: true,
        inputType: "insertText",
        data: character,
        isComposing: composing,
      }));
    });
    expect(input.value).toBe(value);
    expect(document.activeElement).toBe(input);
  }
  if (composing) input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: text }));
}

function ControlledModal(): React.ReactElement {
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <input aria-label="Input A" value={first} onChange={(event) => setFirst(event.target.value)} />
      <input aria-label="Input B" value={second} onChange={(event) => setSecond(event.target.value)} />
    </Modal>
  );
}

function AccessibleModal({ onClose }: { onClose: () => void }): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>Mở</button>
      <Modal isOpen={isOpen} onClose={() => { onClose(); setIsOpen(false); }}>
        <input aria-label="Đầu" />
        <button type="button">Cuối</button>
      </Modal>
    </>
  );
}

function vocabularyItem(): VocabularyItem {
  const now = "2026-08-20T00:00:00.000Z";
  return {
    id: "customer-id", userId: "local-user", language: "en", term: "customer", normalizedTerm: "customer",
    pronunciation: "/ˈkʌstəmər/", meaningVi: "khách hàng", partOfSpeech: "noun", example: "The customer waits.",
    exampleTranslation: "Khách hàng đang chờ.", topic: "Business", topics: ["Business"], collectionIds: ["test-ui"],
    level: "B1", note: null, source: "MANUAL", sourceReadingId: null, audioUrl: null, audioAvailable: false,
    favorite: false, metadata: { ipa: "/ˈkʌstəmər/", cefr: "B1" }, createdAt: now, updatedAt: now,
    progress: { status: "NEW", ease: 2.5, intervalDays: 0, repetitions: 0, nextReviewAt: null, lastReviewedAt: null, correctCount: 0, incorrectCount: 0 },
  };
}

const collection: VocabularyCollection = {
  id: "test-ui", userId: "local-user", name: "TEST UI", normalizedName: "test ui",
  createdAt: "2026-08-20T00:00:00.000Z", updatedAt: "2026-08-20T00:00:00.000Z",
};

async function renderVocabularyPage(): Promise<void> {
  apiMocks.list.mockResolvedValue([vocabularyItem()]);
  apiMocks.listCollections.mockResolvedValue([collection]);
  await act(async () => {
    root.render(<MemoryRouter><VocabularyListPage /></MemoryRouter>);
    await Promise.resolve();
  });
  await act(async () => { await Promise.resolve(); });
}

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  nextFrameId = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    const id = ++nextFrameId;
    callback(performance.now());
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.clearAllMocks();
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  document.body.style.overflow = "";
  vi.unstubAllGlobals();
});

describe("Modal focus lifecycle", () => {
  it("keeps a controlled input focused across value changes and new onClose identities", async () => {
    await act(async () => root.render(<ControlledModal />));
    const inputB = container.querySelector<HTMLInputElement>('input[aria-label="Input B"]')!;
    await enterContinuously(inputB, "abcdef");
    expect(inputB.value).toBe("abcdef");
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
  });

  it("preserves Vietnamese composition input without losing focus", async () => {
    await act(async () => root.render(<ControlledModal />));
    const inputB = container.querySelector<HTMLInputElement>('input[aria-label="Input B"]')!;
    await enterContinuously(inputB, "khách hàng đang chờ", true);
    expect(inputB.value).toBe("khách hàng đang chờ");
  });

  it("preserves focus trap, Escape close, body lock and return focus", async () => {
    const onClose = vi.fn();
    await act(async () => root.render(<AccessibleModal onClose={onClose} />));
    const trigger = container.querySelector<HTMLButtonElement>("button")!;
    trigger.focus();
    await act(async () => trigger.click());
    const first = container.querySelector<HTMLInputElement>('input[aria-label="Đầu"]')!;
    const last = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find((button) => button.textContent === "Cuối")!;
    expect(document.activeElement).toBe(first);
    expect(document.body.style.overflow).toBe("hidden");

    last.focus();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect(document.activeElement).toBe(first);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true }));
    expect(document.activeElement).toBe(last);

    await act(async () => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("");
  });

  it("does not let delayed autofocus steal user focus and cancels its frame", async () => {
    let scheduled: FrameRequestCallback | undefined;
    const cancel = vi.fn();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { scheduled = callback; return 71; });
    vi.stubGlobal("cancelAnimationFrame", cancel);
    await act(async () => root.render(<ControlledModal />));
    const inputB = container.querySelector<HTMLInputElement>('input[aria-label="Input B"]')!;
    inputB.focus();
    scheduled?.(performance.now());
    expect(document.activeElement).toBe(inputB);
    await act(async () => root.unmount());
    expect(cancel).toHaveBeenCalledWith(71);
    root = createRoot(container);
  });
});

describe("Vocabulary editing focus", () => {
  it("accepts full edit strings continuously and saves only on explicit submit", async () => {
    await renderVocabularyPage();
    const edit = container.querySelector<HTMLButtonElement>('button[aria-label="Sửa từ vựng"]')!;
    await act(async () => edit.click());
    const dialog = container.querySelector<HTMLElement>('[role="dialog"]')!;
    const meaning = dialog.querySelector<HTMLInputElement>('input[required]')!;
    const topics = dialog.querySelector<HTMLInputElement>('input[placeholder="Giao tiếp, Công việc"]')!;
    const exampleTranslation = Array.from(dialog.querySelectorAll<HTMLInputElement>('input')).find((input) => input.value === "Khách hàng đang chờ.")!;

    await enterContinuously(meaning, "khách hàng thử nghiệm", true);
    await enterContinuously(topics, "Business, Shopping");
    await enterContinuously(exampleTranslation, "Khách hàng đang chờ đơn hàng.", true);

    expect(meaning.value).toBe("khách hàng thử nghiệm");
    expect(topics.value).toBe("Business, Shopping");
    expect(exampleTranslation.value).toBe("Khách hàng đang chờ đơn hàng.");
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    expect(apiMocks.update).not.toHaveBeenCalled();
  });

  it("keeps the collection rename input mounted and focused during continuous editing", async () => {
    await renderVocabularyPage();
    const rename = container.querySelector<HTMLInputElement>('input[aria-label="Tên bộ sưu tập TEST UI"]')!;
    await enterContinuously(rename, "TEST UI 2 ABC");
    expect(rename.value).toBe("TEST UI 2 ABC");
    expect(document.activeElement).toBe(rename);
    expect(apiMocks.renameCollection).not.toHaveBeenCalled();
  });
});
