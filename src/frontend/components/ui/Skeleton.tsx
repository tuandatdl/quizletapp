import React from "react";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = "20px",
  borderRadius = "var(--radius-sm)",
  style,
  className = "",
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="card flex-col gap-3">
    <Skeleton height="24px" width="40%" />
    <Skeleton height="16px" width="80%" />
    <Skeleton height="16px" width="60%" />
    <div className="flex-row justify-between items-center" style={{ marginTop: "8px" }}>
      <Skeleton height="20px" width="30%" borderRadius="var(--radius-full)" />
      <Skeleton height="28px" width="28px" borderRadius="var(--radius-full)" />
    </div>
  </div>
);
