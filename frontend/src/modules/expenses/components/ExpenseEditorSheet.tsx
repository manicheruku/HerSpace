import type { FormEvent, JSX } from "react";
import { useEffect, useState } from "react";

import { BottomSheet, Button, Input } from "@/components/ui";
import {
  EXPENSE_CATEGORY_OPTIONS,
  formatExpenseCategory,
} from "@/modules/expenses/utils/expenses.format";
import type {
  Expense,
  ExpenseCategory,
  ExpenseInput,
} from "@/modules/expenses/types/expenses.types";

export interface ExpenseEditorSheetProps {
  open: boolean;
  /** Expense being edited, or `null` to create a new one. */
  entry: Expense | null;
  onClose: () => void;
  onSubmit: (input: ExpenseInput) => void;
  isSubmitting?: boolean;
}

interface DraftState {
  title: string;
  amount: string;
  category: ExpenseCategory;
  spentOn: string;
  note: string;
}

const todayISO = new Date().toISOString().slice(0, 10);

const EMPTY_DRAFT: DraftState = {
  title: "",
  amount: "",
  category: "other",
  spentOn: todayISO,
  note: "",
};

/** Create/edit an expense in a bottom sheet. Reused across surfaces. */
export function ExpenseEditorSheet({
  open,
  entry,
  onClose,
  onSubmit,
  isSubmitting = false,
}: ExpenseEditorSheetProps): JSX.Element {
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);

  useEffect(() => {
    if (!open) return;
    setDraft(
      entry
        ? {
            title: entry.title,
            amount: (entry.amountCents / 100).toFixed(2),
            category: entry.category,
            spentOn: entry.spentOn,
            note: entry.note ?? "",
          }
        : EMPTY_DRAFT,
    );
  }, [open, entry]);

  const amountNumber = Number(draft.amount);
  const amountCents = Number.isFinite(amountNumber) ? Math.round(amountNumber * 100) : 0;
  const canSubmit = draft.title.trim().length > 0 && amountCents >= 1 && Boolean(draft.spentOn);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!canSubmit) return;

    onSubmit({
      title: draft.title.trim(),
      amountCents,
      category: draft.category,
      spentOn: draft.spentOn,
      note: draft.note.trim() || null,
    });
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={entry ? "Edit expense" : "Add expense"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Title"
          placeholder="e.g. Groceries"
          value={draft.title}
          onChange={(event) => setDraft((d) => ({ ...d, title: event.target.value }))}
          autoFocus
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount"
            type="number"
            min={0.01}
            step={0.01}
            inputMode="decimal"
            placeholder="0.00"
            value={draft.amount}
            onChange={(event) => setDraft((d) => ({ ...d, amount: event.target.value }))}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="expense-category" className="text-sm font-medium text-ink-700">
              Category
            </label>
            <select
              id="expense-category"
              value={draft.category}
              onChange={(event) =>
                setDraft((d) => ({ ...d, category: event.target.value as ExpenseCategory }))
              }
              className="w-full rounded-[var(--radius-pill)] border border-border bg-surface px-4 py-2.5 text-base text-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-blossom-300"
            >
              {EXPENSE_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Date"
          type="date"
          value={draft.spentOn}
          onChange={(event) => setDraft((d) => ({ ...d, spentOn: event.target.value }))}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-700">Note</span>
          <textarea
            value={draft.note}
            onChange={(event) => setDraft((d) => ({ ...d, note: event.target.value }))}
            placeholder={`Optional details (${formatExpenseCategory(draft.category)})`}
            rows={4}
            className="w-full resize-none rounded-[var(--radius-md)] border border-border bg-card px-3.5 py-2.5 text-sm text-ink-900 outline-none transition focus:border-blossom-300 placeholder:text-ink-300"
          />
        </div>

        <Button type="submit" fullWidth isLoading={isSubmitting} disabled={!canSubmit}>
          {entry ? "Save changes" : "Add expense"}
        </Button>
      </form>
    </BottomSheet>
  );
}
