import type { JSX, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Card } from "./Card";
import { SectionTitle } from "./SectionTitle";

export interface ProgressCardProps {
  title: string;
  value: number;
  max: number;
  unit?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Show an animated circular ring (with percentage) beside the value. */
  circular?: boolean;
}

const RING_RADIUS = 15.5;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Progress surface with an animated brand-gradient bar and an optional control row. */
export function ProgressCard({
  title,
  value,
  max,
  unit,
  icon,
  children,
  className = "",
  circular = false,
}: ProgressCardProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const ratio = max > 0 ? value / max : 0;
  const percent = Math.min(100, Math.max(0, ratio * 100));
  const width = `${percent}%`;
  const dashOffset = RING_CIRCUMFERENCE * (1 - percent / 100);

  return (
    <Card className={className}>
      <SectionTitle title={title} icon={icon} />

      <div className="mt-3 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <motion.span
              key={value}
              initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 500, damping: 18 }
              }
              className="font-display text-3xl font-semibold text-ink-900"
            >
              {value}
            </motion.span>
            <span className="text-lg text-ink-500">/ {max}</span>
            {unit ? <span className="text-sm text-ink-500">{unit}</span> : null}
          </div>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-[var(--radius-pill)] bg-blossom-100">
            <motion.div
              className="h-full rounded-[var(--radius-pill)] bg-[image:var(--gradient-brand)]"
              initial={reduceMotion ? false : { width: 0 }}
              animate={{ width }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 120, damping: 20 }
              }
            />
          </div>
        </div>

        {circular ? (
          <div className="relative size-20 shrink-0">
            <svg viewBox="0 0 36 36" className="size-20 -rotate-90">
              <circle
                className="stroke-blossom-100"
                cx="18"
                cy="18"
                r={RING_RADIUS}
                fill="none"
                strokeWidth="3.5"
              />
              <motion.circle
                className="stroke-blossom-500"
                cx="18"
                cy="18"
                r={RING_RADIUS}
                fill="none"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                initial={
                  reduceMotion ? false : { strokeDashoffset: RING_CIRCUMFERENCE }
                }
                animate={{ strokeDashoffset: dashOffset }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 120, damping: 20 }
                }
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-display text-sm font-semibold text-ink-900">
              {Math.round(percent)}%
            </span>
          </div>
        ) : null}
      </div>

      {children ? <div className="mt-4">{children}</div> : null}
    </Card>
  );
}
