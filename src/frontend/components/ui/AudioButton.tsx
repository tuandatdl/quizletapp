import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { ttsApi } from "../../api/tts.api";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import type { Language } from "../../types/api";
import { configureSpeechUtterance } from "../../services/speech";

let activeHtmlAudio: HTMLAudioElement | null = null;

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
  const { toastError, toastInfo } = (() => {
    try {
      const t = useToast();
      return { toastError: t.error, toastInfo: t.info };
    } catch {
      return { toastError: console.error, toastInfo: console.log };
    }
  })();
  const { settings } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const currentSpeed = speed ?? settings?.audioSpeed ?? 1;
  const speechText = text?.trim() ?? "";

  const stopCurrent = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      if (activeHtmlAudio === audioRef.current) activeHtmlAudio = null;
      audioRef.current = null;
    }
    if (utteranceRef.current && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
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

  const playBrowserSpeech = (speechText: string, lang: Language) => {
    if (!("speechSynthesis" in window)) {
      toastError("Trình duyệt không hỗ trợ phát âm (SpeechSynthesis).");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText);
    utteranceRef.current = utterance;
    const preferredVoice = lang === "zh" ? settings?.preferredVoiceZh : settings?.preferredVoiceEn;
    configureSpeechUtterance(utterance, lang, currentSpeed, window.speechSynthesis.getVoices(), preferredVoice);

    utterance.onstart = () => mountedRef.current && setIsPlaying(true);
    utterance.onend = () => {
      utteranceRef.current = null;
      if (mountedRef.current) setIsPlaying(false);
    };
    utterance.onerror = (event) => {
      utteranceRef.current = null;
      if (mountedRef.current) setIsPlaying(false);
      if (!['canceled', 'interrupted'].includes(event.error)) toastError("Lỗi khi phát âm qua trình duyệt.");
    };

    window.speechSynthesis.speak(utterance);
  };

  const playHtmlAudio = async (url: string, fallbackText?: string) => {
    if (activeHtmlAudio) {
      activeHtmlAudio.pause();
      activeHtmlAudio.src = "";
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    const audio = new Audio(url);
    audioRef.current = audio;
    activeHtmlAudio = audio;
    audio.playbackRate = currentSpeed;
    audio.onplay = () => {
      if (!mountedRef.current) return;
      setIsLoading(false);
      setIsPlaying(true);
    };
    audio.onended = () => {
      if (activeHtmlAudio === audio) activeHtmlAudio = null;
      audioRef.current = null;
      if (mountedRef.current) setIsPlaying(false);
    };
    audio.onerror = () => {
      if (activeHtmlAudio === audio) activeHtmlAudio = null;
      audioRef.current = null;
      if (!mountedRef.current) return;
      setIsLoading(false);
      setIsPlaying(false);
      if (fallbackText) playBrowserSpeech(fallbackText, language);
      else toastError("Không thể phát tệp âm thanh.");
    };
    try { await audio.play(); }
    catch {
      if (activeHtmlAudio === audio) activeHtmlAudio = null;
      audioRef.current = null;
      if (!mountedRef.current) return;
      setIsLoading(false);
      setIsPlaying(false);
      if (fallbackText) playBrowserSpeech(fallbackText, language);
      else toastError("Không thể phát tệp âm thanh.");
    }
  };

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlaying) {
      stopCurrent();
      return;
    }

    // 1. If audioUrl exists from backend/item, play directly
    if (audioUrl) {
      setIsLoading(true);
      await playHtmlAudio(audioUrl, speechText || undefined);
      return;
    }

    // 2. If text is provided, try TTS API
    if (speechText) {
      setIsLoading(true);
      const controller = new AbortController();
      abortRef.current?.abort();
      abortRef.current = controller;
      try {
        const res = await ttsApi.synthesize({
          text: speechText,
          language,
          speed: currentSpeed,
        }, controller.signal);
        abortRef.current = null;
        if (!mountedRef.current) return;

        if (res?.audioUrl) {
          await playHtmlAudio(res.audioUrl, speechText);
        } else {
          setIsLoading(false);
          playBrowserSpeech(speechText, language);
        }
      } catch (err: any) {
        abortRef.current = null;
        if (err?.name === "AbortError" || !mountedRef.current) return;
        setIsLoading(false);
        // If SERVICE_NOT_CONFIGURED or error, use browser fallback as permitted by contract
        playBrowserSpeech(speechText, language);
      }
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
