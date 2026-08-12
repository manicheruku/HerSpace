import { useQuery } from "@tanstack/react-query";

import { fetchExploreLibrary } from "@/modules/explore/services/explore.api";
import type { ExploreSection } from "@/modules/explore/types/explore.types";

/** React Query key for the Explore library. */
export const EXPLORE_LIBRARY_KEY = ["explore", "library"] as const;

interface UseExploreLibraryResult {
  sections: ExploreSection[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/** Loads the grouped Explore library (mock-backed today, API-ready). */
export function useExploreLibrary(): UseExploreLibraryResult {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: EXPLORE_LIBRARY_KEY,
    queryFn: fetchExploreLibrary,
    staleTime: 60_000,
  });

  return {
    sections: data ?? [],
    isLoading,
    isError,
    refetch: () => {
      void refetch();
    },
  };
}
