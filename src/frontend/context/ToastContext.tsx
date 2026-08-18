import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((msg: string) => showToast(msg, "success"), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, "error"), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, "info"), [showToast]);
  const warning = useCallback((msg: string) => showToast(msg, "warning"), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "420px",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-pop-in"
            style={{
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--text-primary)",
              boxShadow: "var(--shadow-lg)",
              border: `1px solid ${
                t.type === "success"
                  ? "var(--color-success-border)"
                  : t.type === "error"
                  ? "var(--color-error-border)"
                  : t.type === "warning"
                  ? "var(--color-warning-border)"
                  : "var(--border-default)"
              }`,
              fontSize: "var(--text-sm)",
              fontWeight: 500,
            }}
          >
            {t.type === "success" && (
              <CheckCircle2 size={18} color="var(--color-success)" style={{ flexShrink: 0 }} />
            )}
            {t.type === "error" && (
              <AlertCircle size={18} color="var(--color-error)" style={{ flexShrink: 0 }} />
            )}
            {t.type === "warning" && (
              <AlertCircle size={18} color="var(--color-warning)" style={{ flexShrink: 0 }} />
            )}
            {t.type === "info" && (
              <Info size={18} color="var(--color-info)" style={{ flexShrink: 0 }} />
            )}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                color: "var(--text-tertiary)",
                display: "flex",
                padding: "2px",
                borderRadius: "var(--radius-xs)",
              }}
              aria-label="Đóng thông báo"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
