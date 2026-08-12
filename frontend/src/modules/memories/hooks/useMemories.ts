import { useQuery } from "@tanstack/react-query";

import {
  fetchMemories,
  fetchMemory,
  fetchMemorySummary,
} from "@/modules/memories/services/memories.api";
import type { MemoryFilters } from "@/modules/memories/types/memories.types";

/** Query key roots so mutations can invalidate precisely. */
export const MEMORIES_KEYS = {
  all: ["memories"] as const,
  list: (filters: MemoryFilters) => ["memories", "entries", filters] as const,
  entry: (id: number) => ["memories", "entry", id] as const,
  summary: ["memories", "summary"] as const,
};

/** List memories with optional favorite/mood/text/date filters. */
export function useMemories(filters: MemoryFilters = {}) {
  const result = useQuery({
    queryKey: MEMORIES_KEYS.list(filters),
    queryFn: () => fetchMemories(filters),
  });
  return {
    memories: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    isFetching: result.isFetching,
    refetch: () => {
      void result.refetch();
    },
  };
}

/** Fetch a single memory (deep-link target from search). */
export function useMemory(id: number | null) {
  const result = useQuery({
    queryKey: MEMORIES_KEYS.entry(id ?? -1),
    queryFn: () => fetchMemory(id as number),
    enabled: id !== null,
  });
  return {
    memory: result.data ?? null,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: () => {
      void result.refetch();
    },
  };
}

/** Compact stats for the Explore Memories card. */
export function useMemorySummary() {
  const result = useQuery({
    queryKey: MEMORIES_KEYS.summary,
    queryFn: fetchMemorySummary,
    staleTime: 30_000,
  });
  return {
    summary: result.data ?? null,
    isLoading: result.isLoading,
    isError: result.isError,
  };
}
