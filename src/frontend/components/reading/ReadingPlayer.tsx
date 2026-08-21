import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { Button } from "../ui/Button";
import type { ReadingPlaybackState } from "../../types/api";

interface ReadingPlayerProps {
  playbackState: ReadingPlaybackState;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onSeekSentence: (index: number) => void;
  onPreviousSentence: () => void;
  onNextSentence: () => void;
  onSpeedChange: (speed: 0.75 | 1 | 1.25) => void;
  onSeekAudioTime?: (timeMs: number) => void;
  language: "en" | "zh";
}

export const ReadingPlayer: React.FC<ReadingPlayerProps> = ({
  playbackState,
  onPlay,
  onPause,
  onResume,
  onRestart,
  onSeekSentence,
  onPreviousSentence,
  onNextSentence,
  onSpeedChange,
  onSeekAudioTime,
  language,
}) => {
  const isSpeech = playbackState.mode === "speech-synthesis";
  const isZh = language === "zh";

  const isPlaying = playbackState.status === "playing";
  const isPaused = playbackState.status === "paused";
  const isIdle = playbackState.status === "idle" || playbackState.status === "completed";

  const currentSentenceIdx = playbackState.currentSentenceIndex ?? 0;
  const totalSentences = playbackState.totalSentences ?? 1;

  const handlePlayPauseToggle = () => {
    if (isPlaying) {
      onPause();
    } else if (isPaused) {
      onResume();
    } else {
      onPlay();
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const accentColor = isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)";

  const speedButtonStyle = (speed: number): React.CSSProperties => ({
    borderRadius: "var(--radius-sm)",
    fontWeight: 700,
    border: `1px solid ${
      playbackState.speed === speed ? accentColor : "var(--border-default)"
    }`,
    backgroundColor:
      playbackState.speed === speed
        ? isZh
          ? "var(--accent-zh-subtle)"
          : "var(--accent-en-subtle)"
        : "var(--bg-surface)",
    color:
      playbackState.speed === speed
        ? isZh
          ? "var(--accent-zh-text)"
          : "var(--accent-en-text)"
        : "var(--text-secondary)",
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    minWidth: 0,
  });

  const iconControlStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-default)",
    backgroundColor: "var(--bg-surface)",
    color: "var(--text-secondary)",
    cursor: "pointer",
  };

  return (
    <div
      className="reading-mini-player animate-fade-in"
      role="region"
      aria-label="Trình phát âm thanh bài đọc"
    >
      {/* ── STATUS ROW: icon + text (stacked on mobile) ── */}
      <div className="rp-status-row">
        {/* Icon bubble */}
        <div
          className="rp-volume-icon"
          style={{
            backgroundColor: isPlaying ? accentColor : "var(--border-strong)",
            transition: "background-color var(--transition-fast)",
          }}
          aria-hidden="true"
        >
          <Volume2 size={15} />
        </div>

        {/* Status text column */}
        <div className="rp-status-text">
          <div className="rp-status-primary">
            {isSpeech ? (
              playbackState.loading ? (
                <span>Đang chuẩn bị giọng đọc...</span>
              ) : isPlaying ? (
                <span>Đang đọc: Câu {currentSentenceIdx + 1}/{totalSentences}</span>
              ) : isPaused ? (
                <span>Tạm dừng: Câu {currentSentenceIdx + 1}/{totalSentences}</span>
              ) : (
                <span>Sẵn sàng phát ({totalSentences} câu)</span>
              )
            ) : (
              <span>
                {formatTime(playbackState.currentTimeMs)} / {formatTime(playbackState.durationMs)}
              </span>
            )}
          </div>
          <div className="rp-status-secondary">
            {isSpeech ? (
              playbackState.loading && !playbackState.engine ? (
                <span className="rp-engine-label-long">Đang chọn nguồn giọng đọc...</span>
              ) : playbackState.engine === "local" ? (
                <>
                  <span className="rp-engine-label-long">Local TTS trên thiết bị</span>
                  <span className="rp-engine-label-short">Local TTS</span>
                </>
              ) : playbackState.engine === "cloud" ? (
                <>
                  <span className="rp-engine-label-long">Cloud TTS tự nhiên</span>
                  <span className="rp-engine-label-short">Cloud TTS</span>
                </>
              ) : (
                <>
                  <span className="rp-engine-label-long">Giọng đọc của trình duyệt (SpeechSynthesis)</span>
                  <span className="rp-engine-label-short">SpeechSynthesis</span>
                </>
              )
            ) : (
              "Tệp âm thanh gốc"
            )}
          </div>
        </div>
      </div>

      {/* ── SPEED ROW ── */}
      <div className="rp-speed-row">
        <span className="rp-speed-label" aria-label="Chọn tốc độ đọc">Tốc độ</span>
        <div className="rp-speed-buttons">
          {([0.75, 1, 1.25] as const).map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => onSpeedChange(speed)}
              className="rp-speed-btn"
              style={speedButtonStyle(speed)}
              aria-label={`Tốc độ đọc ${speed}x`}
              aria-pressed={playbackState.speed === speed}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* ── PROGRESS ROW ── */}
      <div className="rp-progress-row">
        <span className="rp-progress-label">
          {isSpeech ? `Câu ${currentSentenceIdx + 1}` : formatTime(playbackState.currentTimeMs)}
        </span>

        {isSpeech ? (
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSentences - 1)}
            value={currentSentenceIdx}
            onChange={(e) => onSeekSentence(Number(e.target.value))}
            className="rp-slider"
            style={{ accentColor }}
            aria-label="Tua đến câu"
          />
        ) : (
          <input
            type="range"
            min={0}
            max={playbackState.durationMs || 100}
            value={playbackState.currentTimeMs}
            onChange={(e) => onSeekAudioTime?.(Number(e.target.value))}
            className="rp-slider"
            style={{ accentColor }}
            aria-label="Thanh thời gian âm thanh"
          />
        )}

        <span className="rp-progress-total">
          {isSpeech ? `/${totalSentences}` : formatTime(playbackState.durationMs)}
        </span>
      </div>

      {/* ── PLAYBACK CONTROLS ROW ── */}
      <div className="rp-controls-row">
        {/* Restart */}
        <button
          type="button"
          onClick={onRestart}
          className="rp-icon-btn"
          style={iconControlStyle}
          aria-label="Đọc lại từ đầu"
          title="Đọc lại từ đầu"
        >
          <RotateCcw size={16} />
          <span className="rp-btn-label">Từ đầu</span>
        </button>

        {/* Previous Sentence */}
        {isSpeech && (
          <button
            type="button"
            onClick={onPreviousSentence}
            disabled={currentSentenceIdx <= 0}
            className="rp-icon-btn"
            style={{
              ...iconControlStyle,
              color: "var(--text-primary)",
              opacity: currentSentenceIdx <= 0 ? 0.45 : 1,
            }}
            aria-label="Câu trước đó"
            title="Câu trước đó"
          >
            <SkipBack size={16} />
            <span className="rp-btn-label">Câu trước</span>
          </button>
        )}

        {/* Main Play / Pause Button */}
        <Button
          variant={isZh ? "zh" : "primary"}
          size="md"
          onClick={handlePlayPauseToggle}
          leftIcon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
          className="rp-play-btn"
          aria-label={isPlaying ? "Tạm dừng bài đọc" : isPaused ? "Tiếp tục bài đọc" : "Bắt đầu nghe bài đọc"}
        >
          {isPlaying ? "Tạm dừng" : isPaused ? "Tiếp tục" : "Nghe toàn bài"}
        </Button>

        {/* Next Sentence */}
        {isSpeech && (
          <button
            type="button"
            onClick={onNextSentence}
            disabled={currentSentenceIdx >= totalSentences - 1}
            className="rp-icon-btn"
            style={{
              ...iconControlStyle,
              color: "var(--text-primary)",
              opacity: currentSentenceIdx >= totalSentences - 1 ? 0.45 : 1,
            }}
            aria-label="Câu tiếp theo"
            title="Câu tiếp theo"
          >
            <span className="rp-btn-label">Câu sau</span>
            <SkipForward size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
