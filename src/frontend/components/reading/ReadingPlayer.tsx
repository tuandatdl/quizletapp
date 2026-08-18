import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  Sliders,
} from "lucide-react";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";
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

  return (
    <div
      className="reading-mini-player animate-fade-in"
      style={{
        backgroundColor: "var(--bg-muted)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        padding: "14px 18px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: "var(--shadow-xs)",
      }}
      role="region"
      aria-label="Trình phát âm thanh bài đọc"
    >
      {/* Top row: Status info and Speed Selector */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-full)",
              backgroundColor: isPlaying
                ? isZh
                  ? "var(--accent-zh-primary)"
                  : "var(--accent-en-primary)"
                : "var(--border-strong)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color var(--transition-fast)",
            }}
          >
            <Volume2 size={15} />
          </div>

          <div>
            <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-primary)" }}>
              {isSpeech ? (
                isPlaying ? (
                  <span>Đang đọc: Câu {currentSentenceIdx + 1} / {totalSentences}</span>
                ) : isPaused ? (
                  <span>Tạm dừng ở: Câu {currentSentenceIdx + 1} / {totalSentences}</span>
                ) : (
                  <span>Sẵn sàng phát ({totalSentences} câu)</span>
                )
              ) : (
                <span>
                  {formatTime(playbackState.currentTimeMs)} / {formatTime(playbackState.durationMs)}
                </span>
              )}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
              {isSpeech ? "Chế độ phát âm chuẩn từng câu (SpeechSynthesis)" : "Tệp âm thanh gốc"}
            </div>
          </div>
        </div>

        {/* Speed Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontWeight: 600 }}>
            Tốc độ:
          </span>
          <div style={{ display: "flex", gap: "4px" }}>
            {[0.75, 1, 1.25].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => onSpeedChange(speed as any)}
                style={{
                  padding: "4px 8px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 700,
                  border: `1px solid ${
                    playbackState.speed === speed
                      ? isZh
                        ? "var(--accent-zh-primary)"
                        : "var(--accent-en-primary)"
                      : "var(--border-default)"
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
                }}
                aria-label={`Tốc độ đọc ${speed}x`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Middle row: Progress Slider */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontWeight: 600, minWidth: "44px" }}>
          {isSpeech ? `Câu ${currentSentenceIdx + 1}` : formatTime(playbackState.currentTimeMs)}
        </span>

        {isSpeech ? (
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSentences - 1)}
            value={currentSentenceIdx}
            onChange={(e) => onSeekSentence(Number(e.target.value))}
            style={{
              flex: 1,
              accentColor: isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)",
              cursor: "pointer",
            }}
            aria-label="Tua đến câu"
          />
        ) : (
          <input
            type="range"
            min={0}
            max={playbackState.durationMs || 100}
            value={playbackState.currentTimeMs}
            onChange={(e) => onSeekAudioTime?.(Number(e.target.value))}
            style={{
              flex: 1,
              accentColor: isZh ? "var(--accent-zh-primary)" : "var(--accent-en-primary)",
              cursor: "pointer",
            }}
            aria-label="Thanh thời gian âm thanh"
          />
        )}

        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontWeight: 600, minWidth: "44px", textAlign: "right" }}>
          {isSpeech ? `/${totalSentences}` : formatTime(playbackState.durationMs)}
        </span>
      </div>

      {/* Bottom row: Playback Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          paddingTop: "2px",
        }}
      >
        {/* Restart Button */}
        <button
          type="button"
          onClick={onRestart}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "6px 10px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-default)",
            backgroundColor: "var(--bg-surface)",
            color: "var(--text-secondary)",
            fontSize: "var(--text-xs)",
            fontWeight: 600,
          }}
          aria-label="Đọc lại từ đầu"
          title="Đọc lại từ đầu"
        >
          <RotateCcw size={14} />
          <span className="hide-on-mobile">Từ đầu</span>
        </button>

        {/* Previous Sentence */}
        {isSpeech && (
          <button
            type="button"
            onClick={onPreviousSentence}
            disabled={currentSentenceIdx <= 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-default)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--text-primary)",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              opacity: currentSentenceIdx <= 0 ? 0.5 : 1,
            }}
            aria-label="Câu trước đó"
            title="Câu trước đó"
          >
            <SkipBack size={14} />
            <span className="hide-on-mobile">Câu trước</span>
          </button>
        )}

        {/* Main Play / Pause Button */}
        <Button
          variant={isZh ? "zh" : "primary"}
          size="md"
          onClick={handlePlayPauseToggle}
          leftIcon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
          style={{ minWidth: "120px" }}
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
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-default)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--text-primary)",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              opacity: currentSentenceIdx >= totalSentences - 1 ? 0.5 : 1,
            }}
            aria-label="Câu tiếp theo"
            title="Câu tiếp theo"
          >
            <span className="hide-on-mobile">Câu sau</span>
            <SkipForward size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
