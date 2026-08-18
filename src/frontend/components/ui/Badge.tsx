import React from "react";
import type { VocabularyStatus } from "../../types/api";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "new" | "learning" | "review" | "mastered" | "en" | "zh" | "success" | "warning" | "error" | "default";
  status?: VocabularyStatus;
  size?: "sm" | "md";
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  size = "md",
  className = "",
  style,
}) => {
  let resolvedVariant = variant || "default";

  if (status) {
    switch (status) {
      case "NEW":
        resolvedVariant = "new";
        break;
      case "LEARNING":
        resolvedVariant = "learning";
        break;
      case "REVIEW":
        resolvedVariant = "review";
        break;
      case "MASTERED":
        resolvedVariant = "mastered";
        break;
    }
  }

  const getVariantStyles = (): React.CSSProperties => {
    switch (resolvedVariant) {
      case "new":
        return { background: "var(--status-new-bg)", color: "var(--status-new-text)" };
      case "learning":
        return { background: "var(--status-learning-bg)", color: "var(--status-learning-text)" };
      case "review":
        return { background: "var(--status-review-bg)", color: "var(--status-review-text)" };
      case "mastered":
        return { background: "var(--status-mastered-bg)", color: "var(--status-mastered-text)" };
      case "en":
        return {
          background: "var(--accent-en-subtle)",
          color: "var(--accent-en-text)",
          border: "1px solid var(--accent-en-border)",
        };
      case "zh":
        return {
          background: "var(--accent-zh-subtle)",
          color: "var(--accent-zh-text)",
          border: "1px solid var(--accent-zh-border)",
        };
      case "success":
        return {
          background: "var(--color-success-bg)",
          color: "var(--color-success-text)",
          border: "1px solid var(--color-success-border)",
        };
      case "warning":
        return {
          background: "var(--color-warning-bg)",
          color: "var(--color-warning-text)",
          border: "1px solid var(--color-warning-border)",
        };
      case "error":
        return {
          background: "var(--color-error-bg)",
          color: "var(--color-error-text)",
          border: "1px solid var(--color-error-border)",
        };
      default:
        return {
          background: "var(--bg-muted)",
          color: "var(--text-secondary)",
          border: "1px solid var(--border-default)",
        };
    }
  };

  const isSmall = size === "sm";

  return (
    <span
      className={`badge badge-${resolvedVariant} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: isSmall ? "1px 6px" : "3px 8px",
        borderRadius: "var(--radius-full)",
        fontSize: isSmall ? "0.6875rem" : "var(--text-xs)",
        fontWeight: 600,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        ...getVariantStyles(),
        ...style,
      }}
    >
      {children}
    </span>
  );
};
