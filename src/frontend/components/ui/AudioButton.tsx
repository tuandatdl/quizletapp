import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import type { Language } from "../../types/api";
import {
  cancelSpeechAndWait,
  configureSpeechUtterance,
  getReadySpeechVoices,
  getSpeechCancelSettleMs,
  waitForSpeechVoices,
} from "../../services/speech";
import {
  synthesizeCloudSpeech,
  configureAudioElementPlaybackRate,
} from "../../services/cloudTts";
import {
  cloudFallbackMode,
  cloudVoiceFor,
  resolveAudioEngine,
  runAudioEnginePolicy,
  safeTtsDiagnostic,
  type HtmlAudioFallbackMode,
  type TtsSource,
} from "../../services/audioEnginePolicy";

let activeHtmlAudio: HTMLAudioElement | null = null;
let activeObjectUrl: string | null = null;

export interface AudioButtonProps {
  text?: string;
  audioUrl?: string | null;
  language?: Language;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "secondary" | "subtle";
  label?: string;
  speed?: 0.75 | 1 | 1.25;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  audioUrl,
  language = "en",
  size = "md",
  variant = "ghost",
  label = "Nghe phát âm",
  speed,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toastError } = (() => {
    try {
      const t = useToast();
      return { toastError: t.error };
    } catch {
      return { toastError: console.error };
    }
  })();
  const { settings } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const speechGenRef = useRef<number>(0);
  const mountedRef = useRef(true);

  const currentSpeed = speed ?? settings?.audioSpeed ?? 1;
  const speechText = text?.trim() ?? "";

  const cleanupAudio = () => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audioRef.current = null;
      try {
        audio.onplay = null;
        audio.onended = null;
        audio.onerror = null;
        audio.onpause = null;
        audio.ontimeupdate = null;
        audio.pause();
        audio.removeAttribute("src");
        audio.src = "";
      } catch {}
      if (activeHtmlAudio === audio) activeHtmlAudio = null;
    }
    if (objectUrlRef.current) {
      const url = objectUrlRef.current;
      objectUrlRef.current = null;
      try {
        URL.revokeObjectURL(url);
      } catch {}
      if (activeObjectUrl === url) activeObjectUrl = null;
    }
  };

  const stopCurrent = () => {
    speechGenRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    cleanupAudio();
    if (utteranceRef.current && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      utteranceRef.current = null;
    }
    if (mountedRef.current) {
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopCurrent();
    };
  }, []);

  const playBrowserSpeech = async (textToSpeak: string, lang: Language) => {
    safeTtsDiagnostic("tts_source_used", { tts_source_used: "browser" });
    if (!("speechSynthesis" in window)) {
      toastError("Trình duyệt không hỗ trợ phát âm (SpeechSynthesis).");
      return;
    }
    speechGenRef.current += 1;
    const currentGen = speechGenRef.current;
    setIsLoading(true);

    await cancelSpeechAndWait(getSpeechCancelSettleMs(currentSpeed));
    if (!mountedRef.current || speechGenRef.current !== currentGen) return;

    const voices = await waitForSpeechVoices(200);
    if (!mountedRef.current || speechGenRef.current !== currentGen) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;
    const preferredVoice = lang === "zh" ? settings?.preferredVoiceZh : settings?.preferredVoiceEn;
    configureSpeechUtterance(utterance, lang, currentSpeed, voices.length > 0 ? voices : getReadySpeechVoices(), preferredVoice);

    utterance.onstart = () => {
      if (mountedRef.current && speechGenRef.current === currentGen) {
        setIsLoading(false);
        setIsPlaying(true);
      }
    };
    utterance.onend = () => {
      if (utteranceRef.current === utterance) utteranceRef.current = null;
      if (mountedRef.current && speechGenRef.current === currentGen) {
        setIsLoading(false);
        setIsPlaying(false);
      }
    };
    utterance.onerror = (event) => {
      if (utteranceRef.current === utterance) utteranceRef.current = null;
      if (mountedRef.current && speechGenRef.current === currentGen) {
        setIsLoading(false);
        setIsPlaying(false);
      }
      if (!["canceled", "interrupted"].includes(event.error)) toastError("Lỗi khi phát âm qua trình duyệt.");
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      if (mountedRef.current && speechGenRef.current === currentGen) {
        setIsLoading(false);
        setIsPlaying(false);
      }
    }
  };

  const playHtmlAudio = async (url: string, options: {
    fallbackMode: HtmlAudioFallbackMode;
    fallbackText?: string;
    isObjectUrl?: boolean;
    source: TtsSource;
    cloudVoice?: string;
  }) => {
    speechGenRef.current += 1;
    const currentGen = speechGenRef.current;

    if (activeHtmlAudio) {
      const prevAudio = activeHtmlAudio;
      activeHtmlAudio = null;
      try {
        prevAudio.onplay = null;
        prevAudio.onended = null;
        prevAudio.onerror = null;
        prevAudio.onpause = null;
        prevAudio.pause();
        prevAudio.removeAttribute("src");
        prevAudio.src = "";
      } catch {}
    }
    if (activeObjectUrl && activeObjectUrl !== url) {
      const prevUrl = activeObjectUrl;
      activeObjectUrl = null;
      try {
        URL.revokeObjectURL(prevUrl);
      } catch {}
    }
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    activeHtmlAudio = audio;
    if (options.isObjectUrl) {
      objectUrlRef.current = url;
      activeObjectUrl = url;
    }

    configureAudioElementPlaybackRate(audio, currentSpeed);

    let fallbackTriggered = false;
    const triggerFallbackOnce = () => {
      if (fallbackTriggered) return;
      fallbackTriggered = true;

      cleanupAudio();
      if (!mountedRef.current || speechGenRef.current !== currentGen) return;
      setIsLoading(false);
      setIsPlaying(false);
      if (options.fallbackMode === "BROWSER" && options.fallbackText) {
        safeTtsDiagnostic("tts_browser_fallback", { tts_engine_requested: "AUTO", tts_source_used: "browser" });
        void playBrowserSpeech(options.fallbackText, language);
      } else {
        toastError(options.source === "cloud" ? "Cloud TTS không thể phát âm thanh. Vui lòng thử lại." : "Không thể phát tệp âm thanh.");
      }
    };

    audio.onplay = () => {
      if (!mountedRef.current || speechGenRef.current !== currentGen) return;
      safeTtsDiagnostic("tts_source_used", {
        tts_source_used: options.source,
        cloud_voice: options.source === "cloud" ? options.cloudVoice : undefined,
      });
      setIsLoading(false);
      setIsPlaying(true);
    };
    audio.onended = () => {
      cleanupAudio();
      if (mountedRef.current && speechGenRef.current === currentGen) {
        setIsPlaying(false);
        setIsLoading(false);
      }
    };
    audio.onerror = () => {
      triggerFallbackOnce();
    };

    try {
      await audio.play();
    } catch {
      triggerFallbackOnce();
    }
  };

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlaying) {
      stopCurrent();
      return;
    }

    const engine = resolveAudioEngine(settings?.audioEngine);
    safeTtsDiagnostic("tts_engine_requested", { tts_engine_requested: engine });

    // BROWSER is strict too: it never requests Cloud TTS or plays a cloud/static asset.
    if (engine === "BROWSER") {
      if (speechText) await playBrowserSpeech(speechText, language);
      else toastError("Không có văn bản để phát bằng giọng của thiết bị.");
      return;
    }

    // Static assets stay usable in CLOUD/AUTO, but only AUTO may switch to browser speech.
    if (audioUrl) {
      setIsLoading(true);
      await playHtmlAudio(audioUrl, {
        fallbackMode: cloudFallbackMode(engine),
        fallbackText: speechText || undefined,
        source: "static",
      });
      return;
    }

    if (!speechText) return;

    setIsLoading(true);
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    speechGenRef.current += 1;
    const currentGen = speechGenRef.current;

    try {
      await runAudioEnginePolicy({
        engine,
        playCloud: async () => {
          const voice = cloudVoiceFor(language, settings?.preferredCloudVoiceEn);
        const blob = await synthesizeCloudSpeech({
          text: speechText,
            language,
          voice,
          signal: controller.signal,
        });
        if (!mountedRef.current || speechGenRef.current !== currentGen) return;

        const objectUrl = URL.createObjectURL(blob);
          await playHtmlAudio(objectUrl, {
            fallbackMode: cloudFallbackMode(engine),
            fallbackText: speechText,
            isObjectUrl: true,
            source: "cloud",
            cloudVoice: voice,
          });
        },
        playBrowser: async () => {
          if (!mountedRef.current || speechGenRef.current !== currentGen) return;
          safeTtsDiagnostic("tts_browser_fallback", { tts_engine_requested: "AUTO", tts_source_used: "browser" });
          setIsLoading(false);
          await playBrowserSpeech(speechText, language);
        },
      });
    } catch (err: unknown) {
      const aborted = err instanceof DOMException && err.name === "AbortError";
      if (aborted || controller.signal.aborted || !mountedRef.current || speechGenRef.current !== currentGen) return;
      setIsLoading(false);
      toastError("Cloud TTS không khả dụng. CLOUD mode không chuyển sang giọng của thiết bị.");
    }
  };

  const dim = size === "sm" ? 28 : size === "lg" ? 40 : 34;
  const iconSize = size === "sm" ? 14 : size === "lg" ? 20 : 16;

  return (
    <button
      type="button"
      onClick={handlePlay}
      disabled={isLoading || (!audioUrl && !speechText)}
      aria-label={label}
      title={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: `${dim}px`,
        height: `${dim}px`,
        borderRadius: "var(--radius-full)",
        backgroundColor:
          variant === "subtle"
            ? language === "zh"
              ? "var(--accent-zh-subtle)"
              : "var(--accent-en-subtle)"
            : variant === "secondary"
            ? "var(--bg-muted)"
            : "transparent",
        color:
          isPlaying
            ? language === "zh"
              ? "var(--accent-zh-primary)"
              : "var(--accent-en-primary)"
            : "var(--text-secondary)",
        border: variant === "secondary" ? "1px solid var(--border-default)" : "none",
        transition: "all var(--transition-fast)",
      }}
    >
      {isLoading ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : isPlaying ? (
        <Volume2 size={iconSize} />
      ) : !audioUrl && !speechText ? (
        <VolumeX size={iconSize} style={{ opacity: 0.5 }} />
      ) : (
        <Volume2 size={iconSize} />
      )}
    </button>
  );
};
