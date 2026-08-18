import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <FolderOpen size={48} strokeWidth={1.5} color="var(--text-tertiary)" />,
  title,
  description,
  actionText,
  onAction,
  actionIcon,
}) => {
  return (
    <div
      className="card flex-col items-center justify-center animate-fade-in"
      style={{
        padding: "var(--space-12) var(--space-6)",
        textAlign: "center",
        backgroundColor: "var(--bg-surface)",
        border: "1.5px dashed var(--border-strong)",
      }}
    >
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "var(--radius-full)",
          backgroundColor: "var(--bg-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--space-4)",
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-2)" }}>
        {title}
      </h3>
      {description && (
        <p
          style={{
            maxWidth: "420px",
            fontSize: "var(--text-sm)",
            color: "var(--text-secondary)",
            marginBottom: actionText ? "var(--space-6)" : 0,
          }}
        >
          {description}
        </p>
      )}
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction} leftIcon={actionIcon}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
