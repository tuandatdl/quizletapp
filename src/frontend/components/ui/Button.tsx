import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "subtle" | "zh";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  style,
  ...props
}) => {
  const getStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      fontWeight: 600,
      borderRadius: "var(--radius-md)",
      transition: "all var(--transition-fast)",
      whiteSpace: "nowrap",
      position: "relative",
    };

    // Sizes
    if (size === "sm") {
      Object.assign(base, {
        padding: "6px 12px",
        fontSize: "var(--text-xs)",
        height: "32px",
      });
    } else if (size === "lg") {
      Object.assign(base, {
        padding: "12px 24px",
        fontSize: "var(--text-base)",
        height: "48px",
        borderRadius: "var(--radius-lg)",
      });
    } else {
      Object.assign(base, {
        padding: "8px 16px",
        fontSize: "var(--text-sm)",
        height: "40px",
      });
    }

    // Variants
    switch (variant) {
      case "primary":
        Object.assign(base, {
          backgroundColor: "var(--accent-en-primary)",
          color: "#FFFFFF",
          boxShadow: "var(--shadow-xs)",
        });
        break;
      case "zh":
        Object.assign(base, {
          backgroundColor: "var(--accent-zh-primary)",
          color: "#FFFFFF",
          boxShadow: "var(--shadow-xs)",
        });
        break;
      case "secondary":
        Object.assign(base, {
          backgroundColor: "var(--bg-muted)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-default)",
        });
        break;
      case "outline":
        Object.assign(base, {
          backgroundColor: "transparent",
          color: "var(--text-primary)",
          border: "1px solid var(--border-strong)",
        });
        break;
      case "ghost":
        Object.assign(base, {
          backgroundColor: "transparent",
          color: "var(--text-secondary)",
        });
        break;
      case "subtle":
        Object.assign(base, {
          backgroundColor: "var(--accent-en-subtle)",
          color: "var(--accent-en-text)",
        });
        break;
      case "danger":
        Object.assign(base, {
          backgroundColor: "var(--color-error-bg)",
          color: "var(--color-error-text)",
          border: "1px solid var(--color-error-border)",
        });
        break;
    }

    return { ...base, ...style };
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={getStyles()}
      className={`btn btn-${variant} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 size={size === "sm" ? 14 : 16} className="animate-spin" />}
      {!isLoading && leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
