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
    selectedAnswer: string;
    term?: string;
    meaningVi?: string;
    completedSentence?: string;
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

  const submitAnswer = async (answer: string) => {
    if (!session || !answer.trim() || isSubmittingAnswer) return;

    setIsSubmittingAnswer(true);
    try {
      const res = await quizApi.answer(session.id, answer.trim());
      setLastFeedback({
        correct: res.correct,
        expectedAnswer: res.expectedAnswer,
        selectedAnswer: answer.trim(),
        term: res.feedback?.term,
        meaningVi: res.feedback?.meaningVi,
        completedSentence: res.feedback?.completedSentence,
      });
      setSession(res.session);
      setAnswerInput("");
    } catch (err: any) {
      error(getFriendlyErrorMessage(err));
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitAnswer(answerInput);
  };

  const handleContinueNext = () => {
    setLastFeedback(null);
    setAnswerInput("");
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      if (lastFeedback) {
        if (event.key === "Enter" || event.code === "Space") {
          event.preventDefault();
          handleContinueNext();
        }
        return;
      }

      const current = session?.currentQuestion;
      if (!current || isSubmittingAnswer) return;

      if (current.options?.length) {
        const index = Number(event.key) - 1;
        if (index >= 0 && index < current.options.length) {
          event.preventDefault();
          void submitAnswer(current.options[index]!);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [session?.currentQuestion, lastFeedback, isSubmittingAnswer]);

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
  const contextTerm = currentQ?.type === "CONTEXT" ? currentQ.prompt.match(/'([^']+)'/u)?.[1] : undefined;

  const renderContext = (context: string, term?: string) => {
    if (!term) return context;
    const match = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")})`, "iu");
    const parts = context.split(match);
    return parts.map((part, index) =>
      match.test(part) ? (
        <mark
          key={`${part}-${index}`}
          style={{
            background: "var(--accent-en-subtle)",
            color: "var(--accent-en-text)",
            padding: "2px 6px",
            borderRadius: "var(--radius-sm)",
            fontWeight: 800,
            border: "1px solid var(--accent-en-border)",
          }}
        >
          {part}
        </mark>
      ) : (
        <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
      )
    );
  };

  const renderFillBlank = (promptText: string) => {
    const parts = promptText.split(/(______)/gu);
    return parts.map((part, idx) =>
      part === "______" ? (
        <span
          key={idx}
          style={{
            display: "inline-block",
            minWidth: "72px",
            borderBottom: "2.5px solid var(--accent-en-primary)",
            backgroundColor: "var(--accent-en-subtle)",
            color: "var(--accent-en-text)",
            borderRadius: "var(--radius-sm)",
            padding: "0 8px",
            margin: "0 4px",
            fontWeight: 800,
          }}
        >
          ______
        </span>
      ) : (
        <React.Fragment key={idx}>{part}</React.Fragment>
      )
    );
  };

  const getQuestionTypeBadge = () => {
    if (isZh) {
      const zhLabels: Record<string, string> = {
        HANZI_TO_MEANING: "Chữ Hán ➔ Ý nghĩa",
        MEANING_TO_HANZI: "Ý nghĩa ➔ Chữ Hán",
        HANZI_TO_PINYIN: "Chữ Hán ➔ Pinyin",
        PINYIN_TO_HANZI: "Pinyin ➔ Chữ Hán",
        TONE_SELECTION: "Kiểm tra thanh điệu",
        LISTENING: "Nghe âm thanh",
      };
      return zhLabels[currentQ?.type || ""] || "Kiểm tra tiếng Trung";
    }
    const enLabels: Record<string, string> = {
      TERM_TO_MEANING: "Thuật ngữ ➔ Ý nghĩa",
      MEANING_TO_TERM: "Ý nghĩa ➔ Thuật ngữ",
      FILL_BLANK: "Điền vào chỗ trống",
      LISTENING: "Nghe hiểu từ vựng",
      CONTEXT: "Ngữ cảnh sử dụng",
    };
    return enLabels[currentQ?.type || ""] || "Kiểm tra tiếng Anh";
  };

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
        <div style={{ textAlign: "center", padding: "var(--space-2) 0" }}>
          {/* Question Mode Badge */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--space-3)" }}>
            <Badge variant={isZh ? "zh" : "en"} size="md">
              {getQuestionTypeBadge()}
            </Badge>
          </div>

          {/* LISTENING Mode: Audio Player Only (Term is 100% hidden) */}
          {currentQ?.answerMode === "AUDIO_MULTIPLE_CHOICE" ? (
            <div className="flex-col items-center gap-3" style={{ padding: "var(--space-4) 0" }}>
              <div
                style={{
                  width: "84px",
                  height: "84px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "var(--radius-full)",
                  background: isZh ? "var(--accent-zh-subtle)" : "var(--accent-en-subtle)",
                  border: `2px solid ${isZh ? "var(--accent-zh-border)" : "var(--accent-en-border)"}`,
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <div style={{ transform: "scale(1.5)" }}>
                  <AudioButton text={currentQ.audioText} language={session.language} size="lg" label="Phát lại từ cần nghe" />
                </div>
              </div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-secondary)" }}>
                Bấm nút loa để nghe phát âm
              </div>
            </div>
          ) : currentQ?.type === "CONTEXT" && currentQ.contextText ? (
            /* CONTEXT Mode: Context Sentence with Highlighted Target + Prompt */
            <div className="flex-col gap-3" style={{ width: "100%" }}>
              <div
                style={{
                  margin: "0 auto",
                  width: "100%",
                  maxWidth: "580px",
                  padding: "16px 18px",
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: "var(--bg-muted)",
                  border: "1px solid var(--border-default)",
                  fontSize: "var(--text-base)",
                  lineHeight: 1.7,
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-tertiary)", marginBottom: "6px" }}>
                  📖 Ngữ cảnh câu văn:
                </div>
                <div style={{ fontStyle: "italic", color: "var(--text-primary)" }}>
                  {renderContext(currentQ.contextText, contextTerm)}
                </div>
              </div>
              <div style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                {currentQ.prompt}
              </div>
            </div>
          ) : currentQ?.type === "FILL_BLANK" ? (
            /* FILL_BLANK Mode: Sentence with Blank Placeholder */
            <div
              style={{
                margin: "0 auto",
                width: "100%",
                maxWidth: "580px",
                padding: "18px 20px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--bg-muted)",
                border: "1px dashed var(--accent-en-border)",
                fontSize: "var(--text-lg)",
                fontWeight: 700,
                color: "var(--text-primary)",
                lineHeight: 1.7,
                textAlign: "center",
              }}
            >
              {renderFillBlank(currentQ.prompt)}
            </div>
          ) : (
            /* Standard Modes (TERM_TO_MEANING, MEANING_TO_TERM, Chinese Modes) */
            <div className="flex-col items-center gap-2">
              <div
                className={isZh ? "hanzi" : ""}
                style={{
                  fontSize: isZh ? "2.5rem" : currentQ?.type === "MEANING_TO_TERM" ? "1.75rem" : "2.25rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  margin: "var(--space-2) 0",
                  lineHeight: 1.3,
                }}
              >
                {currentQ?.prompt}
              </div>

              {currentQ?.audioText && (
                <div className="flex-row justify-center">
                  <AudioButton text={currentQ.audioText} language={session.language} size="md" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Answer Form or Feedback */}
        {!lastFeedback && currentQ?.answerMode !== "TEXT" ? (
          <div className="flex-col gap-3" role="group" aria-label={currentQ?.instruction || "Chọn đáp án"}>
            {currentQ?.instruction && (
              <p style={{ margin: 0, textAlign: "center", fontSize: "var(--text-sm)", color: "var(--text-secondary)", fontWeight: 700 }}>
                {currentQ.instruction}
              </p>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
              {currentQ?.options?.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => void submitAnswer(option)}
                  disabled={isSubmittingAnswer}
                  aria-label={`Đáp án ${index + 1}: ${option}`}
                  style={{
                    minHeight: "54px",
                    padding: "12px 14px",
                    textAlign: "left",
                    borderRadius: "var(--radius-md)",
                    border: "1.5px solid var(--border-strong)",
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    fontSize: "var(--text-base)",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "24px",
                      height: "24px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: isZh ? "var(--accent-zh-subtle)" : "var(--accent-en-subtle)",
                      color: isZh ? "var(--accent-zh-text)" : "var(--accent-en-text)",
                      fontSize: "var(--text-xs)",
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>
                  <span>{option}</span>
                </button>
              ))}
            </div>
            <span style={{ textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
              Nhấn phím 1–4 trên bàn phím để chọn nhanh.
            </span>
          </div>
        ) : !lastFeedback ? (
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
                Bạn chọn: <strong>{lastFeedback.selectedAnswer}</strong><br />
                Đáp án đúng là: <strong>{lastFeedback.expectedAnswer}</strong>
              </div>
            )}

            {(lastFeedback.term || lastFeedback.meaningVi) && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <div style={{ fontSize: "var(--text-sm)" }}>
                  Từ vựng: <strong style={{ color: "var(--text-primary)" }}>{lastFeedback.term}</strong>
                  {lastFeedback.meaningVi && (
                    <span style={{ color: "var(--text-secondary)", marginLeft: "6px" }}>— {lastFeedback.meaningVi}</span>
                  )}
                </div>
                {lastFeedback.term && (
                  <AudioButton text={lastFeedback.term} language={session.language} size="sm" />
                )}
              </div>
            )}

            {lastFeedback.completedSentence && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  fontSize: "var(--text-sm)",
                  color: "var(--text-primary)",
                  lineHeight: 1.5,
                }}
              >
                <strong>Câu hoàn chỉnh:</strong> {lastFeedback.completedSentence}
              </div>
            )}

            <Button
              type="button"
              variant={lastFeedback.correct ? "primary" : "secondary"}
              size="md"
              onClick={handleContinueNext}
              rightIcon={<ArrowRight size={16} />}
              style={{ width: "100%" }}
            >
              Tiếp tục
            </Button>
            <span style={{ textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
              (Nhấn phím Enter hoặc Space để tiếp tục)
            </span>
          </div>
        )}
      </Card>
    </div>
  );
};
