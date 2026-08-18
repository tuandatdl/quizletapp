import React from "react";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "secondary" | "primary" | "danger" | "subtle";
  label: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  size = "md",
  variant = "ghost",
  label,
  className = "",
  disabled,
  style,
  ...props
}) => {
  const getStyles = (): React.CSSProperties => {
    const dim = size === "sm" ? 32 : size === "lg" ? 44 : 36;
    const base: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: `${dim}px`,
      height: `${dim}px`,
      minWidth: `${dim}px`,
      minHeight: `${dim}px`,
      borderRadius: "var(--radius-md)",
      transition: "all var(--transition-fast)",
      color: "var(--text-secondary)",
    };

    switch (variant) {
      case "primary":
        Object.assign(base, {
          backgroundColor: "var(--accent-en-primary)",
          color: "#FFFFFF",
        });
        break;
      case "secondary":
        Object.assign(base, {
          backgroundColor: "var(--bg-muted)",
          border: "1px solid var(--border-default)",
          color: "var(--text-primary)",
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
          color: "var(--color-error)",
        });
        break;
      case "ghost":
      default:
        Object.assign(base, {
          backgroundColor: "transparent",
        });
        break;
    }

    return { ...base, ...style };
  };

  return (
    <button
      aria-label={label}
      title={label}
      disabled={disabled}
      style={getStyles()}
      className={`icon-btn ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
