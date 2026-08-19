import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  RotateCw,
  Volume2,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowLeft,
  Settings2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { vocabularyApi } from "../../api/vocabulary.api";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { AudioButton } from "../../components/ui/AudioButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { CardSkeleton } from "../../components/ui/Skeleton";
import type { ReviewAction, VocabularyItem } from "../../types/api";
import { configureSpeechUtterance } from "../../services/speech";
import { APP_ROUTES } from "../../runtime/routes";

export const FlashcardPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, settings } = useLanguage();
  const { success, error } = useToast();

  const [deck, setDeck] = useState<VocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<"due" | "all" | "random">("due");
  const [reviewedCount, setReviewedCount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isEn = language === "en";

  const fetchDeck = useCallback(async () => {
    setIsLoading(true);
    setIsFlipped(false);
    setCurrentIndex(0);
    setReviewedCount(0);
    try {
      const items = await vocabularyApi.getFlashcards({
        language,
        due: filterMode === "due" ? true : undefined,
        random: filterMode === "random" ? true : undefined,
        limit: 50,
      });
      setDeck(items);
    } catch {
      error("Không thể tải bộ thẻ flashcard.");
    } finally {
      setIsLoading(false);
    }
  }, [language, filterMode, error]);

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);

  const currentCard = deck[currentIndex];

  useEffect(() => {
    if (!settings?.autoPlayAudio || !isFlipped || !currentCard || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentCard.term);
    const preferredVoice = currentCard.language === "zh" ? settings.preferredVoiceZh : settings.preferredVoiceEn;
    configureSpeechUtterance(utterance, currentCard.language, settings.audioSpeed, window.speechSynthesis.getVoices(), preferredVoice);
    window.speechSynthesis.speak(utterance);
    return () => window.speechSynthesis.cancel();
  }, [currentCard?.id, isFlipped, settings?.autoPlayAudio, settings?.audioSpeed, settings?.preferredVoiceEn, settings?.preferredVoiceZh]);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleAnswer = async (action: ReviewAction) => {
    if (!currentCard || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await vocabularyApi.answerFlashcard(currentCard.id, action);
      setReviewedCount((prev) => prev + 1);

      // Move to next card with smooth reset
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsSubmitting(false);
      }, 150);
    } catch {
      setIsSubmitting(false);
      error("Lỗi khi cập nhật tiến độ thẻ.");
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped && !isSubmitting) {
        if (e.key === "1") handleAnswer("AGAIN");
        else if (e.key === "2") handleAnswer("HARD");
        else if (e.key === "3") handleAnswer("GOOD");
        else if (e.key === "4") handleAnswer("EASY");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, isSubmitting, currentCard]);

  if (isLoading) {
    return (
      <div className="page-container flex-col items-center justify-center gap-6">
        <div style={{ width: "100%", maxWidth: "680px" }}>
          <CardSkeleton />
        </div>
      </div>
    );
  }

  // Finished Deck State
  if (deck.length > 0 && currentIndex >= deck.length) {
    return (
      <div className="page-container flex-col items-center justify-center gap-6 animate-fade-in">
        <div
          className="card flex-col items-center justify-center"
          style={{
            maxWidth: "540px",
            width: "100%",
            textAlign: "center",
            padding: "var(--space-12) var(--space-8)",
            boxShadow: "var(--shadow-xl)",
            backgroundColor: "var(--bg-surface)",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--color-success-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "var(--space-4)",
            }}
          >
            <CheckCircle2 size={40} color="var(--color-success)" />
          </div>

          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>
            Hoàn thành xuất sắc!
          </h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-8)" }}>
            Bạn đã hoàn thành phiên ôn tập gồm <strong>{reviewedCount} thẻ</strong> từ vựng. Trí nhớ của bạn đã được củng cố theo thuật toán SRS.
          </p>

          <div className="flex-row gap-3" style={{ flexWrap: "wrap", justifyContent: "center" }}>
            <Button variant="secondary" onClick={fetchDeck} leftIcon={<RotateCw size={16} />}>
              Ôn lại bộ thẻ này
            </Button>
            <Link to="/">
              <Button variant="primary">Trở về Trang chủ</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty Deck State
  if (deck.length === 0) {
    return (
      <div className="page-container flex-col gap-6 animate-fade-in">
        <div className="flex-row justify-between items-center">
          <div className="flex-row items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>
                Trang chủ
              </Button>
            </Link>
            <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>Flashcards</h1>
          </div>
        </div>

        <EmptyState
          icon={<Layers size={48} color="var(--text-tertiary)" />}
          title={
            filterMode === "due"
              ? "Không có thẻ nào đến hạn ôn tập hôm nay!"
              : "Chưa có thẻ từ vựng nào trong danh sách."
          }
          description={
            filterMode === "due"
              ? "Tuyệt vời! Bạn đã hoàn thành tất cả thẻ cần ôn. Bạn có thể chọn chế độ 'Tất cả từ' hoặc 'Ngẫu nhiên' để tiếp tục luyện tập."
              : "Hãy thêm từ vựng mới hoặc chuyển ngôn ngữ để bắt đầu luyện flashcard."
          }
          actionText={filterMode === "due" ? "Ôn tập tất cả từ vựng" : "+ Thêm từ vựng mới"}
          onAction={() => {
            if (filterMode === "due") setFilterMode("all");
            else navigate(APP_ROUTES.addVocabulary);
          }}
        />
      </div>
    );
  }

  const isCardZh = currentCard.language === "zh";
  const pinyin = currentCard.metadata?.pinyin || currentCard.pronunciation;

  return (
    <div className="page-container flex-col gap-6 animate-fade-in">
      {/* Top Header & Mode Filter */}
      <div className="flex-row justify-between items-center" style={{ flexWrap: "wrap", gap: "12px" }}>
        <div className="flex-row items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>
              Trang chủ
            </Button>
          </Link>
          <div>
            <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>
              Học Flashcard ({isEn ? "🇬🇧 English" : "🇨🇳 中文"})
            </h1>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
              Thẻ {currentIndex + 1} / {deck.length} • Lần ôn: {currentCard.progress.repetitions}
            </span>
          </div>
        </div>

        {/* Deck Mode Selector */}
        <div
          style={{
            display: "inline-flex",
            backgroundColor: "var(--bg-muted)",
            padding: "3px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-default)",
          }}
        >
          {[
            { id: "due", label: "Đến hạn" },
            { id: "all", label: "Tất cả" },
            { id: "random", label: "Ngẫu nhiên" },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setFilterMode(mode.id as any)}
              style={{
                padding: "6px 12px",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                borderRadius: "var(--radius-sm)",
                backgroundColor: filterMode === mode.id ? "var(--bg-surface)" : "transparent",
                color: filterMode === mode.id ? "var(--text-primary)" : "var(--text-tertiary)",
                boxShadow: filterMode === mode.id ? "var(--shadow-xs)" : "none",
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Center 3D Flip Card Container */}
      <div className="flashcard-perspective" onClick={handleFlip} onKeyDown={(event) => { if (event.key === "Enter") handleFlip(); }} role="button" tabIndex={0} aria-label={isFlipped ? "Mặt sau flashcard, nhấn để lật" : "Mặt trước flashcard, nhấn để lật"}>
        <div className={`flashcard-inner ${isFlipped ? "flipped" : ""}`}>
          {/* ================= CARD FRONT ================= */}
          <div className="flashcard-front">
            {/* Top Indicator */}
            <div className="flex-row justify-between items-center" style={{ width: "100%" }}>
              <Badge variant={isCardZh ? "zh" : "en"}>
                {isCardZh ? "🇨🇳 Chữ Hán" : "🇬🇧 Thuật ngữ"}
              </Badge>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                Nhấn hoặc phím [Space] để lật thẻ
              </span>
            </div>

            {/* Center Content */}
            <div className="flex-col items-center justify-center gap-4" style={{ flex: 1, padding: "var(--space-6) 0" }}>
              <div
                className={isCardZh ? "hanzi" : ""}
                style={{
                  fontSize: isCardZh ? "3.25rem" : "2.5rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: isCardZh ? "0.05em" : "-0.02em",
                }}
              >
                {currentCard.term}
              </div>

              {pinyin && (!isCardZh || settings?.showPinyin !== false) && (
                <div
                  className={isCardZh ? "pinyin" : ""}
                  style={{
                    fontSize: "var(--text-lg)",
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  {pinyin}
                </div>
              )}

              <AudioButton
                text={currentCard.term}
                audioUrl={currentCard.audioUrl}
                language={currentCard.language}
                size="lg"
                variant="subtle"
              />
            </div>

            {/* Bottom Tag */}
            <div className="flex-row items-center justify-between" style={{ width: "100%", fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
              <span>{currentCard.topic || "Tổng quát"}</span>
              {currentCard.level && <Badge variant="default" size="sm">{currentCard.level}</Badge>}
            </div>
          </div>

          {/* ================= CARD BACK ================= */}
          <div className="flashcard-back">
            {/* Top Indicator */}
            <div className="flex-row justify-between items-center" style={{ width: "100%" }}>
              <Badge variant="mastered">🇻🇳 Nghĩa tiếng Việt</Badge>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                Mặt sau
              </span>
            </div>

            {/* Center Meaning & Details */}
            <div className="flex-col items-center justify-center gap-3" style={{ flex: 1, padding: "var(--space-4) 0", maxWidth: "560px" }}>
              <div
                style={{
                  fontSize: "var(--text-2xl)",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                }}
              >
                {currentCard.meaningVi}
              </div>

              {currentCard.partOfSpeech && (
                <div style={{ fontSize: "var(--text-sm)", fontStyle: "italic", color: "var(--text-tertiary)" }}>
                  ({currentCard.partOfSpeech})
                </div>
              )}

              {/* Example Sentence Section */}
              {currentCard.example && (
                <div
                  style={{
                    marginTop: "var(--space-3)",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "var(--bg-muted)",
                    border: "1px solid var(--border-default)",
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                    {currentCard.example}
                  </div>
                  {currentCard.exampleTranslation && (
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                      {currentCard.exampleTranslation}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hint */}
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
              Chọn mức độ ghi nhớ bên dưới để SRS lên lịch ôn tập
            </div>
          </div>
        </div>
      </div>

      {/* Spaced Repetition (SRS) Action Buttons */}
      <div
        className="animate-fade-in"
        style={{
          maxWidth: "680px",
          width: "100%",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
        }}
      >
        <button
          type="button"
          disabled={!isFlipped || isSubmitting}
          onClick={() => handleAnswer("AGAIN")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            padding: "12px 8px",
            borderRadius: "var(--radius-lg)",
            backgroundColor: isFlipped ? "var(--color-error-bg)" : "var(--bg-muted)",
            border: `1.5px solid ${isFlipped ? "var(--color-error-border)" : "var(--border-default)"}`,
            color: isFlipped ? "var(--color-error-text)" : "var(--text-tertiary)",
            cursor: isFlipped ? "pointer" : "not-allowed",
            transition: "all var(--transition-fast)",
          }}
        >
          <span style={{ fontWeight: 800, fontSize: "var(--text-sm)" }}>1. Quên (Again)</span>
          <span style={{ fontSize: "0.6875rem", opacity: 0.8 }}>Học lại sớm</span>
        </button>

        <button
          type="button"
          disabled={!isFlipped || isSubmitting}
          onClick={() => handleAnswer("HARD")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            padding: "12px 8px",
            borderRadius: "var(--radius-lg)",
            backgroundColor: isFlipped ? "var(--color-warning-bg)" : "var(--bg-muted)",
            border: `1.5px solid ${isFlipped ? "var(--color-warning-border)" : "var(--border-default)"}`,
            color: isFlipped ? "var(--color-warning-text)" : "var(--text-tertiary)",
            cursor: isFlipped ? "pointer" : "not-allowed",
            transition: "all var(--transition-fast)",
          }}
        >
          <span style={{ fontWeight: 800, fontSize: "var(--text-sm)" }}>2. Khó (Hard)</span>
          <span style={{ fontSize: "0.6875rem", opacity: 0.8 }}>Khoảng cách ngắn</span>
        </button>

        <button
          type="button"
          disabled={!isFlipped || isSubmitting}
          onClick={() => handleAnswer("GOOD")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            padding: "12px 8px",
            borderRadius: "var(--radius-lg)",
            backgroundColor: isFlipped ? "var(--accent-en-subtle)" : "var(--bg-muted)",
            border: `1.5px solid ${isFlipped ? "var(--accent-en-border)" : "var(--border-default)"}`,
            color: isFlipped ? "var(--accent-en-text)" : "var(--text-tertiary)",
            cursor: isFlipped ? "pointer" : "not-allowed",
            transition: "all var(--transition-fast)",
          }}
        >
          <span style={{ fontWeight: 800, fontSize: "var(--text-sm)" }}>3. Tốt (Good)</span>
          <span style={{ fontSize: "0.6875rem", opacity: 0.8 }}>Đúng hạn</span>
        </button>

        <button
          type="button"
          disabled={!isFlipped || isSubmitting}
          onClick={() => handleAnswer("EASY")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            padding: "12px 8px",
            borderRadius: "var(--radius-lg)",
            backgroundColor: isFlipped ? "var(--color-success-bg)" : "var(--bg-muted)",
            border: `1.5px solid ${isFlipped ? "var(--color-success-border)" : "var(--border-default)"}`,
            color: isFlipped ? "var(--color-success-text)" : "var(--text-tertiary)",
            cursor: isFlipped ? "pointer" : "not-allowed",
            transition: "all var(--transition-fast)",
          }}
        >
          <span style={{ fontWeight: 800, fontSize: "var(--text-sm)" }}>4. Dễ (Easy)</span>
          <span style={{ fontSize: "0.6875rem", opacity: 0.8 }}>Tăng khoảng cách</span>
        </button>
      </div>
    </div>
  );
};
