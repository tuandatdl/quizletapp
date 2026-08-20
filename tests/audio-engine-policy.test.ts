import { describe, expect, it, vi } from "vitest";
import { DEFAULT_LOCAL_SETTINGS } from "../src/frontend/persistence/settingsDefaults.js";
import { computeTtsCacheKey, DEFAULT_CLOUD_VOICE_EN } from "../src/frontend/services/cloudTts.js";
import { cloudFallbackMode, cloudVoiceFor, resolveAudioEngine, runAudioEnginePolicy } from "../src/frontend/services/audioEnginePolicy.js";

function engines() {
  return {
    local: vi.fn().mockResolvedValue("local-audio"),
    cloud: vi.fn().mockResolvedValue("cloud-audio"),
    browser: vi.fn().mockResolvedValue("browser-audio"),
  };
}

describe("free-first local TTS audio-engine policy", () => {
  it("LOCAL_ZERO_CLOUD_REQUEST and LOCAL_ZERO_BROWSER_SPEECH", async () => {
    const { local, cloud, browser } = engines();
    await expect(runAudioEnginePolicy({ engine: "LOCAL", playLocal: local, playCloud: cloud, playBrowser: browser })).resolves.toMatchObject({ source: "local" });
    expect(cloud).not.toHaveBeenCalled();
    expect(browser).not.toHaveBeenCalled();
  });

  it("AUTO_LOCAL_SUCCESS_ZERO_CLOUD", async () => {
    const { local, cloud, browser } = engines();
    await expect(runAudioEnginePolicy({ engine: "AUTO", playLocal: local, playCloud: cloud, playBrowser: browser })).resolves.toMatchObject({ source: "local" });
    expect(cloud).not.toHaveBeenCalled();
    expect(browser).not.toHaveBeenCalled();
  });

  it("AUTO_LOCAL_FAILURE_TRIES_CLOUD", async () => {
    const local = vi.fn().mockRejectedValue(new Error("missing model"));
    const cloud = vi.fn().mockResolvedValue("cloud-audio");
    const browser = vi.fn().mockResolvedValue("browser-audio");
    await expect(runAudioEnginePolicy({ engine: "AUTO", playLocal: local, playCloud: cloud, playBrowser: browser })).resolves.toMatchObject({ source: "cloud" });
    expect(cloud).toHaveBeenCalledTimes(1);
    expect(browser).not.toHaveBeenCalled();
  });

  it("AUTO_CLOUD_FAILURE_BROWSER_FALLBACK", async () => {
    const local = vi.fn().mockRejectedValue(new Error("missing model"));
    const cloud = vi.fn().mockRejectedValue(new Error("offline"));
    const browser = vi.fn().mockResolvedValue("browser-audio");
    await expect(runAudioEnginePolicy({ engine: "AUTO", playLocal: local, playCloud: cloud, playBrowser: browser })).resolves.toMatchObject({ source: "browser" });
    expect(browser).toHaveBeenCalledTimes(1);
    expect(cloudFallbackMode("AUTO")).toBe("BROWSER");
  });

  it("CLOUD_POLICY_UNCHANGED", async () => {
    const { local, cloud, browser } = engines();
    await expect(runAudioEnginePolicy({ engine: "CLOUD", playLocal: local, playCloud: cloud, playBrowser: browser })).resolves.toMatchObject({ source: "cloud" });
    expect(local).not.toHaveBeenCalled();
    expect(browser).not.toHaveBeenCalled();
    const failure = new Error("cloud network");
    await expect(runAudioEnginePolicy({ engine: "CLOUD", playLocal: local, playCloud: vi.fn().mockRejectedValue(failure), playBrowser: browser })).rejects.toBe(failure);
    expect(browser).not.toHaveBeenCalled();
    expect(cloudFallbackMode("CLOUD")).toBe("NONE");
  });

  it("BROWSER_POLICY_UNCHANGED", async () => {
    const { local, cloud, browser } = engines();
    await expect(runAudioEnginePolicy({ engine: "BROWSER", playLocal: local, playCloud: cloud, playBrowser: browser })).resolves.toMatchObject({ source: "browser" });
    expect(local).not.toHaveBeenCalled();
    expect(cloud).not.toHaveBeenCalled();
  });

  it("CLOUD_EN_USES_ASTERIA and Chinese cloud voice remains undefined", () => {
    expect(DEFAULT_CLOUD_VOICE_EN).toBe("aura-asteria-en");
    expect(cloudVoiceFor("en", undefined)).toBe("aura-asteria-en");
    expect(cloudVoiceFor("zh", "aura-asteria-en")).toBeUndefined();
  });

  it("VOICE_CACHE_KEY_ISOLATION and new defaults are LOCAL without overriding explicit engines", () => {
    expect(computeTtsCacheKey("en", "bank", "aura-asteria-en")).not.toBe(computeTtsCacheKey("en", "bank", "aura-luna-en"));
    expect(DEFAULT_LOCAL_SETTINGS.audioEngine).toBe("LOCAL");
    expect(resolveAudioEngine(undefined)).toBe("LOCAL");
    expect(resolveAudioEngine("CLOUD")).toBe("CLOUD");
    expect(resolveAudioEngine("BROWSER")).toBe("BROWSER");
  });
});
