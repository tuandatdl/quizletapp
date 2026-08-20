/// <reference lib="webworker" />

import { remove, TtsSession } from "@pbji/piper-tts-web";
import type { LocalEnglishModelConfig, LocalTtsProgress } from "./localTts.js";

const CACHE_NAME = "tutrinh-local-tts-models-v1";
const VOICE_ID = "en_US-lessac-medium";
let session: TtsSession | null = null;
let sessionVersion: string | null = null;
let activeModelConfig: LocalEnglishModelConfig | null = null;
let fetchPatched = false;
const nativeFetch = self.fetch.bind(self);

type RequestMessage = { id: number; type: "prepare" | "synthesize" | "remove"; text?: string; config: LocalEnglishModelConfig };

function cacheRequest(config: LocalEnglishModelConfig, resource: "model" | "config"): Request {
  const source = encodeURIComponent(`${config.modelUrl}|${config.configUrl}`);
  return new Request(`https://local-tts-cache.invalid/en/${encodeURIComponent(config.version)}/${source}/${resource}`);
}

function progress(id: number, value: LocalTtsProgress): void {
  self.postMessage({ id, type: "progress", progress: value });
}

async function sha256(blob: Blob): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function validCachedModel(config: LocalEnglishModelConfig): Promise<boolean> {
  const cache = await caches.open(CACHE_NAME);
  const [modelResponse, configResponse] = await Promise.all([
    cache.match(cacheRequest(config, "model")),
    cache.match(cacheRequest(config, "config")),
  ]);
  if (!modelResponse || !configResponse) return false;
  const model = await modelResponse.blob();
  if (model.size < config.expectedBytes) return false;
  if (config.expectedSha256 && (await sha256(model)).toLowerCase() !== config.expectedSha256.toLowerCase()) return false;
  try {
    const parsed = await configResponse.json() as { audio?: { sample_rate?: number } };
    return Number(parsed.audio?.sample_rate) > 0;
  } catch {
    return false;
  }
}

async function downloadResource(
  id: number,
  config: LocalEnglishModelConfig,
  resource: "model" | "config",
): Promise<void> {
  const url = resource === "model" ? config.modelUrl : config.configUrl;
  const response = await nativeFetch(url, { cache: "no-store" });
  if (!response.ok || !response.body) throw new Error(`Không tải được ${resource === "model" ? "model" : "cấu hình"} Local TTS (${response.status}).`);
  const total = Number(response.headers.get("content-length") || (resource === "model" ? config.expectedBytes : 0));
  const reader = response.body.getReader();
  const chunks: ArrayBuffer[] = [];
  let loaded = 0;
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    chunks.push(next.value.buffer.slice(next.value.byteOffset, next.value.byteOffset + next.value.byteLength) as ArrayBuffer);
    loaded += next.value.byteLength;
    progress(id, { phase: "download", loaded, total });
  }
  const blob = new Blob(chunks, { type: resource === "model" ? "application/octet-stream" : "application/json" });
  if (resource === "model" && blob.size < config.expectedBytes) throw new Error("Model Local TTS bị tải thiếu. Hãy thử tải lại.");
  if (resource === "model" && config.expectedSha256 && (await sha256(blob)).toLowerCase() !== config.expectedSha256.toLowerCase()) {
    throw new Error("Kiểm tra toàn vẹn model Local TTS thất bại. Hãy tải lại.");
  }
  const cache = await caches.open(CACHE_NAME);
  await cache.put(cacheRequest(config, resource), new Response(blob, { headers: { "content-length": String(blob.size) } }));
}

async function ensureModel(id: number, config: LocalEnglishModelConfig): Promise<void> {
  const cache = await caches.open(CACHE_NAME);
  if (!(await validCachedModel(config))) {
    await Promise.all([cache.delete(cacheRequest(config, "model")), cache.delete(cacheRequest(config, "config"))]);
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        await downloadResource(id, config, "config");
        await downloadResource(id, config, "model");
        if (await validCachedModel(config)) return;
      } catch (error) {
        lastError = error;
        await Promise.all([cache.delete(cacheRequest(config, "model")), cache.delete(cacheRequest(config, "config"))]);
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Không thể tải model Local TTS. Hãy kiểm tra mạng rồi thử lại.");
  }
}

function patchModelFetch(): void {
  if (fetchPatched) return;
  fetchPatched = true;
  self.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.includes("en_US-lessac-medium.onnx")) {
      const config = activeModelConfig;
      if (config) {
        const cache = await caches.open(CACHE_NAME);
        const resource = url.endsWith(".json") ? "config" : "model";
        const cached = await cache.match(cacheRequest(config, resource));
        if (cached) return cached.clone();
      }
    }
    return nativeFetch(input, init);
  }) as typeof fetch;
}

async function localSession(id: number, config: LocalEnglishModelConfig): Promise<TtsSession> {
  await ensureModel(id, config);
  patchModelFetch();
  if (session && sessionVersion === config.version) return session;
  // Piper has its own OPFS cache keyed by the upstream URL. Remove it first so
  // Cache Storage (which is versioned by our configured model URL) stays authoritative.
  await remove(VOICE_ID);
  sessionVersion = config.version;
  activeModelConfig = config;
  progress(id, { phase: "load" });
  session = await TtsSession.create({
    voiceId: VOICE_ID,
    progress: (item) => progress(id, { phase: "download", loaded: item.loaded, total: item.total }),
  });
  // TtsSession persists an OPFS copy internally. Cache Storage is the product
  // cache and already owns the versioned resource, so release that transient
  // duplicate once ONNX has initialized the single in-memory session.
  await remove(VOICE_ID);
  progress(id, { phase: "ready" });
  return session;
}

self.onmessage = async (event: MessageEvent<RequestMessage>) => {
  const { id, type, text, config } = event.data;
  try {
    if (type === "remove") {
      await remove(VOICE_ID);
      session = null;
      sessionVersion = null;
      activeModelConfig = null;
      self.postMessage({ id, type: "result" });
      return;
    }
    const ready = await localSession(id, config);
    if (type === "prepare") {
      self.postMessage({ id, type: "result" });
      return;
    }
    const blob = await ready.predict(text || "");
    self.postMessage({ id, type: "result", blob });
  } catch (error) {
    self.postMessage({ id, type: "error", message: error instanceof Error ? error.message : "Không thể khởi tạo Local TTS." });
  }
};
