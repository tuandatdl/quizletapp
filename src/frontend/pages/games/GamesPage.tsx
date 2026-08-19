import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Gamepad2,
  Sparkles,
  Trophy,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Zap,
  CheckCircle2,
  XCircle,
  Volume2,
  Clock,
  Play,
  HelpCircle,
  Flame,
  Check,
  X,
  Layers,
} from "lucide-react";
import { gamesApi } from "../../api/games.api";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { AudioButton } from "../../components/ui/AudioButton";
import { getFriendlyErrorMessage } from "../../api/client";
import type { GameSession, Language } from "../../types/api";
import type { GameType } from "../../../shared/gameModes";
import { configureSpeechUtterance } from "../../services/speech";

const GAME_TYPES = [
  {
    id: "MATCHING" as const,
    title: "Nối từ (Matching)",
    desc: "Ghép cặp từ vựng với giải nghĩa tương ứng",
    badge: "Phản xạ từ",
    icon: Zap,
  },
  {
    id: "MEMORY" as const,
    title: "Thẻ bài trí nhớ (Memory Cards)",
    desc: "Lật thẻ và tự đánh giá mức độ ghi nhớ theo SRS",
    badge: "Flashcard game",
    icon: Layers,
  },
  {
    id: "LISTENING_CHOICE" as const,
    title: "Luyện nghe chọn từ (Listening Choice)",
    desc: "Tập trung nghe âm thanh phát âm và chọn nghĩa đúng",
    badge: "Luyện nghe",
    icon: Volume2,
  },
  {
    id: "FILL_WORD" as const,
    title: "Điền chữ còn thiếu (Fill Word)",
    desc: "Hoàn thiện các ký tự còn thiếu trong từ vựng",
    badge: "Chính tả & gõ từ",
    icon: Gamepad2,
  },
  {
    id: "SPEED_CHALLENGE" as const,
    title: "Thử thách tốc độ (Speed Challenge)",
    desc: "Phản xạ nhanh với các từ vựng trong thời gian ngắn",
    badge: "Đua thời gian",
    icon: Clock,
  },
];

export const GamesPage: React.FC = () => {
  const { language, settings } = useLanguage();
  const { success, error } = useToast();

  const [selectedType, setSelectedType] = useState<GameType>("MATCHING");
  const [session, setSession] = useState<GameSession | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Active Item Interaction
  const [inputAnswer, setInputAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    expected: string;
  } | null>(null);
  const [memoryRevealed, setMemoryRevealed] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isListeningPlaying, setIsListeningPlaying] = useState(false);

  const isZh = (session?.language ?? language) === "zh";
  const item = session?.currentItem;
  const gameType = session?.type as GameType | undefined;
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input for fill word and speed challenge
  useEffect(() => {
    if (!feedback && (gameType === "FILL_WORD" || gameType === "SPEED_CHALLENGE")) {
      inputRef.current?.focus();
    }
  }, [feedback, gameType, item?.id]);

  const handleStartGame = async () => {
    setIsStarting(true);
    setFeedback(null);
    setInputAnswer("");
    try {
      const newSession = await gamesApi.start({
        language: session?.language ?? language,
        type: selectedType,
        count: 10,
      });
      setSession(newSession);
      setMemoryRevealed(false);
      setSecondsRemaining(newSession.timerSeconds);
    } catch (err: any) {
      error(getFriendlyErrorMessage(err));
    } finally {
      setIsStarting(false);
    }
  };

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (!session || !session.currentItem || !answer.trim() || isSubmitting) return;

      setIsSubmitting(true);
      try {
        const res = await gamesApi.answer(
          session.id,
          session.currentItem.id,
          answer.trim()
        );
        setFeedback({
          correct: res.correct,
          expected: res.expectedAnswer,
        });
        setSession(res.session);
        setInputAnswer("");
      } catch (err: any) {
        error(getFriendlyErrorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, session, error]
  );

  const handleNext = useCallback(() => {
    setFeedback(null);
    setInputAnswer("");
    setMemoryRevealed(false);
  }, []);

  const handleAnswer = (event: React.FormEvent) => {
    event.preventDefault();
    void submitAnswer(inputAnswer);
  };

  // Speed challenge timer countdown
  useEffect(() => {
    if (session?.type !== "SPEED_CHALLENGE" || !session.currentItem || feedback || secondsRemaining === null || secondsRemaining <= 0) return;
    const timer = window.setInterval(() => setSecondsRemaining((value) => Math.max(0, (value ?? 0) - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [feedback, secondsRemaining, session?.currentItem?.id, session?.type]);

  // Timeout trigger
  useEffect(() => {
    if (session?.type === "SPEED_CHALLENGE" && secondsRemaining === 0 && !feedback && !isSubmitting) {
      void submitAnswer("__timeout__");
    }
  }, [feedback, isSubmitting, secondsRemaining, session?.type, submitAnswer]);

  // Play audio helper for listening mode
  const playListeningAudio = useCallback(() => {
    if (!item?.audioText || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(item.audioText);
    const preferredVoice = isZh ? settings?.preferredVoiceZh : settings?.preferredVoiceEn;
    configureSpeechUtterance(utterance, session?.language ?? language, settings?.audioSpeed || 1, window.speechSynthesis.getVoices(), preferredVoice);

    setIsListeningPlaying(true);
    utterance.onend = () => setIsListeningPlaying(false);
    utterance.onerror = () => setIsListeningPlaying(false);
    window.speechSynthesis.speak(utterance);
  }, [isZh, item?.audioText, language, session?.language, settings]);

  // Auto-play audio when new listening item arrives
  useEffect(() => {
    if (session?.type === "LISTENING_CHOICE" && item && !feedback) {
      playListeningAudio();
    }
  }, [item?.id, session?.type, feedback, playListeningAudio]);

  // Keyboard shortcut listener for gameplay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in input, let default behavior happen
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      if (feedback) {
        if (e.key === "Enter" || e.code === "Space") {
          e.preventDefault();
          handleNext();
        }
        return;
      }

      if (!session || !session.currentItem) return;

      if (session.type === "MATCHING" || session.type === "LISTENING_CHOICE" || session.type === "SPEED_CHALLENGE") {
        const choices = session.currentItem.choices;
        if (choices && choices.length > 0) {
          const keyNum = parseInt(e.key, 10);
          if (keyNum >= 1 && keyNum <= choices.length) {
            e.preventDefault();
            const chosen = choices[keyNum - 1];
            if (chosen) void submitAnswer(chosen);
          }
        }
        if (session.type === "LISTENING_CHOICE" && e.code === "Space") {
          e.preventDefault();
          playListeningAudio();
        }
      } else if (session.type === "MEMORY") {
        if (!memoryRevealed) {
          if (e.code === "Space" || e.key === "Enter") {
            e.preventDefault();
            setMemoryRevealed(true);
          }
        } else {
          if (e.key === "1" || e.key === "y" || e.key === "Y") {
            e.preventDefault();
            void submitAnswer(session.currentItem.revealText ?? "__forgot__");
          } else if (e.key === "2" || e.key === "n" || e.key === "N") {
            e.preventDefault();
            void submitAnswer("__forgot__");
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [feedback, handleNext, memoryRevealed, playListeningAudio, session, submitAnswer]);

  // ================= 1. GAME SELECTION SCREEN =================
  if (!session) {
    return (
      <div className="page-container flex-col gap-6 animate-fade-in" style={{ maxWidth: "840px" }}>
        <div className="flex-row justify-between items-center" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div className="flex-row items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>
                Trang chủ
              </Button>
            </Link>
            <div>
              <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>
                Trò Chơi Ngôn Ngữ ({isZh ? "🇨🇳 Tiếng Trung" : "🇬🇧 Tiếng Anh"})
              </h1>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                Học mà chơi, củng cố vốn từ vựng và phản xạ tự nhiên qua các chế độ mini-game tương tác
              </p>
            </div>
          </div>
        </div>

        {/* Game Mode Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {GAME_TYPES.map((g) => {
            const Icon = g.icon;
            const isSelected = selectedType === g.id;

            return (
              <Card
                key={g.id}
                hoverable
                onClick={() => setSelectedType(g.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedType(g.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                style={{
                  border: `2px solid ${
                    isSelected
                      ? isZh
                        ? "var(--accent-zh-primary)"
                        : "var(--accent-en-primary)"
                      : "var(--border-default)"
                  }`,
                  backgroundColor: isSelected
                    ? isZh
                      ? "var(--accent-zh-subtle)"
                      : "var(--accent-en-subtle)"
                    : "var(--bg-surface)",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
                className="flex-col justify-between"
              >
                <div>
                  <div className="flex-row justify-between items-center" style={{ marginBottom: "var(--space-3)" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "var(--shadow-xs)",
                      }}
                    >
                      <Icon size={22} />
                    </div>

                    <Badge variant={isSelected ? (isZh ? "zh" : "en") : "default"} size="sm">
                      {g.badge}
                    </Badge>
                  </div>

                  <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "6px" }}>
                    {g.title}
                  </h3>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                    {g.desc}
                  </p>
                </div>

                <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                  <Badge variant={isSelected ? (isZh ? "zh" : "en") : "default"}>
                    {isSelected ? "✓ Đang chọn" : "Chọn chơi"}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex-row justify-end">
          <Button
            variant={isZh ? "zh" : "primary"}
            size="lg"
            isLoading={isStarting}
            onClick={handleStartGame}
            leftIcon={<Gamepad2 size={18} />}
          >
            Bắt đầu trò chơi ngay
          </Button>
        </div>
      </div>
    );
  }

  // ================= 2. COMPLETED GAME SCREEN =================
  if (session.status === "COMPLETED") {
    const totalQuestions = session.completedCount || 10;
    return (
      <div className="page-container flex-col items-center justify-center gap-6 animate-fade-in">
        <div
          className="card flex-col items-center justify-center"
          style={{
            maxWidth: "520px",
            width: "100%",
            textAlign: "center",
            padding: "var(--space-12) var(--space-8)",
            boxShadow: "var(--shadow-xl)",
            backgroundColor: "var(--bg-surface)",
          }}
        >
          <div
            style={{
              width: "76px",
              height: "76px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--color-success-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "var(--space-4)",
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.2)",
            }}
          >
            <Trophy size={42} color="var(--color-success)" />
          </div>

          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>
            Trò chơi kết thúc!
          </h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-6)" }}>
            Bạn đã hoàn thành lượt chơi với <strong>{totalQuestions} từ</strong> ({isZh ? "Tiếng Trung" : "Tiếng Anh"}).
          </p>

          <div
            style={{
              fontSize: "var(--text-4xl)",
              fontWeight: 800,
              color: isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)",
              marginBottom: "var(--space-8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Flame size={32} />
            <span>+{session.score} điểm</span>
          </div>

          <div className="flex-row gap-3" style={{ flexWrap: "wrap", justifyContent: "center" }}>
            <Button variant="secondary" onClick={() => setSession(null)} leftIcon={<RotateCcw size={16} />}>
              Chọn trò chơi khác
            </Button>
            <Button variant={isZh ? "zh" : "primary"} onClick={handleStartGame}>
              Chơi lại ván mới
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ================= 3. ACTIVE GAMEPLAY SHELL =================
  const currentModeInfo = GAME_TYPES.find((m) => m.id === gameType) ?? GAME_TYPES[0]!;
  const currentCount = session.completedCount + 1;
  const progressPercent = Math.min(100, Math.round((session.completedCount / 10) * 100));

  return (
    <div className="page-container flex-col gap-6 animate-fade-in" style={{ maxWidth: "700px" }}>
      {/* Top Gameplay Bar */}
      <div className="flex-row justify-between items-center" style={{ flexWrap: "wrap", gap: "10px" }}>
        <Button variant="ghost" size="sm" onClick={() => setSession(null)} leftIcon={<ArrowLeft size={16} />}>
          Thoát
        </Button>

        <div className="flex-row items-center gap-3">
          <Badge variant={isZh ? "zh" : "en"} size="sm">
            {currentModeInfo.title.split("(")[0]?.trim()}
          </Badge>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", fontWeight: 600 }}>
            Câu {currentCount}/10
          </span>
          <Badge variant="mastered" size="sm">
            ★ {session.score} đ
          </Badge>
          {gameType === "SPEED_CHALLENGE" && (
            <Badge
              variant={(secondsRemaining ?? 0) <= 3 ? "error" : "warning"}
              size="sm"
              style={{ fontWeight: 800 }}
            >
              ⏱ {secondsRemaining ?? session.timerSeconds ?? 0}s
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: "100%",
          height: "4px",
          borderRadius: "var(--radius-full)",
          backgroundColor: "var(--bg-muted)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            backgroundColor: isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)",
            transition: "width var(--transition-normal)",
          }}
        />
      </div>

      {/* Main Game Interaction Card */}
      <Card elevated className="flex-col gap-6" style={{ padding: "var(--space-8)", position: "relative" }}>
        {/* ================= MODE A: MATCHING ================= */}
        {gameType === "MATCHING" && (
          <div className="flex-col gap-6">
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", fontWeight: 700 }}>
                TỪ CẦN NỐI NGHĨA
              </span>
              <div className="flex-row items-center justify-center gap-3" style={{ marginTop: "8px" }}>
                <span
                  className={isZh ? "hanzi" : ""}
                  style={{
                    fontSize: isZh ? "2.75rem" : "2.25rem",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                  }}
                >
                  {item?.prompt}
                </span>
                <AudioButton
                  text={item?.prompt}
                  language={session.language}
                  size="md"
                  variant="subtle"
                />
              </div>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: "6px" }}>
                Chọn một nghĩa tiếng Việt khớp với từ trên (Nhấn phím 1, 2, 3, 4)
              </p>
            </div>

            {!feedback && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
                {item?.choices?.map((choice, index) => (
                  <button
                    key={`${choice}-${index}`}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void submitAnswer(choice)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "14px 16px",
                      borderRadius: "var(--radius-lg)",
                      border: "1.5px solid var(--border-default)",
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontSize: "var(--text-sm)",
                      fontWeight: 600,
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                    }}
                    className="card-hoverable"
                  >
                    <span
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: isZh ? "var(--accent-zh-subtle)" : "var(--accent-en-subtle)",
                        color: isZh ? "var(--accent-zh-text)" : "var(--accent-en-text)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "var(--text-xs)",
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </span>
                    <span style={{ flex: 1 }}>{choice}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= MODE B: MEMORY CARDS ================= */}
        {gameType === "MEMORY" && (
          <div className="flex-col gap-6 items-center">
            <div
              style={{
                width: "100%",
                minHeight: "220px",
                borderRadius: "var(--radius-xl)",
                border: "2px solid var(--border-strong)",
                backgroundColor: memoryRevealed ? "var(--bg-surface)" : "var(--bg-muted)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "var(--space-6)",
                textAlign: "center",
                transition: "all var(--transition-normal)",
                boxShadow: memoryRevealed ? "var(--shadow-md)" : "none",
              }}
            >
              {!memoryRevealed ? (
                <div className="flex-col items-center gap-3">
                  <Badge variant="default" size="sm">Thẻ chưa mở</Badge>
                  <p style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--text-primary)" }}>
                    Lật thẻ để kiểm tra từ vựng và tự đánh giá độ nhớ
                  </p>
                  <Button
                    variant={isZh ? "zh" : "primary"}
                    size="lg"
                    onClick={() => setMemoryRevealed(true)}
                    leftIcon={<Layers size={18} />}
                  >
                    Lật thẻ (Phím Space)
                  </Button>
                </div>
              ) : (
                <div className="flex-col items-center gap-3 animate-fade-in" style={{ width: "100%" }}>
                  <Badge variant={isZh ? "zh" : "en"} size="sm">Mặt sau đã mở</Badge>
                  <div className="flex-row items-center justify-center gap-2">
                    <span
                      className={isZh ? "hanzi" : ""}
                      style={{
                        fontSize: isZh ? "2.75rem" : "2.25rem",
                        fontWeight: 800,
                        color: "var(--text-primary)",
                      }}
                    >
                      {item?.revealText}
                    </span>
                    <AudioButton
                      text={item?.revealText}
                      language={session.language}
                      size="md"
                      variant="subtle"
                    />
                  </div>

                  <div
                    style={{
                      fontSize: "var(--text-lg)",
                      fontWeight: 700,
                      color: isZh ? "var(--accent-zh-text)" : "var(--accent-en-text)",
                    }}
                  >
                    {item?.hint}
                  </div>
                </div>
              )}
            </div>

            {!feedback && memoryRevealed && (
              <div className="flex-row gap-4 justify-center" style={{ width: "100%", maxWidth: "420px" }}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => void submitAnswer(item?.revealText ?? "__forgot__")}
                  leftIcon={<Check size={18} />}
                  style={{ flex: 1 }}
                >
                  Đã nhớ (+10đ) [1]
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => void submitAnswer("__forgot__")}
                  leftIcon={<X size={18} />}
                  style={{ flex: 1 }}
                >
                  Cần ôn lại [2]
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ================= MODE C: LISTENING CHOICE ================= */}
        {gameType === "LISTENING_CHOICE" && (
          <div className="flex-col gap-6">
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", fontWeight: 700 }}>
                LUYỆN NGHE & PHẢN XẠ
              </span>

              {/* Listening Hero Play Button */}
              <div style={{ margin: "var(--space-4) 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={playListeningAudio}
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isListeningPlaying ? "0 0 24px rgba(99, 102, 241, 0.6)" : "var(--shadow-md)",
                    transform: isListeningPlaying ? "scale(1.08)" : "scale(1)",
                    transition: "all var(--transition-fast)",
                    cursor: "pointer",
                  }}
                  aria-label="Phát âm thanh câu hỏi"
                  title="Nhấn để nghe lại (hoặc phím Space)"
                >
                  <Volume2 size={32} />
                </button>

                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", fontWeight: 600 }}>
                  {isListeningPlaying ? "Đang phát âm thanh..." : "Nhấn nút hoặc phím [Space] để nghe lại"}
                </span>
              </div>

              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                Nghe kỹ phát âm và chọn nghĩa tiếng Việt đúng bên dưới (Phím 1, 2, 3, 4)
              </p>
            </div>

            {!feedback && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
                {item?.choices?.map((choice, index) => (
                  <button
                    key={`${choice}-${index}`}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void submitAnswer(choice)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "14px 16px",
                      borderRadius: "var(--radius-lg)",
                      border: "1.5px solid var(--border-default)",
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontSize: "var(--text-sm)",
                      fontWeight: 600,
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                    }}
                    className="card-hoverable"
                  >
                    <span
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: isZh ? "var(--accent-zh-subtle)" : "var(--accent-en-subtle)",
                        color: isZh ? "var(--accent-zh-text)" : "var(--accent-en-text)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "var(--text-xs)",
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </span>
                    <span style={{ flex: 1 }}>{choice}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= MODE D: FILL WORD ================= */}
        {gameType === "FILL_WORD" && (
          <div className="flex-col gap-6">
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", fontWeight: 700 }}>
                ĐIỀN CHỮ CÒN THIẾU
              </span>

              {/* Masked Word Typography */}
              <div
                style={{
                  margin: "var(--space-4) 0",
                  padding: "16px 24px",
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: "var(--bg-muted)",
                  border: "1.5px dashed var(--border-strong)",
                  display: "inline-block",
                }}
              >
                <span
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.3em",
                    color: isZh ? "var(--accent-zh-text)" : "var(--accent-en-text)",
                  }}
                >
                  {item?.prompt}
                </span>
              </div>

              {item?.hint && (
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", fontWeight: 600 }}>
                  {item.hint}
                </p>
              )}
            </div>

            {!feedback && (
              <form onSubmit={handleAnswer} className="flex-col gap-4">
                <input
                  ref={inputRef}
                  type="text"
                  required
                  value={inputAnswer}
                  onChange={(e) => setInputAnswer(e.target.value)}
                  placeholder="Nhập từ hoàn chỉnh và nhấn Enter..."
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "var(--radius-md)",
                    border: "2px solid var(--border-strong)",
                    backgroundColor: "var(--bg-surface)",
                    fontSize: "var(--text-lg)",
                    fontWeight: 700,
                    textAlign: "center",
                    fontFamily: isZh ? "var(--font-chinese)" : "inherit",
                  }}
                />

                <Button
                  type="submit"
                  variant={isZh ? "zh" : "primary"}
                  size="lg"
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight size={18} />}
                >
                  Kiểm tra câu trả lời (Enter)
                </Button>
              </form>
            )}
          </div>
        )}

        {/* ================= MODE E: SPEED CHALLENGE ================= */}
        {gameType === "SPEED_CHALLENGE" && (
          <div className="flex-col gap-6">
            <div style={{ textAlign: "center" }}>
              <div className="flex-row justify-center items-center gap-2" style={{ marginBottom: "6px" }}>
                <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", fontWeight: 700 }}>
                  PHẢN XẠ NHANH
                </span>
              </div>

              <div
                style={{
                  fontSize: isZh ? "2.5rem" : "2rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  margin: "var(--space-2) 0",
                }}
              >
                {item?.prompt}
              </div>

              {item?.hint && (
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                  {item.hint}
                </p>
              )}
            </div>

            {!feedback && (
              <>
                {item?.choices && item.choices.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
                    {item.choices.map((choice, index) => (
                      <button
                        key={`${choice}-${index}`}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => void submitAnswer(choice)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "12px 14px",
                          borderRadius: "var(--radius-md)",
                          border: "1.5px solid var(--border-default)",
                          backgroundColor: "var(--bg-surface)",
                          fontSize: "var(--text-sm)",
                          fontWeight: 700,
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                        className="card-hoverable"
                      >
                        <span
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "var(--radius-xs)",
                            backgroundColor: isZh ? "var(--accent-zh-subtle)" : "var(--accent-en-subtle)",
                            color: isZh ? "var(--accent-zh-text)" : "var(--accent-en-text)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "var(--text-xs)",
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {index + 1}
                        </span>
                        <span style={{ flex: 1 }}>{choice}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <form onSubmit={handleAnswer} className="flex-col gap-3">
                    <input
                      ref={inputRef}
                      type="text"
                      required
                      value={inputAnswer}
                      onChange={(e) => setInputAnswer(e.target.value)}
                      placeholder="Gõ từ nhanh nhất có thể..."
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "var(--radius-md)",
                        border: "2px solid var(--border-strong)",
                        backgroundColor: "var(--bg-surface)",
                        fontSize: "var(--text-base)",
                        fontWeight: 700,
                        textAlign: "center",
                      }}
                    />
                    <Button type="submit" variant={isZh ? "zh" : "primary"} size="lg" isLoading={isSubmitting}>
                      Gửi ngay (Enter)
                    </Button>
                  </form>
                )}
              </>
            )}
          </div>
        )}

        {/* ================= SHARED FEEDBACK OVERLAY ================= */}
        {feedback && (
          <div
            className="animate-pop-in flex-col gap-4"
            style={{
              padding: "var(--space-6)",
              borderRadius: "var(--radius-lg)",
              backgroundColor: feedback.correct ? "var(--color-success-bg)" : "var(--color-error-bg)",
              border: `1.5px solid ${feedback.correct ? "var(--color-success-border)" : "var(--color-error-border)"}`,
            }}
          >
            <div className="flex-row items-center justify-between">
              <div className="flex-row items-center gap-2">
                {feedback.correct ? (
                  <CheckCircle2 size={26} color="var(--color-success)" />
                ) : (
                  <XCircle size={26} color="var(--color-error)" />
                )}
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: "var(--text-base)",
                    color: feedback.correct ? "var(--color-success-text)" : "var(--color-error-text)",
                  }}
                >
                  {feedback.correct ? "+10 điểm! Hoàn toàn chính xác!" : "Chưa chính xác!"}
                </span>
              </div>

              {item?.audioText && (
                <AudioButton
                  text={item.audioText}
                  language={session.language}
                  size="sm"
                  variant="subtle"
                />
              )}
            </div>

            {!feedback.correct && (
              <div style={{ fontSize: "var(--text-sm)", color: "var(--color-error-text)", backgroundColor: "rgba(255, 255, 255, 0.4)", padding: "10px 12px", borderRadius: "var(--radius-md)" }}>
                Đáp án chuẩn xác là: <strong style={{ fontSize: "var(--text-base)" }}>{feedback.expected}</strong>
              </div>
            )}

            <Button
              variant={feedback.correct ? "primary" : "secondary"}
              size="lg"
              onClick={handleNext}
              rightIcon={<ArrowRight size={18} />}
              style={{ width: "100%" }}
            >
              Tiếp tục ➔ (Phím Enter / Space)
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
