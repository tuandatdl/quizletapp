import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  Headphones,
  Mic,
  Square,
  Volume2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  Loader2,
  Flame,
} from "lucide-react";
import { shadowingApi } from "../../api/shadowing.api";
import { readingApi } from "../../api/reading.api";
import { pronunciationApi } from "../../api/pronunciation.api";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { AudioButton } from "../../components/ui/AudioButton";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { getFriendlyErrorMessage } from "../../api/client";
import type {
  PronunciationResult,
  ReadingPassageSummary,
  ShadowingSession,
} from "../../types/api";
import { isStaticRuntime } from "../../runtime/runtime";
import { analyzeLocalEnglishRecording, type LocalPronunciationProgress } from "../../services/localPronunciation";
import { saveLocalPronunciationHistory } from "../../services/localPronunciationHistory";
import type { LocalPronunciationAnalysis } from "../../services/localPronunciationScoring";

type ShadowingPhase = "LISTEN" | "RECORD" | "EVALUATING" | "RESULT" | "COMPLETED";

export function formatRecordingTime(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds || 0));
  const mins = Math.floor(safeSec / 60);
  const secs = safeSec % 60;
  return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export const ShadowingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const readingIdParam = searchParams.get("readingId");
  const { language } = useLanguage();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [readings, setReadings] = useState<ReadingPassageSummary[]>([]);
  const [selectedReadingId, setSelectedReadingId] = useState<string>(readingIdParam || "");
  const [session, setSession] = useState<ShadowingSession | null>(null);
  const [phase, setPhase] = useState<ShadowingPhase>("LISTEN");
  const [lastAttemptResult, setLastAttemptResult] = useState<PronunciationResult | null>(null);

  // Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string | undefined>(undefined);
  const [analysisProgress, setAnalysisProgress] = useState<LocalPronunciationProgress | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);
  const autoStartedReadingRef = useRef<string | null>(null);
  const analysisGenerationRef = useRef(0);
  const analysisAbortRef = useRef<AbortController | null>(null);

  // Fetch available readings if no session started
  useEffect(() => {
    readingApi.list(language).then(setReadings).catch(() => []);
  }, [language]);

  // Start Session if readingId is passed
  const handleStartSession = async (rId: string) => {
    setSelectedReadingId(rId);
    analysisAbortRef.current?.abort();
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
    setRecordedAudioBlob(null);
    setAudioBase64(null);
    setLastAttemptResult(null);
    setAnalysisProgress(null);

    try {
      if (isStaticRuntime()) {
        const reading = await readingApi.get(rId);
        const first = reading.sentences[0];
        if (!first) throw new Error("Bài đọc chưa có câu để luyện shadowing.");
        setSession({
          id: `local-shadowing-${rId}`,
          user_id: "local-profile",
          reading_id: rId,
          language: reading.language,
          current_sentence: 0,
          completed_count: 0,
          score_total: 0,
          average_score: 0,
          status: "ACTIVE",
          created_at: new Date().toISOString(),
          completed_at: null,
          currentSentenceData: {
            id: first.id,
            order: first.order,
            text: first.text,
            translationVi: first.translationVi,
            audioUrl: first.audioUrl,
          },
        });
        setPhase("LISTEN");
        return;
      }
      const newSession = await shadowingApi.start(rId);
      setSession(newSession);
      setPhase("LISTEN");
    } catch (err: any) {
      error(getFriendlyErrorMessage(err));
    }
  };

  useEffect(() => {
    if (readingIdParam && !session && autoStartedReadingRef.current !== readingIdParam) {
      autoStartedReadingRef.current = readingIdParam;
      void handleStartSession(readingIdParam);
    }
  }, [readingIdParam]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      analysisAbortRef.current?.abort();
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state !== "inactive") mediaRecorderRef.current?.stop();
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [recordedAudioUrl]);

  // Recording controls
  const startRecording = async () => {
    analysisAbortRef.current?.abort();
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
    setRecordedAudioBlob(null);
    setAudioBase64(null);
    setAudioMimeType(undefined);
    setLastAttemptResult(null);
    setAnalysisProgress(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia || !("MediaRecorder" in window)) {
        error("Trình duyệt này không hỗ trợ ghi âm bằng MediaRecorder.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        if (!mountedRef.current || blob.size === 0) return;

        const url = URL.createObjectURL(blob);
        setRecordedAudioBlob(blob);
        setRecordedAudioUrl(url);
        setAudioMimeType(blob.type || "audio/webm");

        if (!isStaticRuntime()) {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const b64 = (reader.result as string).split(",")[1];
            if (b64 && mountedRef.current) {
              setAudioBase64(b64);
            }
          };
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      error("Vui lòng cấp quyền truy cập microphone để luyện shadowing.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Local Free Evaluation (Static English)
  const handleLocalEvaluate = async () => {
    if (!session || !session.currentSentenceData || !recordedAudioBlob) return;
    const generation = ++analysisGenerationRef.current;
    const controller = new AbortController();
    analysisAbortRef.current?.abort();
    analysisAbortRef.current = controller;
    setPhase("EVALUATING");
    setAnalysisProgress(null);

    try {
      const res = await analyzeLocalEnglishRecording({
        blob: recordedAudioBlob,
        expectedText: session.currentSentenceData.text,
        signal: controller.signal,
        onProgress: (p) => {
          if (mountedRef.current && generation === analysisGenerationRef.current) {
            setAnalysisProgress(p);
          }
        },
      });

      if (!mountedRef.current || controller.signal.aborted || generation !== analysisGenerationRef.current) return;
      setLastAttemptResult(res);
      setPhase("RESULT");
      success("Đã hoàn thành phân tích luyện đọc trên thiết bị!");
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setPhase("RECORD");
        error(getFriendlyErrorMessage(err));
      }
    } finally {
      if (mountedRef.current && generation === analysisGenerationRef.current) {
        setAnalysisProgress(null);
      }
    }
  };

  // Server Evaluate & Advance (Server Mode)
  const handleEvaluateAndAdvance = async () => {
    if (!session || !session.currentSentenceData || !audioBase64) return;
    setPhase("EVALUATING");

    try {
      const assessResult = await pronunciationApi.assess({
        expectedText: session.currentSentenceData.text,
        language: session.language,
        audioBase64,
        audioMimeType,
        readingId: session.reading_id,
        sentenceId: session.currentSentenceData.id,
      });

      setLastAttemptResult(assessResult);
      setPhase("RESULT");

      const nextSession = await shadowingApi.advance(session.id, assessResult.attemptId);
      setSession(nextSession);

      if (nextSession.status === "COMPLETED") {
        setPhase("COMPLETED");
        success("Chúc mừng bạn đã hoàn thành bài luyện Shadowing!");
      }
    } catch (err: any) {
      setPhase("RECORD");
      error(getFriendlyErrorMessage(err));
    }
  };

  // Commit Score & Advance to Next Sentence (Static English Mode)
  const handleCommitAndAdvance = async () => {
    if (!session) return;
    const reading = await readingApi.get(session.reading_id);
    const nextIndex = session.current_sentence + 1;
    const next = reading.sentences[nextIndex];

    let newCompletedCount = session.completed_count;
    let newScoreTotal = session.score_total;
    let newAverageScore = session.average_score;

    if (lastAttemptResult) {
      newCompletedCount += 1;
      newScoreTotal += lastAttemptResult.overallScore;
      newAverageScore = Math.round(newScoreTotal / newCompletedCount);
      try {
        await saveLocalPronunciationHistory(lastAttemptResult as LocalPronunciationAnalysis);
      } catch {
        // history persistence fail-open
      }
    }

    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
    setRecordedAudioBlob(null);
    setAudioBase64(null);
    setLastAttemptResult(null);

    if (!next) {
      setSession({
        ...session,
        current_sentence: nextIndex,
        completed_count: newCompletedCount,
        score_total: newScoreTotal,
        average_score: newAverageScore,
        status: "COMPLETED",
        completed_at: new Date().toISOString(),
        currentSentenceData: null,
      });
      setPhase("COMPLETED");
      success("Chúc mừng bạn đã hoàn thành bài luyện Shadowing!");
      return;
    }

    setSession({
      ...session,
      current_sentence: nextIndex,
      completed_count: newCompletedCount,
      score_total: newScoreTotal,
      average_score: newAverageScore,
      currentSentenceData: {
        id: next.id,
        order: next.order,
        text: next.text,
        translationVi: next.translationVi,
        audioUrl: next.audioUrl,
      },
    });
    setPhase("LISTEN");
  };

  // Advance without score (Static Chinese Mode)
  const handleStaticAdvanceChinese = async () => {
    if (!session) return;
    const reading = await readingApi.get(session.reading_id);
    const nextIndex = session.current_sentence + 1;
    const next = reading.sentences[nextIndex];
    const newCompletedCount = session.completed_count + 1;

    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
    setRecordedAudioBlob(null);
    setAudioBase64(null);
    setLastAttemptResult(null);

    if (!next) {
      setSession({
        ...session,
        current_sentence: nextIndex,
        completed_count: newCompletedCount,
        status: "COMPLETED",
        completed_at: new Date().toISOString(),
        currentSentenceData: null,
      });
      setPhase("COMPLETED");
      success("Bạn đã hoàn thành lượt shadowing tiếng Trung.");
      return;
    }

    setSession({
      ...session,
      current_sentence: nextIndex,
      completed_count: newCompletedCount,
      currentSentenceData: {
        id: next.id,
        order: next.order,
        text: next.text,
        translationVi: next.translationVi,
        audioUrl: next.audioUrl,
      },
    });
    setPhase("LISTEN");
  };

  // Retry Current Sentence
  const handleRetryCurrentSentence = () => {
    analysisAbortRef.current?.abort();
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
    setRecordedAudioBlob(null);
    setAudioBase64(null);
    setLastAttemptResult(null);
    setPhase("RECORD");
  };

  // Server Next Sentence
  const handleNextSentence = () => {
    if (session?.status === "COMPLETED") {
      setPhase("COMPLETED");
      return;
    }
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
    setRecordedAudioBlob(null);
    setAudioBase64(null);
    setLastAttemptResult(null);
    setPhase("LISTEN");
  };

  // If no active session, show passage selector
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
            <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>Luyện Nói Shadowing</h1>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
              Kỹ thuật nhại giọng (Shadowing) giúp cải thiện phát âm, ngữ điệu và độ trôi chảy tự nhiên
            </p>
          </div>
        </div>

        <Card className="flex-col gap-4">
          <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>Chọn bài đọc để bắt đầu</h2>
          {readings.length > 0 ? (
            <div className="flex-col gap-3">
              {readings.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                    padding: "14px 18px",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "var(--bg-muted)",
                    border: "1px solid var(--border-default)",
                  }}
                >
                  <div style={{ minWidth: 0, flex: "1 1 auto" }}>
                    <div className="flex-row items-center gap-2" style={{ marginBottom: "4px", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: "var(--text-base)" }}>{r.title}</span>
                      <Badge variant={r.language === "zh" ? "zh" : "en"} size="sm">
                        {r.language === "zh" ? "🇨🇳 Trung" : "🇬🇧 Anh"}
                      </Badge>
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                      {r.wordCount} từ • {r.topic || "Tổng hợp"}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStartSession(r.id)}
                    leftIcon={<Headphones size={14} />}
                  >
                    Bắt đầu
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--text-tertiary)" }}>
              Chưa có bài đọc nào. Vui lòng thêm bài đọc mới trước khi luyện Shadowing.
            </div>
          )}
        </Card>
      </div>
    );
  }

  const currentSentence = session.currentSentenceData;
  const isZh = session.language === "zh";
  const isLocalEnglish = isStaticRuntime() && !isZh;
  const isLocalZh = isStaticRuntime() && isZh;

  // Completed Session Screen
  if (session.status === "COMPLETED" || phase === "COMPLETED") {
    return (
      <div className="page-container flex-col items-center justify-center gap-6 animate-fade-in">
        <div
          className="card flex-col items-center justify-center"
          style={{
            maxWidth: "560px",
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
            <Award size={40} color="var(--color-success)" />
          </div>

          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>
            Hoàn thành bài Shadowing!
          </h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: isLocalZh ? "var(--space-8)" : "var(--space-4)" }}>
            Bạn đã hoàn thành toàn bộ <strong>{session.completed_count} câu</strong>.
            {isLocalZh ? " Chấm điểm Shadowing tiếng Trung chưa được hỗ trợ." : ""}
          </p>

          {!isLocalZh && (
            <div style={{ marginBottom: "var(--space-8)" }}>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-tertiary)", marginBottom: "4px" }}>
                Điểm luyện đọc trung bình
              </div>
              <div
                style={{
                  fontSize: "var(--text-4xl)",
                  fontWeight: 800,
                  color: "var(--accent-en-primary)",
                }}
              >
                {session.completed_count > 0 ? `${session.average_score} / 100` : "— / 100"}
              </div>
            </div>
          )}

          <div className="flex-row gap-3" style={{ flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
            <Button variant="secondary" onClick={() => handleStartSession(session.reading_id)}>
              Luyện lại bài này
            </Button>
            <Button variant="primary" onClick={() => navigate("/reading")}>
              Trở về danh sách
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container flex-col gap-6 animate-fade-in" style={{ maxWidth: "780px" }}>
      {/* Distraction-Free Top Bar */}
      <div className="flex-row justify-between items-center">
        <Button variant="ghost" size="sm" onClick={() => setSession(null)} leftIcon={<ArrowLeft size={16} />}>
          Thoát
        </Button>

        <div className="flex-row items-center gap-3">
          <Badge variant={isZh ? "zh" : "en"}>
            Câu {session.current_sentence + 1}
          </Badge>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-secondary)" }}>
            Điểm TB: {isLocalZh ? "—" : session.completed_count > 0 ? session.average_score : "—"}
          </span>
        </div>
      </div>

      {/* Main Shadowing Player Studio */}
      <Card elevated className="flex-col gap-8" style={{ padding: "var(--space-8)" }}>
        {/* Step Indicator Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px",
            backgroundColor: "var(--bg-muted)",
            padding: "4px",
            borderRadius: "var(--radius-lg)",
            textAlign: "center",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
          }}
        >
          <div
            style={{
              padding: "8px",
              borderRadius: "var(--radius-md)",
              backgroundColor: phase === "LISTEN" ? "var(--bg-surface)" : "transparent",
              color: phase === "LISTEN" ? "var(--accent-en-primary)" : "var(--text-tertiary)",
              boxShadow: phase === "LISTEN" ? "var(--shadow-xs)" : "none",
            }}
          >
            1. Nghe mẫu
          </div>
          <div
            style={{
              padding: "8px",
              borderRadius: "var(--radius-md)",
              backgroundColor: phase === "RECORD" ? "var(--bg-surface)" : "transparent",
              color: phase === "RECORD" ? "var(--accent-en-primary)" : "var(--text-tertiary)",
              boxShadow: phase === "RECORD" ? "var(--shadow-xs)" : "none",
            }}
          >
            2. Bạn đọc lại
          </div>
          <div
            style={{
              padding: "8px",
              borderRadius: "var(--radius-md)",
              backgroundColor: phase === "RESULT" ? "var(--bg-surface)" : "transparent",
              color: phase === "RESULT" ? "var(--color-success)" : "var(--text-tertiary)",
              boxShadow: phase === "RESULT" ? "var(--shadow-xs)" : "none",
            }}
          >
            3. Kết quả
          </div>
        </div>

        {/* Current Sentence Center Stage */}
        <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
          <div
            className={isZh ? "hanzi" : ""}
            style={{
              fontSize: isZh ? "2.25rem" : "1.75rem",
              fontWeight: 800,
              lineHeight: isZh ? "1.8" : "1.5",
              color: "var(--text-primary)",
              marginBottom: "var(--space-3)",
            }}
          >
            {currentSentence?.text}
          </div>

          {currentSentence?.translationVi && (
            <div style={{ fontSize: "var(--text-base)", color: "var(--text-secondary)" }}>
              {currentSentence.translationVi}
            </div>
          )}
        </div>

        {/* Audio Model Playback (Listen Phase) */}
        <div
          style={{
            backgroundColor: "var(--bg-muted)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-6)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          {phase === "LISTEN" && (
            <div className="flex-col items-center gap-3">
              <AudioButton
                text={currentSentence?.text}
                audioUrl={currentSentence?.audioUrl}
                language={session.language}
                size="lg"
                variant="subtle"
                label="Nghe câu mẫu"
              />
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                Nghe kỹ ngữ điệu và phát âm của người bản xứ
              </span>

              <Button
                variant={isZh ? "zh" : "primary"}
                size="lg"
                onClick={() => setPhase("RECORD")}
                leftIcon={<Mic size={18} />}
                style={{ marginTop: "8px" }}
              >
                Tôi đã sẵn sàng đọc
              </Button>
            </div>
          )}

          {phase === "RECORD" && (
            <div className="flex-col items-center gap-4" style={{ width: "100%" }}>
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                aria-label={isRecording ? "Dừng ghi âm shadowing" : "Bắt đầu ghi âm shadowing"}
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: isRecording ? "var(--color-error)" : isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: isRecording ? "pulseGlow 1.5s infinite" : "none",
                  cursor: "pointer",
                  border: "none",
                }}
              >
                {isRecording ? <Square size={28} /> : <Mic size={32} />}
              </button>

              <div>
                <div style={{ fontSize: "var(--text-base)", fontWeight: 700, textAlign: "center" }}>
                  {isRecording ? `Đang ghi âm... ${formatRecordingTime(recordingSeconds)}` : (recordedAudioBlob || audioBase64) ? "Đã ghi âm xong!" : "Nhấn vào micro để đọc"}
                </div>
              </div>

              {(recordedAudioBlob || audioBase64) && !isRecording && (
                <div className="flex-col items-center gap-4" style={{ width: "100%" }}>
                  <audio
                    controls
                    src={recordedAudioUrl || `data:${audioMimeType || "audio/webm"};base64,${audioBase64}`}
                    style={{ width: "100%", maxWidth: "440px" }}
                    aria-label="Nghe lại bản ghi shadowing"
                  />

                  {isLocalZh && (
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", textAlign: "center" }}>
                      Chấm điểm Shadowing tiếng Trung chưa được hỗ trợ.
                    </div>
                  )}

                  <div className="flex-row gap-3" style={{ flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
                    <Button variant="secondary" size="md" onClick={startRecording} leftIcon={<RotateCcw size={16} />}>
                      Ghi lại
                    </Button>
                    {isLocalEnglish ? (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleLocalEvaluate}
                        rightIcon={<Sparkles size={16} />}
                      >
                        Phân tích & chấm điểm
                      </Button>
                    ) : isLocalZh ? (
                      <Button
                        variant="zh"
                        size="md"
                        onClick={handleStaticAdvanceChinese}
                        rightIcon={<ArrowRight size={16} />}
                      >
                        Sang câu tiếp theo
                      </Button>
                    ) : (
                      <Button
                        variant={isZh ? "zh" : "primary"}
                        size="md"
                        onClick={handleEvaluateAndAdvance}
                        rightIcon={<ArrowRight size={16} />}
                      >
                        Gửi và chấm điểm
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {phase === "EVALUATING" && (
            <div className="flex-col items-center gap-3" style={{ padding: "var(--space-6)" }}>
              <Loader2 size={36} className="animate-spin" color="var(--accent-en-primary)" />
              <div style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>
                {analysisProgress?.phase === "download"
                  ? `Đang tải mô hình nhận dạng... ${analysisProgress.loaded && analysisProgress.total ? `${Math.round((analysisProgress.loaded / analysisProgress.total) * 100)}%` : ""}`
                  : analysisProgress?.phase === "load"
                  ? "Đang khởi tạo mô hình..."
                  : analysisProgress?.phase === "analyze"
                  ? "Đang phân tích giọng đọc..."
                  : "Đang phân tích phát âm..."}
              </div>
            </div>
          )}

          {phase === "RESULT" && lastAttemptResult && (
            <div className="flex-col gap-6" style={{ width: "100%" }}>
              <div
                style={{
                  padding: "var(--space-6)",
                  borderRadius: "var(--radius-xl)",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <div className="flex-row justify-between items-center" style={{ flexWrap: "wrap", gap: "8px", marginBottom: "var(--space-4)" }}>
                  <div className="flex-row items-center gap-2">
                    <Award size={24} color="var(--accent-en-primary)" />
                    <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>
                      {isStaticRuntime() ? "Kết quả luyện đọc" : "Kết quả đánh giá"}
                    </h3>
                  </div>
                  <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--accent-en-primary)" }}>
                    Điểm số: {lastAttemptResult.overallScore} / 100
                  </div>
                </div>

                {/* Metric Bars */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "var(--space-6)" }}>
                  <div className="flex-col gap-1">
                    <div className="flex-row justify-between" style={{ fontSize: "var(--text-xs)" }}>
                      <span>{isStaticRuntime() ? "Độ khớp lời đọc" : "Phát âm (Pronunciation)"}</span>
                      <strong>{lastAttemptResult.pronunciationScore}%</strong>
                    </div>
                    <ProgressBar value={lastAttemptResult.pronunciationScore} />
                  </div>

                  <div className="flex-col gap-1">
                    <div className="flex-row justify-between" style={{ fontSize: "var(--text-xs)" }}>
                      <span>Độ trôi chảy</span>
                      <strong>{lastAttemptResult.fluencyScore}%</strong>
                    </div>
                    <ProgressBar value={lastAttemptResult.fluencyScore} color="var(--color-success)" />
                  </div>

                  {lastAttemptResult.wordsPerMinute !== undefined && (
                    <div className="flex-col gap-1">
                      <div className="flex-row justify-between" style={{ fontSize: "var(--text-xs)" }}>
                        <span>Tốc độ đọc</span>
                        <strong>{lastAttemptResult.wordsPerMinute} từ/phút</strong>
                      </div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                        Dựa trên thời lượng bản ghi; không suy luận giọng hay âm sắc.
                      </div>
                    </div>
                  )}
                </div>

                {/* Transcripts */}
                <div style={{ marginBottom: "var(--space-5)", fontSize: "var(--text-sm)", lineHeight: 1.6 }}>
                  <div><strong>Văn bản mẫu:</strong> {lastAttemptResult.expectedText || currentSentence?.text}</div>
                  {lastAttemptResult.recognizedText !== undefined && (
                    <div><strong>Nhận dạng từ bản ghi:</strong> {lastAttemptResult.recognizedText || "(Không nhận dạng được lời đọc)"}</div>
                  )}
                  {lastAttemptResult.coaching?.map((message) => (
                    <div key={message} style={{ color: "var(--text-secondary)" }}>{message}</div>
                  ))}
                  {isStaticRuntime() && (
                    <div style={{ marginTop: "6px", color: "var(--text-tertiary)", fontSize: "var(--text-xs)" }}>
                      Âm thanh được phân tích trên thiết bị và không được gửi lên máy chủ.
                    </div>
                  )}
                </div>

                {/* Word-by-word alignment */}
                {lastAttemptResult.words && lastAttemptResult.words.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 700, marginBottom: "8px" }}>
                      {isStaticRuntime() ? "So khớp từng từ:" : "Phân tích từng từ:"}
                    </h4>
                    <div className="flex-row gap-2" style={{ flexWrap: "wrap" }}>
                      {lastAttemptResult.words.map((w, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "var(--radius-md)",
                            backgroundColor:
                              w.status === "good"
                                ? "var(--color-success-bg)"
                                : w.status === "warning"
                                ? "var(--color-warning-bg)"
                                : "var(--color-error-bg)",
                            border: `1px solid ${
                              w.status === "good"
                                ? "var(--color-success-border)"
                                : w.status === "warning"
                                ? "var(--color-warning-border)"
                                : "var(--color-error-border)"
                            }`,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "var(--text-sm)",
                            fontWeight: 600,
                          }}
                        >
                          <span>{w.word}</span>
                          <span style={{ fontSize: "var(--text-xs)", opacity: 0.8 }}>({w.score}%)</span>
                          {w.status === "good" && <CheckCircle2 size={14} color="var(--color-success)" />}
                          {w.status === "warning" && <AlertCircle size={14} color="var(--color-warning)" />}
                          {w.status === "poor" && <XCircle size={14} color="var(--color-error)" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions on Result */}
              <div className="flex-row justify-center gap-3" style={{ flexWrap: "wrap", width: "100%" }}>
                <Button variant="secondary" size="md" onClick={handleRetryCurrentSentence} leftIcon={<RotateCcw size={16} />}>
                  Ghi lại
                </Button>
                <Button
                  variant={isZh ? "zh" : "primary"}
                  size="md"
                  onClick={isStaticRuntime() ? handleCommitAndAdvance : handleNextSentence}
                  rightIcon={<ArrowRight size={16} />}
                >
                  Sang câu tiếp theo
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
