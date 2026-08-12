import type { JSX, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface ActionCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

/** Tappable card primitive with button semantics and a subtle press animation. */
export function ActionCard({ children, onClick, className = "" }: ActionCardProps): JSX.Element {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      className={`w-full rounded-[var(--radius-card)] bg-card p-5 text-left shadow-[var(--shadow-card)] ring-1 ring-black/5 outline-none focus-visible:ring-2 focus-visible:ring-blossom-300 ${className}`}
    >
      {children}
    </motion.button>
  );
}
