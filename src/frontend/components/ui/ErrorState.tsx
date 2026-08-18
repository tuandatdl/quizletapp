import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Đã xảy ra lỗi",
  message,
  onRetry,
}) => {
  return (
    <div
      className="card flex-col items-center justify-center animate-fade-in"
      style={{
        padding: "var(--space-8) var(--space-6)",
        textAlign: "center",
        backgroundColor: "var(--color-error-bg)",
        borderColor: "var(--color-error-border)",
      }}
    >
      <AlertCircle size={40} color="var(--color-error)" style={{ marginBottom: "var(--space-3)" }} />
      <h3 style={{ color: "var(--color-error-text)", fontSize: "var(--text-lg)", marginBottom: "var(--space-2)" }}>
        {title}
      </h3>
      <p
        style={{
          maxWidth: "460px",
          fontSize: "var(--text-sm)",
          color: "var(--color-error-text)",
          marginBottom: onRetry ? "var(--space-5)" : 0,
          opacity: 0.9,
        }}
      >
        {message}
      </p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry} leftIcon={<RefreshCw size={14} />}>
          Thử lại
        </Button>
      )}
    </div>
  );
};
