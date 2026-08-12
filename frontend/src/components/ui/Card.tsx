import type { JSX, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CardVariant = "plain" | "gradient" | "outline";

export interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
  onClick?: () => void;
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  plain: "bg-card shadow-[var(--shadow-card)] ring-1 ring-black/5",
  gradient: "bg-gradient-to-br from-blossom-100 to-lilac-100 shadow-[var(--shadow-card)]",
  outline: "bg-card border border-border",
};

/** Soft, rounded surface primitive; lifts gently on hover and presses on tap. */
export function Card({
  children,
  className = "",
  variant = "plain",
  onClick,
}: CardProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const base = `rounded-[var(--radius-card)] p-5 transition-shadow hover:shadow-[var(--shadow-raised)] ${VARIANT_CLASSES[variant]} ${className}`;
  const lift = reduceMotion ? undefined : { y: -3 };
  const liftTransition = { type: "spring", stiffness: 300, damping: 22 } as const;

  if (onClick) {
    return (
      <motion.div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
          }
        }}
        whileHover={lift}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        transition={liftTransition}
        className={`${base} cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-blossom-300`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={lift}
      transition={liftTransition}
      className={base}
    >
      {children}
    </motion.div>
  );
}
