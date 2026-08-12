import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  advanceGoal,
  createGoal,
  deleteGoal,
  updateGoal,
} from "@/modules/goals/services/goals.api";
import { GOALS_KEYS } from "@/modules/goals/hooks/useGoals";
import type { GoalInput } from "@/modules/goals/types/goals.types";

/**
 * Create/update/delete/advance mutations for goals.
 *
 * All of them invalidate the goals queries plus the Explore summary and the
 * global search cache, so every surface that shows goal data stays in sync.
 */
export function useGoalMutations() {
  const queryClient = useQueryClient();

  function invalidateAll(): void {
    void queryClient.invalidateQueries({ queryKey: GOALS_KEYS.all });
    void queryClient.invalidateQueries({ queryKey: ["explore", "library"] });
    void queryClient.invalidateQueries({ queryKey: ["search"] });
  }

  const create = useMutation({
    mutationFn: (input: GoalInput) => createGoal(input),
    onSuccess: invalidateAll,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<GoalInput> }) =>
      updateGoal(id, input),
    onSuccess: invalidateAll,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteGoal(id),
    onSuccess: invalidateAll,
  });

  const advance = useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      advanceGoal(id, amount),
    onSuccess: invalidateAll,
  });

  return { create, update, remove, advance };
}
