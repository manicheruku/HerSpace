import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createHabit,
  deleteHabit,
  toggleHabitCheck,
  updateHabit,
} from "@/modules/habits/services/habits.api";
import { HABITS_KEYS } from "@/modules/habits/hooks/useHabits";
import type { HabitInput } from "@/modules/habits/types/habits.types";

/**
 * Create/update/delete/check mutations for habits.
 *
 * All of them invalidate the habits queries plus the Explore summary and the
 * global search cache, so every surface that shows habit data stays in sync.
 */
export function useHabitMutations() {
  const queryClient = useQueryClient();

  function invalidateAll(): void {
    void queryClient.invalidateQueries({ queryKey: HABITS_KEYS.all });
    void queryClient.invalidateQueries({ queryKey: ["explore", "library"] });
    void queryClient.invalidateQueries({ queryKey: ["search"] });
  }

  const create = useMutation({
    mutationFn: (input: HabitInput) => createHabit(input),
    onSuccess: invalidateAll,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<HabitInput> }) =>
      updateHabit(id, input),
    onSuccess: invalidateAll,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteHabit(id),
    onSuccess: invalidateAll,
  });

  const check = useMutation({
    mutationFn: ({ id, on }: { id: number; on?: string }) =>
      toggleHabitCheck(id, on),
    onSuccess: invalidateAll,
  });

  return { create, update, remove, check };
}
