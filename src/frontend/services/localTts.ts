import { getCachedAudio, setCachedAudio } from "./cloudTts.js";

export const LOCAL_ENGLISH_MODEL_ID = "en_US-lessac-medium";
export const LOCAL_ENGLISH_MODEL_SIZE_BYTES = 63_201_294;
const CACHE_NAME = "tutrinh-local-tts-models-v1";

export interface LocalEnglishModelConfig {
  id: typeof LOCAL_ENGLISH_MODEL_ID;
  version: string;
  modelUrl: string;
  configUrl: string;
  expectedBytes: number;
  expectedSha256?: string;
}

export interface LocalModelStatus {
  supported: boolean;
  cached: boolean;
  modelName: string;
  version: string;
  approximateSizeBytes: number;
}

export interface LocalTtsProgress {
  phase: "download" | "load" | "ready";
  loaded?: number;
  total?: number;
}

interface WorkerRequest {
  id: number;
  type: "prepare" | "synthesize" | "remove";
  text?: string;
  config: LocalEnglishModelConfig;
}

interface WorkerResponse {
  id: number;
  type: "progress" | "result" | "error";
  progress?: LocalTtsProgress;
  blob?: Blob;
  message?: string;
}

type PendingRequest = {
  resolve: (value: Blob | void) => void;
  reject: (reason?: unknown) => void;
  onProgress?: (progress: LocalTtsProgress) => void;
};

const DEFAULT_MODEL_URL =
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx?download=true";
const DEFAULT_CONFIG_URL =
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json?download=true";

export function getLocalEnglishModelConfig(): LocalEnglishModelConfig {
  return {
    id: LOCAL_ENGLISH_MODEL_ID,
    version: import.meta.env.VITE_LOCAL_TTS_EN_MODEL_VERSION || "lessac-medium-2026-08",
    modelUrl: import.meta.env.VITE_LOCAL_TTS_EN_MODEL_URL || DEFAULT_MODEL_URL,
    configUrl: import.meta.env.VITE_LOCAL_TTS_EN_CONFIG_URL || DEFAULT_CONFIG_URL,
    expectedBytes: LOCAL_ENGLISH_MODEL_SIZE_BYTES,
    expectedSha256: import.meta.env.VITE_LOCAL_TTS_EN_MODEL_SHA256 || undefined,
  };
}

function cacheRequest(config: LocalEnglishModelConfig, resource: "model" | "config"): Request {
  const source = encodeURIComponent(`${config.modelUrl}|${config.configUrl}`);
  return new Request(`https://local-tts-cache.invalid/en/${encodeURIComponent(config.version)}/${source}/${resource}`);
}

async function modelCache(): Promise<Cache | null> {
  if (typeof caches === "undefined") return null;
  return caches.open(CACHE_NAME);
}

export async function getLocalEnglishModelStatus(): Promise<LocalModelStatus> {
  const config = getLocalEnglishModelConfig();
  try {
    const cache = await modelCache();
    const [model, modelConfig] = await Promise.all([
      cache?.match(cacheRequest(config, "model")),
      cache?.match(cacheRequest(config, "config")),
    ]);
    const modelSize = Number(model?.headers.get("content-length") || 0);
    return {
      supported: typeof Worker !== "undefined" && typeof caches !== "undefined",
      cached: Boolean(model && modelConfig && modelSize >= config.expectedBytes),
      modelName: config.id,
      version: config.version,
      approximateSizeBytes: config.expectedBytes,
    };
  } catch {
    return {
      supported: false,
      cached: false,
      modelName: config.id,
      version: config.version,
      approximateSizeBytes: config.expectedBytes,
    };
  }
}

let worker: Worker | null = null;
let requestId = 0;
const pending = new Map<number, PendingRequest>();

function localWorker(): Worker {
  if (worker) return worker;
  if (typeof Worker === "undefined") throw new Error("Trình duyệt này không hỗ trợ Local TTS. Hãy dùng AUTO, CLOUD hoặc BROWSER.");
  worker = new Worker(new URL("./localTts.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const message = event.data;
    const task = pending.get(message.id);
    if (!task) return;
    if (message.type === "progress" && message.progress) {
      task.onProgress?.(message.progress);
      return;
    }
    pending.delete(message.id);
    if (message.type === "result") task.resolve(message.blob);
    else task.reject(new Error(message.message || "Không thể tải hoặc khởi tạo Local TTS. Hãy kiểm tra mạng rồi thử tải lại model."));
  };
  worker.onerror = () => {
    for (const task of pending.values()) task.reject(new Error("Local TTS worker đã dừng. Hãy tải lại model hoặc chọn AUTO."));
    pending.clear();
    worker?.terminate();
    worker = null;
  };
  return worker;
}

function runWorker(type: WorkerRequest["type"], text?: string, onProgress?: PendingRequest["onProgress"]): Promise<Blob | void> {
  const id = ++requestId;
  return new Promise<Blob | void>((resolve, reject) => {
    pending.set(id, { resolve, reject, onProgress });
    localWorker().postMessage({ id, type, text, config: getLocalEnglishModelConfig() } satisfies WorkerRequest);
  });
}

export async function downloadLocalEnglishModel(onProgress?: (progress: LocalTtsProgress) => void): Promise<void> {
  if ((await getLocalEnglishModelStatus()).cached) {
    onProgress?.({ phase: "ready" });
    return;
  }
  await runWorker("prepare", undefined, onProgress);
}

export async function removeLocalEnglishModel(): Promise<void> {
  if (typeof caches !== "undefined" && typeof caches.delete === "function") {
    await caches.delete(CACHE_NAME);
  } else {
    const config = getLocalEnglishModelConfig();
    const cache = await modelCache();
    await Promise.all([
      cache?.delete(cacheRequest(config, "model")),
      cache?.delete(cacheRequest(config, "config")),
    ]);
  }
  if (worker) {
    await runWorker("remove");
    worker.terminate();
    worker = null;
  }
}

function localAudioCacheKey(text: string, speed: number, config = getLocalEnglishModelConfig()): string {
  return `local-v1:en:${config.id}:${config.version}:${speed}:${text.trim().replace(/\s+/gu, " ").toLowerCase()}`;
}

export async function synthesizeLocalEnglishSpeech(options: {
  text: string;
  speed: number;
  signal?: AbortSignal;
  onProgress?: (progress: LocalTtsProgress) => void;
}): Promise<Blob> {
  const text = options.text.trim();
  if (!text) throw new TypeError("Văn bản phát âm không được để trống.");
  if (options.signal?.aborted) throw new DOMException("Đã hủy Local TTS.", "AbortError");

  const cacheKey = localAudioCacheKey(text, options.speed);
  const cached = await getCachedAudio(cacheKey);
  if (cached) return cached;

  const request = runWorker("synthesize", text, options.onProgress) as Promise<Blob>;
  const abort = new Promise<never>((_, reject) => {
    options.signal?.addEventListener("abort", () => reject(new DOMException("Đã hủy Local TTS.", "AbortError")), { once: true });
  });
  const blob = await Promise.race([request, abort]);
  if (!blob || blob.size === 0) throw new Error("Local TTS trả về audio rỗng. Hãy xóa model và tải lại.");
  await setCachedAudio(cacheKey, blob);
  return blob;
}

/** Test-only lifecycle reset; production callers use the settings cache controls. */
export function __resetLocalTtsForTests(): void {
  for (const task of pending.values()) task.reject(new Error("test reset"));
  pending.clear();
  worker?.terminate();
  worker = null;
  requestId = 0;
}
