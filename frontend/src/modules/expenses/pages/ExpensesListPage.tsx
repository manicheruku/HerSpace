import type { JSX } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";

import { Button, EmptyState, ErrorState, useToast } from "@/components/ui";
import { ExpenseCard } from "@/modules/expenses/components/ExpenseCard";
import { ExpenseEditorSheet } from "@/modules/expenses/components/ExpenseEditorSheet";
import { ExpenseFilters } from "@/modules/expenses/components/ExpenseFilters";
import { useExpenses } from "@/modules/expenses/hooks/useExpenses";
import { useExpenseMutations } from "@/modules/expenses/hooks/useExpenseMutations";
import { formatCents } from "@/modules/expenses/utils/expenses.format";
import type {
  Expense,
  ExpenseCategory,
  ExpenseInput,
} from "@/modules/expenses/types/expenses.types";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

export function ExpensesListPage(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ExpenseCategory | "all">("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);

  const { expenses, isLoading, isError, refetch } = useExpenses({
    category,
    query,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });
  const { create } = useExpenseMutations();

  function handleOpen(expense: Expense): void {
    navigate(`/expenses/${expense.id}`);
  }

  function handleCreate(input: ExpenseInput): void {
    create.mutate(input, {
      onSuccess: () => {
        setEditorOpen(false);
        showToast("Expense added", "success");
      },
      onError: () => showToast("Couldn't add expense", "error"),
    });
  }

  const monthTotalCents = expenses.reduce((sum, item) => sum + item.amountCents, 0);

  const header = (
    <div className="flex flex-col gap-3 px-1">
      <button
        type="button"
        onClick={() => navigate("/explore")}
        className="flex items-center gap-1 self-start text-sm text-ink-500 transition hover:text-ink-700"
      >
        <span aria-hidden="true">‹</span> Explore
      </button>
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Expenses</h1>
          <p className="mt-0.5 text-sm text-ink-500">Track spending gently, without the stress.</p>
        </div>
        <Button size="sm" leftIcon="+" onClick={() => setEditorOpen(true)}>
          Add
        </Button>
      </header>
      {expenses.length > 0 ? (
        <p className="text-xs text-ink-400">
          {expenses.length} item{expenses.length === 1 ? "" : "s"} · {formatCents(monthTotalCents)}
        </p>
      ) : null}
    </div>
  );

  function renderBody(): JSX.Element {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[120px] animate-pulse rounded-[var(--radius-card)] bg-ink-100/70"
            />
          ))}
        </div>
      );
    }
    if (isError) {
      return (
        <ErrorState
          title="Couldn't load your expenses"
          description="Please check your connection and try again."
          onRetry={refetch}
        />
      );
    }
    if (expenses.length === 0) {
      return (
        <EmptyState
          icon="💸"
          title="No expenses yet"
          description="Add your first expense to see trends and monthly totals."
          action={
            <Button size="sm" leftIcon="+" onClick={() => setEditorOpen(true)}>
              Add expense
            </Button>
          }
        />
      );
    }
    return (
      <motion.div
        className="flex flex-col gap-3"
        variants={reduceMotion ? undefined : containerVariants}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
      >
        <AnimatePresence initial={false}>
          {expenses.map((expense) => (
            <motion.div
              key={expense.id}
              variants={reduceMotion ? undefined : itemVariants}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
              layout={!reduceMotion}
            >
              <ExpenseCard expense={expense} onOpen={handleOpen} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className="flex flex-col gap-5 pb-8"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
      >
        {header}
        <ExpenseFilters
          query={query}
          onQueryChange={setQuery}
          activeCategory={category}
          onCategoryChange={setCategory}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
        />
        {renderBody()}
      </motion.div>

      <ExpenseEditorSheet
        open={editorOpen}
        entry={null}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={create.isPending}
      />
    </>
  );
}
