import { motion, useReducedMotion } from "framer-motion";

import { Card, ErrorState, ProgressCard, Skeleton } from "@/components/ui";
import { useWaterTracker } from "@/modules/today/hooks/useWaterTracker";

export function WaterCard() {
  const { glasses, goal, isLoading, isError, refetch, increment, decrement } =
    useWaterTracker();
  const reduceMotion = useReducedMotion();
  const tap = reduceMotion ? undefined : { scale: 0.9 };

  if (isLoading) {
    return (
      <Card className="space-y-4 px-5 py-5">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-3 w-full" rounded />
      </Card>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load water"
        description="Please try again."
        onRetry={refetch}
      />
    );
  }

  return (
    <ProgressCard title="Water" value={glasses} max={goal} unit="glasses" icon="💧" circular>
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          whileTap={glasses === 0 ? undefined : tap}
          onClick={decrement}
          disabled={glasses === 0}
          aria-label="Remove a glass of water"
          className="flex size-10 items-center justify-center rounded-[var(--radius-pill)] bg-blossom-100 text-xl font-semibold text-blossom-600 transition-opacity disabled:opacity-40"
        >
          −
        </motion.button>
        <motion.button
          type="button"
          whileTap={tap}
          onClick={increment}
          aria-label="Add a glass of water"
          className="flex size-10 items-center justify-center rounded-[var(--radius-pill)] bg-blossom-500 text-xl font-semibold text-white shadow-[var(--shadow-button)] transition-opacity"
        >
          +
        </motion.button>
      </div>
    </ProgressCard>
  );
}
