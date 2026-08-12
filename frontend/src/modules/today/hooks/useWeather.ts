import { useQuery } from "@tanstack/react-query";

import { fetchWeather } from "@/modules/today/services/weather.api";
import { useGeolocation } from "@/shared/hooks/useGeolocation";
import type { Weather } from "@/modules/today/types/today.types";

interface UseWeatherResult {
  data: Weather | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useWeather(): UseWeatherResult {
  const { coords, resolved } = useGeolocation();

  const query = useQuery({
    queryKey: ["weather", coords?.lat ?? null, coords?.lon ?? null],
    queryFn: () => fetchWeather(coords ?? undefined),
    // Wait for the geolocation attempt to settle so we make a single request
    // (with coordinates when granted, or the city fallback when not).
    enabled: resolved,
  });

  return {
    data: query.data,
    isLoading: query.isLoading || !resolved,
    isError: query.isError,
    refetch: () => {
      void query.refetch();
    },
  };
}
