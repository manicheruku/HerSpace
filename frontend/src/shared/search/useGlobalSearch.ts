import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { searchAll } from "@/shared/search/searchApi";
import type { SearchResponse } from "@/shared/search/types";

/** Minimum characters before a network request fires. */
export const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

const EMPTY: SearchResponse = { query: "", total: 0, groups: [] };

/** Debounce a rapidly-changing value. */
function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/**
 * Debounced global search backed by TanStack Query.
 *
 * - Debounces the term by 300ms.
 * - Only fetches once the term reaches {@link MIN_QUERY_LENGTH}.
 * - Forwards the query's `AbortSignal` for automatic request cancellation.
 * - Caches per term and keeps previous data to avoid flicker while typing.
 */
export function useGlobalSearch(rawQuery: string) {
  const query = rawQuery.trim();
  const debounced = useDebounced(query, DEBOUNCE_MS);
  const enabled = debounced.length >= MIN_QUERY_LENGTH;

  const result = useQuery({
    queryKey: ["search", debounced],
    queryFn: ({ signal }) => searchAll(debounced, signal),
    enabled,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  // `isFetching` covers the debounce gap where the query is enabled but the
  // previous term's data is still shown.
  const isSearching = enabled && (result.isLoading || result.isFetching);

  return {
    data: enabled ? result.data ?? EMPTY : EMPTY,
    isSearching,
    isError: result.isError,
    refetch: () => {
      void result.refetch();
    },
    /** True once the debounced term is long enough to have triggered a search. */
    hasQuery: enabled,
    /** True while the user is typing but the debounce hasn't settled yet. */
    isDebouncing: query !== debounced,
  };
}
