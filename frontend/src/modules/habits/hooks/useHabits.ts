import { useQuery } from "@tanstack/react-query";

import {
  fetchHabit,
  fetchHabits,
  fetchHabitSummary,
} from "@/modules/habits/services/habits.api";
import type { HabitFilters } from "@/modules/habits/types/habits.types";

/** Query key roots so mutations can invalidate precisely. */
export const HABITS_KEYS = {
  all: ["habits"] as const,
  list: (filters: HabitFilters) => ["habits", "list", filters] as const,
  entry: (id: number) => ["habits", "entry", id] as const,
  summary: ["habits", "summary"] as const,
};

/** List habits with optional archived/text filters. */
export function useHabits(filters: HabitFilters = {}) {
  const result = useQuery({
    queryKey: HABITS_KEYS.list(filters),
    queryFn: () => fetchHabits(filters),
  });
  return {
    habits: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    isFetching: result.isFetching,
    refetch: () => {
      void result.refetch();
    },
  };
}

/** Fetch a single habit (deep-link target from search). */
export function useHabit(id: number | null) {
  const result = useQuery({
    queryKey: HABITS_KEYS.entry(id ?? -1),
    queryFn: () => fetchHabit(id as number),
    enabled: id !== null,
  });
  return {
    habit: result.data ?? null,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: () => {
      void result.refetch();
    },
  };
}

/** Compact stats for the Explore Habits card. */
export function useHabitSummary() {
  const result = useQuery({
    queryKey: HABITS_KEYS.summary,
    queryFn: fetchHabitSummary,
    staleTime: 30_000,
  });
  return {
    summary: result.data ?? null,
    isLoading: result.isLoading,
    isError: result.isError,
  };
}
