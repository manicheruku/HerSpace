import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createExpense,
  deleteExpense,
  updateExpense,
} from "@/modules/expenses/services/expenses.api";
import { EXPENSES_KEYS } from "@/modules/expenses/hooks/useExpenses";
import type { ExpenseInput } from "@/modules/expenses/types/expenses.types";

/**
 * Create/update/delete mutations for expenses.
 *
 * All of them invalidate the expenses queries plus the Explore summary and the
 * global search cache, so every surface that shows expense data stays in sync.
 */
export function useExpenseMutations() {
  const queryClient = useQueryClient();

  function invalidateAll(): void {
    void queryClient.invalidateQueries({ queryKey: EXPENSES_KEYS.all });
    void queryClient.invalidateQueries({ queryKey: ["explore", "library"] });
    void queryClient.invalidateQueries({ queryKey: ["search"] });
  }

  const create = useMutation({
    mutationFn: (input: ExpenseInput) => createExpense(input),
    onSuccess: invalidateAll,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<ExpenseInput> }) =>
      updateExpense(id, input),
    onSuccess: invalidateAll,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteExpense(id),
    onSuccess: invalidateAll,
  });

  return { create, update, remove };
}
