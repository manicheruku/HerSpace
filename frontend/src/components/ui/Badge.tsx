import type { JSX, ReactNode } from "react";

export type BadgeTone =
  | "neutral"
  | "blossom"
  | "lilac"
  | "sky"
  | "success"
  | "warning"
  | "danger";

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
}

const TONE: Record<BadgeTone, { bg: string; text: string; dot: string }> = {
  neutral: { bg: "bg-ink-100", text: "text-ink-700", dot: "bg-ink-300" },
  blossom: { bg: "bg-blossom-100", text: "text-blossom-700", dot: "bg-blossom-500" },
  lilac: { bg: "bg-lilac-100", text: "text-lilac-500", dot: "bg-lilac-400" },
  sky: { bg: "bg-sky-100", text: "text-sky-500", dot: "bg-sky-400" },
  success: { bg: "bg-success/15", text: "text-success", dot: "bg-success" },
  warning: { bg: "bg-warning/15", text: "text-warning", dot: "bg-warning" },
  danger: { bg: "bg-danger/15", text: "text-danger", dot: "bg-danger" },
};

/** Small status pill for priorities, categories and counts. */
export function Badge({
  children,
  tone = "neutral",
  dot = false,
  className = "",
}: BadgeProps): JSX.Element {
  const t = TONE[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium ${t.bg} ${t.text} ${className}`}
    >
      {dot ? <span aria-hidden="true" className={`size-1.5 rounded-full ${t.dot}`} /> : null}
      {children}
    </span>
  );
}
