import { QueryClient } from "@tanstack/react-query";

/**
 * Shared TanStack Query client for the app.
 *
 * Defaults tuned for a small PWA: short-lived freshness, a single retry on
 * transient failures, and no refetch on window focus to avoid surprise spinners.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
