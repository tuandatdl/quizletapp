import React, { useState } from "react";
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

const GAME_TYPES = [
  {
    id: "MATCHING" as const,
    title: "Nối từ (Matching)",
    desc: "Ghép cặp từ vựng với giải nghĩa tương ứng",
    icon: Zap,
  },
  {
    id: "MEMORY" as const,
    title: "Thẻ bài trí nhớ (Memory Cards)",
    desc: "Lật mở và ghi nhớ vị trí các cặp từ",
    icon: Sparkles,
  },
  {
    id: "LISTENING_CHOICE" as const,
    title: "Luyện nghe chọn từ (Listening Choice)",
    desc: "Nghe âm thanh phát âm và chọn nghĩa đúng",
    icon: Volume2,
  },
  {
    id: "FILL_WORD" as const,
    title: "Điền chữ còn thiếu (Fill Word)",
    desc: "Hoàn thiện các ký tự trong từ vựng",
    icon: Gamepad2,
  },
  {
    id: "SPEED_CHALLENGE" as const,
    title: "Thử thách tốc độ (Speed Challenge)",
    desc: "Phản xạ nhanh với các từ vựng trong thời gian ngắn",
    icon: Clock,
  },
];

export const GamesPage: React.FC = () => {
  const { language } = useLanguage();
  const { success, error } = useToast();

  const [selectedType, setSelectedType] = useState<
    "MATCHING" | "MEMORY" | "LISTENING_CHOICE" | "FILL_WORD" | "SPEED_CHALLENGE"
  >("MATCHING");
  const [session, setSession] = useState<GameSession | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Active Item Interaction
  const [inputAnswer, setInputAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    expected: string;
  } | null>(null);

  const isZh = (session?.language ?? language) === "zh";

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
    } catch (err: any) {
      error(getFriendlyErrorMessage(err));
    } finally {
      setIsStarting(false);
    }
  };

  const handleAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !session.currentItem || !inputAnswer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await gamesApi.answer(
        session.id,
        session.currentItem.id,
        inputAnswer.trim()
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
  };

  const handleNext = () => {
    setFeedback(null);
    setInputAnswer("");
  };

  // 1. Game Selection Screen
  if (!session) {
    return (
      <div className="page-container flex-col gap-6 animate-fade-in" style={{ maxWidth: "780px" }}>
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
              Học mà chơi, củng cố vốn từ và phản xạ tự nhiên thông qua các mini-game tương tác
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
          {GAME_TYPES.map((g) => {
            const Icon = g.icon;
            const isSelected = selectedType === g.id;

            return (
              <Card
                key={g.id}
                hoverable
                onClick={() => setSelectedType(g.id)}
                onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedType(g.id); } }}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                style={{
                  border: `2px solid ${isSelected ? (isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)") : "var(--border-default)"}`,
                  backgroundColor: isSelected ? (isZh ? "var(--accent-zh-subtle)" : "var(--accent-en-subtle)") : "var(--bg-surface)",
                  cursor: "pointer",
                }}
                className="flex-col justify-between"
              >
                <div>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "var(--space-3)",
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "4px" }}>
                    {g.title}
                  </h3>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                    {g.desc}
                  </p>
                </div>

                <div style={{ marginTop: "16px", textAlign: "right" }}>
                  <Badge variant={isSelected ? (isZh ? "zh" : "en") : "default"}>
                    {isSelected ? "Đang chọn" : "Chọn chơi"}
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
            Bắt đầu trò chơi
          </Button>
        </div>
      </div>
    );
  }

  // 2. Completed Game Screen
  if (session.status === "COMPLETED") {
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
            <Trophy size={40} color="var(--color-success)" />
          </div>

          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>
            Trò chơi kết thúc!
          </h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-6)" }}>
            Tổng điểm thưởng bạn đã đạt được:
          </p>

          <div
            style={{
              fontSize: "var(--text-4xl)",
              fontWeight: 800,
              color: isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)",
              marginBottom: "var(--space-8)",
            }}
          >
            +{session.score} điểm
          </div>

          <div className="flex-row gap-3">
            <Button variant="secondary" onClick={() => setSession(null)} leftIcon={<RotateCcw size={16} />}>
              Chọn trò chơi khác
            </Button>
            <Button variant="primary" onClick={handleStartGame}>
              Chơi lại ván mới
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Active Gameplay Shell
  const item = session.currentItem;

  return (
    <div className="page-container flex-col gap-6 animate-fade-in" style={{ maxWidth: "680px" }}>
      {/* Top Bar */}
      <div className="flex-row justify-between items-center">
        <Button variant="ghost" size="sm" onClick={() => setSession(null)} leftIcon={<ArrowLeft size={16} />}>
          Thoát
        </Button>

        <div className="flex-row items-center gap-3">
          <Badge variant={isZh ? "zh" : "en"}>
            Điểm: {session.score}
          </Badge>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
            Đã qua: {session.completedCount} từ
          </span>
        </div>
      </div>

      <Card elevated className="flex-col gap-6" style={{ padding: "var(--space-8)" }}>
        <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
          <div
            className={isZh ? "hanzi" : ""}
            style={{
              fontSize: isZh ? "3rem" : "2.25rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              marginBottom: "var(--space-3)",
            }}
          >
            {item?.prompt}
          </div>

          <div className="flex-row justify-center">
            <AudioButton text={item?.audioText || item?.prompt} language={session.language} size="md" />
          </div>
        </div>

        {/* Input Form */}
        {!feedback ? (
          <form onSubmit={handleAnswer} className="flex-col gap-4">
            <input
              type="text"
              autoFocus
              required
              value={inputAnswer}
              onChange={(e) => setInputAnswer(e.target.value)}
              placeholder="Nhập nghĩa hoặc từ vựng tương ứng..."
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--border-strong)",
                backgroundColor: "var(--bg-surface)",
                fontSize: "var(--text-base)",
                fontWeight: 600,
                textAlign: "center",
              }}
            />

            <Button
              type="submit"
              variant={isZh ? "zh" : "primary"}
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight size={18} />}
            >
              Gửi câu trả lời
            </Button>
          </form>
        ) : (
          <div
            className="animate-pop-in flex-col gap-4"
            style={{
              padding: "var(--space-6)",
              borderRadius: "var(--radius-lg)",
              backgroundColor: feedback.correct ? "var(--color-success-bg)" : "var(--color-error-bg)",
              border: `1px solid ${feedback.correct ? "var(--color-success-border)" : "var(--color-error-border)"}`,
            }}
          >
            <div className="flex-row items-center gap-2">
              {feedback.correct ? (
                <CheckCircle2 size={24} color="var(--color-success)" />
              ) : (
                <XCircle size={24} color="var(--color-error)" />
              )}
              <span style={{ fontWeight: 800, fontSize: "var(--text-base)", color: feedback.correct ? "var(--color-success-text)" : "var(--color-error-text)" }}>
                {feedback.correct ? "+10 điểm! Chuẩn xác!" : "Chưa chính xác!"}
              </span>
            </div>

            {!feedback.correct && (
              <div style={{ fontSize: "var(--text-sm)", color: "var(--color-error-text)" }}>
                Đáp án đúng là: <strong>{feedback.expected}</strong>
              </div>
            )}

            <Button
              variant={feedback.correct ? "primary" : "secondary"}
              size="md"
              onClick={handleNext}
              rightIcon={<ArrowRight size={16} />}
              style={{ width: "100%" }}
            >
              Từ tiếp theo ➔
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
