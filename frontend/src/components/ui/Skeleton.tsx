import type { JSX } from "react";

export interface SkeletonProps {
  className?: string;
  rounded?: boolean;
}

/** Shimmer placeholder whose size is supplied via className while content loads. */
export function Skeleton({ className = "", rounded = false }: SkeletonProps): JSX.Element {
  const radius = rounded ? "rounded-[var(--radius-pill)]" : "rounded-[var(--radius-md)]";
  return <div className={`animate-pulse bg-ink-100 ${radius} ${className}`} />;
}
