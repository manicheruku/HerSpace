import type { JSX } from "react";

import { Chip, Input } from "@/components/ui";
import {
  EXPENSE_CATEGORY_OPTIONS,
  formatExpenseCategory,
} from "@/modules/expenses/utils/expenses.format";
import type { ExpenseCategory } from "@/modules/expenses/types/expenses.types";

interface ExpenseFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  activeCategory: ExpenseCategory | "all";
  onCategoryChange: (value: ExpenseCategory | "all") => void;
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
}

/** Search/category/date filters for the expenses list. */
export function ExpenseFilters({
  query,
  onQueryChange,
  activeCategory,
  onCategoryChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}: ExpenseFiltersProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-[var(--radius-pill)] border border-border bg-card px-4 py-2.5">
        <svg viewBox="0 0 24 24" fill="none" className="size-4 text-ink-300" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search expenses…"
          className="flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-300"
          aria-label="Search expenses"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="text-ink-300 transition hover:text-ink-500"
            aria-label="Clear expenses search"
          >
            ×
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Chip selected={activeCategory === "all"} onClick={() => onCategoryChange("all")}>
          All
        </Chip>
        {EXPENSE_CATEGORY_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            selected={activeCategory === option.value}
            onClick={() => onCategoryChange(option.value)}
          >
            {formatExpenseCategory(option.value)}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="From"
          type="date"
          value={fromDate}
          onChange={(event) => onFromDateChange(event.target.value)}
        />
        <Input
          label="To"
          type="date"
          value={toDate}
          onChange={(event) => onToDateChange(event.target.value)}
        />
      </div>
    </div>
  );
}
