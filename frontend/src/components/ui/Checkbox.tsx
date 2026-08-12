import type { JSX } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  /** Accessible label when no visible `label` text is provided. */
  ariaLabel?: string;
}

/** Circular checkbox with a spring-animated checkmark. */
export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
  ariaLabel,
}: CheckboxProps): JSX.Element {
  const reduceMotion = useReducedMotion();

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel ?? label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-2 rounded-[var(--radius-pill)] text-left outline-none focus-visible:ring-2 focus-visible:ring-blossom-300 disabled:opacity-50 ${className}`}
    >
      <span
        aria-hidden="true"
        className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          checked
            ? "border-blossom-500 bg-blossom-500 text-white"
            : "border-border bg-card text-transparent"
        }`}
      >
        <motion.svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
          initial={false}
          animate={{ scale: checked ? 1 : 0 }}
          transition={
            reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 18 }
          }
        >
          <path d="M20 6 9 17l-5-5" />
        </motion.svg>
      </span>
      {label ? <span className="text-base text-ink-900">{label}</span> : null}
    </button>
  );
}
