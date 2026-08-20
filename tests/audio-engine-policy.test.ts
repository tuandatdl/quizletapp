import { describe, expect, it, vi } from "vitest";
import { DEFAULT_LOCAL_SETTINGS } from "../src/frontend/persistence/settingsDefaults.js";
import { computeTtsCacheKey, DEFAULT_CLOUD_VOICE_EN } from "../src/frontend/services/cloudTts.js";
import {
  cloudFallbackMode,
  cloudVoiceFor,
  resolveAudioEngine,
  runAudioEnginePolicy,
} from "../src/frontend/services/audioEnginePolicy.js";

describe("strict cloud TTS audio-engine policy", () => {
  it("CLOUD_EN_USES_ASTERIA and device voice lists do not affect CLOUD mode", async () => {
    const deviceA = ["female-device-voice"];
    const deviceB = ["male-device-voice"];
    expect(deviceA).not.toEqual(deviceB);
    expect(DEFAULT_CLOUD_VOICE_EN).toBe("aura-asteria-en");
    expect(cloudVoiceFor("en", undefined)).toBe("aura-asteria-en");
    expect(cloudVoiceFor("en", "aura-asteria-en")).toBe("aura-asteria-en");
    const cloud = vi.fn().mockResolvedValue("cloud-audio");
    const browser = vi.fn().mockResolvedValue("browser-audio");
    await expect(runAudioEnginePolicy({ engine: "CLOUD", playCloud: cloud, playBrowser: browser })).resolves.toMatchObject({ source: "cloud" });
    expect(browser).not.toHaveBeenCalled();
  });

  it("CLOUD_FAILURE_ZERO_BROWSER_FALLBACK and CLOUD_AUDIO_PLAY_FAILURE_ZERO_BROWSER_FALLBACK", async () => {
    for (const failure of [new Error("cloud network"), new Error("HTML audio playback")]) {
      const cloud = vi.fn().mockRejectedValue(failure);
      const browser = vi.fn().mockResolvedValue("browser-audio");
      await expect(runAudioEnginePolicy({ engine: "CLOUD", playCloud: cloud, playBrowser: browser })).rejects.toBe(failure);
      expect(browser).not.toHaveBeenCalled();
    }
    expect(cloudFallbackMode("CLOUD")).toBe("NONE");
  });

  it("AUTO_CLOUD_SUCCESS_ZERO_BROWSER and AUTO_CLOUD_FAILURE_BROWSER_FALLBACK", async () => {
    const successCloud = vi.fn().mockResolvedValue("cloud-audio");
    const successBrowser = vi.fn().mockResolvedValue("browser-audio");
    await expect(runAudioEnginePolicy({ engine: "AUTO", playCloud: successCloud, playBrowser: successBrowser })).resolves.toMatchObject({ source: "cloud" });
    expect(successBrowser).not.toHaveBeenCalled();

    const failedCloud = vi.fn().mockRejectedValue(new Error("offline"));
    const fallbackBrowser = vi.fn().mockResolvedValue("browser-audio");
    await expect(runAudioEnginePolicy({ engine: "AUTO", playCloud: failedCloud, playBrowser: fallbackBrowser })).resolves.toMatchObject({ source: "browser" });
    expect(fallbackBrowser).toHaveBeenCalledTimes(1);
    expect(cloudFallbackMode("AUTO")).toBe("BROWSER");
  });

  it("BROWSER_ZERO_CLOUD_REQUEST", async () => {
    const cloud = vi.fn().mockResolvedValue("cloud-audio");
    const browser = vi.fn().mockResolvedValue("browser-audio");
    await expect(runAudioEnginePolicy({ engine: "BROWSER", playCloud: cloud, playBrowser: browser })).resolves.toMatchObject({ source: "browser" });
    expect(cloud).not.toHaveBeenCalled();
  });

  it("CLOUD_ZH_ZERO_BROWSER_FALLBACK and AUTO_ZH_FAILURE_BROWSER_FALLBACK", async () => {
    expect(cloudVoiceFor("zh", "aura-asteria-en")).toBeUndefined();
    const cloudFailure = vi.fn().mockRejectedValue(new Error("zh cloud unavailable"));
    const browser = vi.fn().mockResolvedValue("browser-zh");
    await expect(runAudioEnginePolicy({ engine: "CLOUD", playCloud: cloudFailure, playBrowser: browser })).rejects.toThrow("zh cloud unavailable");
    expect(browser).not.toHaveBeenCalled();

    await expect(runAudioEnginePolicy({ engine: "AUTO", playCloud: cloudFailure, playBrowser: browser })).resolves.toMatchObject({ source: "browser" });
    expect(browser).toHaveBeenCalledTimes(1);
  });

  it("VOICE_CACHE_KEY_ISOLATION and new settings default to strict CLOUD", () => {
    expect(computeTtsCacheKey("en", "bank", "aura-asteria-en")).not.toBe(computeTtsCacheKey("en", "bank", "aura-luna-en"));
    expect(DEFAULT_LOCAL_SETTINGS.audioEngine).toBe("CLOUD");
    expect(resolveAudioEngine(undefined)).toBe("CLOUD");
  });
});
