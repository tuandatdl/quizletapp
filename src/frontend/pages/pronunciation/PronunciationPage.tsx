import React, { useEffect, useState, useRef } from "react";
import {
  Mic,
  Square,
  Volume2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  TrendingDown,
  Loader2,
  Award,
  Play,
  Pause,
  Trash2,
} from "lucide-react";
import { pronunciationApi } from "../../api/pronunciation.api";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { AudioButton } from "../../components/ui/AudioButton";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { CardSkeleton } from "../../components/ui/Skeleton";
import { getFriendlyErrorMessage } from "../../api/client";
import type {
  PronunciationAvailability,
  PronunciationResult,
  RecentPronunciationAttempt,
  WeakestWord,
} from "../../types/api";

export const PronunciationPage: React.FC = () => {
  const { language } = useLanguage();
  const { success, error } = useToast();

  const [availability, setAvailability] = useState<PronunciationAvailability>({
    status: "NOT_CONFIGURED",
    configured: false,
    provider: null,
    assessmentAvailable: false,
  });

  const [practiceText, setPracticeText] = useState<string>(
    language === "zh" ? "我们每天一起学习汉语。" : "Learning a language takes time and patience."
  );
  const [weakestWords, setWeakestWords] = useState<WeakestWord[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<RecentPronunciationAttempt[]>([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);

  // Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioBase64, setRecordedAudioBase64] = useState<string | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioMimeType, setRecordedAudioMimeType] = useState<string | undefined>(undefined);
  const [isPlayingLocalAudio, setIsPlayingLocalAudio] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [lastResult, setLastResult] = useState<PronunciationResult | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const localAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const discardRecordingRef = useRef(false);
  const mountedRef = useRef(true);

  const isZh = language === "zh";

  useEffect(() => {
    setPracticeText(
      language === "zh" ? "我们每天一起学习汉语。" : "Learning a language takes time and patience."
    );
  }, [language]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      discardRecordingRef.current = true;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current?.state !== "inactive") mediaRecorderRef.current?.stop();
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (localAudioElementRef.current) {
        localAudioElementRef.current.pause();
        localAudioElementRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setIsLoadingMeta(true);
    Promise.all([
      pronunciationApi.checkAvailability().catch(() => ({
        status: "NOT_CONFIGURED" as const,
        configured: false,
        provider: null,
        assessmentAvailable: false,
      })),
      pronunciationApi.getWeakest(10).catch(() => []),
      pronunciationApi.getRecent(10).catch(() => []),
    ]).then(([avail, weakest, recent]) => {
      setAvailability(avail);
      setWeakestWords(weakest);
      setRecentAttempts(recent);
      setIsLoadingMeta(false);
    });
  }, [language]);

  // Audio Recording Handlers
  const startRecording = async () => {
    setLastResult(null);
    setRecordedAudioBase64(null);
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
    setRecordedAudioMimeType(undefined);
    discardRecordingRef.current = false;

    try {
      if (!navigator.mediaDevices?.getUserMedia || !("MediaRecorder" in window)) {
        error("Trình duyệt này không hỗ trợ ghi âm bằng MediaRecorder.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mime = mediaRecorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mime });
        stream.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;

        if (discardRecordingRef.current || !mountedRef.current || audioBlob.size === 0) return;

        // Create local playable URL
        const localUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(localUrl);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = (reader.result as string).split(",")[1];
          if (base64Data && mountedRef.current && !discardRecordingRef.current) {
            setRecordedAudioBase64(base64Data);
            setRecordedAudioMimeType(mime);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      error("Không thể truy cập microphone. Vui lòng cấp quyền ghi âm trong trình duyệt.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const deleteRecording = () => {
    if (localAudioElementRef.current) {
      localAudioElementRef.current.pause();
    }
    setIsPlayingLocalAudio(false);
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    setRecordedAudioUrl(null);
    setRecordedAudioBase64(null);
    setRecordedAudioMimeType(undefined);
    setLastResult(null);
  };

  const handleTogglePlayLocalRecording = () => {
    if (!recordedAudioUrl) return;

    if (isPlayingLocalAudio && localAudioElementRef.current) {
      localAudioElementRef.current.pause();
      setIsPlayingLocalAudio(false);
      return;
    }

    const audio = new Audio(recordedAudioUrl);
    localAudioElementRef.current = audio;
    setIsPlayingLocalAudio(true);

    audio.onended = () => {
      setIsPlayingLocalAudio(false);
    };

    audio.onerror = () => {
      setIsPlayingLocalAudio(false);
    };

    audio.play().catch(() => {
      setIsPlayingLocalAudio(false);
    });
  };

  // Submit Pronunciation Assessment (Only when assessmentAvailable === true)
  const handleSubmitAssessment = async () => {
    if (!availability.assessmentAvailable) return;
    if (!recordedAudioBase64 || !practiceText.trim()) {
      error("Vui lòng ghi âm giọng đọc trước khi chấm điểm.");
      return;
    }

    setIsEvaluating(true);
    try {
      const res = await pronunciationApi.assess({
        expectedText: practiceText.trim(),
        language,
        audioBase64: recordedAudioBase64,
        audioMimeType: recordedAudioMimeType,
      });
      setLastResult(res);
      success("Đã hoàn thành đánh giá phát âm!");

      // Refresh recent attempts
      pronunciationApi.getRecent(10).then(setRecentAttempts).catch(() => {});
      pronunciationApi.getWeakest(10).then(setWeakestWords).catch(() => {});
    } catch (err: any) {
      error(getFriendlyErrorMessage(err));
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="page-container flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800 }}>Luyện Phát Âm & Đánh Giá Giọng Nói</h1>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginTop: "4px" }}>
          Luyện phát âm chuẩn xác từng câu, nghe lại bản ghi và nhận diện các từ cần cải thiện
        </p>
      </div>

      {/* Provider Unconfigured Inline Status */}
      {!availability.assessmentAvailable && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "var(--radius-lg)",
            backgroundColor: "var(--color-info-bg)",
            border: "1px solid var(--color-info-border)",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <HelpCircle size={20} color="var(--color-info)" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div style={{ fontSize: "var(--text-sm)", color: "var(--color-info-text)", lineHeight: "1.5" }}>
            <strong>Chấm phát âm chưa khả dụng:</strong> Tính năng chấm điểm AI hiện chưa được cấu hình khóa máy chủ. Bạn vẫn có thể ghi âm, nghe lại trực tiếp giọng nói của mình và tra cứu phát âm mẫu bất cứ lúc nào.
          </div>
        </div>
      )}

      {/* Practice & Recorder Studio Card */}
      <Card elevated className="flex-col gap-6" style={{ padding: "var(--space-8)" }}>
        <div>
          <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "6px" }}>
            Văn bản mẫu để luyện đọc
          </label>
          <div className="flex-row items-center gap-3">
            <input
              type="text"
              value={practiceText}
              onChange={(e) => setPracticeText(e.target.value)}
              className={isZh ? "hanzi" : ""}
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--border-strong)",
                backgroundColor: "var(--bg-surface)",
                fontSize: isZh ? "1.25rem" : "var(--text-base)",
                fontWeight: 600,
              }}
            />
            <AudioButton
              text={practiceText}
              language={language}
              size="lg"
              variant="secondary"
              label="Nghe câu mẫu"
            />
          </div>
        </div>

        {/* Recorder Center Stage */}
        <div
          style={{
            backgroundColor: "var(--bg-muted)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-8) var(--space-6)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            textAlign: "center",
          }}
        >
          {/* Glowing Mic Button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            aria-label={isRecording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "var(--radius-full)",
              backgroundColor: isRecording ? "var(--color-error)" : isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isRecording ? "0 0 24px rgba(239, 68, 68, 0.5)" : "var(--shadow-lg)",
              animation: isRecording ? "pulseGlow 1.5s infinite" : "none",
              transition: "all var(--transition-normal)",
            }}
          >
            {isRecording ? <Square size={32} /> : <Mic size={36} />}
          </button>

          <div>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>
              {isRecording
                ? `Đang ghi âm... 00:${recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}`
                : recordedAudioUrl
                  ? "Đã ghi âm xong! Bạn có thể nghe lại giọng đọc của mình."
                  : "Nhấn vào micro để bắt đầu đọc"}
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "4px" }}>
              Đọc rõ ràng, giữ khoảng cách mic ổn định
            </div>
          </div>

          {/* Action Buttons after recording */}
          {recordedAudioUrl && !isRecording && (
            <div className="flex-row gap-3" style={{ flexWrap: "wrap", justifyContent: "center" }}>
              {/* Listen to My Recording (Local playback) */}
              <Button
                variant="secondary"
                size="md"
                onClick={handleTogglePlayLocalRecording}
                leftIcon={isPlayingLocalAudio ? <Pause size={16} /> : <Play size={16} />}
              >
                {isPlayingLocalAudio ? "Tạm dừng nghe lại" : "Nghe lại bản ghi của tôi"}
              </Button>

              {/* Record Again */}
              <Button variant="ghost" size="md" onClick={startRecording} leftIcon={<RefreshCw size={14} />}>
                Ghi âm lại
              </Button>

              {/* Delete Recording */}
              <Button variant="ghost" size="md" onClick={deleteRecording} leftIcon={<Trash2 size={14} />}>
                Xóa bản ghi
              </Button>

              {/* Submit Scoring (Gated by assessmentAvailable) */}
              {availability.assessmentAvailable ? (
                <Button
                  variant={isZh ? "zh" : "primary"}
                  size="md"
                  isLoading={isEvaluating}
                  onClick={handleSubmitAssessment}
                  leftIcon={<Sparkles size={16} />}
                >
                  Chấm điểm phát âm
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="md"
                  disabled
                  title="Tính năng chấm điểm AI hiện chưa được cấu hình"
                >
                  Chấm điểm — Chưa khả dụng
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Pronunciation Assessment Result */}
        {lastResult && (
          <div
            className="animate-pop-in"
            style={{
              padding: "var(--space-6)",
              borderRadius: "var(--radius-xl)",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="flex-row justify-between items-center" style={{ marginBottom: "var(--space-4)" }}>
              <div className="flex-row items-center gap-2">
                <Award size={24} color="var(--accent-en-primary)" />
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>Kết quả đánh giá</h3>
              </div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--accent-en-primary)" }}>
                {lastResult.overallScore} / 100
              </div>
            </div>

            {/* Metric Bars */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "var(--space-6)" }}>
              <div className="flex-col gap-1">
                <div className="flex-row justify-between" style={{ fontSize: "var(--text-xs)" }}>
                  <span>Phát âm (Pronunciation)</span>
                  <strong>{lastResult.pronunciationScore}%</strong>
                </div>
                <ProgressBar value={lastResult.pronunciationScore} />
              </div>

              <div className="flex-col gap-1">
                <div className="flex-row justify-between" style={{ fontSize: "var(--text-xs)" }}>
                  <span>Độ trôi chảy (Fluency)</span>
                  <strong>{lastResult.fluencyScore}%</strong>
                </div>
                <ProgressBar value={lastResult.fluencyScore} color="var(--color-success)" />
              </div>

              {lastResult.toneAccuracy !== undefined && (
                <div className="flex-col gap-1">
                  <div className="flex-row justify-between" style={{ fontSize: "var(--text-xs)" }}>
                    <span>Độ chuẩn thanh điệu</span>
                    <strong>{lastResult.toneAccuracy}%</strong>
                  </div>
                  <ProgressBar value={lastResult.toneAccuracy} color="var(--accent-zh-primary)" />
                </div>
              )}
            </div>

            {/* Word by word feedback */}
            {lastResult.words.length > 0 && (
              <div>
                <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 700, marginBottom: "8px" }}>
                  Phân tích từng từ:
                </h4>
                <div className="flex-row gap-2" style={{ flexWrap: "wrap" }}>
                  {lastResult.words.map((w, idx) => (
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
        )}
      </Card>

      {/* Words to Practice & Weakest Words Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {/* Weakest Words */}
        <Card className="flex-col gap-4">
          <div className="flex-row items-center gap-2">
            <TrendingDown size={20} color="var(--color-warning)" />
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>
              Các từ cần luyện thêm (Điểm dưới 75)
            </h3>
          </div>

          {weakestWords.length > 0 ? (
            <div className="flex-col gap-2">
              {weakestWords.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-muted)",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "var(--text-sm)" }}>{item.word}</strong>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                      {item.attempts} lần thử • Trung bình {item.averageScore}%
                    </div>
                  </div>

                  <div className="flex-row items-center gap-2">
                    <AudioButton text={item.word} language={language} size="sm" />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPracticeText(item.word)}
                    >
                      Luyện từ này
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "var(--space-6)", color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>
              Chưa có từ nào bị điểm yếu. Hãy tiếp tục luyện tập!
            </div>
          )}
        </Card>

        {/* Recent Attempts History */}
        <Card className="flex-col gap-4">
          <div className="flex-row items-center gap-2">
            <Sparkles size={20} color="var(--accent-en-primary)" />
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>Lịch sử luyện đọc gần đây</h3>
          </div>

          {recentAttempts.length > 0 ? (
            <div className="flex-col gap-2">
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-muted)",
                  }}
                >
                  <div style={{ maxWidth: "70%" }}>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {attempt.text}
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                      {new Date(attempt.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>

                  <div style={{ fontSize: "var(--text-base)", fontWeight: 800, color: attempt.score >= 80 ? "var(--color-success)" : "var(--color-warning)" }}>
                    {attempt.score}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "var(--space-6)", color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>
              Chưa có lịch sử phát âm nào.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
