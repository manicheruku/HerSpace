import { useQuery } from "@tanstack/react-query";

import {
  fetchNote,
  fetchNotes,
  fetchNoteSummary,
} from "@/modules/notes/services/notes.api";
import type { NoteFilters } from "@/modules/notes/types/notes.types";

/** Query key roots so mutations can invalidate precisely. */
export const NOTES_KEYS = {
  all: ["notes"] as const,
  list: (filters: NoteFilters) => ["notes", "entries", filters] as const,
  entry: (id: number) => ["notes", "entry", id] as const,
  summary: ["notes", "summary"] as const,
};

/** List notes with optional pinned/tag/text filters. */
export function useNotes(filters: NoteFilters = {}) {
  const result = useQuery({
    queryKey: NOTES_KEYS.list(filters),
    queryFn: () => fetchNotes(filters),
  });
  return {
    notes: result.data ?? [],
    isLoading: result.isLoading,
    isError: result.isError,
    isFetching: result.isFetching,
    refetch: () => {
      void result.refetch();
    },
  };
}

/** Fetch a single note (deep-link target from search). */
export function useNote(id: number | null) {
  const result = useQuery({
    queryKey: NOTES_KEYS.entry(id ?? -1),
    queryFn: () => fetchNote(id as number),
    enabled: id !== null,
  });
  return {
    note: result.data ?? null,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: () => {
      void result.refetch();
    },
  };
}

/** Compact stats for the Explore Notes card. */
export function useNoteSummary() {
  const result = useQuery({
    queryKey: NOTES_KEYS.summary,
    queryFn: fetchNoteSummary,
    staleTime: 30_000,
  });
  return {
    summary: result.data ?? null,
    isLoading: result.isLoading,
    isError: result.isError,
  };
}
