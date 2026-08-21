import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  Headphones,
  Mic,
  Square,
  Volume2,
  Pause,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  Loader2,
  ChevronDown,
  Layers,
  Check,
  X,
} from "lucide-react";
import { shadowingApi } from "../../api/shadowing.api";
import { readingApi } from "../../api/reading.api";
import { pronunciationApi } from "../../api/pronunciation.api";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { AudioButton, stopAllGlobalAudio } from "../../components/ui/AudioButton";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { getFriendlyErrorMessage } from "../../api/client";
import type {
  PronunciationResult,
  ReadingPassageSummary,
  ReadingSentence,
  ShadowingSession,
} from "../../types/api";
import { isStaticRuntime } from "../../runtime/runtime";
import { analyzeLocalEnglishRecording, type LocalPronunciationProgress } from "../../services/localPronunciation";
import { saveLocalPronunciationHistory } from "../../services/localPronunciationHistory";
import type { LocalPronunciationAnalysis } from "../../services/localPronunciationScoring";

export type ShadowingPhase = "LISTEN" | "RECORD" | "EVALUATING" | "RESULT" | "COMPLETED";
export type ShadowingPracticeMode = "manual" | "continuous";

export interface SentenceAttempt {
  id: number;
  score: number;
  recordedAt: string;
  result: PronunciationResult;
}

export interface SentenceProgress {
  completed: boolean;
  bestScore?: number;
  latestScore?: number;
  latestAudioBlob?: Blob;
  attempts: SentenceAttempt[];
}

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
  const { success, error, warning } = useToast();
  const navigate = useNavigate();

  const [readings, setReadings] = useState<ReadingPassageSummary[]>([]);
  const [sentences, setSentences] = useState<ReadingSentence[]>([]);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState<number>(0);
  const [session, setSession] = useState<ShadowingSession | null>(null);
  const [phase, setPhase] = useState<ShadowingPhase>("LISTEN");
  const [practiceMode, setPracticeMode] = useState<ShadowingPracticeMode>("manual");
  const [progressMap, setProgressMap] = useState<Record<number, SentenceProgress>>({});
  const [isSentenceSelectorOpen, setIsSentenceSelectorOpen] = useState(false);
  const [lastAttemptResult, setLastAttemptResult] = useState<PronunciationResult | null>(null);

  // Recorder & Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string | undefined>(undefined);
  const [analysisProgress, setAnalysisProgress] = useState<LocalPronunciationProgress | null>(null);
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState(false);

  // Refs for race condition & generation safety
  const currentPracticeIndexRef = useRef(0);
  currentPracticeIndexRef.current = currentPracticeIndex;

  const practiceModeRef = useRef<ShadowingPracticeMode>("manual");
  practiceModeRef.current = practiceMode;

  const sessionRef = useRef<ShadowingSession | null>(null);
  sessionRef.current = session;

  const sentencesRef = useRef<ReadingSentence[]>([]);
  sentencesRef.current = sentences;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);
  const autoStartedReadingRef = useRef<string | null>(null);

  const recordingGenerationRef = useRef(0);
  const analysisGenerationRef = useRef(0);
  const serverAssessmentGenerationRef = useRef(0);
  const continuousAdvanceTimerRef = useRef<any>(null);
  const analysisAbortRef = useRef<AbortController | null>(null);
  const userAudioElRef = useRef<HTMLAudioElement | null>(null);
  const recordedAudioUrlRef = useRef<string | null>(null);

  // User audio controls
  const stopUserAudio = useCallback(() => {
    if (userAudioElRef.current) {
      try {
        userAudioElRef.current.pause();
        userAudioElRef.current.currentTime = 0;
      } catch {}
    }
    setIsPlayingUserAudio(false);
  }, []);

  const togglePlayUserAudio = () => {
    if (!userAudioElRef.current) return;
    if (isPlayingUserAudio) {
      userAudioElRef.current.pause();
      setIsPlayingUserAudio(false);
    } else {
      // Mutual Exclusivity: Stop model audio before playing user recording
      stopAllGlobalAudio();
      userAudioElRef.current
        .play()
        .then(() => {
          if (mountedRef.current) setIsPlayingUserAudio(true);
        })
        .catch(() => {
          if (mountedRef.current) setIsPlayingUserAudio(false);
        });
    }
  };

  // Centralized Runtime Cleanup
  const performFullRuntimeCleanup = useCallback(() => {
    // Invalidate generations
    recordingGenerationRef.current++;
    analysisGenerationRef.current++;
    serverAssessmentGenerationRef.current++;

    // Abort in-flight analysis
    analysisAbortRef.current?.abort();
    analysisAbortRef.current = null;

    // Clear timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (continuousAdvanceTimerRef.current) {
      clearTimeout(continuousAdvanceTimerRef.current);
      continuousAdvanceTimerRef.current = null;
    }

    // Stop MediaRecorder safely
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    mediaRecorderRef.current = null;

    // Stop MediaStream tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      mediaStreamRef.current = null;
    }

    // Stop audios
    stopUserAudio();
    stopAllGlobalAudio();

    // Revoke object URL
    if (recordedAudioUrlRef.current) {
      try {
        URL.revokeObjectURL(recordedAudioUrlRef.current);
      } catch {}
      recordedAudioUrlRef.current = null;
      setRecordedAudioUrl(null);
    }

    setIsRecording(false);
  }, [stopUserAudio]);

  // Fetch available readings if no session started
  useEffect(() => {
    readingApi.list(language).then(setReadings).catch(() => []);
  }, [language]);

  // Clean unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      performFullRuntimeCleanup();
    };
  }, [performFullRuntimeCleanup]);

  // Exit Shadowing Studio safely
  const handleExitShadowing = () => {
    performFullRuntimeCleanup();
    setSession(null);
    setSentences([]);
    setProgressMap({});
    setLastAttemptResult(null);
    setRecordedAudioBlob(null);
    setAudioBase64(null);
    setAudioMimeType(undefined);
  };

  // Start Session with Full Passage sentences
  const handleStartSession = async (rId: string) => {
    performFullRuntimeCleanup();
    setRecordedAudioBlob(null);
    setAudioBase64(null);
    setAudioMimeType(undefined);
    setLastAttemptResult(null);
    setAnalysisProgress(null);
    setProgressMap({});
    setCurrentPracticeIndex(0);

    try {
      const fullReading = await readingApi.get(rId);
      if (!fullReading.sentences || fullReading.sentences.length === 0) {
        throw new Error("Bài đọc chưa có câu để luyện shadowing.");
      }
      setSentences(fullReading.sentences);

      if (isStaticRuntime()) {
        const first = fullReading.sentences[0];
        setSession({
          id: `local-shadowing-${rId}`,
          user_id: "local-profile",
          reading_id: rId,
          language: fullReading.language,
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
      } else {
        const newSession = await shadowingApi.start(rId);
        setSession(newSession);
      }
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

  // Clean transition to target sentence
  const handleSelectSentence = (targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= sentences.length) return;
    if (targetIndex === currentPracticeIndex && isSentenceSelectorOpen) {
      setIsSentenceSelectorOpen(false);
      return;
    }

    performFullRuntimeCleanup();

    setRecordedAudioBlob(null);
    setAudioBase64(null);
    setAudioMimeType(undefined);
    setAnalysisProgress(null);

    const targetSentence = sentences[targetIndex];
    setCurrentPracticeIndex(targetIndex);

    // Check if target sentence already has evaluated attempt with retained audio blob
    const existingProgress = progressMap[targetIndex];
    if (existingProgress && existingProgress.attempts.length > 0) {
      const latestAttempt = existingProgress.attempts[existingProgress.attempts.length - 1];
      setLastAttemptResult(latestAttempt.result);

      if (existingProgress.latestAudioBlob) {
        setRecordedAudioBlob(existingProgress.latestAudioBlob);
        try {
          const freshUrl = URL.createObjectURL(existingProgress.latestAudioBlob);
          recordedAudioUrlRef.current = freshUrl;
          setRecordedAudioUrl(freshUrl);
        } catch {}
      }
      setPhase("RESULT");
    } else {
      setLastAttemptResult(null);
      setPhase("LISTEN");
    }

    // In Static mode only: update synthetic local session state
    if (session && targetSentence && isStaticRuntime()) {
      setSession((prev) =>
        prev
          ? {
              ...prev,
              current_sentence: targetIndex,
              currentSentenceData: {
                id: targetSentence.id,
                order: targetSentence.order,
                text: targetSentence.text,
                translationVi: targetSentence.translationVi,
                audioUrl: targetSentence.audioUrl,
              },
            }
          : null
      );
    }

    setIsSentenceSelectorOpen(false);
  };

  const handlePreviousSentence = () => {
    if (currentPracticeIndex > 0) {
      handleSelectSentence(currentPracticeIndex - 1);
    }
  };

  const handleNextSentence = () => {
    const allDone = sentences.length > 0 && Object.values(progressMap).filter((p) => p.completed).length >= sentences.length;
    if (currentPracticeIndex < sentences.length - 1) {
      handleSelectSentence(currentPracticeIndex + 1);
    } else if (allDone) {
      setPhase("COMPLETED");
      success("Chúc mừng bạn đã hoàn thành bài luyện Shadowing!");
    }
  };

  // Recording controls
  const startRecording = async () => {
    performFullRuntimeCleanup();

    const generation = recordingGenerationRef.current;
    const currentSent = sentences[currentPracticeIndex] || session?.currentSentenceData;
    const sentenceIndex = currentPracticeIndex;
    const sentenceId = currentSent?.id;
    const targetReadingId = session?.reading_id;

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
      if (!mountedRef.current || generation !== recordingGenerationRef.current || sentenceIndex !== currentPracticeIndexRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        stream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {}
        });
        if (mediaStreamRef.current === stream) {
          mediaStreamRef.current = null;
        }
        if (mediaRecorderRef.current === recorder) {
          mediaRecorderRef.current = null;
        }

        // Blocker B Guard: Verify active recording generation and sentence before touching React state
        if (
          !mountedRef.current ||
          generation !== recordingGenerationRef.current ||
          sentenceIndex !== currentPracticeIndexRef.current ||
          sentenceId !== sentencesRef.current[currentPracticeIndexRef.current]?.id ||
          targetReadingId !== sessionRef.current?.reading_id ||
          blob.size === 0
        ) {
          return;
        }

        // Revoke any previous URL
        if (recordedAudioUrlRef.current) {
          try {
            URL.revokeObjectURL(recordedAudioUrlRef.current);
          } catch {}
          recordedAudioUrlRef.current = null;
        }

        const freshUrl = URL.createObjectURL(blob);
        recordedAudioUrlRef.current = freshUrl;
        setRecordedAudioBlob(blob);
        setRecordedAudioUrl(freshUrl);
        setAudioMimeType(blob.type || "audio/webm");

        if (!isStaticRuntime()) {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const b64 = (reader.result as string).split(",")[1];
            if (
              b64 &&
              mountedRef.current &&
              generation === recordingGenerationRef.current &&
              sentenceIndex === currentPracticeIndexRef.current
            ) {
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
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Helper to record attempt progress and update session stats without advancing sentence cursor
  const recordAttemptSuccess = (res: PronunciationResult, blob: Blob | null) => {
    const idx = currentPracticeIndex;
    const prevProg = progressMap[idx] || { completed: false, attempts: [] };
    const newAttempt: SentenceAttempt = {
      id: prevProg.attempts.length + 1,
      score: res.overallScore,
      recordedAt: new Date().toISOString(),
      result: res,
    };
    const newBest = Math.max(prevProg.bestScore ?? 0, res.overallScore);
    const updatedProg: SentenceProgress = {
      completed: true,
      bestScore: newBest,
      latestScore: res.overallScore,
      latestAudioBlob: blob || prevProg.latestAudioBlob,
      attempts: [...prevProg.attempts, newAttempt],
    };

    const newProgressMap = {
      ...progressMap,
      [idx]: updatedProg,
    };
    setProgressMap(newProgressMap);

    const completedCount = Object.values(newProgressMap).filter((p) => p.completed).length;
    const totalScore = Object.values(newProgressMap).reduce((sum, p) => sum + (p.bestScore ?? 0), 0);
    const averageScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;

    // In Static mode only: update synthetic local session stats
    if (isStaticRuntime()) {
      setSession((prev) =>
        prev
          ? {
              ...prev,
              completed_count: completedCount,
              score_total: totalScore,
              average_score: averageScore,
            }
          : null
      );
    }

    setLastAttemptResult(res);
    setPhase("RESULT");

    // In Continuous mode: schedule managed auto-advance
    if (practiceMode === "continuous") {
      if (continuousAdvanceTimerRef.current) {
        clearTimeout(continuousAdvanceTimerRef.current);
      }
      const timerGen = recordingGenerationRef.current;
      const timerIdx = idx;
      continuousAdvanceTimerRef.current = setTimeout(() => {
        continuousAdvanceTimerRef.current = null;
        if (
          !mountedRef.current ||
          practiceModeRef.current !== "continuous" ||
          timerIdx !== currentPracticeIndexRef.current ||
          timerGen !== recordingGenerationRef.current
        ) {
          return;
        }
        if (timerIdx < sentencesRef.current.length - 1) {
          handleSelectSentence(timerIdx + 1);
        } else if (completedCount >= sentencesRef.current.length) {
          setPhase("COMPLETED");
        }
      }, 2000);
    }
  };

  // Local Free Evaluation (Static English)
  const handleLocalEvaluate = async () => {
    const currentSent = sentences[currentPracticeIndex] || session?.currentSentenceData;
    if (!session || !currentSent || !recordedAudioBlob) return;

    const targetIdx = currentPracticeIndex;
    const targetSentenceId = currentSent.id;
    const generation = ++analysisGenerationRef.current;
    const controller = new AbortController();
    analysisAbortRef.current?.abort();
    analysisAbortRef.current = controller;
    setPhase("EVALUATING");
    setAnalysisProgress(null);

    try {
      const res = await analyzeLocalEnglishRecording({
        blob: recordedAudioBlob,
        expectedText: currentSent.text,
        signal: controller.signal,
        onProgress: (p) => {
          if (
            mountedRef.current &&
            generation === analysisGenerationRef.current &&
            targetIdx === currentPracticeIndexRef.current &&
            targetSentenceId === sentencesRef.current[currentPracticeIndexRef.current]?.id
          ) {
            setAnalysisProgress(p);
          }
        },
      });

      if (
        !mountedRef.current ||
        controller.signal.aborted ||
        generation !== analysisGenerationRef.current ||
        targetIdx !== currentPracticeIndexRef.current ||
        targetSentenceId !== sentencesRef.current[currentPracticeIndexRef.current]?.id
      ) {
        return;
      }

      recordAttemptSuccess(res, recordedAudioBlob);
      try {
        await saveLocalPronunciationHistory(res as LocalPronunciationAnalysis);
      } catch {
        // history persistence fail-open
      }
      success("Đã hoàn thành phân tích luyện đọc trên thiết bị!");
    } catch (err: any) {
      if (
        err?.name !== "AbortError" &&
        generation === analysisGenerationRef.current &&
        targetIdx === currentPracticeIndexRef.current
      ) {
        setPhase("RECORD");
        error(getFriendlyErrorMessage(err));
      }
    } finally {
      if (mountedRef.current && generation === analysisGenerationRef.current) {
        setAnalysisProgress(null);
      }
    }
  };

  // Server Evaluate (Server Mode)
  const handleEvaluateAndAdvance = async () => {
    const currentSent = sentences[currentPracticeIndex] || session?.currentSentenceData;
    if (!session || !currentSent || !audioBase64) return;

    const targetIdx = currentPracticeIndex;
    const targetSentenceId = currentSent.id;
    const generation = ++serverAssessmentGenerationRef.current;
    setPhase("EVALUATING");

    try {
      const assessResult = await pronunciationApi.assess({
        expectedText: currentSent.text,
        language: session.language,
        audioBase64,
        audioMimeType,
        readingId: session.reading_id,
        sentenceId: currentSent.id,
      });

      if (
        !mountedRef.current ||
        generation !== serverAssessmentGenerationRef.current ||
        targetIdx !== currentPracticeIndexRef.current ||
        targetSentenceId !== sentencesRef.current[currentPracticeIndexRef.current]?.id
      ) {
        return;
      }

      recordAttemptSuccess(assessResult, recordedAudioBlob);

      // Blocker A Safety Guard: Only advance server cursor if practicing server's authoritative current sentence
      if (
        !isStaticRuntime() &&
        assessResult.attemptId &&
        targetIdx === session.current_sentence &&
        targetSentenceId === session.currentSentenceData?.id
      ) {
        try {
          const next = await shadowingApi.advance(session.id, assessResult.attemptId);
          if (
            mountedRef.current &&
            generation === serverAssessmentGenerationRef.current &&
            targetIdx === currentPracticeIndexRef.current
          ) {
            setSession(next);
          }
        } catch {
          // Assessment score is preserved in progressMap and RESULT phase; surface visible warning for server sync failure
          warning("Không thể đồng bộ tiến độ phiên học với máy chủ. Điểm đánh giá vẫn được lưu.");
        }
      }
    } catch (err: any) {
      if (generation === serverAssessmentGenerationRef.current && targetIdx === currentPracticeIndexRef.current) {
        setPhase("RECORD");
        error(getFriendlyErrorMessage(err));
      }
    }
  };

  // Advance without score (Static Chinese Mode)
  const handleStaticAdvanceChinese = () => {
    const idx = currentPracticeIndex;
    const newProg: SentenceProgress = {
      completed: true,
      attempts: [],
    };
    const newProgressMap = { ...progressMap, [idx]: newProg };
    setProgressMap(newProgressMap);

    const completedCount = Object.values(newProgressMap).filter((p) => p.completed).length;
    setSession((prev) =>
      prev
        ? {
            ...prev,
            completed_count: completedCount,
          }
        : null
    );

    if (idx < sentences.length - 1) {
      handleSelectSentence(idx + 1);
    } else {
      setPhase("COMPLETED");
      success("Bạn đã hoàn thành lượt shadowing tiếng Trung.");
    }
  };

  // Retry Current Sentence (Preserves currentPracticeIndex)
  const handleRetryCurrentSentence = () => {
    performFullRuntimeCleanup();
    setRecordedAudioBlob(null);
    setAudioBase64(null);
    setAudioMimeType(undefined);
    setLastAttemptResult(null);
    setPhase("RECORD");
  };

  // Practice Mode Switch Handler
  const handleSwitchPracticeMode = (mode: ShadowingPracticeMode) => {
    if (mode === "manual" && continuousAdvanceTimerRef.current) {
      clearTimeout(continuousAdvanceTimerRef.current);
      continuousAdvanceTimerRef.current = null;
    }
    setPracticeMode(mode);
  };

  // Back to passage selector or home
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
            <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>Luyện Nói Shadowing Studio</h1>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
              Luyện phát âm, ngữ điệu và phản xạ giao tiếp tự nhiên với phòng thu câu tự do
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
                    Vào phòng thu
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

  const currentSentence = sentences[currentPracticeIndex] || session.currentSentenceData;
  const isZh = session.language === "zh";
  const isLocalEnglish = isStaticRuntime() && !isZh;
  const isLocalZh = isStaticRuntime() && isZh;
  const currentSentenceProgress = progressMap[currentPracticeIndex];
  const attemptHistory = currentSentenceProgress?.attempts || [];
  const completedCount = Object.values(progressMap).filter((p) => p.completed).length;
  const allCompleted = sentences.length > 0 && completedCount >= sentences.length;

  // Completed Session Screen
  if (session.status === "COMPLETED" || phase === "COMPLETED") {
    return (
      <div className="page-container flex-col items-center justify-center gap-6 animate-fade-in shadowing-page-container">
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
            Bạn đã hoàn thành <strong>{completedCount} / {sentences.length} câu</strong>.
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
                {completedCount > 0 ? `${session.average_score} / 100` : "— / 100"}
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
    <div className="page-container flex-col gap-5 animate-fade-in shadowing-page-container" style={{ maxWidth: "780px" }}>
      {/* Top Header: Navigation & Practice Mode Selector */}
      <div className="flex-row justify-between items-center" style={{ flexWrap: "wrap", gap: "8px" }}>
        <Button variant="ghost" size="sm" onClick={handleExitShadowing} leftIcon={<ArrowLeft size={16} />}>
          Thoát
        </Button>

        {/* Practice Mode Selector (Tự do / Liên tục) */}
        <div className="flex-row items-center gap-2">
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontWeight: 600 }}>Chế độ:</span>
          <div style={{ display: "inline-flex", borderRadius: "var(--radius-md)", backgroundColor: "var(--bg-muted)", padding: "2px", border: "1px solid var(--border-default)" }}>
            <button
              type="button"
              onClick={() => handleSwitchPracticeMode("manual")}
              style={{
                padding: "4px 10px",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--text-xs)",
                fontWeight: practiceMode === "manual" ? 700 : 500,
                backgroundColor: practiceMode === "manual" ? "var(--bg-surface)" : "transparent",
                color: practiceMode === "manual" ? (isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)") : "var(--text-secondary)",
                border: "none",
                cursor: "pointer",
                boxShadow: practiceMode === "manual" ? "var(--shadow-xs)" : "none",
              }}
            >
              Tự do
            </button>
            <button
              type="button"
              onClick={() => handleSwitchPracticeMode("continuous")}
              style={{
                padding: "4px 10px",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--text-xs)",
                fontWeight: practiceMode === "continuous" ? 700 : 500,
                backgroundColor: practiceMode === "continuous" ? "var(--bg-surface)" : "transparent",
                color: practiceMode === "continuous" ? (isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)") : "var(--text-secondary)",
                border: "none",
                cursor: "pointer",
                boxShadow: practiceMode === "continuous" ? "var(--shadow-xs)" : "none",
              }}
            >
              Liên tục
            </button>
          </div>
        </div>

        {/* Session Score Pill */}
        <div className="flex-row items-center gap-2">
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-secondary)" }}>
            Điểm TB: {isLocalZh ? "—" : completedCount > 0 ? `${session.average_score}` : "—"}
          </span>
        </div>
      </div>

      {/* Studio Sentence Navigation Bar: [← Câu trước] [Câu X / Y ▼] [Câu sau →] */}
      <div
        className="flex-row justify-between items-center"
        style={{
          backgroundColor: "var(--bg-surface)",
          padding: "10px 14px",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-sm)",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPracticeIndex === 0}
          onClick={handlePreviousSentence}
          leftIcon={<ArrowLeft size={15} />}
        >
          Câu trước
        </Button>

        {/* Sentence Selector Dropdown / Modal Trigger */}
        <button
          type="button"
          onClick={() => setIsSentenceSelectorOpen(true)}
          aria-label="Mở danh sách câu shadowing"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--bg-muted)",
            border: "1px solid var(--border-default)",
            fontSize: "var(--text-sm)",
            fontWeight: 700,
            color: "var(--text-primary)",
            cursor: "pointer",
          }}
        >
          <Layers size={14} color={isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)"} />
          <span>
            Câu {currentPracticeIndex + 1} / {sentences.length}
          </span>
          <ChevronDown size={14} />
        </button>

        <Button
          variant="secondary"
          size="sm"
          disabled={currentPracticeIndex === sentences.length - 1 && !allCompleted}
          onClick={handleNextSentence}
          rightIcon={<ArrowRight size={15} />}
        >
          {currentPracticeIndex === sentences.length - 1 && allCompleted ? "Hoàn thành" : "Câu sau"}
        </Button>
      </div>

      {/* Main Shadowing Player Studio Card */}
      <Card elevated className="flex-col gap-6" style={{ padding: "var(--space-8)" }}>
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
              color: phase === "LISTEN" ? (isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)") : "var(--text-tertiary)",
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
              color: phase === "RECORD" ? (isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)") : "var(--text-tertiary)",
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
        <div style={{ textAlign: "center", padding: "var(--space-3) 0" }}>
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

        {/* Audio Model Playback & Studio Action Container */}
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
          {/* Phase 1: LISTEN */}
          {phase === "LISTEN" && (
            <div className="flex-col items-center gap-4" style={{ width: "100%" }}>
              <div className="flex-row items-center justify-center gap-3" style={{ flexWrap: "wrap" }}>
                <AudioButton
                  text={currentSentence?.text}
                  audioUrl={currentSentence?.audioUrl}
                  language={session.language}
                  size="lg"
                  variant="subtle"
                  label="Nghe câu mẫu"
                  onPlayStart={stopUserAudio}
                />
              </div>

              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", textAlign: "center" }}>
                Nghe kỹ ngữ điệu và phát âm chuẩn của người bản xứ
              </span>

              <Button
                variant={isZh ? "zh" : "primary"}
                size="lg"
                onClick={() => setPhase("RECORD")}
                leftIcon={<Mic size={18} />}
                style={{ marginTop: "6px" }}
              >
                Tôi đã sẵn sàng đọc
              </Button>
            </div>
          )}

          {/* Phase 2: RECORD */}
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
                  boxShadow: "var(--shadow-md)",
                }}
              >
                {isRecording ? <Square size={28} /> : <Mic size={32} />}
              </button>

              <div>
                <div style={{ fontSize: "var(--text-base)", fontWeight: 700, textAlign: "center" }}>
                  {isRecording
                    ? `Đang ghi âm... ${formatRecordingTime(recordingSeconds)}`
                    : recordedAudioBlob || audioBase64
                    ? "Đã ghi âm xong!"
                    : "Nhấn vào micro để bắt đầu đọc"}
                </div>
              </div>

              {(recordedAudioBlob || audioBase64) && !isRecording && (
                <div className="flex-col items-center gap-4" style={{ width: "100%" }}>
                  {/* Model vs User A/B Comparison Buttons */}
                  <div className="flex-row items-center justify-center gap-3" style={{ flexWrap: "wrap", width: "100%" }}>
                    <AudioButton
                      text={currentSentence?.text}
                      audioUrl={currentSentence?.audioUrl}
                      language={session.language}
                      size="md"
                      variant="subtle"
                      label="🔊 Nghe câu mẫu"
                      onPlayStart={stopUserAudio}
                    />
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={togglePlayUserAudio}
                      leftIcon={isPlayingUserAudio ? <Pause size={16} /> : <Volume2 size={16} />}
                    >
                      {isPlayingUserAudio ? "Dừng bản ghi" : "🎙️ Nghe lại bản ghi"}
                    </Button>
                  </div>

                  {/* Standard Audio Player */}
                  <audio
                    aria-label="Nghe lại bản ghi shadowing"
                    ref={userAudioElRef}
                    controls
                    src={recordedAudioUrl || undefined}
                    onEnded={() => setIsPlayingUserAudio(false)}
                    onPause={() => setIsPlayingUserAudio(false)}
                    onPlay={() => {
                      setIsPlayingUserAudio(true);
                      stopAllGlobalAudio();
                    }}
                    style={{ width: "100%", maxWidth: "440px" }}
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
                        Phân tích & chấm điểm
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Phase 3: EVALUATING */}
          {phase === "EVALUATING" && (
            <div className="flex-col items-center gap-3" style={{ padding: "var(--space-6)" }}>
              <Loader2 size={36} className="animate-spin" color={isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)"} />
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

          {/* Phase 4: RESULT (Stays on same sentence, user can compare A/B & retry) */}
          {phase === "RESULT" && lastAttemptResult && (
            <div className="flex-col gap-6" style={{ width: "100%" }}>
              {/* Model vs User A/B Comparison Controls in Result */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                  padding: "12px",
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <AudioButton
                  text={currentSentence?.text}
                  audioUrl={currentSentence?.audioUrl}
                  language={session.language}
                  size="md"
                  variant="subtle"
                  label="🔊 Nghe câu mẫu"
                  onPlayStart={stopUserAudio}
                />
                {recordedAudioUrl && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={togglePlayUserAudio}
                    leftIcon={isPlayingUserAudio ? <Pause size={16} /> : <Volume2 size={16} />}
                  >
                    {isPlayingUserAudio ? "Dừng giọng tôi" : "🎙️ Nghe giọng của tôi"}
                  </Button>
                )}
              </div>

              {/* Score & Metric Breakdown Card */}
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
                    <Award size={24} color={isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)"} />
                    <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>
                      {isStaticRuntime() ? "Kết quả luyện đọc" : "Kết quả đánh giá"}
                    </h3>
                  </div>
                  <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)" }}>
                    Điểm số: {lastAttemptResult.overallScore} / 100
                  </div>
                </div>

                {/* Attempt History Pills for Current Sentence */}
                {attemptHistory.length > 1 && (
                  <div className="flex-row items-center gap-2" style={{ marginBottom: "var(--space-4)", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontWeight: 600 }}>
                      Lịch sử lượt đọc câu này:
                    </span>
                    {attemptHistory.map((att, attIdx) => (
                      <span
                        key={att.id || attIdx}
                        style={{
                          padding: "2px 8px",
                          borderRadius: "var(--radius-full)",
                          backgroundColor: att.score >= 80 ? "var(--color-success-bg)" : "var(--bg-muted)",
                          border: `1px solid ${att.score >= 80 ? "var(--color-success-border)" : "var(--border-default)"}`,
                          fontSize: "var(--text-xs)",
                          fontWeight: 700,
                          color: att.score >= 80 ? "var(--color-success)" : "var(--text-secondary)",
                        }}
                      >
                        Lần {att.id}: {att.score}đ {att.score === currentSentenceProgress?.bestScore ? "⭐" : ""}
                      </span>
                    ))}
                  </div>
                )}

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

              {/* Actions on Result: Retry current sentence OR Advance manually */}
              <div className="flex-row justify-center gap-3" style={{ flexWrap: "wrap", width: "100%" }}>
                <Button variant="secondary" size="md" onClick={handleRetryCurrentSentence} leftIcon={<RotateCcw size={16} />}>
                  Thử lại câu này
                </Button>
                <Button
                  variant={isZh ? "zh" : "primary"}
                  size="md"
                  onClick={handleNextSentence}
                  rightIcon={<ArrowRight size={16} />}
                >
                  {currentPracticeIndex === sentences.length - 1 ? "Hoàn thành bài đọc" : "Sang câu tiếp theo"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Sentence Selector Modal / Sheet */}
      {isSentenceSelectorOpen && (
        <div
          className="modal-backdrop animate-fade-in"
          onClick={() => setIsSentenceSelectorOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            className="modal-card animate-pop-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-xl)",
              maxWidth: "520px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              padding: "20px",
            }}
          >
            <div className="flex-row justify-between items-center" style={{ marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>Chọn câu luyện tập</h3>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                  Đã hoàn thành {completedCount} / {sentences.length} câu
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSentenceSelectorOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-tertiary)",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Grid of Sentence Badges */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(56px, 1fr))",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              {sentences.map((sent, idx) => {
                const isCurrent = idx === currentPracticeIndex;
                const prog = progressMap[idx];
                const isCompleted = prog?.completed;
                const bestScore = prog?.bestScore;

                return (
                  <button
                    key={sent.id || idx}
                    type="button"
                    onClick={() => handleSelectSentence(idx)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "8px 4px",
                      borderRadius: "var(--radius-lg)",
                      backgroundColor: isCurrent
                        ? isZh
                          ? "var(--accent-zh-subtle)"
                          : "var(--accent-en-subtle)"
                        : isCompleted
                        ? "var(--color-success-bg)"
                        : "var(--bg-muted)",
                      border: isCurrent
                        ? `2px solid ${isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)"}`
                        : isCompleted
                        ? "1px solid var(--color-success-border)"
                        : "1px solid var(--border-default)",
                      color: isCurrent
                        ? isZh
                          ? "var(--accent-zh-text)"
                          : "var(--accent-en-text)"
                        : isCompleted
                        ? "var(--color-success)"
                        : "var(--text-primary)",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    <span style={{ fontSize: "var(--text-sm)" }}>{idx + 1}</span>
                    <span style={{ fontSize: "10px", fontWeight: 600, opacity: 0.9 }}>
                      {bestScore !== undefined ? `${bestScore}đ` : isCompleted ? <Check size={12} /> : "—"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex-row justify-end">
              <Button variant="secondary" size="sm" onClick={() => setIsSentenceSelectorOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
