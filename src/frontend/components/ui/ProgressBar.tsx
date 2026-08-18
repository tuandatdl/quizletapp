import React from "react";

export interface ProgressBarProps {
  value: number; // 0 to 100 or current
  max?: number;
  color?: string;
  height?: number | string;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = "var(--accent-en-primary)",
  height = 8,
  showLabel = false,
  className = "",
}) => {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  return (
    <div className={`flex-col gap-1 ${className}`} style={{ width: "100%" }}>
      {showLabel && (
        <div className="flex-row justify-between items-center" style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
          <span>Tiến độ</span>
          <span style={{ fontWeight: 600 }}>{percentage}%</span>
        </div>
      )}
      <div
        style={{
          width: "100%",
          height: typeof height === "number" ? `${height}px` : height,
          backgroundColor: "var(--bg-muted)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: "var(--radius-full)",
            transition: "width var(--transition-normal)",
          }}
        />
      </div>
    </div>
  );
};
