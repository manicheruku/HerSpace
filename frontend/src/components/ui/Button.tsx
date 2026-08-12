import type { ButtonHTMLAttributes, JSX, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onAnimationStart" | "onAnimationEnd" | "onDrag" | "onDragStart" | "onDragEnd"
>;

export interface ButtonProps extends NativeButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-[image:var(--gradient-brand)] text-white shadow-[var(--shadow-button)]",
  secondary: "bg-card text-ink-900 ring-1 ring-black/5 shadow-[var(--shadow-card)]",
  ghost: "bg-transparent text-ink-700 hover:bg-blossom-50",
  danger: "bg-danger text-white shadow-[var(--shadow-button)]",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 px-3 text-sm",
  md: "h-11 gap-2 px-5 text-base",
  lg: "h-12 gap-2 px-6 text-base",
};

/** Brand button primitive with variants, sizes, loading state and tap feedback. */
export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  type = "button",
  ...rest
}: ButtonProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      whileTap={isDisabled || reduceMotion ? undefined : { scale: 0.96 }}
      className={`inline-flex items-center justify-center rounded-[var(--radius-pill)] font-medium outline-none transition-[opacity,background-color] focus-visible:ring-2 focus-visible:ring-blossom-300 disabled:opacity-50 ${VARIANT[variant]} ${SIZE[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <span
          className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          aria-hidden="true"
        />
      ) : leftIcon ? (
        <span className="shrink-0" aria-hidden="true">
          {leftIcon}
        </span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon ? (
        <span className="shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      ) : null}
    </motion.button>
  );
}
