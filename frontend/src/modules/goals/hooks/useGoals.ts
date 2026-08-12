import { useQuery } from "@tanstack/react-query";

import {
  fetchGoal,
  fetchGoals,
  fetchGoalSummary,
} from "@/modules/goals/services/goals.api";
import type { GoalFilters } from "@/modules/goals/types/goals.types";

/** Query key roots so mutations can invalidate precisely. */
export const GOALS_KEYS = {
  all: ["goals"] as const,
  list: (filters: GoalFilters) => ["goals", "list", filters] as const,
  entry: (id: number) => ["goals", "entry", id] as const,
  summary: ["goals", "summary"] as const,
};

/** List goals with optional archived/text filters. */
export function useGoals(filters: GoalFilters = {}) {
  const result = useQuery({
    queryKey: GOALS_KEYS.list(filters),
    queryFn: () => fetchGoals(filters),
  });
  return {
    goals: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    isFetching: result.isFetching,
    refetch: () => {
      void result.refetch();
    },
  };
}

/** Fetch a single goal (deep-link target from search). */
export function useGoal(id: number | null) {
  const result = useQuery({
    queryKey: GOALS_KEYS.entry(id ?? -1),
    queryFn: () => fetchGoal(id as number),
    enabled: id !== null,
  });
  return {
    goal: result.data ?? null,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: () => {
      void result.refetch();
    },
  };
}

/** Compact stats for the Explore Goals card. */
export function useGoalSummary() {
  const result = useQuery({
    queryKey: GOALS_KEYS.summary,
    queryFn: fetchGoalSummary,
    staleTime: 30_000,
  });
  return {
    summary: result.data ?? null,
    isLoading: result.isLoading,
    isError: result.isError,
  };
}
