import type { JSX } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

/** Gentle error placeholder with an optional retry action. */
export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  className = "",
}: ErrorStateProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center px-6 py-8 text-center ${className}`}
    >
      <p className="font-display text-base font-semibold text-ink-700">{title}</p>
      {description ? <p className="mt-1 text-sm text-ink-500">{description}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-[var(--radius-pill)] bg-blossom-500 px-4 py-2 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-blossom-300"
        >
          Try again
        </button>
      ) : null}
    </motion.div>
  );
}
