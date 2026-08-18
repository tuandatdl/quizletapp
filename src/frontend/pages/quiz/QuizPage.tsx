import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  Volume2,
} from "lucide-react";
import { quizApi } from "../../api/quiz.api";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { AudioButton } from "../../components/ui/AudioButton";
import { getFriendlyErrorMessage } from "../../api/client";
import type { Language, QuizAnswerResult, QuizSession } from "../../types/api";

const ENGLISH_QUIZ_TYPES = [
  { id: "TERM_TO_MEANING", label: "Thuật ngữ ➔ Ý nghĩa", desc: "Xem từ vựng tiếng Anh, đoán nghĩa tiếng Việt" },
  { id: "MEANING_TO_TERM", label: "Ý nghĩa ➔ Thuật ngữ", desc: "Xem nghĩa tiếng Việt, viết hoặc chọn từ tiếng Anh" },
  { id: "FILL_BLANK", label: "Điền vào chỗ trống", desc: "Hoàn thiện câu với từ vựng thích hợp" },
  { id: "LISTENING", label: "Nghe hiểu từ vựng", desc: "Nghe phát âm và chọn đáp án chính xác" },
  { id: "CONTEXT", label: "Ngữ cảnh sử dụng", desc: "Áp dụng từ trong ngữ cảnh bài đọc" },
];

const CHINESE_QUIZ_TYPES = [
  { id: "HANZI_TO_MEANING", label: "Chữ Hán ➔ Ý nghĩa", desc: "Nhìn chữ Hán, chọn giải nghĩa tiếng Việt" },
  { id: "MEANING_TO_HANZI", label: "Ý nghĩa ➔ Chữ Hán", desc: "Nhìn nghĩa tiếng Việt, tìm chữ Hán đúng" },
  { id: "HANZI_TO_PINYIN", label: "Chữ Hán ➔ Pinyin", desc: "Nhìn chữ Hán, đoán cách phát âm Pinyin" },
  { id: "PINYIN_TO_HANZI", label: "Pinyin ➔ Chữ Hán", desc: "Nhìn phiên âm Pinyin, tìm chữ Hán" },
  { id: "TONE_SELECTION", label: "Kiểm tra thanh điệu", desc: "Xác định thanh 1, 2, 3, 4 hoặc thanh nhẹ" },
  { id: "LISTENING", label: "Nghe âm thanh", desc: "Nghe phát âm tiếng Trung và chọn đáp án" },
];

export const QuizPage: React.FC = () => {
  const { language } = useLanguage();
  const { success, error } = useToast();

  const [selectedType, setSelectedType] = useState<string>(
    language === "zh" ? "HANZI_TO_MEANING" : "TERM_TO_MEANING"
  );
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Active Question Answer State
  const [answerInput, setAnswerInput] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<{
    correct: boolean;
    expectedAnswer: string;
  } | null>(null);

  const quizLanguage = session?.language ?? language;
  const isZh = quizLanguage === "zh";
  const types = language === "zh" ? CHINESE_QUIZ_TYPES : ENGLISH_QUIZ_TYPES;

  useEffect(() => {
    if (!session) setSelectedType(language === "zh" ? "HANZI_TO_MEANING" : "TERM_TO_MEANING");
  }, [language, session]);

  const handleStartQuiz = async () => {
    setIsStarting(true);
    setLastFeedback(null);
    setAnswerInput("");
    try {
      const newSession = await quizApi.start({
        language: session?.language ?? language,
        type: selectedType,
        count: questionCount,
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
    if (!session || !answerInput.trim() || isSubmittingAnswer) return;

    setIsSubmittingAnswer(true);
    try {
      const res = await quizApi.answer(session.id, answerInput.trim());
      setLastFeedback({
        correct: res.correct,
        expectedAnswer: res.expectedAnswer,
      });
      setSession(res.session);
      setAnswerInput("");
    } catch (err: any) {
      error(getFriendlyErrorMessage(err));
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleContinueNext = () => {
    setLastFeedback(null);
    setAnswerInput("");
  };

  // 1. Quiz Setup Screen
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
              Kiểm Tra Trắc Nghiệm ({isZh ? "🇨🇳 Tiếng Trung" : "🇬🇧 Tiếng Anh"})
            </h1>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
              Củng cố phản xạ ngôn ngữ qua các bài kiểm tra được tạo tự động từ kho từ vựng
            </p>
          </div>
        </div>

        <Card className="flex-col gap-6">
          <div>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "12px" }}>
              Chọn dạng bài kiểm tra
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
              {types.map((t) => {
                const isSelected = selectedType === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedType(t.id); } }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "var(--radius-lg)",
                      border: `2px solid ${isSelected ? (isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)") : "var(--border-default)"}`,
                      backgroundColor: isSelected ? (isZh ? "var(--accent-zh-subtle)" : "var(--accent-en-subtle)") : "var(--bg-surface)",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: isSelected ? (isZh ? "var(--accent-zh-text)" : "var(--accent-en-text)") : "var(--text-primary)", marginBottom: "4px" }}>
                      {t.label}
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                      {t.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "8px" }}>
              Số lượng câu hỏi
            </label>
            <div className="flex-row gap-2">
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "var(--radius-md)",
                    border: `1px solid ${questionCount === num ? "var(--accent-en-primary)" : "var(--border-default)"}`,
                    backgroundColor: questionCount === num ? "var(--accent-en-subtle)" : "var(--bg-surface)",
                    color: questionCount === num ? "var(--accent-en-text)" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {num} câu
                </button>
              ))}
            </div>
          </div>

          <div className="flex-row justify-end" style={{ borderTop: "1px solid var(--border-default)", paddingTop: "var(--space-4)" }}>
            <Button
              variant={isZh ? "zh" : "primary"}
              size="lg"
              isLoading={isStarting}
              onClick={handleStartQuiz}
              leftIcon={<HelpCircle size={18} />}
            >
              Bắt đầu kiểm tra
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 2. Quiz Completed Screen
  if (session.status === "COMPLETED") {
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
              backgroundColor: session.score >= 80 ? "var(--color-success-bg)" : "var(--color-warning-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "var(--space-4)",
            }}
          >
            <Award
              size={40}
              color={session.score >= 80 ? "var(--color-success)" : "var(--color-warning)"}
            />
          </div>

          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>
            Kết quả bài kiểm tra
          </h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-6)" }}>
            Đã trả lời đúng <strong>{session.correct}</strong> trên tổng số <strong>{session.totalQuestions}</strong> câu hỏi.
          </p>

          <div
            style={{
              fontSize: "var(--text-4xl)",
              fontWeight: 800,
              color: session.score >= 80 ? "var(--color-success)" : "var(--accent-en-primary)",
              marginBottom: "var(--space-8)",
            }}
          >
            {session.score}%
          </div>

          <div className="flex-row gap-3">
            <Button variant="secondary" onClick={() => setSession(null)} leftIcon={<RotateCcw size={16} />}>
              Chọn bài khác
            </Button>
            <Button variant="primary" onClick={handleStartQuiz}>
              Làm lại bài này
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Active Question Screen
  const currentQ = session.currentQuestion;

  return (
    <div className="page-container flex-col gap-6 animate-fade-in" style={{ maxWidth: "680px" }}>
      {/* Header & Progress Bar */}
      <div className="flex-row justify-between items-center">
        <Button variant="ghost" size="sm" onClick={() => setSession(null)} leftIcon={<ArrowLeft size={16} />}>
          Dừng kiểm tra
        </Button>

        <div className="flex-row items-center gap-3">
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontWeight: 600 }}>
            Câu {session.currentIndex + 1} / {session.totalQuestions}
          </span>
          <Badge variant={isZh ? "zh" : "en"} size="sm">
            Đúng: {session.correct} • Sai: {session.incorrect}
          </Badge>
        </div>
      </div>

      <ProgressBar
        value={session.currentIndex}
        max={session.totalQuestions}
        color={isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)"}
      />

      {/* Question Card */}
      <Card elevated className="flex-col gap-6" style={{ padding: "var(--space-8)" }}>
        <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
            Câu hỏi:
          </span>

          <div
            className={isZh ? "hanzi" : ""}
            style={{
              fontSize: isZh ? "2.5rem" : "2rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              margin: "var(--space-3) 0",
            }}
          >
            {currentQ?.prompt}
          </div>

          <div className="flex-row justify-center">
            <AudioButton text={currentQ?.audioText || currentQ?.prompt} language={session.language} size="md" />
          </div>
        </div>

        {/* Answer Form or Feedback */}
        {!lastFeedback ? (
          <form onSubmit={handleAnswer} className="flex-col gap-4">
            <input
              type="text"
              autoFocus
              required
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              placeholder="Nhập câu trả lời của bạn..."
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
              isLoading={isSubmittingAnswer}
              rightIcon={<ArrowRight size={18} />}
            >
              Kiểm tra câu trả lời
            </Button>
          </form>
        ) : (
          /* Instant Feedback Box */
          <div
            className="animate-pop-in flex-col gap-4"
            style={{
              padding: "var(--space-6)",
              borderRadius: "var(--radius-lg)",
              backgroundColor: lastFeedback.correct ? "var(--color-success-bg)" : "var(--color-error-bg)",
              border: `1px solid ${lastFeedback.correct ? "var(--color-success-border)" : "var(--color-error-border)"}`,
            }}
          >
            <div className="flex-row items-center gap-2">
              {lastFeedback.correct ? (
                <CheckCircle2 size={24} color="var(--color-success)" />
              ) : (
                <XCircle size={24} color="var(--color-error)" />
              )}
              <span style={{ fontWeight: 800, fontSize: "var(--text-base)", color: lastFeedback.correct ? "var(--color-success-text)" : "var(--color-error-text)" }}>
                {lastFeedback.correct ? "Chính xác! Rất tốt!" : "Chưa chính xác!"}
              </span>
            </div>

            {!lastFeedback.correct && (
              <div style={{ fontSize: "var(--text-sm)", color: "var(--color-error-text)" }}>
                Đáp án đúng là: <strong>{lastFeedback.expectedAnswer}</strong>
              </div>
            )}

            <Button
              variant={lastFeedback.correct ? "primary" : "secondary"}
              size="md"
              onClick={handleContinueNext}
              rightIcon={<ArrowRight size={16} />}
              style={{ width: "100%" }}
            >
              Tiếp tục ➔
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
