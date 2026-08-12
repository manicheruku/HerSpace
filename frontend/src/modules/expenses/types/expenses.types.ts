/** Domain types for the Expenses module (camelCase, UI-facing). */

export type ExpenseCategory =
  | "food"
  | "transport"
  | "shopping"
  | "health"
  | "home"
  | "bills"
  | "other";

export interface Expense {
  id: number;
  title: string;
  amountCents: number;
  category: ExpenseCategory;
  spentOn: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  title: string;
  amountCents: number;
  category: ExpenseCategory;
  spentOn: string;
  note?: string | null;
}

/** Filters applied to the expenses list view. */
export interface ExpenseFilters {
  category?: ExpenseCategory | "all";
  query?: string;
  fromDate?: string;
  toDate?: string;
}

/** Compact stats powering the Explore Expenses card. */
export interface ExpenseSummary {
  monthTotalCents: number;
  monthCount: number;
  latestTitle: string | null;
  lastUpdated: string | null;
}
