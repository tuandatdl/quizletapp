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
} from "lucide-react";
import { readingApi } from "../../api/reading.api";
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
import { configureSpeechUtterance } from "../../services/speech";

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

  // Click-Word Popover State (Pronunciation Mode)
  const [activeToken, setActiveToken] = useState<{
    token: Token;
    coords: { x: number; y: number };
  } | null>(null);

  const readingAreaRef = useRef<HTMLDivElement>(null);
  const playbackCancelledRef = useRef(false);
  const currentSentenceIdxRef = useRef(0);
  const isPlayingRef = useRef(false);

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
    setPlaybackState((prev) => ({ ...prev, speed: settings.audioSpeed }));
    setShowFullTranslation(settings.showTranslation);
  }, [settings]);

  // Audio Playback Engine (Sequential SpeechSynthesis / Real Audio)
  const stopAllAudio = useCallback(() => {
    playbackCancelledRef.current = true;
    isPlayingRef.current = false;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const playSentenceAtIndex = useCallback(
    async (index: number) => {
      if (!passage || !passage.sentences || index >= passage.sentences.length) {
        setPlaybackState((prev) => ({ ...prev, status: "completed" }));
        isPlayingRef.current = false;
        return;
      }

      const sentence = passage.sentences[index];
      if (!sentence) return;

      currentSentenceIdxRef.current = index;
      setPlaybackState((prev) => ({
        ...prev,
        status: "playing",
        currentSentenceIndex: index,
        currentSentenceId: sentence.id,
      }));
      isPlayingRef.current = true;
      playbackCancelledRef.current = false;

      if (!("speechSynthesis" in window)) {
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sentence.text);
      const preferredVoice = passage.language === "zh" ? settings?.preferredVoiceZh : settings?.preferredVoiceEn;
      configureSpeechUtterance(utterance, passage.language, playbackState.speed, window.speechSynthesis.getVoices(), preferredVoice);

      utterance.onend = () => {
        if (playbackCancelledRef.current) return;
        const nextIndex = index + 1;
        if (nextIndex < passage.sentences.length) {
          playSentenceAtIndex(nextIndex);
        } else {
          setPlaybackState((prev) => ({
            ...prev,
            status: "completed",
            currentSentenceIndex: passage.sentences.length - 1,
          }));
          isPlayingRef.current = false;
        }
      };

      utterance.onerror = (e) => {
        if (playbackCancelledRef.current) return;
        // On error or interruption, stop cleanly
        setPlaybackState((prev) => ({ ...prev, status: "paused" }));
        isPlayingRef.current = false;
      };

      window.speechSynthesis.speak(utterance);
    },
    [passage, playbackState.speed]
  );

  const handlePlay = useCallback(() => {
    playSentenceAtIndex(currentSentenceIdxRef.current);
  }, [playSentenceAtIndex]);

  const handlePause = useCallback(() => {
    stopAllAudio();
    setPlaybackState((prev) => ({ ...prev, status: "paused" }));
  }, [stopAllAudio]);

  const handleResume = useCallback(() => {
    playSentenceAtIndex(currentSentenceIdxRef.current);
  }, [playSentenceAtIndex]);

  const handleRestart = useCallback(() => {
    stopAllAudio();
    currentSentenceIdxRef.current = 0;
    playSentenceAtIndex(0);
  }, [stopAllAudio, playSentenceAtIndex]);

  const handleSeekSentence = useCallback(
    (index: number) => {
      stopAllAudio();
      currentSentenceIdxRef.current = index;
      const wasPlaying = isPlayingRef.current;
      setPlaybackState((prev) => ({
        ...prev,
        currentSentenceIndex: index,
        currentSentenceId: passage?.sentences[index]?.id || null,
        status: wasPlaying ? "playing" : "paused",
      }));
      if (wasPlaying) {
        playSentenceAtIndex(index);
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
      setPlaybackState((prev) => ({ ...prev, speed: newSpeed }));
      if (isPlayingRef.current) {
        stopAllAudio();
        playSentenceAtIndex(currentSentenceIdxRef.current);
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

      setSelectedText(text);
      setManualMeaningVi("");
      setToolbarCoords({
        x: Math.min(window.innerWidth - 140, Math.max(140, rect.left + rect.width / 2)),
        y: Math.max(70, rect.top - 10),
      });
      setTranslationResult(null);
      setTranslationUnavailableNotice(false);
    }, 50);
  };

  // Selection Translation Action
  const handleTranslateSelection = async () => {
    if (!selectedText || !passage) return;
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
      // Map cleanly without raw error
      setTranslationUnavailableNotice(true);
    } finally {
      setIsTranslatingSelection(false);
    }
  };

  // Save Selection to Vocabulary
  const handleSaveSelectionToVocab = async () => {
    if (!selectedText || !passage) return;
    let meaning = manualMeaningVi.trim() || translationResult?.translation?.trim();
    if (!meaning && translationAvailability.configured) {
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
      info("Không thể tự động dịch lúc này. Bạn có thể nhập nghĩa tiếng Việt rồi thử lưu lại.");
      return;
    }

    setIsSavingVocab(true);
    try {
      const res = await readingApi.saveFromSelection({
        text: selectedText,
        sourceLanguage: passage.language,
        targetLanguage: "vi",
        readingId: passage.id,
        meaningVi: meaning,
      });

      if (res.duplicate) {
        info(`Từ "${selectedText}" đã có trong kho từ của bạn.`);
      } else {
        success(`Đã lưu "${selectedText}" vào kho từ vựng!`);
      }

      // Close overlays
      setSelectedText("");
      setToolbarCoords(null);
      setTranslationResult(null);
      setTranslationUnavailableNotice(false);
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
        x: rect.left + rect.width / 2,
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
          setSelectedText("");
          setToolbarCoords(null);
          setTranslationResult(null);
          setTranslationUnavailableNotice(false);
        }
        setActiveToken(null);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      stopAllAudio();
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
    <div className="page-container flex-col gap-6 animate-fade-in" style={{ maxWidth: "var(--reading-max-width)" }}>
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
        style={{
          backgroundColor: "var(--bg-surface)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-default)",
          padding: "var(--space-8)",
          boxShadow: "var(--shadow-sm)",
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
              onClick={() => {
                setSelectedText("");
                setToolbarCoords(null);
                setTranslationResult(null);
                setTranslationUnavailableNotice(false);
              }}
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

        {/* ================= SELECTION TRANSLATION / UNCONFIGURED POPOVER ================= */}
        {(translationResult || translationUnavailableNotice) && toolbarCoords && (
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
