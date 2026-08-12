import type { JSX } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { ProgressBar } from "@/components/ui";
import { formatDueDate, formatPercent } from "@/modules/goals/utils/goals.format";
import type { Goal } from "@/modules/goals/types/goals.types";

interface GoalCardProps {
  goal: Goal;
  onOpen: (goal: Goal) => void;
  onAdvance: (goal: Goal, amount: number) => void;
  isUpdating?: boolean;
}

/** A goal summary card with progress bar and quick +/- controls. */
export function GoalCard({
  goal,
  onOpen,
  onAdvance,
  isUpdating = false,
}: GoalCardProps): JSX.Element {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      layout={!reduceMotion}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="relative overflow-hidden rounded-[var(--radius-card)] bg-card shadow-[var(--shadow-card)] ring-1 ring-black/5"
    >
      <button
        type="button"
        onClick={() => onOpen(goal)}
        className="flex w-full flex-col gap-2 px-4 py-3.5 text-left"
        aria-label={`Open ${goal.title}`}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 truncate font-display text-base font-semibold text-ink-900">
            {goal.title}
          </h3>
          <span
            className={`rounded-[var(--radius-pill)] px-2 py-0.5 text-[11px] font-semibold ${
              goal.isCompleted
                ? "bg-mint-100 text-mint-700"
                : "bg-surface text-ink-500"
            }`}
          >
            {formatPercent(goal.progressPercent)}
          </span>
        </div>

        {goal.description ? (
          <p className="line-clamp-2 text-sm text-ink-500">{goal.description}</p>
        ) : null}

        <ProgressBar value={goal.progressPercent} max={100} />

        <div className="flex items-center justify-between text-xs text-ink-300">
          <span>
            {goal.currentValue}/{goal.targetValue}
            {goal.unit ? ` ${goal.unit}` : ""}
          </span>
          <span>{formatDueDate(goal.dueDate)}</span>
        </div>
      </button>

      <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-2">
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => onAdvance(goal, -1)}
          className="rounded-[var(--radius-pill)] bg-surface px-2.5 py-1 text-sm font-semibold text-ink-500 transition hover:text-ink-700 disabled:opacity-60"
          aria-label={`Decrease progress for ${goal.title}`}
        >
          -1
        </button>
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => onAdvance(goal, 1)}
          className="rounded-[var(--radius-pill)] bg-blossom-50 px-2.5 py-1 text-sm font-semibold text-blossom-700 transition hover:bg-blossom-100 disabled:opacity-60"
          aria-label={`Increase progress for ${goal.title}`}
        >
          +1
        </button>
      </div>
    </motion.div>
  );
}
