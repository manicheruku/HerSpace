import { useQuery } from "@tanstack/react-query";

import {
  fetchExpense,
  fetchExpenses,
  fetchExpenseSummary,
} from "@/modules/expenses/services/expenses.api";
import type { ExpenseFilters } from "@/modules/expenses/types/expenses.types";

/** Query key roots so mutations can invalidate precisely. */
export const EXPENSES_KEYS = {
  all: ["expenses"] as const,
  list: (filters: ExpenseFilters) => ["expenses", "list", filters] as const,
  entry: (id: number) => ["expenses", "entry", id] as const,
  summary: ["expenses", "summary"] as const,
};

/** List expenses with optional category/text/date filters. */
export function useExpenses(filters: ExpenseFilters = {}) {
  const result = useQuery({
    queryKey: EXPENSES_KEYS.list(filters),
    queryFn: () => fetchExpenses(filters),
  });
  return {
    expenses: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    isFetching: result.isFetching,
    refetch: () => {
      void result.refetch();
    },
  };
}

/** Fetch a single expense (deep-link target from search). */
export function useExpense(id: number | null) {
  const result = useQuery({
    queryKey: EXPENSES_KEYS.entry(id ?? -1),
    queryFn: () => fetchExpense(id as number),
    enabled: id !== null,
  });
  return {
    expense: result.data ?? null,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: () => {
      void result.refetch();
    },
  };
}

/** Compact stats for the Explore Expenses card. */
export function useExpenseSummary() {
  const result = useQuery({
    queryKey: EXPENSES_KEYS.summary,
    queryFn: fetchExpenseSummary,
    staleTime: 30_000,
  });
  return {
    summary: result.data ?? null,
    isLoading: result.isLoading,
    isError: result.isError,
  };
}
