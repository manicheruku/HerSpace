import type { ButtonHTMLAttributes, JSX, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onAnimationStart" | "onAnimationEnd" | "onDrag" | "onDragStart" | "onDragEnd"
>;

export interface FloatingActionButtonProps extends NativeButtonProps {
  icon?: ReactNode;
  label?: string;
  /** Pin to the lower-right, floating above the bottom navigation. */
  fixed?: boolean;
}

/** Round gradient action button with hover/tap spring feedback. */
export function FloatingActionButton({
  icon = "+",
  label = "Add",
  fixed = true,
  className = "",
  ...rest
}: FloatingActionButtonProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const button = (
    <motion.button
      type="button"
      aria-label={label}
      whileHover={reduceMotion ? undefined : { scale: 1.05 }}
      whileTap={reduceMotion ? undefined : { scale: 0.9 }}
      className={`pointer-events-auto flex size-14 items-center justify-center rounded-full bg-[image:var(--gradient-brand)] text-2xl text-white shadow-lg outline-none ring-4 ring-surface focus-visible:ring-blossom-300 ${className}`}
      {...rest}
    >
      <span aria-hidden="true">{icon}</span>
    </motion.button>
  );

  if (!fixed) return button;

  // Keep the button pinned to the right edge of the centered mobile column
  // (matching the bottom navigation / toast layout) instead of the viewport edge.
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 mx-auto flex max-w-md justify-end px-5">
      {button}
    </div>
  );
}
