import type { JSX, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface ChipProps {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  leftIcon?: ReactNode;
  className?: string;
}

/** Selectable pill used for quick filters and toggles. */
export function Chip({
  children,
  selected = false,
  onClick,
  leftIcon,
  className = "",
}: ChipProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      whileTap={reduceMotion ? undefined : { scale: 0.95 }}
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-3.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blossom-300 ${
        selected
          ? "border-transparent bg-[image:var(--gradient-brand)] text-white shadow-[var(--shadow-button)]"
          : "border-border bg-surface text-ink-500 hover:bg-blossom-50"
      } ${className}`}
    >
      {leftIcon ? (
        <span aria-hidden="true" className="shrink-0">
          {leftIcon}
        </span>
      ) : null}
      {children}
    </motion.button>
  );
}
