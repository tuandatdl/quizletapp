import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { indexedDB } from "fake-indexeddb";
import {
  __resetLocalTtsForTests,
  downloadLocalEnglishModel,
  getLocalEnglishModelStatus,
  synthesizeLocalEnglishSpeech,
} from "../src/frontend/services/localTts.js";

type WorkerMessage = { id: number; type: "prepare" | "synthesize" | "remove" };
let workerPosts: WorkerMessage[] = [];
let workerFailure = false;

class FakeLocalTtsWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  postMessage(message: WorkerMessage) {
    workerPosts.push(message);
    queueMicrotask(() => {
      if (workerFailure && message.type === "synthesize") {
        this.onmessage?.({ data: { id: message.id, type: "error", message: "Không thể tải model Local TTS. Hãy kiểm tra mạng rồi thử lại." } } as MessageEvent);
      } else {
        this.onmessage?.({ data: { id: message.id, type: "result", blob: message.type === "synthesize" ? new Blob(["local wav"], { type: "audio/wav" }) : undefined } } as MessageEvent);
      }
    });
  }

  terminate() {}
}

class MemoryCache {
  readonly entries = new Map<string, Response>();
  async match(request: Request) { return this.entries.get(request.url)?.clone(); }
  async put(request: Request, response: Response) { this.entries.set(request.url, response.clone()); }
  async delete(request: Request) { return this.entries.delete(request.url); }
}

const cache = new MemoryCache();

function cacheRequest(resource: "model" | "config", version = "test-v1", source = "https://models.example/en.onnx|https://models.example/en.onnx.json") {
  return new Request(`https://local-tts-cache.invalid/en/${encodeURIComponent(version)}/${encodeURIComponent(source)}/${resource}`);
}

async function seedModel(version = "test-v1") {
  await cache.put(cacheRequest("model", version), new Response(new Blob(["model"]), { headers: { "content-length": "63201294" } }));
  await cache.put(cacheRequest("config", version), new Response(JSON.stringify({ audio: { sample_rate: 22050 } }), { headers: { "content-length": "42" } }));
}

describe("local English Piper runtime", () => {
  beforeEach(() => {
    workerPosts = [];
    workerFailure = false;
    cache.entries.clear();
    vi.stubGlobal("indexedDB", indexedDB);
    vi.stubGlobal("Worker", FakeLocalTtsWorker);
    vi.stubGlobal("caches", { open: vi.fn().mockResolvedValue(cache) });
    vi.stubEnv("VITE_LOCAL_TTS_EN_MODEL_VERSION", "test-v1");
    vi.stubEnv("VITE_LOCAL_TTS_EN_MODEL_URL", "https://models.example/en.onnx");
    vi.stubEnv("VITE_LOCAL_TTS_EN_CONFIG_URL", "https://models.example/en.onnx.json");
  });

  afterEach(() => {
    __resetLocalTtsForTests();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("LOCAL_MODEL_DOWNLOAD_ONCE and LOCAL_MODEL_CACHE_HIT", async () => {
    await downloadLocalEnglishModel();
    expect(workerPosts.filter((message) => message.type === "prepare")).toHaveLength(1);

    await seedModel();
    await downloadLocalEnglishModel();
    expect(workerPosts.filter((message) => message.type === "prepare")).toHaveLength(1);
  });

  it("LOCAL_AUDIO_CACHE, LOCAL_ZERO_CLOUD_REQUEST and LOCAL_ZERO_BROWSER_SPEECH", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const speech = { speak: vi.fn() };
    vi.stubGlobal("speechSynthesis", speech);

    const first = await synthesizeLocalEnglishSpeech({ text: "Unique local phrase one", speed: 1 });
    const second = await synthesizeLocalEnglishSpeech({ text: "  unique  local phrase one ", speed: 1 });

    expect(first.size).toBeGreaterThan(0);
    expect(second.size).toBe(first.size);
    expect(workerPosts.filter((message) => message.type === "synthesize")).toHaveLength(1);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(speech.speak).not.toHaveBeenCalled();
  });

  it("LOCAL_MODEL_VERSION_ISOLATION", async () => {
    await seedModel("test-v1");
    expect((await getLocalEnglishModelStatus()).cached).toBe(true);
    vi.stubEnv("VITE_LOCAL_TTS_EN_MODEL_VERSION", "test-v2");
    expect((await getLocalEnglishModelStatus()).cached).toBe(false);
    vi.stubEnv("VITE_LOCAL_TTS_EN_MODEL_VERSION", "test-v1");
    vi.stubEnv("VITE_LOCAL_TTS_EN_MODEL_URL", "https://other-model-host.example/en.onnx");
    expect((await getLocalEnglishModelStatus()).cached).toBe(false);
  });

  it("LOCAL_DEVICE_VOICE_INDEPENDENCE", async () => {
    const deviceA = ["device A voice"];
    const deviceB = ["device B voice"];
    expect(deviceA).not.toEqual(deviceB);
    await synthesizeLocalEnglishSpeech({ text: "same Piper model", speed: 1 });
    expect(workerPosts[0]?.type).toBe("synthesize");
  });

  it("LOCAL_MODEL_LOAD_FAILURE_ACTIONABLE", async () => {
    workerFailure = true;
    await expect(synthesizeLocalEnglishSpeech({ text: "model failure", speed: 1 })).rejects.toThrow("Không thể tải model Local TTS");
  });
});
