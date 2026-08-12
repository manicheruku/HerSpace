import type { ExpenseCategory } from "@/modules/expenses/types/expenses.types";

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: "Food",
  transport: "Transport",
  shopping: "Shopping",
  health: "Health",
  home: "Home",
  bills: "Bills",
  other: "Other",
};

export const EXPENSE_CATEGORY_OPTIONS: Array<{ value: ExpenseCategory; label: string }> = [
  { value: "food", label: CATEGORY_LABELS.food },
  { value: "transport", label: CATEGORY_LABELS.transport },
  { value: "shopping", label: CATEGORY_LABELS.shopping },
  { value: "health", label: CATEGORY_LABELS.health },
  { value: "home", label: CATEGORY_LABELS.home },
  { value: "bills", label: CATEGORY_LABELS.bills },
  { value: "other", label: CATEGORY_LABELS.other },
];

/** Human label for an expense category. */
export function formatExpenseCategory(category: ExpenseCategory): string {
  return CATEGORY_LABELS[category];
}

/** Format integer cents as localized currency (USD). */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** Compact date text for expense cards and detail metadata. */
export function formatSpentOn(dateISO: string): string {
  const date = new Date(`${dateISO}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
