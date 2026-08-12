import type { JSX, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** Centered, calm placeholder shown when a list or section has no content yet. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center px-6 py-8 text-center ${className}`}
    >
      {icon ? <div className="mb-3 text-4xl text-ink-300">{icon}</div> : null}
      <p className="font-display text-base font-semibold text-ink-700">{title}</p>
      {description ? <p className="mt-1 text-sm text-ink-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </motion.div>
  );
}
