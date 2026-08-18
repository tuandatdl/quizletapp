import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  elevated?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  elevated = false,
  padding = "md",
  className = "",
  style,
  ...props
}) => {
  const getPadding = () => {
    switch (padding) {
      case "none":
        return "0";
      case "sm":
        return "var(--space-4)";
      case "lg":
        return "var(--space-8)";
      case "md":
      default:
        return "var(--space-6)";
    }
  };

  return (
    <div
      className={`card ${hoverable ? "card-hoverable" : ""} ${elevated ? "card-elevated" : ""} ${className}`}
      style={{
        padding: getPadding(),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
