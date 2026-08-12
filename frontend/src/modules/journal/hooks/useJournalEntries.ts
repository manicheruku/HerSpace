import { useQuery } from "@tanstack/react-query";

import {
  fetchJournalEntries,
  fetchJournalEntry,
  fetchJournalSummary,
} from "@/modules/journal/services/journal.api";
import type { JournalFilters } from "@/modules/journal/types/journal.types";

/** Query key roots so mutations can invalidate precisely. */
export const JOURNAL_KEYS = {
  all: ["journal"] as const,
  list: (filters: JournalFilters) => ["journal", "entries", filters] as const,
  entry: (id: number) => ["journal", "entry", id] as const,
  summary: ["journal", "summary"] as const,
};

/** List entries with optional favorite/tag/text filters. */
export function useJournalEntries(filters: JournalFilters = {}) {
  const result = useQuery({
    queryKey: JOURNAL_KEYS.list(filters),
    queryFn: () => fetchJournalEntries(filters),
  });
  return {
    entries: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    isFetching: result.isFetching,
    refetch: () => {
      void result.refetch();
    },
  };
}

/** Fetch a single entry (deep-link target from search). */
export function useJournalEntry(id: number | null) {
  const result = useQuery({
    queryKey: JOURNAL_KEYS.entry(id ?? -1),
    queryFn: () => fetchJournalEntry(id as number),
    enabled: id !== null,
  });
  return {
    entry: result.data ?? null,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: () => {
      void result.refetch();
    },
  };
}

/** Compact stats for the Explore Journal card. */
export function useJournalSummary() {
  const result = useQuery({
    queryKey: JOURNAL_KEYS.summary,
    queryFn: fetchJournalSummary,
    staleTime: 30_000,
  });
  return {
    summary: result.data ?? null,
    isLoading: result.isLoading,
    isError: result.isError,
  };
}
