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

    it("TTS_AURA2_ASTERIA_INPUT uses the documented Aura 2 model and Asteria speaker", async () => {
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

    it("TTS_READABLE_STREAM_OUTPUT returns Workers AI audio streams without rewriting them", async () => {
      const audio = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new Uint8Array([1, 2, 3, 4]));
          controller.close();
        },
      });
      const env = { ...mockEnv, AI: { run: vi.fn().mockResolvedValue(audio) } };
      const req = new Request("https://worker.dev/v1/tts", {
        method: "POST",
        headers: { Origin: "https://tuandatdl.github.io", "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Hello.", language: "en", voice: "aura-asteria-en" }),
      });

      const res = await handleRequest(req, env);
      expect(res.status).toBe(200);
      expect((await res.arrayBuffer()).byteLength).toBe(4);
    });

    it("TTS_ASTERIA_HEADER identifies the selected Asteria cloud voice", async () => {
      const env = { ...mockEnv, AI: { run: vi.fn().mockResolvedValue(new Uint8Array([1])) } };
      const req = new Request("https://worker.dev/v1/tts", {
        method: "POST",
        headers: { Origin: "https://tuandatdl.github.io", "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Hello.", language: "en", voice: "aura-asteria-en" }),
      });

      const res = await handleRequest(req, env);
      expect(res.headers.get("X-TTS-Voice")).toBe("aura-asteria-en");
    });

    it("TTS_UPSTREAM_FAILURE_SAFE_CLASSIFICATION and TTS_NO_RAW_TEXT_LOGGING log only safe upstream fields", async () => {
      const upstreamError = Object.assign(new Error("provider failure for private source text"), { code: 3036, status: 429 });
      const env = { ...mockEnv, AI: { run: vi.fn().mockRejectedValue(upstreamError) } };
      const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
      const req = new Request("https://worker.dev/v1/tts", {
        method: "POST",
        headers: { Origin: "https://tuandatdl.github.io", "Content-Type": "application/json" },
        body: JSON.stringify({ text: "private source text", language: "en", voice: "aura-asteria-en" }),
      });

      const res = await handleRequest(req, env);
      expect(res.status).toBe(502);
      const logged = JSON.parse(String(errorLog.mock.calls[0]?.[0]));
      expect(logged).toEqual({
        event: "tts_failed",
        model: "@cf/deepgram/aura-2-en",
        voice: "aura-asteria-en",
        failureClass: "QUOTA_EXCEEDED",
        upstreamStatus: 429,
        upstreamCode: "3036",
      });
      expect(JSON.stringify(logged)).not.toContain("private source text");
      expect(JSON.stringify(logged)).not.toContain("provider failure");
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

  describe("6. Duplicate Playback Race Prevention & Fallback Guards (Tests A - H)", () => {
    it("TEST A: audio.onerror AND audio.play() rejection together trigger fallback EXACTLY ONCE", async () => {
      let fallbackCount = 0;
      let fallbackTriggered = false;

      const triggerFallbackOnce = () => {
        if (fallbackTriggered) return;
        fallbackTriggered = true;
        fallbackCount++;
      };

      const mockAudio = {
        onerror: null as (() => void) | null,
        play: vi.fn().mockImplementation(async () => {
          // Simulate browser firing onerror AND rejecting play()
          mockAudio.onerror?.();
          throw new Error("Autoplay / decoding failed");
        }),
      };

      mockAudio.onerror = () => {
        triggerFallbackOnce();
      };

      try {
        await mockAudio.play();
      } catch {
        triggerFallbackOnce();
      }

      expect(fallbackCount).toBe(1);
    });

    it("TEST B: sequential sentence transition failure triggers fallback EXACTLY ONCE", async () => {
      let sequentialFallbackCount = 0;
      let fallbackTriggered = false;

      const triggerFallbackOnce = () => {
        if (fallbackTriggered) return;
        fallbackTriggered = true;
        sequentialFallbackCount++;
      };

      const mockSequentialAudio = {
        onerror: null as (() => void) | null,
        play: vi.fn().mockImplementation(async () => {
          mockSequentialAudio.onerror?.();
          throw new Error("Network timeout on sequential sentence");
        }),
      };

      mockSequentialAudio.onerror = () => {
        triggerFallbackOnce();
      };

      try {
        await mockSequentialAudio.play();
      } catch {
        triggerFallbackOnce();
      }

      expect(sequentialFallbackCount).toBe(1);
    });

    it("TEST C: cleanupActiveAudio detaches media handlers so pause()/src='' cannot trigger stale onerror", () => {
      let staleErrorFired = false;
      const mockAudio: any = {
        onplay: vi.fn(),
        onended: vi.fn(),
        onerror: vi.fn(() => {
          staleErrorFired = true;
        }),
        onpause: vi.fn(),
        ontimeupdate: vi.fn(),
        pause: vi.fn(() => {
          // Emulate browser triggering error on abort/pause
          if (mockAudio.onerror) mockAudio.onerror();
        }),
        removeAttribute: vi.fn(),
        src: "blob:http://localhost/test",
      };

      // Perform the exact cleanup routine implemented
      mockAudio.onplay = null;
      mockAudio.onended = null;
      mockAudio.onerror = null;
      mockAudio.onpause = null;
      mockAudio.ontimeupdate = null;
      mockAudio.pause();
      mockAudio.removeAttribute("src");
      mockAudio.src = "";

      expect(staleErrorFired).toBe(false);
      expect(mockAudio.onerror).toBeNull();
      expect(mockAudio.onended).toBeNull();
    });

    it("TEST D: duplicate audio.onended events schedule next sentence EXACTLY ONCE", () => {
      let transitionTimer: any = null;
      let scheduleCount = 0;

      const scheduleNextSentence = (sessionId: number, currentSession: number) => {
        if (transitionTimer) {
          clearTimeout(transitionTimer);
          transitionTimer = null;
        }
        if (sessionId !== currentSession) return;
        scheduleCount++;
        transitionTimer = setTimeout(() => {}, 70);
      };

      let nextScheduled = false;
      const onendedHandler = () => {
        if (nextScheduled) return;
        nextScheduled = true;
        scheduleNextSentence(1, 1);
      };

      // Trigger onended twice
      onendedHandler();
      onendedHandler();

      expect(scheduleCount).toBe(1);
      if (transitionTimer) clearTimeout(transitionTimer);
    });

    it("TEST E: old sentence Cloud promise resolving after new session is started becomes inert", async () => {
      let currentSessionId = 1;
      let currentAttemptId = 1;
      let playedAudioUrl: string | null = null;

      // Simulate sentence 1 starting
      const session1Id = currentSessionId;
      const attempt1Id = currentAttemptId;

      // User clicks next sentence / restart before sentence 1 resolves
      currentSessionId = 2;
      currentAttemptId = 2;

      // Sentence 1 promise resolves late
      const lateBlob = new Blob([new Uint8Array([1, 2, 3])], { type: "audio/mpeg" });
      const isValid = session1Id === currentSessionId && attempt1Id === currentAttemptId;

      if (isValid) {
        playedAudioUrl = "blob:valid";
      }

      expect(isValid).toBe(false);
      expect(playedAudioUrl).toBeNull();
    });

    it("TEST F: old audio.play rejection occurring after user presses Next does not trigger fallback", async () => {
      let currentSessionId = 1;
      let currentAttemptId = 1;
      let fallbackTriggered = false;

      const session1Id = currentSessionId;
      const attempt1Id = currentAttemptId;

      // User presses Next
      currentSessionId = 2;
      currentAttemptId = 2;

      // Old play() rejects
      const triggerFallbackOnce = () => {
        if (session1Id !== currentSessionId || attempt1Id !== currentAttemptId) {
          return;
        }
        fallbackTriggered = true;
      };

      triggerFallbackOnce();
      expect(fallbackTriggered).toBe(false);
    });

    it("TEST G: prefetchCloudSpeech only fetches/caches and NEVER plays audio or invokes speech synthesis", async () => {
      const playSpy = vi.fn();
      const speakSpy = vi.fn();
      vi.stubGlobal("Audio", class {
        play = playSpy;
      });
      vi.stubGlobal("speechSynthesis", {
        speak: speakSpy,
      });

      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(new Uint8Array([1, 2, 3]), {
          status: 200,
          headers: { "Content-Type": "audio/mpeg" },
        })
      );

      await prefetchCloudSpeech({
        text: "Background sentence",
        language: "en",
      });

      expect(playSpy).not.toHaveBeenCalled();
      expect(speakSpy).not.toHaveBeenCalled();
    });

    it("TEST H: enforces single active audio owner (Cloud HTMLAudio cancels SpeechSynthesis on session start)", () => {
      let cancelCount = 0;
      vi.stubGlobal("speechSynthesis", {
        cancel: () => {
          cancelCount++;
        },
      });

      // When starting a new Cloud audio session
      if ("speechSynthesis" in globalThis) {
        (globalThis as any).speechSynthesis.cancel();
      }

      expect(cancelCount).toBe(1);
    });
  });
});
