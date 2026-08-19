import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { indexedDB } from "fake-indexeddb";
import {
  computeTtsCacheKey,
  synthesizeCloudSpeech,
  prefetchCloudSpeech,
  configureAudioElementPlaybackRate,
  getCachedAudio,
  setCachedAudio,
  CLOUD_VOICES_EN,
  DEFAULT_CLOUD_VOICE_EN,
} from "../src/frontend/services/cloudTts.js";
import { handleRequest } from "../cloudflare/worker/src/index.js";

describe("Cloud TTS Service & Cache Architecture", () => {
  beforeEach(() => {
    vi.stubGlobal("indexedDB", indexedDB);
    vi.stubGlobal("navigator", { onLine: true });
    vi.stubGlobal("__ENV__", { VITE_LANGUAGE_API_URL: "https://mock-language-api.dev" });
    vi.stubEnv("VITE_LANGUAGE_API_URL", "https://mock-language-api.dev");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  describe("1. Cache Key Formulation", () => {
    it("generates cache key independent of UI playback speed", () => {
      const key1 = computeTtsCacheKey("en", "bank", "aura-asteria-en");
      const key2 = computeTtsCacheKey("en", "bank", "aura-asteria-en");
      expect(key1).toBe(key2);
      expect(key1).toBe("v1:en:aura-asteria-en:bank");
    });

    it("normalizes text and voice in cache key", () => {
      const key1 = computeTtsCacheKey("en", "  Hello World  ", "AURA-ASTERIA-EN");
      const key2 = computeTtsCacheKey("en", "Hello World", "aura-asteria-en");
      expect(key1).toBe(key2);
    });

    it("differentiates different voices and languages", () => {
      const keyEn1 = computeTtsCacheKey("en", "bank", "aura-asteria-en");
      const keyEn2 = computeTtsCacheKey("en", "bank", "aura-luna-en");
      const keyZh = computeTtsCacheKey("zh", "bank", "default");
      expect(keyEn1).not.toBe(keyEn2);
      expect(keyEn1).not.toBe(keyZh);
    });
  });

  describe("2. Curated Cloud Voices", () => {
    it("provides 4 curated natural voices for English with Asteria as default", () => {
      expect(CLOUD_VOICES_EN.length).toBe(4);
      expect(CLOUD_VOICES_EN.map((v) => v.id)).toEqual([
        "aura-asteria-en",
        "aura-luna-en",
        "aura-athena-en",
        "aura-orion-en",
      ]);
      expect(DEFAULT_CLOUD_VOICE_EN).toBe("aura-asteria-en");
    });
  });

  describe("3. Audio Element Playback Rate & Pitch Preservation", () => {
    it("correctly sets playbackRate and preservesPitch flags on HTMLAudioElement", () => {
      const mockAudio = {
        playbackRate: 1,
        preservesPitch: false,
        mozPreservesPitch: false,
        webkitPreservesPitch: false,
      } as unknown as HTMLAudioElement;

      configureAudioElementPlaybackRate(mockAudio, 0.75);
      expect(mockAudio.playbackRate).toBe(0.75);
      expect((mockAudio as any).preservesPitch).toBe(true);

      configureAudioElementPlaybackRate(mockAudio, 1.25);
      expect(mockAudio.playbackRate).toBe(1.25);
    });
  });

  describe("4. Cloud Synthesis & IndexedDB Caching", () => {
    it("retrieves audio from cache when available without network call", async () => {
      const cacheKey = computeTtsCacheKey("en", "hello", "aura-asteria-en");
      const fakeBlob = new Blob([new Uint8Array([1, 2, 3, 4])], { type: "audio/mpeg" });
      await setCachedAudio(cacheKey, fakeBlob);

      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const resultBlob = await synthesizeCloudSpeech({
        text: "hello",
        language: "en",
        voice: "aura-asteria-en",
      });

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(resultBlob.size).toBe(fakeBlob.size);
    });

    it("fetches from backend on cache miss and stores in IndexedDB", async () => {
      const fakeAudioBytes = new Uint8Array([73, 68, 51, 3, 0, 0, 0]);
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(fakeAudioBytes, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "X-TTS-Model": "@cf/deepgram/aura-2-en",
          },
        })
      );

      const resultBlob = await synthesizeCloudSpeech({
        text: "She deposited money in the bank.",
        language: "en",
        voice: "aura-asteria-en",
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(resultBlob.size).toBe(fakeAudioBytes.length);

      // Verify cached for next call
      const cacheKey = computeTtsCacheKey("en", "She deposited money in the bank.", "aura-asteria-en");
      const cached = await getCachedAudio(cacheKey);
      expect(cached).not.toBeNull();
      expect(cached?.size).toBe(fakeAudioBytes.length);
    });

    it("throws clear error when text is empty", async () => {
      await expect(
        synthesizeCloudSpeech({
          text: "   ",
          language: "en",
        })
      ).rejects.toThrow("Văn bản phát âm không được để trống.");
    });

    it("throws error when offline", async () => {
      vi.stubGlobal("navigator", { onLine: false });
      await expect(
        synthesizeCloudSpeech({
          text: "offline test",
          language: "en",
        })
      ).rejects.toThrow("Không có kết nối mạng để sử dụng Cloud TTS.");
    });

    it("prefetchCloudSpeech downloads audio into cache without throwing", async () => {
      const fakeAudioBytes = new Uint8Array([10, 20, 30]);
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(fakeAudioBytes, {
          status: 200,
          headers: { "Content-Type": "audio/mpeg" },
        })
      );

      await prefetchCloudSpeech({
        text: "Prefetched sentence",
        language: "en",
      });

      const cacheKey = computeTtsCacheKey("en", "Prefetched sentence", "aura-asteria-en");
      const cached = await getCachedAudio(cacheKey);
      expect(cached?.size).toBe(fakeAudioBytes.length);
    });
  });

  describe("5. Cloudflare Worker /v1/tts Endpoint Contract", () => {
    const mockEnv: any = {
      ALLOWED_ORIGINS: "https://tuandatdl.github.io,http://localhost:5173",
      TTS_MODEL_EN: "@cf/deepgram/aura-2-en",
      TTS_MODEL_ZH: "@cf/myshell-ai/melotts",
      AI: {
        run: vi.fn(async (model: string, input: any) => {
          if (model.includes("aura")) {
            return new Uint8Array([1, 2, 3, 4, 5]);
          }
          throw new Error("MeloTTS unavailable");
        }),
      },
    };

    it("accepts valid English TTS request with allowed origin and returns audio/mpeg", async () => {
      const req = new Request("https://worker.dev/v1/tts", {
        method: "POST",
        headers: {
          Origin: "https://tuandatdl.github.io",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "I live in Vietnam.",
          language: "en",
          voice: "aura-asteria-en",
        }),
      });

      const res = await handleRequest(req, mockEnv);
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("audio/mpeg");
      expect(res.headers.get("X-TTS-Provider")).toBe("cloudflare-workers-ai");
      expect(res.headers.get("X-TTS-Voice")).toBe("aura-asteria-en");
      expect(mockEnv.AI.run).toHaveBeenCalledWith(
        "@cf/deepgram/aura-2-en",
        expect.objectContaining({
          text: "I live in Vietnam.",
          speaker: "asteria",
        })
      );
    });

    it("rejects unauthorized origin with 403", async () => {
      const req = new Request("https://worker.dev/v1/tts", {
        method: "POST",
        headers: {
          Origin: "https://unauthorized-domain.com",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "bank",
          language: "en",
        }),
      });

      const res = await handleRequest(req, mockEnv);
      expect(res.status).toBe(403);
    });

    it("rejects unknown keys with 400 VALIDATION_ERROR", async () => {
      const req = new Request("https://worker.dev/v1/tts", {
        method: "POST",
        headers: {
          Origin: "https://tuandatdl.github.io",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "bank",
          language: "en",
          unknownKey: 123,
        }),
      });

      const res = await handleRequest(req, mockEnv);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects unsupported voice with 400 VALIDATION_ERROR", async () => {
      const req = new Request("https://worker.dev/v1/tts", {
        method: "POST",
        headers: {
          Origin: "https://tuandatdl.github.io",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "bank",
          language: "en",
          voice: "non-existent-voice-name",
        }),
      });

      const res = await handleRequest(req, mockEnv);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.code).toBe("VALIDATION_ERROR");
    });
  });
});
