import {
  LOCAL_PRONUNCIATION_MODEL_DOWNLOAD_BYTES,
  LOCAL_PRONUNCIATION_MODEL_ID,
  LOCAL_PRONUNCIATION_MODEL_REVISION,
  LOCAL_PRONUNCIATION_MODEL_VERSION,
  scoreLocalEnglishPronunciation,
  type LocalPronunciationAnalysis,
} from "./localPronunciationScoring.js";

export { LOCAL_PRONUNCIATION_MODEL_DOWNLOAD_BYTES, LOCAL_PRONUNCIATION_MODEL_ID, LOCAL_PRONUNCIATION_MODEL_REVISION, LOCAL_PRONUNCIATION_MODEL_VERSION };

export interface LocalPronunciationProgress {
  phase: "download" | "load" | "analyze" | "ready";
  loaded?: number;
  total?: number;
}

type WorkerRequest = { id: number; type: "transcribe"; audio: Float32Array; config: LocalPronunciationModelConfig };
type WorkerResponse = { id: number; type: "progress" | "result" | "error"; progress?: LocalPronunciationProgress; text?: string; message?: string };
type PendingRequest = { resolve: (text: string) => void; reject: (reason?: unknown) => void; onProgress?: (progress: LocalPronunciationProgress) => void; abort?: () => void };

export interface LocalPronunciationModelConfig {
  id: typeof LOCAL_PRONUNCIATION_MODEL_ID;
  revision: typeof LOCAL_PRONUNCIATION_MODEL_REVISION;
  version: typeof LOCAL_PRONUNCIATION_MODEL_VERSION;
  dtype: "q4";
}

export function getLocalPronunciationModelConfig(): LocalPronunciationModelConfig {
  return { id: LOCAL_PRONUNCIATION_MODEL_ID, revision: LOCAL_PRONUNCIATION_MODEL_REVISION, version: LOCAL_PRONUNCIATION_MODEL_VERSION, dtype: "q4" };
}

let worker: Worker | null = null;
let requestId = 0;
const pending = new Map<number, PendingRequest>();

function localWorker(): Worker {
  if (worker) return worker;
  if (typeof Worker === "undefined") throw new Error("Trình duyệt này không hỗ trợ Web Worker để phân tích luyện đọc cục bộ.");
  worker = new Worker(new URL("./localPronunciation.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const message = event.data;
    const task = pending.get(message.id);
    if (!task) return;
    if (message.type === "progress" && message.progress) {
      task.onProgress?.(message.progress);
      return;
    }
    pending.delete(message.id);
    if (message.type === "result" && typeof message.text === "string") task.resolve(message.text);
    else task.reject(new Error(message.message || "Không thể phân tích giọng đọc trên thiết bị."));
  };
  worker.onerror = () => {
    for (const task of pending.values()) task.reject(new Error("Local ASR worker đã dừng. Hãy tải lại trang rồi thử lại."));
    pending.clear();
    worker?.terminate();
    worker = null;
  };
  return worker;
}

function aborted(): DOMException { return new DOMException("Đã hủy phân tích bản ghi cũ.", "AbortError"); }

export function transcribeLocalEnglishAudio(
  audio: Float32Array,
  options: { signal?: AbortSignal; onProgress?: (progress: LocalPronunciationProgress) => void } = {},
): Promise<string> {
  if (options.signal?.aborted) return Promise.reject(aborted());
  const id = ++requestId;
  return new Promise<string>((resolve, reject) => {
    const task: PendingRequest = { resolve, reject, onProgress: options.onProgress };
    const cancel = () => {
      if (!pending.delete(id)) return;
      reject(aborted());
    };
    task.abort = cancel;
    options.signal?.addEventListener("abort", cancel, { once: true });
    pending.set(id, task);
    localWorker().postMessage({ id, type: "transcribe", audio, config: getLocalPronunciationModelConfig() } satisfies WorkerRequest, [audio.buffer]);
  });
}

export async function decodeAndResampleRecording(blob: Blob, signal?: AbortSignal): Promise<{ samples: Float32Array; durationSeconds: number }> {
  if (signal?.aborted) throw aborted();
  const AudioContextConstructor = globalThis.AudioContext || (globalThis as typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) throw new Error("Trình duyệt không hỗ trợ giải mã bản ghi âm cục bộ.");
  const context = new AudioContextConstructor();
  try {
    const decoded = await context.decodeAudioData(await blob.arrayBuffer());
    if (signal?.aborted) throw aborted();
    const source = decoded.getChannelData(0);
    const targetRate = 16_000;
    const targetLength = Math.max(1, Math.round(decoded.duration * targetRate));
    const samples = new Float32Array(targetLength);
    const ratio = decoded.sampleRate / targetRate;
    for (let index = 0; index < targetLength; index += 1) {
      const sourceIndex = index * ratio;
      const lower = Math.floor(sourceIndex);
      const upper = Math.min(lower + 1, source.length - 1);
      const fraction = sourceIndex - lower;
      samples[index] = (source[lower] ?? 0) * (1 - fraction) + (source[upper] ?? 0) * fraction;
    }
    return { samples, durationSeconds: decoded.duration };
  } finally {
    await context.close();
  }
}

export async function analyzeLocalEnglishRecording(input: {
  blob: Blob;
  expectedText: string;
  signal?: AbortSignal;
  onProgress?: (progress: LocalPronunciationProgress) => void;
}): Promise<LocalPronunciationAnalysis> {
  const decoded = await decodeAndResampleRecording(input.blob, input.signal);
  input.onProgress?.({ phase: "analyze" });
  const recognizedText = await transcribeLocalEnglishAudio(decoded.samples, { signal: input.signal, onProgress: input.onProgress });
  if (input.signal?.aborted) throw aborted();
  return scoreLocalEnglishPronunciation({ expectedText: input.expectedText, recognizedText, durationSeconds: decoded.durationSeconds });
}

/** Test-only lifecycle reset. Runtime keeps one model session in one Worker. */
export function __resetLocalPronunciationForTests(): void {
  for (const task of pending.values()) task.reject(new Error("test reset"));
  pending.clear();
  worker?.terminate();
  worker = null;
  requestId = 0;
}
