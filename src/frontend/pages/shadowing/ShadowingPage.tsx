import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  Headphones,
  Mic,
  Square,
  Volume2,
  CheckCircle2,
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

type ShadowingPhase = "LISTEN" | "RECORD" | "EVALUATING" | "RESULT" | "COMPLETED";

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
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string | undefined>(undefined);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);
  const autoStartedReadingRef = useRef<string | null>(null);

  // Fetch available readings if no session started
  useEffect(() => {
    readingApi.list(language).then(setReadings).catch(() => []);
  }, [language]);

  // Start Session if readingId is passed
  const handleStartSession = async (rId: string) => {
    setSelectedReadingId(rId);
    try {
      if (isStaticRuntime()) {
        const reading = await readingApi.get(rId);
        const first = reading.sentences[0];
        if (!first) throw new Error("Bài đọc chưa có câu để luyện shadowing.");
        setSession({
          id: `local-shadowing-${rId}`, user_id: "local-profile", reading_id: rId, language: reading.language,
          current_sentence: 0, completed_count: 0, score_total: 0, average_score: 0, status: "ACTIVE",
          created_at: new Date().toISOString(), completed_at: null,
          currentSentenceData: { id: first.id, order: first.order, text: first.text, translationVi: first.translationVi, audioUrl: first.audioUrl },
        });
        setPhase("LISTEN");
        setLastAttemptResult(null);
        return;
      }
      const newSession = await shadowingApi.start(rId);
      setSession(newSession);
      setPhase("LISTEN");
      setLastAttemptResult(null);
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
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state !== "inactive") mediaRecorderRef.current?.stop();
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Recording controls
  const startRecording = async () => {
    setAudioBase64(null);
    setAudioMimeType(undefined);
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
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const b64 = (reader.result as string).split(",")[1];
          if (b64 && mountedRef.current) {
            setAudioBase64(b64);
            setAudioMimeType(blob.type || "audio/webm");
          }
        };
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

  // Evaluate & Advance State Machine
  const handleEvaluateAndAdvance = async () => {
    if (!session || !session.currentSentenceData || !audioBase64) return;
    setPhase("EVALUATING");

    try {
      // 1. Submit pronunciation attempt to get attemptId
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

      // 2. Advance session on backend
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

  const handleNextSentence = () => {
    setLastAttemptResult(null);
    setAudioBase64(null);
    setPhase("LISTEN");
  };

  const handleStaticAdvance = async () => {
    if (!session) return;
    const reading = await readingApi.get(session.reading_id);
    const nextIndex = session.current_sentence + 1;
    const next = reading.sentences[nextIndex];
    setAudioBase64(null);
    if (!next) {
      setSession({ ...session, current_sentence: nextIndex, completed_count: reading.sentences.length, status: "COMPLETED", completed_at: new Date().toISOString(), currentSentenceData: null });
      setPhase("COMPLETED");
      success("Bạn đã hoàn thành lượt shadowing cục bộ.");
      return;
    }
    setSession({ ...session, current_sentence: nextIndex, completed_count: nextIndex, currentSentenceData: { id: next.id, order: next.order, text: next.text, translationVi: next.translationVi, audioUrl: next.audioUrl } });
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
                    padding: "14px 18px",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "var(--bg-muted)",
                    border: "1px solid var(--border-default)",
                  }}
                >
                  <div>
                    <div className="flex-row items-center gap-2" style={{ marginBottom: "4px" }}>
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
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-6)" }}>
            Bạn đã hoàn thành toàn bộ <strong>{session.completed_count} câu</strong>. {isStaticRuntime() ? "Bản static không chấm điểm phát âm." : "Điểm số trung bình:"}
          </p>

          {!isStaticRuntime() && <div
            style={{
              fontSize: "var(--text-4xl)",
              fontWeight: 800,
              color: "var(--accent-en-primary)",
              marginBottom: "var(--space-8)",
            }}
          >
            {session.average_score} / 100
          </div>}

          <div className="flex-row gap-3">
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
            Điểm TB: {session.average_score}
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
            <div className="flex-col items-center gap-4">
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
                }}
              >
                {isRecording ? <Square size={28} /> : <Mic size={32} />}
              </button>

              <div>
                <div style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>
                  {isRecording ? `Đang ghi âm... 00:${recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}` : audioBase64 ? "Đã ghi âm xong!" : "Nhấn vào micro để đọc"}
                </div>
              </div>

              {audioBase64 && !isRecording && (
                <div className="flex-col items-center gap-3">
                  <audio controls src={`data:${audioMimeType || "audio/webm"};base64,${audioBase64}`} aria-label="Nghe lại bản ghi shadowing" />
                  <div className="flex-row gap-3">
                    <Button variant="secondary" size="sm" onClick={startRecording}>Ghi lại</Button>
                    <Button
                      variant={isZh ? "zh" : "primary"}
                      size="md"
                      onClick={isStaticRuntime() ? handleStaticAdvance : handleEvaluateAndAdvance}
                      rightIcon={<ArrowRight size={16} />}
                    >
                      {isStaticRuntime() ? "Sang câu tiếp theo (không chấm điểm)" : "Gửi và chấm điểm"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {phase === "EVALUATING" && (
            <div className="flex-col items-center gap-3" style={{ padding: "var(--space-4)" }}>
              <Loader2 size={36} className="animate-spin" color="var(--accent-en-primary)" />
              <div style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Đang phân tích phát âm...</div>
            </div>
          )}

          {phase === "RESULT" && lastAttemptResult && (
            <div className="flex-col items-center gap-4" style={{ width: "100%" }}>
              <div className="flex-row items-center gap-2">
                <CheckCircle2 size={24} color="var(--color-success)" />
                <span style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>
                  Điểm số: {lastAttemptResult.overallScore} / 100
                </span>
              </div>

              <Button
                variant={isZh ? "zh" : "primary"}
                size="lg"
                onClick={handleNextSentence}
                rightIcon={<ArrowRight size={18} />}
              >
                Sang câu tiếp theo
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
