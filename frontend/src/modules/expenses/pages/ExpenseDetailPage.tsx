import type { JSX } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import { Button, ErrorState, LoadingState, Modal, useToast } from "@/components/ui";
import { ExpenseEditorSheet } from "@/modules/expenses/components/ExpenseEditorSheet";
import { useExpense } from "@/modules/expenses/hooks/useExpenses";
import { useExpenseMutations } from "@/modules/expenses/hooks/useExpenseMutations";
import {
  formatCents,
  formatExpenseCategory,
  formatSpentOn,
} from "@/modules/expenses/utils/expenses.format";
import type { ExpenseInput } from "@/modules/expenses/types/expenses.types";

export function ExpenseDetailPage(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const params = useParams<{ id: string }>();
  const id = params.id ? Number(params.id) : null;

  const { expense, isLoading, isError, refetch } = useExpense(id);
  const { update, remove } = useExpenseMutations();

  const [editorOpen, setEditorOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleUpdate(input: ExpenseInput): void {
    if (!expense) return;
    update.mutate(
      { id: expense.id, input },
      {
        onSuccess: () => {
          setEditorOpen(false);
          showToast("Expense updated", "success");
        },
        onError: () => showToast("Couldn't update expense", "error"),
      },
    );
  }

  function handleDelete(): void {
    if (!expense) return;
    remove.mutate(expense.id, {
      onSuccess: () => {
        showToast("Expense deleted", "success");
        navigate("/expenses");
      },
      onError: () => showToast("Couldn't delete expense", "error"),
    });
  }

  if (isLoading) return <LoadingState label="Loading expense" />;
  if (isError || !expense) {
    return (
      <ErrorState
        title="Expense not found"
        description="It may have been deleted."
        onRetry={id ? refetch : undefined}
      />
    );
  }

  return (
    <>
      <motion.article
        className="flex flex-col gap-4 pb-8"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
      >
        <button
          type="button"
          onClick={() => navigate("/expenses")}
          className="flex items-center gap-1 self-start text-sm text-ink-500 transition hover:text-ink-700"
        >
          <span aria-hidden="true">‹</span> Expenses
        </button>

        <header className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-semibold text-ink-900">{expense.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
            <span>{formatExpenseCategory(expense.category)}</span>
            <span>•</span>
            <span>{formatSpentOn(expense.spentOn)}</span>
          </div>
        </header>

        <div className="rounded-[var(--radius-card)] border border-border bg-card px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-ink-400">Amount</p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink-900">
            {formatCents(expense.amountCents)}
          </p>
        </div>

        {expense.note ? (
          <section className="rounded-[var(--radius-card)] border border-border bg-card px-4 py-3">
            <h2 className="text-sm font-semibold text-ink-700">Note</h2>
            <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-700">
              {expense.note}
            </p>
          </section>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditorOpen(true)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
        </div>
      </motion.article>

      <ExpenseEditorSheet
        open={editorOpen}
        entry={expense}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleUpdate}
        isSubmitting={update.isPending}
      />

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete expense?">
        <p className="text-sm text-ink-500">
          This will permanently remove “{expense.title}”. This can't be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" isLoading={remove.isPending} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
