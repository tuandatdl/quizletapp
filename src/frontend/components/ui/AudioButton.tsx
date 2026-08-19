import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { ttsApi } from "../../api/tts.api";
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
  DEFAULT_CLOUD_VOICE_EN,
} from "../../services/cloudTts";

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

  const playHtmlAudio = async (url: string, fallbackText?: string, isObjectUrl = false) => {
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
    if (isObjectUrl) {
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
      if (fallbackText) void playBrowserSpeech(fallbackText, language);
      else toastError("Không thể phát tệp âm thanh.");
    };

    audio.onplay = () => {
      if (!mountedRef.current || speechGenRef.current !== currentGen) return;
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

    // 1. If static audioUrl exists, play directly
    if (audioUrl) {
      setIsLoading(true);
      await playHtmlAudio(audioUrl, speechText || undefined);
      return;
    }

    if (!speechText) return;

    setIsLoading(true);
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    speechGenRef.current += 1;
    const currentGen = speechGenRef.current;

    // 2. If English & Cloud TTS enabled (AUTO or CLOUD), use Cloud TTS first
    const isCloudEnabled = (settings?.audioEngine !== "BROWSER") && language === "en";
    if (isCloudEnabled) {
      try {
        const voice = settings?.preferredCloudVoiceEn || DEFAULT_CLOUD_VOICE_EN;
        const blob = await synthesizeCloudSpeech({
          text: speechText,
          language: "en",
          voice,
          signal: controller.signal,
        });
        if (!mountedRef.current || speechGenRef.current !== currentGen) return;

        const objectUrl = URL.createObjectURL(blob);
        await playHtmlAudio(objectUrl, speechText, true);
        return;
      } catch (err: any) {
        if (controller.signal.aborted || !mountedRef.current || speechGenRef.current !== currentGen) return;
        // Fallback to SpeechSynthesis if Cloud TTS failed or offline
        setIsLoading(false);
        await playBrowserSpeech(speechText, language);
        return;
      }
    }

    // 3. Fallback / Chinese / Browser engine mode
    try {
      const res = await ttsApi.synthesize({
        text: speechText,
        language,
        speed: currentSpeed,
      }, controller.signal);
      if (!mountedRef.current || speechGenRef.current !== currentGen) return;

      if (res?.audioUrl) {
        await playHtmlAudio(res.audioUrl, speechText);
      } else {
        setIsLoading(false);
        await playBrowserSpeech(speechText, language);
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || !mountedRef.current || speechGenRef.current !== currentGen) return;
      setIsLoading(false);
      await playBrowserSpeech(speechText, language);
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
