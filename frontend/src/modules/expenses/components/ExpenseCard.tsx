import type { JSX } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { formatCents, formatExpenseCategory, formatSpentOn } from "@/modules/expenses/utils/expenses.format";
import type { Expense } from "@/modules/expenses/types/expenses.types";

interface ExpenseCardProps {
  expense: Expense;
  onOpen: (expense: Expense) => void;
}

/** Expense summary card with category pill and amount emphasis. */
export function ExpenseCard({ expense, onOpen }: ExpenseCardProps): JSX.Element {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      layout={!reduceMotion}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="relative flex w-full flex-col gap-2 overflow-hidden rounded-[var(--radius-card)] bg-card px-4 py-3.5 text-left shadow-[var(--shadow-card)] ring-1 ring-black/5"
      onClick={() => onOpen(expense)}
      aria-label={`Open ${expense.title}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 truncate font-display text-base font-semibold text-ink-900">
          {expense.title}
        </h3>
        <span className="text-sm font-semibold text-ink-900">{formatCents(expense.amountCents)}</span>
      </div>

      {expense.note ? <p className="line-clamp-2 text-sm text-ink-500">{expense.note}</p> : null}

      <div className="flex items-center justify-between text-xs text-ink-400">
        <span className="rounded-[var(--radius-pill)] bg-surface px-2 py-0.5">
          {formatExpenseCategory(expense.category)}
        </span>
        <span>{formatSpentOn(expense.spentOn)}</span>
      </div>
    </motion.button>
  );
}
