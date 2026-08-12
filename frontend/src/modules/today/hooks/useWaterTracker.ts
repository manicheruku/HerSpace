import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  decrementWater,
  fetchWaterToday,
  incrementWater,
} from "@/modules/today/services/water.api";
import type { Water } from "@/modules/today/types/today.types";

const WATER_KEY = ["water", "today"] as const;

interface UseWaterTrackerResult {
  glasses: number;
  goal: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  increment: () => void;
  decrement: () => void;
}

export function useWaterTracker(): UseWaterTrackerResult {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: WATER_KEY,
    queryFn: fetchWaterToday,
  });

  function optimisticAdjust(delta: number) {
    return {
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: WATER_KEY });
        const previous = queryClient.getQueryData<Water>(WATER_KEY);
        if (previous) {
          queryClient.setQueryData<Water>(WATER_KEY, {
            ...previous,
            glasses: Math.max(0, previous.glasses + delta),
          });
        }
        return { previous };
      },
      onError: (_error: unknown, _vars: void, context?: { previous?: Water }) => {
        if (context?.previous) {
          queryClient.setQueryData(WATER_KEY, context.previous);
        }
      },
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: WATER_KEY });
      },
    };
  }

  const incrementMutation = useMutation({
    mutationFn: incrementWater,
    ...optimisticAdjust(1),
  });

  const decrementMutation = useMutation({
    mutationFn: decrementWater,
    ...optimisticAdjust(-1),
  });

  return {
    glasses: query.data?.glasses ?? 0,
    goal: query.data?.goal ?? 8,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch();
    },
    increment: () => incrementMutation.mutate(),
    decrement: () => decrementMutation.mutate(),
  };
}
