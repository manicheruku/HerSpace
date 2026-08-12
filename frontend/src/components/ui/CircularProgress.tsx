import type { JSX, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface CircularProgressProps {
  value: number;
  max?: number;
  /** Rendered pixel size of the ring. */
  size?: number;
  strokeWidth?: number;
  children?: ReactNode;
  showLabel?: boolean;
  className?: string;
}

const RADIUS = 15.5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Animated circular progress ring with an optional centered label. */
export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 3.5,
  children,
  showLabel = true,
  className = "",
}: CircularProgressProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const dashOffset = CIRCUMFERENCE * (1 - percent / 100);

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="size-full -rotate-90">
        <circle
          className="stroke-blossom-100"
          cx="18"
          cy="18"
          r={RADIUS}
          fill="none"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          className="stroke-blossom-500"
          cx="18"
          cy="18"
          r={RADIUS}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={reduceMotion ? false : { strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-sm font-semibold text-ink-900">
        {children ?? (showLabel ? `${Math.round(percent)}%` : null)}
      </span>
    </div>
  );
}
