import { motion, useReducedMotion } from "framer-motion";

import { Card, ErrorState, Skeleton } from "@/components/ui";
import { useWeather } from "@/modules/today/hooks/useWeather";

export function WeatherCard() {
  const { data, isLoading, isError, refetch } = useWeather();
  const reduceMotion = useReducedMotion();

  if (isLoading) {
    return (
      <Card className="flex items-center justify-between bg-gradient-to-br from-sky-100 via-sky-50 to-lilac-100 px-6 py-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" rounded />
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-4 w-28" rounded />
        </div>
        <Skeleton className="size-20" rounded />
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Couldn't load weather"
        description="Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-sky-200 via-sky-100 to-lilac-100 px-6 py-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full bg-sky-50/70 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-12 -left-8 size-28 rounded-full bg-lilac-200/40 blur-2xl"
      />
      <div className="relative flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-ink-500">
            {data.city}
          </span>
          <span className="font-display text-6xl font-semibold leading-none text-ink-900">
            {Math.round(data.tempC)}°
          </span>
          <span className="mt-2 text-base font-medium text-ink-700">
            {data.condition}
          </span>
          <span className="mt-0.5 text-sm text-ink-500">
            Feels like {Math.round(data.feelsLikeC)}°
          </span>
        </div>
        <motion.div
          className="flex size-20 items-center justify-center rounded-full bg-white/60 text-5xl shadow-[var(--shadow-card)] backdrop-blur"
          animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <span aria-hidden="true">{data.icon}</span>
        </motion.div>
      </div>
    </Card>
  );
}
