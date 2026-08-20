import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Headphones,
  Mic,
  Globe,
  Bookmark,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Loader2,
  X,
  Volume2,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { readingApi, type VocabularyContext } from "../../api/reading.api";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { AudioButton } from "../../components/ui/AudioButton";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { ReadingPlayer } from "../../components/reading/ReadingPlayer";
import { getFriendlyErrorMessage } from "../../api/client";
import type {
  Language,
  ProviderStatus,
  ReadingPassage,
  ReadingPlaybackState,
  ReadingSentence,
  Token,
  TranslationResult,
} from "../../types/api";
import type { VocabularyEnrichment } from "../../services/languageApi";
import { classifyLocalSelection } from "../../static/localDomain";
import {
  cancelSpeechAndWait,
  configureSpeechUtterance,
  getReadySpeechVoices,
  getSpeechCancelSettleMs,
  waitForSpeechVoices,
} from "../../services/speech";
import {
  synthesizeCloudSpeech,
  prefetchCloudSpeech,
  configureAudioElementPlaybackRate,
  DEFAULT_CLOUD_VOICE_EN,
} from "../../services/cloudTts";

export const ReadingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language: currentLang, settings } = useLanguage();
  const { success, error, info } = useToast();

  const [passage, setPassage] = useState<ReadingPassage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [translationAvailability, setTranslationAvailability] = useState<ProviderStatus>({
    configured: false,
    provider: null,
  });

  // Reading Playback State Machine
  const [playbackState, setPlaybackState] = useState<ReadingPlaybackState>({
    mode: "speech-synthesis",
    status: "idle",
    currentSentenceIndex: 0,
    currentSentenceId: null,
    totalSentences: 0,
    speed: settings?.audioSpeed || 1,
  });

  // Display Modes
  const [pronunciationMode, setPronunciationMode] = useState<boolean>(false);
  const [showFullTranslation, setShowFullTranslation] = useState<boolean>(settings?.showTranslation ?? true);
  const [isTranslatingPassage, setIsTranslatingPassage] = useState<boolean>(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  // Text Selection & Floating Toolbar State
  const [selectedText, setSelectedText] = useState<string>("");
  const [toolbarCoords, setToolbarCoords] = useState<{ x: number; y: number } | null>(null);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [translationUnavailableNotice, setTranslationUnavailableNotice] = useState<boolean>(false);
  const [isTranslatingSelection, setIsTranslatingSelection] = useState<boolean>(false);
  const [isSavingVocab, setIsSavingVocab] = useState<boolean>(false);
  const [manualMeaningVi, setManualMeaningVi] = useState<string>("");
  // Context-aware enrichment state
  const [selectedContext, setSelectedContext] = useState<VocabularyContext | null>(null);
  const [contextualEnrichment, setContextualEnrichment] = useState<VocabularyEnrichment | null>(null);
  const [isEnrichingContext, setIsEnrichingContext] = useState<boolean>(false);
  const [selectedSenseIndex, setSelectedSenseIndex] = useState<number>(-1); // -1 = primary
  const [showAllSenses, setShowAllSenses] = useState<boolean>(false);
  const [contextEnrichError, setContextEnrichError] = useState<string | null>(null);
  const [duplicateContextualSense, setDuplicateContextualSense] = useState<VocabularyEnrichment | null>(null);

  // Click-Word Popover State (Pronunciation Mode)
  const [activeToken, setActiveToken] = useState<{
    token: Token;
    coords: { x: number; y: number };
  } | null>(null);

  const readingAreaRef = useRef<HTMLDivElement>(null);
  const playbackCancelledRef = useRef(false);
  const currentSentenceIdxRef = useRef(0);
  const isPlayingRef = useRef(false);
  const playbackSessionIdRef = useRef(0);
  const sentencePlayAttemptRef = useRef(0);
  const playbackSpeedRef = useRef<number>(settings?.audioSpeed || 1);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enrichAbortRef = useRef<AbortController | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeObjectUrlRef = useRef<string | null>(null);
  const cloudAbortRef = useRef<AbortController | null>(null);

  // ---- Context capture helper ----
  function extractSentenceContext(sentences: ReadingPassage["sentences"]): VocabularyContext | null {
    if (!sentences || sentences.length === 0) return null;
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return null;
      const range = selection.getRangeAt(0);
      const startEl = range.startContainer.nodeType === Node.ELEMENT_NODE
        ? (range.startContainer as Element)
        : range.startContainer.parentElement;
      const sentenceEl = startEl?.closest("[data-sentence-index]");
      let foundIdx: number | null = null;
      if (sentenceEl) {
        const attr = sentenceEl.getAttribute("data-sentence-index");
        if (attr !== null && attr !== "") {
          const parsed = Number(attr);
          if (!Number.isNaN(parsed) && parsed >= 0 && parsed < sentences.length) {
            foundIdx = parsed;
          }
        }
      }
      if (foundIdx === null) {
        const selText = selection.toString().trim().toLowerCase();
        foundIdx = sentences.findIndex((s) => s.text.toLowerCase().includes(selText));
        if (foundIdx === -1) foundIdx = 0;
      }
      const idx = Math.max(0, Math.min(foundIdx, sentences.length - 1));
      return {
        sentence: sentences[idx]!.text,
        previousSentence: idx > 0 ? sentences[idx - 1]!.text : undefined,
        nextSentence: idx < sentences.length - 1 ? sentences[idx + 1]!.text : undefined,
      };
    } catch {
      return null;
    }
  }

  // Helper: get the currently-selected sense fields (primary or alternate)
  function getActiveSense(enrichment: VocabularyEnrichment, senseIdx: number) {
    if (senseIdx >= 0 && enrichment.senses && enrichment.senses[senseIdx]) {
      const s = enrichment.senses[senseIdx]!;
      return { meaningVi: s.meaningVi, partOfSpeech: s.partOfSpeech, ipa: s.ipa, pronunciation: s.pronunciation, example: s.example, exampleTranslation: s.exampleTranslation };
    }
    return { meaningVi: enrichment.meaningVi, partOfSpeech: enrichment.partOfSpeech, ipa: enrichment.ipa, pronunciation: enrichment.pronunciation, example: enrichment.example, exampleTranslation: enrichment.exampleTranslation };
  }

  function closeOverlays() {
    if (enrichAbortRef.current) { enrichAbortRef.current.abort(); enrichAbortRef.current = null; }
    setSelectedText("");
    setToolbarCoords(null);
    setTranslationResult(null);
    setTranslationUnavailableNotice(false);
    setContextualEnrichment(null);
    setSelectedContext(null);
    setSelectedSenseIndex(-1);
    setShowAllSenses(false);
    setContextEnrichError(null);
    setDuplicateContextualSense(null);
  }

  const triggerContextualEnrichment = (text: string, ctx: VocabularyContext | null) => {
    if (!passage || !ctx) return;
    if (enrichAbortRef.current) enrichAbortRef.current.abort();
    const controller = new AbortController();
    enrichAbortRef.current = controller;
    setIsEnrichingContext(true);
    setContextEnrichError(null);
    void readingApi.enrichFromContext({
      term: text,
      language: passage.language,
      sentence: ctx.sentence,
      previousSentence: ctx.previousSentence,
      nextSentence: ctx.nextSentence,
    }).then((result) => {
      if (controller.signal.aborted) return;
      if (!result) {
        setContextEnrichError("Không thể tra nghĩa theo ngữ cảnh. Thử lại.");
        return;
      }
      setContextualEnrichment(result);
      if (result.meaningVi) setManualMeaningVi(result.meaningVi);
    }).catch(() => {
      if (controller.signal.aborted) return;
      setContextEnrichError("Không thể tra nghĩa theo ngữ cảnh. Thử lại.");
    }).finally(() => {
      if (!controller.signal.aborted) setIsEnrichingContext(false);
    });
  };

  // Fetch passage & translation availability
  const fetchPassageAndMeta = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const [passageData, transAvail] = await Promise.all([
        readingApi.get(id),
        readingApi.getTranslationAvailability().catch(() => ({ configured: false, provider: null })),
      ]);

      setPassage(passageData);
      setTranslationAvailability(transAvail);
      setPlaybackState((prev) => ({
        ...prev,
        totalSentences: passageData.sentences.length,
        currentSentenceIndex: 0,
        currentSentenceId: passageData.sentences[0]?.id || null,
      }));
      currentSentenceIdxRef.current = 0;
    } catch (err: any) {
      const message = getFriendlyErrorMessage(err);
      setLoadError(message);
      setPassage(null);
      error(message);
    } finally {
      setIsLoading(false);
    }
  }, [id, error]);

  useEffect(() => {
    fetchPassageAndMeta();
  }, [fetchPassageAndMeta]);

  useEffect(() => {
    if (!settings) return;
    playbackSpeedRef.current = settings.audioSpeed;
    setPlaybackState((prev) => ({ ...prev, speed: settings.audioSpeed }));
    setShowFullTranslation(settings.showTranslation);
  }, [settings]);

  // Audio Playback Engine (Cloud TTS First + SpeechSynthesis Fallback)
  const cleanupActiveAudio = () => {
    if (activeAudioRef.current) {
      const audio = activeAudioRef.current;
      activeAudioRef.current = null;
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
    }
    if (activeObjectUrlRef.current) {
      const url = activeObjectUrlRef.current;
      activeObjectUrlRef.current = null;
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }
  };

  const stopAllAudio = useCallback(() => {
    playbackCancelledRef.current = true;
    playbackSessionIdRef.current += 1;
    sentencePlayAttemptRef.current += 1;
    isPlayingRef.current = false;
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    if (cloudAbortRef.current) {
      cloudAbortRef.current.abort();
      cloudAbortRef.current = null;
    }
    cleanupActiveAudio();
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [stopAllAudio]);

  const scheduleNextSentence = (
    nextIndex: number,
    effectiveSpeed: number,
    sessionId: number
  ) => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    if (playbackCancelledRef.current || playbackSessionIdRef.current !== sessionId) return;

    if (passage && nextIndex < passage.sentences.length) {
      transitionTimerRef.current = setTimeout(() => {
        transitionTimerRef.current = null;
        if (!playbackCancelledRef.current && playbackSessionIdRef.current === sessionId) {
          void playSentenceAtIndex(nextIndex, true, effectiveSpeed);
        }
      }, 70);
    } else {
      setPlaybackState((prev) => ({
        ...prev,
        status: "completed",
        loading: false,
        currentSentenceIndex: (passage?.sentences.length || 1) - 1,
      }));
      isPlayingRef.current = false;
    }
  };

  const playBrowserSentence = async (
    index: number,
    sentence: ReadingSentence,
    effectiveSpeed: number,
    sessionId: number,
    attemptId: number
  ) => {
    if (!("speechSynthesis" in window)) return;
    cleanupActiveAudio();

    const settleMs = getSpeechCancelSettleMs(effectiveSpeed);
    await cancelSpeechAndWait(settleMs);
    if (playbackCancelledRef.current || playbackSessionIdRef.current !== sessionId || sentencePlayAttemptRef.current !== attemptId) return;

    const voices = await waitForSpeechVoices(200);
    if (playbackCancelledRef.current || playbackSessionIdRef.current !== sessionId || sentencePlayAttemptRef.current !== attemptId) return;

    const utterance = new SpeechSynthesisUtterance(sentence.text);
    const preferredVoice = passage?.language === "zh" ? settings?.preferredVoiceZh : settings?.preferredVoiceEn;
    configureSpeechUtterance(
      utterance,
      passage?.language || "en",
      effectiveSpeed,
      voices.length > 0 ? voices : getReadySpeechVoices(),
      preferredVoice
    );

    utterance.onstart = () => {
      if (playbackCancelledRef.current || playbackSessionIdRef.current !== sessionId || sentencePlayAttemptRef.current !== attemptId) return;
      setPlaybackState((prev) => ({ ...prev, loading: false, status: "playing" }));
    };

    let nextScheduled = false;
    utterance.onend = () => {
      if (nextScheduled || playbackCancelledRef.current || playbackSessionIdRef.current !== sessionId || sentencePlayAttemptRef.current !== attemptId) return;
      nextScheduled = true;
      scheduleNextSentence(index + 1, effectiveSpeed, sessionId);
    };

    utterance.onerror = (event) => {
      if (playbackCancelledRef.current || playbackSessionIdRef.current !== sessionId || sentencePlayAttemptRef.current !== attemptId) return;
      if (!["canceled", "interrupted"].includes((event as any)?.error)) {
        setPlaybackState((prev) => ({ ...prev, status: "paused", loading: false }));
        isPlayingRef.current = false;
      }
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      if (!playbackCancelledRef.current && playbackSessionIdRef.current === sessionId && sentencePlayAttemptRef.current === attemptId) {
        setPlaybackState((prev) => ({ ...prev, status: "paused", loading: false }));
        isPlayingRef.current = false;
      }
    }
  };

  const playBrowserSentenceSequential = (
    index: number,
    sentence: ReadingSentence,
    effectiveSpeed: number,
    sessionId: number,
    attemptId: number
  ) => {
    if (!("speechSynthesis" in window)) return;
    cleanupActiveAudio();

    if (playbackCancelledRef.current || playbackSessionIdRef.current !== sessionId || sentencePlayAttemptRef.current !== attemptId) return;

    const utterance = new SpeechSynthesisUtterance(sentence.text);
    const preferredVoice = passage?.language === "zh" ? settings?.preferredVoiceZh : settings?.preferredVoiceEn;
    configureSpeechUtterance(
      utterance,
      passage?.language || "en",
      effectiveSpeed,
      getReadySpeechVoices(),
      preferredVoice
    );

    let nextScheduled = false;
    utterance.onend = () => {
      if (nextScheduled || playbackCancelledRef.current || playbackSessionIdRef.current !== sessionId || sentencePlayAttemptRef.current !== attemptId) return;
      nextScheduled = true;
      scheduleNextSentence(index + 1, effectiveSpeed, sessionId);
    };

    utterance.onerror = (event) => {
      if (playbackCancelledRef.current || playbackSessionIdRef.current !== sessionId || sentencePlayAttemptRef.current !== attemptId) return;
      if (!["canceled", "interrupted"].includes((event as any)?.error)) {
        setPlaybackState((prev) => ({ ...prev, status: "paused", loading: false }));
        isPlayingRef.current = false;
      }
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      if (!playbackCancelledRef.current && playbackSessionIdRef.current === sessionId && sentencePlayAttemptRef.current === attemptId) {
        setPlaybackState((prev) => ({ ...prev, status: "paused", loading: false }));
        isPlayingRef.current = false;
      }
    }
  };

  const playSentenceAtIndex = useCallback(
    async (index: number, isSequential = false, speedOverride?: number) => {
      if (!passage || !passage.sentences || index >= passage.sentences.length) {
        setPlaybackState((prev) => ({ ...prev, status: "completed", loading: false }));
        isPlayingRef.current = false;
        return;
      }

      const sentence = passage.sentences[index];
      if (!sentence) return;

      sentencePlayAttemptRef.current += 1;
      const attemptId = sentencePlayAttemptRef.current;

      if (!isSequential) {
        playbackSessionIdRef.current += 1;
        playbackCancelledRef.current = false;
        isPlayingRef.current = true;
        if ("speechSynthesis" in window) {
          try {
            window.speechSynthesis.cancel();
          } catch {}
        }
      }

      const sessionId = playbackSessionIdRef.current;
      if (playbackCancelledRef.current || playbackSessionIdRef.current !== sessionId) return;

      currentSentenceIdxRef.current = index;
      const effectiveSpeed = speedOverride ?? playbackSpeedRef.current;
      const isCloudPreferred = (settings?.audioEngine !== "BROWSER") && passage.language === "en";

      setPlaybackState((prev) => ({
        ...prev,
        status: "playing",
        currentSentenceIndex: index,
        currentSentenceId: sentence.id,
        loading: isCloudPreferred && !isSequential,
        engine: isCloudPreferred ? "cloud" : "browser",
      }));

      if (isCloudPreferred) {
        let fallbackTriggered = false;
        const triggerFallbackOnce = () => {
          if (fallbackTriggered) return;
          fallbackTriggered = true;

          if (playbackCancelledRef.current || playbackSessionIdRef.current !== sessionId || sentencePlayAttemptRef.current !== attemptId) {
            return;
          }

          cleanupActiveAudio();

          if (isSequential) {
            void playBrowserSentenceSequential(index, sentence, effectiveSpeed, sessionId, attemptId);
          } else {
            void playBrowserSentence(index, sentence, effectiveSpeed, sessionId, attemptId);
          }
        };

        try {
          const voice = settings?.preferredCloudVoiceEn || DEFAULT_CLOUD_VOICE_EN;
          const controller = new AbortController();
          cloudAbortRef.current?.abort();
          cloudAbortRef.current = controller;

          // Prefetch next sentence in background (cache warm only, never plays)
          if (index + 1 < passage.sentences.length) {
            void prefetchCloudSpeech({
              text: passage.sentences[index + 1]!.text,
              language: "en",
              voice,
            });
          }

          const blob = await synthesizeCloudSpeech({
            text: sentence.text,
            language: "en",
            voice,
            signal: controller.signal,
          });

          if (playbackCancelledRef.current || playbackSessionIdRef.current !== sessionId || sentencePlayAttemptRef.current !== attemptId) {
            return;
          }

          cleanupActiveAudio();

          const objectUrl = URL.createObjectURL(blob);
          activeObjectUrlRef.current = objectUrl;
          const audio = new Audio(objectUrl);
          activeAudioRef.current = audio;

          configureAudioElementPlaybackRate(audio, effectiveSpeed);

          audio.onplay = () => {
            if (playbackCancelledRef.current || playbackSessionIdRef.current !== sessionId || sentencePlayAttemptRef.current !== attemptId) return;
            setPlaybackState((prev) => ({ ...prev, loading: false, status: "playing" }));
          };

          let nextScheduled = false;
          audio.onended = () => {
            cleanupActiveAudio();
            if (nextScheduled || playbackCancelledRef.current || playbackSessionIdRef.current !== sessionId || sentencePlayAttemptRef.current !== attemptId) return;
            nextScheduled = true;
            scheduleNextSentence(index + 1, effectiveSpeed, sessionId);
          };

          audio.onerror = () => {
            triggerFallbackOnce();
          };

          await audio.play();
          return;
        } catch {
          triggerFallbackOnce();
          return;
        }
      } else {
        cleanupActiveAudio();
        if (isSequential) {
          void playBrowserSentenceSequential(index, sentence, effectiveSpeed, sessionId, attemptId);
        } else {
          void playBrowserSentence(index, sentence, effectiveSpeed, sessionId, attemptId);
        }
      }
    },
    [passage, settings?.preferredVoiceZh, settings?.preferredVoiceEn, settings?.preferredCloudVoiceEn, settings?.audioEngine]
  );

  const handlePlay = useCallback(() => {
    stopAllAudio();
    void playSentenceAtIndex(currentSentenceIdxRef.current, false, playbackSpeedRef.current);
  }, [stopAllAudio, playSentenceAtIndex]);

  const handlePause = useCallback(() => {
    stopAllAudio();
    setPlaybackState((prev) => ({ ...prev, status: "paused", loading: false }));
  }, [stopAllAudio]);

  const handleResume = useCallback(() => {
    stopAllAudio();
    void playSentenceAtIndex(currentSentenceIdxRef.current, false, playbackSpeedRef.current);
  }, [stopAllAudio, playSentenceAtIndex]);

  const handleRestart = useCallback(() => {
    stopAllAudio();
    currentSentenceIdxRef.current = 0;
    void playSentenceAtIndex(0, false, playbackSpeedRef.current);
  }, [stopAllAudio, playSentenceAtIndex]);

  const handleSeekSentence = useCallback(
    (index: number) => {
      const wasPlaying = isPlayingRef.current;
      stopAllAudio();
      currentSentenceIdxRef.current = index;
      setPlaybackState((prev) => ({
        ...prev,
        currentSentenceIndex: index,
        currentSentenceId: passage?.sentences[index]?.id || null,
        status: wasPlaying ? "playing" : "paused",
      }));
      if (wasPlaying) {
        void playSentenceAtIndex(index, false, playbackSpeedRef.current);
      }
    },
    [stopAllAudio, passage, playSentenceAtIndex]
  );

  const handlePreviousSentence = useCallback(() => {
    const prevIdx = Math.max(0, currentSentenceIdxRef.current - 1);
    handleSeekSentence(prevIdx);
  }, [handleSeekSentence]);

  const handleNextSentence = useCallback(() => {
    if (!passage) return;
    const nextIdx = Math.min(passage.sentences.length - 1, currentSentenceIdxRef.current + 1);
    handleSeekSentence(nextIdx);
  }, [passage, handleSeekSentence]);

  const handleSpeedChange = useCallback(
    (newSpeed: 0.75 | 1 | 1.25) => {
      const wasPlaying = isPlayingRef.current;
      playbackSpeedRef.current = newSpeed;
      setPlaybackState((prev) => ({ ...prev, speed: newSpeed }));

      if (wasPlaying) {
        if (activeAudioRef.current && !activeAudioRef.current.paused) {
          // Live rate update on active HTMLAudioElement with pitch preservation
          configureAudioElementPlaybackRate(activeAudioRef.current, newSpeed);
        } else {
          stopAllAudio();
          void playSentenceAtIndex(currentSentenceIdxRef.current, false, newSpeed);
        }
      }
    },
    [stopAllAudio, playSentenceAtIndex]
  );

  // Click on sentence text jumps playback to that sentence
  const handleSentenceClick = (sIdx: number) => {
    handleSeekSentence(sIdx);
  };

  // Full passage translation
  const handleTranslatePassage = async () => {
    if (!passage) return;
    if (!translationAvailability.configured) {
      info("Tính năng dịch tự động hiện chưa được cấu hình trên máy chủ.");
      return;
    }

    setIsTranslatingPassage(true);
    setTranslationError(null);
    try {
      const result = await readingApi.translatePassage(passage.id);
      setPassage((prev) => (prev ? { ...prev, translationVi: result.translation } : prev));
      setShowFullTranslation(true);
      success("Đã tạo bản dịch toàn bài thành công!");
    } catch (err: any) {
      setTranslationError(getFriendlyErrorMessage(err));
    } finally {
      setIsTranslatingPassage(false);
    }
  };

  // Text Selection Detection
  const handleMouseUp = () => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        if (!translationResult && !translationUnavailableNotice) {
          setSelectedText("");
          setToolbarCoords(null);
        }
        return;
      }

      const text = selection.toString().trim();
      if (!text || text.length > 1000) {
        setSelectedText("");
        setToolbarCoords(null);
        setTranslationResult(null);
        setTranslationUnavailableNotice(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.width === 0 && rect.height === 0) return;

      // Capture surrounding sentence context via DOM lookup
      const ctx = passage ? extractSentenceContext(passage.sentences) : null;

      setSelectedText(text);
      setSelectedContext(ctx);
      setManualMeaningVi("");
      setContextualEnrichment(null);
      setContextEnrichError(null);
      setSelectedSenseIndex(-1);
      setShowAllSenses(false);
      setDuplicateContextualSense(null);
      setToolbarCoords({
        x: Math.min(window.innerWidth - 170, Math.max(170, rect.left + rect.width / 2)),
        y: Math.max(70, rect.top - 10),
      });
      setTranslationResult(null);
      setTranslationUnavailableNotice(false);

      // Auto-trigger contextual enrichment for word/phrase selections
      if (passage && ctx) {
        const selType = classifyLocalSelection(text, passage.language);
        if ((selType === "word" || selType === "phrase") && text.split(/\s+/).length <= 6) {
          triggerContextualEnrichment(text, ctx);
        }
      }
    }, 50);
  };

  // Selection Translation Action
  const handleTranslateSelection = async () => {
    if (!selectedText || !passage) return;
    const isWordOrPhrase = selectedContext && (classifyLocalSelection(selectedText, passage.language) !== "sentence") && selectedText.split(/\s+/).length <= 6;
    if (isWordOrPhrase) {
      triggerContextualEnrichment(selectedText, selectedContext);
      return;
    }
    if (!translationAvailability.configured) {
      setTranslationUnavailableNotice(true);
      return;
    }

    setIsTranslatingSelection(true);
    try {
      const res = await readingApi.translateSelection({
        text: selectedText,
        sourceLanguage: passage.language,
        targetLanguage: "vi",
        readingId: passage.id,
      });
      setTranslationResult(res);
      setManualMeaningVi(res.translation);
      setTranslationUnavailableNotice(false);
    } catch (err: any) {
      setTranslationUnavailableNotice(true);
    } finally {
      setIsTranslatingSelection(false);
    }
  };

  // Save Selection to Vocabulary
  const handleSaveSelectionToVocab = async () => {
    if (!selectedText || !passage) return;

    // Prefer manual input, then contextual enrichment sense
    const activeSense = contextualEnrichment ? getActiveSense(contextualEnrichment, selectedSenseIndex) : null;
    const isWordOrPhrase = selectedContext && (classifyLocalSelection(selectedText, passage.language) !== "sentence") && selectedText.split(/\s+/).length <= 6;

    let meaning = manualMeaningVi.trim() || activeSense?.meaningVi || "";

    // For long selections without word context: allow translation fallback
    if (!meaning && !isWordOrPhrase && translationAvailability.configured) {
      try {
        const translated = await readingApi.translateSelection({
          text: selectedText,
          sourceLanguage: passage.language,
          targetLanguage: "vi",
          readingId: passage.id,
        });
        meaning = translated.translation.trim();
        setTranslationResult(translated);
        setManualMeaningVi(meaning);
      } catch {}
    }
    if (!meaning) {
      info("Vui lòng nhập nghĩa tiếng Việt để lưu vào kho từ vựng.");
      return;
    }

    setIsSavingVocab(true);
    try {
      const res = await readingApi.saveFromSelection({
        text: selectedText,
        sourceLanguage: passage.language,
        targetLanguage: "vi",
        readingId: passage.id,
        meaningVi: manualMeaningVi.trim() || activeSense?.meaningVi || meaning,
        partOfSpeech: activeSense?.partOfSpeech || contextualEnrichment?.partOfSpeech,
        ...(selectedContext ? { context: selectedContext } : {}),
      });

      if (res.duplicate) {
        if (res.contextualSense) {
          setDuplicateContextualSense(res.contextualSense);
          info(`Từ "${selectedText}" đã có trong kho từ của bạn.`);
        } else {
          info(`Từ "${selectedText}" đã có trong kho từ của bạn.`);
          closeOverlays();
        }
      } else {
        success(`Đã lưu "${selectedText}" vào kho từ vựng!`);
        closeOverlays();
      }
    } catch (err: any) {
      error(getFriendlyErrorMessage(err));
    } finally {
      setIsSavingVocab(false);
    }
  };

  // Token Click in Pronunciation/Lookup Mode
  const handleTokenClick = (token: Token, e: React.MouseEvent) => {
    if (!pronunciationMode || !token.clickable) return;
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setActiveToken({
      token,
      coords: {
        x: Math.min(window.innerWidth - 160, Math.max(160, rect.left + rect.width / 2)),
        y: Math.max(60, rect.top - 8),
      },
    });
  };

  // Close overlays on outside click
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".floating-selection-toolbar") && !target.closest(".token-popover")) {
        if (!window.getSelection()?.toString().trim()) {
          closeOverlays();
        }
        setActiveToken(null);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      stopAllAudio();
      if (enrichAbortRef.current) enrichAbortRef.current.abort();
    };
  }, [stopAllAudio]);

  if (isLoading) {
    return (
      <div className="page-container flex-col gap-6" style={{ maxWidth: "var(--reading-max-width)" }}>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (loadError || !passage) {
    return (
      <div className="page-container flex-col items-center justify-center gap-4" style={{ maxWidth: "var(--reading-max-width)", textAlign: "center" }}>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>Không thể mở bài đọc</h1>
        <p>{loadError || "Bài đọc không tồn tại hoặc bạn không có quyền truy cập."}</p>
        <Button variant="primary" onClick={() => navigate("/reading")}>Về danh sách bài đọc</Button>
      </div>
    );
  }

  const isZh = passage.language === "zh";

  return (
    <div className="page-container reading-page-container flex-col gap-6 animate-fade-in" style={{ maxWidth: "var(--reading-max-width)" }}>
      {/* Top Navigation & Metadata */}
      <div className="flex-row justify-between items-center" style={{ flexWrap: "wrap", gap: "12px" }}>
        <Link to="/reading">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>
            Danh sách bài đọc
          </Button>
        </Link>

        <div className="flex-row items-center gap-2">
          <Badge variant={isZh ? "zh" : "en"}>
            {isZh ? "🇨🇳 Tiếng Trung" : "🇬🇧 Tiếng Anh"}
          </Badge>
          {passage.level && <Badge variant="default">{passage.level}</Badge>}
          {passage.topic && <Badge variant="default">{passage.topic}</Badge>}
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
            {passage.wordCount} từ
          </span>
        </div>
      </div>

      {/* Main Reading Card */}
      <div
        className="reading-main-card"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-default)",
          padding: "var(--space-8)",
          boxShadow: "var(--shadow-sm)",
          maxWidth: "100%",
          boxSizing: "border-box" as const,
          overflowX: "hidden" as const,
        }}
      >
        {/* Title */}
        <h1
          className={isZh ? "hanzi" : ""}
          style={{
            fontSize: isZh ? "2rem" : "1.875rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: "var(--space-4)",
            letterSpacing: "-0.02em",
          }}
        >
          {passage.title}
        </h1>

        {/* Toolbar: Dedicated Reading Player */}
        <div style={{ marginBottom: "var(--space-6)" }}>
          <ReadingPlayer
            playbackState={playbackState}
            onPlay={handlePlay}
            onPause={handlePause}
            onResume={handleResume}
            onRestart={handleRestart}
            onSeekSentence={handleSeekSentence}
            onPreviousSentence={handlePreviousSentence}
            onNextSentence={handleNextSentence}
            onSpeedChange={handleSpeedChange}
            language={passage.language}
          />
        </div>

        {/* Action Bar (Modes & Shortcuts) */}
        <div
          className="reading-action-bar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "var(--space-6)",
            paddingBottom: "var(--space-4)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div className="flex-row items-center gap-2" style={{ flexWrap: "wrap" }}>
            {/* Click-Word / Lookup Mode Toggle */}
            <button
              type="button"
              onClick={() => setPronunciationMode(!pronunciationMode)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${
                  pronunciationMode
                    ? isZh
                      ? "var(--accent-zh-border)"
                      : "var(--accent-en-border)"
                    : "var(--border-default)"
                }`,
                backgroundColor: pronunciationMode
                  ? isZh
                    ? "var(--accent-zh-subtle)"
                    : "var(--accent-en-subtle)"
                  : "var(--bg-surface)",
                color: pronunciationMode
                  ? isZh
                    ? "var(--accent-zh-text)"
                    : "var(--accent-en-text)"
                  : "var(--text-secondary)",
                fontSize: "var(--text-xs)",
                fontWeight: 700,
                transition: "all var(--transition-fast)",
              }}
              aria-label="Bật/Tắt chế độ tra từ nhanh"
            >
              <Mic size={14} />
              <span>{pronunciationMode ? "Chế độ tra từ: BẬT" : "Chế độ tra từ"}</span>
            </button>

            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
              (Bôi đen bất kỳ đoạn văn nào để dịch và lưu từ)
            </span>
          </div>

          {/* Shadowing CTA */}
          <Link to={`/shadowing?readingId=${passage.id}`}>
            <Button variant="secondary" size="sm" leftIcon={<Headphones size={14} />}>
              Luyện Shadowing
            </Button>
          </Link>
        </div>

        {/* ================= READING PASSAGE TEXT AREA ================= */}
        <div
          ref={readingAreaRef}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className="reading-passage-area"
          style={{
            fontSize: isZh ? "1.375rem" : "1.125rem",
            lineHeight: isZh ? "2.3" : "1.9",
            fontFamily: isZh ? "var(--font-chinese)" : "var(--font-body)",
            color: "var(--text-primary)",
            position: "relative",
            userSelect: "text",
            padding: "4px 0",
          }}
        >
          {passage.sentences.map((sentence, sIdx) => {
            const isPlayingThisSentence =
              playbackState.status === "playing" && playbackState.currentSentenceIndex === sIdx;
            const isPausedAtThisSentence =
              playbackState.status === "paused" && playbackState.currentSentenceIndex === sIdx;

            return (
              <span
                key={sentence.id}
                data-sentence-index={sIdx}
                className={`reading-sentence-block ${
                  isPlayingThisSentence ? "sentence-active" : isPausedAtThisSentence ? "sentence-paused" : ""
                }`}
                onClick={() => handleSentenceClick(sIdx)}
                style={{
                  position: "relative",
                  display: "inline",
                  backgroundColor: isPlayingThisSentence
                    ? isZh
                      ? "var(--accent-zh-subtle)"
                      : "var(--accent-en-subtle)"
                    : isPausedAtThisSentence
                    ? "var(--bg-muted)"
                    : "transparent",
                  borderRadius: "var(--radius-sm)",
                  transition: "background-color var(--transition-fast)",
                  padding: "2px 4px",
                  marginRight: "4px",
                  cursor: "pointer",
                }}
                title="Nhấn để tua đến câu này"
              >
                {/* Sentence Tokens */}
                {sentence.tokens.map((token, tIdx) => {
                  const isWord = token.type === "word" && token.clickable;

                  return (
                    <span
                      key={`${sentence.id}-${tIdx}`}
                      onClick={(e) => handleTokenClick(token, e)}
                      style={{
                        cursor: pronunciationMode && isWord ? "pointer" : "inherit",
                        borderRadius: "var(--radius-xs)",
                        padding: pronunciationMode && isWord ? "1px 2px" : "0",
                        backgroundColor:
                          pronunciationMode && isWord ? "var(--bg-muted)" : "transparent",
                        textDecoration: pronunciationMode && isWord ? "underline dotted 1.5px" : "none",
                        textUnderlineOffset: "3px",
                        fontWeight: isZh ? 500 : 400,
                        transition: "background-color var(--transition-fast)",
                      }}
                      className={isZh ? "hanzi" : ""}
                    >
                      {token.text}
                    </span>
                  );
                })}

                {/* Inline Sentence Audio Replay Button */}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    verticalAlign: "middle",
                    marginLeft: "4px",
                    marginRight: "6px",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    stopAllAudio();
                  }}
                >
                  <AudioButton
                    text={sentence.text}
                    audioUrl={sentence.audioUrl}
                    language={passage.language}
                    size="sm"
                    label={`Nghe câu: ${sentence.text}`}
                  />
                </span>
              </span>
            );
          })}
        </div>

        {/* ================= FLOATING SELECTION TOOLBAR ================= */}
        {toolbarCoords && selectedText && (
          <div
            className="floating-selection-toolbar animate-pop-in"
            style={{
              position: "fixed",
              left: `${toolbarCoords.x}px`,
              top: `${toolbarCoords.y}px`,
              transform: "translate(-50%, -100%)",
              zIndex: 900,
              backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-xl)",
              padding: "6px 8px",
              boxShadow: "var(--shadow-float)",
              border: "1px solid var(--border-default)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              maxWidth: "calc(100vw - 16px)",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={handleTranslateSelection}
              disabled={isTranslatingSelection}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 10px",
                borderRadius: "var(--radius-md)",
                backgroundColor: isZh ? "var(--accent-zh-subtle)" : "var(--accent-en-subtle)",
                color: isZh ? "var(--accent-zh-text)" : "var(--accent-en-text)",
                fontSize: "var(--text-xs)",
                fontWeight: 700,
              }}
              title={
                translationAvailability.configured
                  ? "Dịch nghĩa đoạn đã chọn"
                  : "Dịch tự động chưa được cấu hình"
              }
            >
              {isTranslatingSelection ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Globe size={13} />
              )}
              <span>{translationAvailability.configured ? "Dịch" : "Dịch (Chưa khả dụng)"}</span>
            </button>

            <AudioButton
              text={selectedText}
              language={passage.language}
              size="sm"
              variant="secondary"
            />

            <button
              type="button"
              onClick={handleSaveSelectionToVocab}
              disabled={isSavingVocab}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 10px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-muted)",
                color: "var(--text-primary)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
              }}
              title="Lưu vào kho từ vựng"
            >
              {isSavingVocab ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Bookmark size={13} />
              )}
              <span>Lưu từ vựng</span>
            </button>

            <button
              type="button"
              onClick={closeOverlays}
              style={{
                padding: "4px",
                color: "var(--text-tertiary)",
                display: "flex",
              }}
              aria-label="Đóng thanh công cụ chọn từ"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ================= CONTEXTUAL DICTIONARY POPUP ================= */}
        {toolbarCoords && selectedText && (isEnrichingContext || contextualEnrichment || contextEnrichError || duplicateContextualSense) && (
          <div
            className="floating-selection-toolbar animate-pop-in"
            style={{
              position: "fixed",
              left: `${toolbarCoords.x}px`,
              top: `${toolbarCoords.y + 46}px`,
              transform: "translateX(-50%)",
              zIndex: 901,
              backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-xl)",
              padding: "14px 16px",
              boxShadow: "var(--shadow-float)",
              border: "1px solid var(--border-default)",
              maxWidth: "340px",
              width: "88vw",
              minWidth: "220px",
            }}
          >
            {/* Header */}
            <div className="flex-row justify-between items-center" style={{ marginBottom: "8px" }}>
              <div style={{ fontWeight: 800, fontSize: "var(--text-base)" }}>{selectedText}</div>
              <button type="button" onClick={closeOverlays} style={{ color: "var(--text-tertiary)", display: "flex" }} aria-label="Đóng popup từ điển"><X size={14} /></button>
            </div>

            {/* Loading */}
            {isEnrichingContext && (
              <div className="flex-row items-center gap-2" style={{ color: "var(--text-tertiary)", fontSize: "var(--text-xs)", marginBottom: "8px" }}>
                <Loader2 size={13} className="animate-spin" />
                <span>Đang tra từ theo ngữ cảnh...</span>
              </div>
            )}

            {/* Error with Retry & manual fallback */}
            {!isEnrichingContext && contextEnrichError && !contextualEnrichment && (
              <div style={{ marginBottom: "10px" }}>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-warning-text)", backgroundColor: "var(--color-warning-bg)", padding: "8px 10px", borderRadius: "var(--radius-md)", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{contextEnrichError}</span>
                  <button
                    type="button"
                    onClick={() => triggerContextualEnrichment(selectedText, selectedContext)}
                    style={{ fontSize: "var(--text-xs)", fontWeight: 700, textDecoration: "underline", color: "var(--color-warning-text)", background: "none", border: "none", cursor: "pointer", padding: "2px 4px" }}
                  >
                    Thử lại
                  </button>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "3px" }}>Tự nhập nghĩa tiếng Việt:</label>
                  <input type="text" value={manualMeaningVi} onChange={(e) => setManualMeaningVi(e.target.value)} placeholder="Nhập nghĩa tiếng Việt..." style={{ width: "100%", padding: "6px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", backgroundColor: "var(--bg-surface)", fontSize: "var(--text-xs)" }} />
                </div>
                <div className="flex-row" style={{ gap: "6px", justifyContent: "flex-end" }}>
                  <Button variant={isZh ? "zh" : "primary"} size="sm" isLoading={isSavingVocab} disabled={!manualMeaningVi.trim()} onClick={handleSaveSelectionToVocab} leftIcon={<Bookmark size={12} />}>
                    Lưu vào kho
                  </Button>
                </div>
              </div>
            )}

            {/* Duplicate + contextual sense */}
            {duplicateContextualSense && (
              <div style={{ fontSize: "var(--text-xs)", padding: "8px 10px", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-info-bg)", border: "1px solid var(--color-info-border)", marginBottom: "10px" }}>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>Từ này đã có trong kho.</div>
                <div style={{ color: "var(--text-secondary)" }}>Trong câu này: <strong>{duplicateContextualSense.meaningVi}</strong></div>
                {duplicateContextualSense.partOfSpeech && <div style={{ color: "var(--text-tertiary)", marginTop: "2px" }}>{duplicateContextualSense.partOfSpeech}{duplicateContextualSense.ipa ? ` · ${duplicateContextualSense.ipa}` : ""}</div>}
              </div>
            )}

            {/* Main enrichment result */}
            {!isEnrichingContext && contextualEnrichment && !duplicateContextualSense && (() => {
              const activeSense = getActiveSense(contextualEnrichment, selectedSenseIndex);
              const allSenses = contextualEnrichment.senses ?? [];
              return (
                <>
                  {selectedContext && (
                    <div className="flex-row items-center gap-1" style={{ marginBottom: "6px" }}>
                      <CheckCircle2 size={12} color="var(--color-success-text)" />
                      <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-success-text)" }}>Nghĩa theo ngữ cảnh</span>
                    </div>
                  )}
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginBottom: "4px" }}>
                    {activeSense.partOfSpeech && <span>{activeSense.partOfSpeech}</span>}
                    {activeSense.ipa && <span> · <span style={{ fontFamily: "monospace" }}>{activeSense.ipa}</span></span>}
                  </div>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--color-success-text)", backgroundColor: "var(--color-success-bg)", padding: "6px 10px", borderRadius: "var(--radius-md)", marginBottom: "8px" }}>
                    {activeSense.meaningVi}
                  </div>
                  {selectedContext?.sentence && (
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", fontStyle: "italic", marginBottom: "8px", padding: "4px 8px", borderLeft: "2px solid var(--border-default)" }}>
                      "{selectedContext.sentence}"
                    </div>
                  )}
                  {allSenses.length > 0 && (
                    <div style={{ marginBottom: "8px" }}>
                      <button type="button" onClick={() => setShowAllSenses(!showAllSenses)} style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: "4px" }}>
                        {showAllSenses ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        <span>{allSenses.length} nghĩa khác</span>
                      </button>
                      {showAllSenses && (
                        <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
                          <button type="button" onClick={() => { setSelectedSenseIndex(-1); setManualMeaningVi(contextualEnrichment.meaningVi ?? ""); }}
                            style={{ textAlign: "left", padding: "5px 8px", borderRadius: "var(--radius-md)", backgroundColor: selectedSenseIndex === -1 ? (isZh ? "var(--accent-zh-subtle)" : "var(--accent-en-subtle)") : "var(--bg-muted)", border: selectedSenseIndex === -1 ? `1px solid ${isZh ? "var(--accent-zh-border)" : "var(--accent-en-border)"}` : "1px solid transparent", fontSize: "var(--text-xs)" }}>
                            <span style={{ fontWeight: 700 }}>{contextualEnrichment.meaningVi}</span>
                            {contextualEnrichment.partOfSpeech && <span style={{ color: "var(--text-tertiary)", marginLeft: "4px" }}>({contextualEnrichment.partOfSpeech})</span>}
                            {contextualEnrichment.ipa && <span style={{ color: "var(--text-tertiary)", marginLeft: "4px", fontFamily: "monospace" }}>{contextualEnrichment.ipa}</span>}
                          </button>
                          {allSenses.map((sense, i) => (
                            <button key={i} type="button" onClick={() => { setSelectedSenseIndex(i); setManualMeaningVi(sense.meaningVi); }}
                              style={{ textAlign: "left", padding: "5px 8px", borderRadius: "var(--radius-md)", backgroundColor: selectedSenseIndex === i ? (isZh ? "var(--accent-zh-subtle)" : "var(--accent-en-subtle)") : "var(--bg-muted)", border: selectedSenseIndex === i ? `1px solid ${isZh ? "var(--accent-zh-border)" : "var(--accent-en-border)"}` : "1px solid transparent", fontSize: "var(--text-xs)" }}>
                              <span style={{ fontWeight: 700 }}>{sense.meaningVi}</span>
                              {sense.partOfSpeech && <span style={{ color: "var(--text-tertiary)", marginLeft: "4px" }}>({sense.partOfSpeech})</span>}
                              {sense.ipa && <span style={{ color: "var(--text-tertiary)", marginLeft: "4px", fontFamily: "monospace" }}>{sense.ipa}</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "3px" }}>Giải nghĩa (có thể chỉnh):</label>
                    <input type="text" value={manualMeaningVi} onChange={(e) => setManualMeaningVi(e.target.value)} placeholder="Nhập nghĩa tiếng Việt..." style={{ width: "100%", padding: "6px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", backgroundColor: "var(--bg-surface)", fontSize: "var(--text-xs)" }} />
                  </div>
                  <div className="flex-row" style={{ gap: "6px", justifyContent: "flex-end" }}>
                    <AudioButton text={selectedText} language={passage.language} size="sm" />
                    <Button variant={isZh ? "zh" : "primary"} size="sm" isLoading={isSavingVocab} disabled={!manualMeaningVi.trim() && !activeSense.meaningVi} onClick={handleSaveSelectionToVocab} leftIcon={<Bookmark size={12} />}>
                      Lưu vào kho
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ================= CLASSIC TRANSLATION POPOVER (long selections / no word context) ================= */}
        {(translationResult || translationUnavailableNotice) && toolbarCoords && !selectedContext && !contextualEnrichment && !isEnrichingContext && (

          <div
            className="floating-selection-toolbar animate-pop-in"
            style={{
              position: "fixed",
              left: `${toolbarCoords.x}px`,
              top: `${toolbarCoords.y + 40}px`,
              transform: "translateX(-50%)",
              zIndex: 901,
              backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-xl)",
              padding: "16px 18px",
              boxShadow: "var(--shadow-float)",
              border: "1px solid var(--border-default)",
              maxWidth: "380px",
              width: "90vw",
            }}
          >
            <div className="flex-row justify-between items-center" style={{ marginBottom: "8px" }}>
              <Badge variant={isZh ? "zh" : "en"} size="sm">
                {selectedText.includes(" ") ? "Cụm từ / Câu" : "Từ đơn"}
              </Badge>

              <button
                type="button"
                onClick={() => {
                  setTranslationResult(null);
                  setTranslationUnavailableNotice(false);
                }}
                style={{ color: "var(--text-tertiary)" }}
                aria-label="Đóng popup dịch"
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ fontWeight: 700, fontSize: "var(--text-base)", marginBottom: "8px" }}>
              {selectedText}
            </div>

            {translationResult ? (
              <div
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-success-text)",
                  backgroundColor: "var(--color-success-bg)",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 600,
                  marginBottom: "12px",
                }}
              >
                {translationResult.translation}
              </div>
            ) : (
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-info-text)",
                  backgroundColor: "var(--color-info-bg)",
                  border: "1px solid var(--color-info-border)",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "12px",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: "2px" }}>Dịch tự động chưa khả dụng</div>
                <div>Bạn có thể nhập nghĩa tiếng Việt bên dưới để lưu vào kho từ vựng.</div>
              </div>
            )}

            {/* Quick Meaning Input for saving */}
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "var(--text-xs)",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  marginBottom: "4px",
                }}
              >
                Giải nghĩa tiếng Việt:
              </label>
              <input
                type="text"
                value={manualMeaningVi}
                onChange={(e) => setManualMeaningVi(e.target.value)}
                placeholder="Nhập nghĩa tiếng Việt..."
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-default)",
                  backgroundColor: "var(--bg-surface)",
                  fontSize: "var(--text-sm)",
                }}
              />
            </div>

            <div className="flex-row justify-end gap-2">
              <Button
                variant={isZh ? "zh" : "primary"}
                size="sm"
                isLoading={isSavingVocab}
                disabled={!manualMeaningVi.trim()}
                onClick={handleSaveSelectionToVocab}
                leftIcon={<Bookmark size={13} />}
              >
                Lưu vào kho từ vựng
              </Button>
            </div>
          </div>
        )}

        {/* ================= TOKEN CLICK POPOVER (PRONUNCIATION MODE) ================= */}
        {activeToken && (
          <div
            className="token-popover animate-pop-in"
            style={{
              position: "fixed",
              left: `${activeToken.coords.x}px`,
              top: `${activeToken.coords.y}px`,
              transform: "translate(-50%, -100%)",
              zIndex: 910,
              backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              padding: "10px 14px",
              boxShadow: "var(--shadow-float)",
              border: "1px solid var(--border-default)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              className={isZh ? "hanzi" : ""}
              style={{ fontWeight: 700, fontSize: "var(--text-base)" }}
            >
              {activeToken.token.text}
            </span>

            <AudioButton
              text={activeToken.token.text}
              language={passage.language}
              size="sm"
            />

            <button
              type="button"
              onClick={() => {
                const text = activeToken.token.text;
                setSelectedText(text);
                setToolbarCoords(activeToken.coords);
                setActiveToken(null);
                if (translationAvailability.configured) {
                  handleTranslateSelection();
                } else {
                  setTranslationUnavailableNotice(true);
                }
              }}
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                color: isZh ? "var(--accent-zh-text)" : "var(--accent-en-text)",
                padding: "4px 8px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: isZh ? "var(--accent-zh-subtle)" : "var(--accent-en-subtle)",
              }}
            >
              {translationAvailability.configured ? "Tra nghĩa" : "Thêm vào từ vựng"}
            </button>
          </div>
        )}
      </div>

      {/* ================= FULL PASSAGE TRANSLATION PANEL ================= */}
      <Card>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
          onClick={() => setShowFullTranslation(!showFullTranslation)}
          role="button"
          tabIndex={0}
          aria-expanded={showFullTranslation}
          aria-label="Bật/Tắt bản dịch tiếng Việt toàn bài"
        >
          <div className="flex-row items-center gap-2">
            <Globe size={18} color="var(--accent-en-primary)" />
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>
              🇻🇳 Bản dịch tiếng Việt toàn bài
            </h3>
          </div>

          <div className="flex-row items-center gap-2">
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
              {showFullTranslation ? "Ẩn bản dịch" : "Hiện bản dịch"}
            </span>
            {showFullTranslation ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {showFullTranslation && (
          <div className="animate-fade-in" style={{ marginTop: "var(--space-4)" }}>
            {passage.translationVi ? (
              <div
                style={{
                  fontSize: "var(--text-base)",
                  lineHeight: "var(--leading-relaxed)",
                  color: "var(--text-secondary)",
                  backgroundColor: "var(--bg-muted)",
                  padding: "var(--space-4) var(--space-6)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-default)",
                }}
              >
                {passage.translationVi}
              </div>
            ) : !translationAvailability.configured ? (
              /* Informative Unavailable State */
              <div
                style={{
                  padding: "var(--space-6)",
                  textAlign: "center",
                  backgroundColor: "var(--bg-muted)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px dashed var(--border-default)",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-primary)", marginBottom: "4px" }}>
                  Dịch tự động hiện chưa được cấu hình
                </div>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>
                  Bạn vẫn có thể đọc bài, nghe phát âm và tra cứu lưu từng từ vựng bình thường.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled
                  leftIcon={<Globe size={14} />}
                  title="Dịch tự động chưa được cấu hình trên máy chủ"
                >
                  Dịch tự động — Chưa khả dụng
                </Button>
              </div>
            ) : translationError ? (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-warning-bg)",
                  border: "1px solid var(--color-warning-border)",
                  color: "var(--color-warning-text)",
                  fontSize: "var(--text-sm)",
                }}
              >
                {translationError}
              </div>
            ) : (
              <div
                style={{
                  padding: "var(--space-6)",
                  textAlign: "center",
                  backgroundColor: "var(--bg-muted)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-3)" }}>
                  Bài đọc này chưa có bản dịch tiếng Việt.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isTranslatingPassage}
                  onClick={handleTranslatePassage}
                  leftIcon={<Globe size={14} />}
                >
                  Tạo bản dịch tự động
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
