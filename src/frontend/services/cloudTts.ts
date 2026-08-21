import type { Language } from "../types/api.js";
import { getLanguageApiUrl } from "../runtime/runtime.js";

const DB_NAME = "tutrinh_tts_cache";
const DB_VERSION = 1;
const STORE_NAME = "audio_blobs";
const MAX_CACHE_ENTRIES = 200;

export interface CloudVoiceOption {
  id: string;
  label: string;
  description: string;
}

export const CLOUD_VOICES_EN: CloudVoiceOption[] = [
  { id: "aura-asteria-en", label: "Natural 1 (Khuyên dùng)", description: "Giọng nữ tự nhiên, rõ ràng, truyền cảm" },
  { id: "aura-luna-en", label: "Natural 2", description: "Giọng nữ thanh lịch, tốc độ ổn định" },
  { id: "aura-athena-en", label: "Natural 3", description: "Giọng nữ đĩnh đạc, phát âm chuẩn xác" },
  { id: "aura-orion-en", label: "Natural 4", description: "Giọng nam trầm ấm, tự nhiên" },
];

export const DEFAULT_CLOUD_VOICE_EN = "aura-asteria-en";

export function computeTtsCacheKey(language: Language, text: string, voice?: string): string {
  const normText = text.trim();
  const effectiveVoice = voice || (language === "en" ? DEFAULT_CLOUD_VOICE_EN : "default");
  const normVoice = effectiveVoice.toLowerCase();
  return `v1:${language}:${normVoice}:${normText}`;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getTtsDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB không khả dụng"));
  }
  if (!dbPromise) {
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "key" });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

export async function getCachedAudio(key: string): Promise<Blob | null> {
  try {
    const db = await getTtsDb();
    return await new Promise<Blob | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        const record = req.result;
        if (record && record.blob instanceof Blob && record.blob.size > 0) {
          resolve(record.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setCachedAudio(key: string, blob: Blob): Promise<void> {
  if (!blob || !(blob instanceof Blob) || blob.size === 0) return;
  try {
    const db = await getTtsDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put({ key, blob, timestamp: Date.now() });

      // Evict oldest if exceeding limit
      const index = store.index("timestamp");
      const countReq = store.count();
      countReq.onsuccess = () => {
        if (countReq.result > MAX_CACHE_ENTRIES) {
          const excess = countReq.result - MAX_CACHE_ENTRIES;
          let deleted = 0;
          index.openCursor().onsuccess = (e) => {
            const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor && deleted < excess) {
              cursor.delete();
              deleted++;
              cursor.continue();
            }
          };
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {}
}

const inFlightRequests = new Map<string, Promise<Blob>>();

export function clearInFlightTtsRequestsForTesting(): void {
  inFlightRequests.clear();
}

export function getInFlightTtsRequestCountForTesting(): number {
  return inFlightRequests.size;
}

export interface SynthesizeCloudSpeechOptions {
  text: string;
  language: Language;
  voice?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export async function synthesizeCloudSpeech(options: SynthesizeCloudSpeechOptions): Promise<Blob> {
  const { text, language, voice, signal, timeoutMs } = options;
  const trimmed = text.trim();
  if (!trimmed) {
    throw new TypeError("Văn bản phát âm không được để trống.");
  }

  if (signal?.aborted) {
    throw signal.reason || new DOMException("Aborted", "AbortError");
  }

  const effectiveVoice = voice || (language === "en" ? DEFAULT_CLOUD_VOICE_EN : undefined);
  const cacheKey = computeTtsCacheKey(language, trimmed, effectiveVoice);

  // Check in-flight coalesced request first
  let requestPromise = inFlightRequests.get(cacheKey);

  if (!requestPromise) {
    requestPromise = (async () => {
      const internalController = new AbortController();
      const effectiveTimeout = timeoutMs ?? 15000;
      const timeoutId = setTimeout(() => {
        internalController.abort(new Error("Cloud TTS quá thời gian chờ."));
      }, effectiveTimeout);

      try {
        // 1. Check local audio cache
        const cached = await getCachedAudio(cacheKey);
        if (cached) {
          return cached;
        }

        // 2. Fetch from Cloudflare Worker
        const baseUrl = getLanguageApiUrl();
        if (!baseUrl) {
          throw new Error("Dịch vụ Cloud TTS chưa được cấu hình (thiếu VITE_LANGUAGE_API_URL).");
        }

        if (typeof navigator !== "undefined" && navigator.onLine === false) {
          throw new Error("Không có kết nối mạng để sử dụng Cloud TTS.");
        }

        const endpoint = `${baseUrl}/v1/tts`;
        let response: Response;
        try {
          response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: trimmed,
              language,
              voice: effectiveVoice,
            }),
            signal: internalController.signal,
          });
        } catch (error: any) {
          if (internalController.signal.aborted) {
            const abortReason = internalController.signal.reason;
            if (abortReason instanceof Error && abortReason.message.includes("quá thời gian")) {
              throw abortReason;
            }
          }
          throw new Error("Không thể kết nối đến máy chủ Cloud TTS.", { cause: error });
        }

        if (!response.ok) {
          let errorDetail = "";
          try {
            const errJson = await response.json();
            errorDetail = errJson?.error?.message || errJson?.error?.code || "";
          } catch {}
          throw new Error(`Máy chủ Cloud TTS phản hồi lỗi (${response.status}): ${errorDetail || "Yêu cầu thất bại."}`);
        }

        const contentType = response.headers.get("Content-Type") || "";
        if (!contentType.toLowerCase().startsWith("audio/")) {
          throw new TypeError(`Máy chủ trả về định dạng không phải audio: ${contentType}`);
        }

        const blob = await response.blob();
        if (!blob || blob.size === 0) {
          throw new TypeError("Dữ liệu âm thanh từ máy chủ bị rỗng.");
        }

        // Cache blob
        await setCachedAudio(cacheKey, blob);

        return blob;
      } finally {
        clearTimeout(timeoutId);
        inFlightRequests.delete(cacheKey);
      }
    })();

    inFlightRequests.set(cacheKey, requestPromise);
  }

  // 3. Return promise with per-caller AbortSignal support
  if (!signal) {
    return await requestPromise;
  }

  return await new Promise<Blob>((resolve, reject) => {
    const onAbort = () => {
      reject(signal.reason || new DOMException("Aborted", "AbortError"));
    };

    signal.addEventListener("abort", onAbort, { once: true });

    requestPromise
      .then((blob) => {
        signal.removeEventListener("abort", onAbort);
        resolve(blob);
      })
      .catch((err) => {
        signal.removeEventListener("abort", onAbort);
        reject(err);
      });
  });
}

export async function prefetchCloudSpeech(options: SynthesizeCloudSpeechOptions): Promise<void> {
  try {
    await synthesizeCloudSpeech(options);
  } catch {}
}

export function configureAudioElementPlaybackRate(audio: HTMLAudioElement, speed: 0.75 | 1 | 1.25 | number): void {
  audio.playbackRate = speed;
  if ("preservesPitch" in audio) {
    (audio as any).preservesPitch = true;
  }
  if ("mozPreservesPitch" in audio) {
    (audio as any).mozPreservesPitch = true;
  }
  if ("webkitPreservesPitch" in audio) {
    (audio as any).webkitPreservesPitch = true;
  }
}
