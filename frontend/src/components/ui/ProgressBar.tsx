import type { JSX } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  trackClassName?: string;
}

/** Animated linear progress bar using the brand gradient. */
export function ProgressBar({
  value,
  max = 100,
  className = "",
  trackClassName = "",
}: ProgressBarProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-3 w-full overflow-hidden rounded-[var(--radius-pill)] bg-blossom-100 ${trackClassName} ${className}`}
    >
      <motion.div
        className="h-full rounded-[var(--radius-pill)] bg-[image:var(--gradient-brand)]"
        initial={reduceMotion ? false : { width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }}
      />
    </div>
  );
}
