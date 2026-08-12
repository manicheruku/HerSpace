import { useQuery } from "@tanstack/react-query";

import { fetchRandomQuote } from "@/modules/today/services/quotes.api";
import type { DailyMessage } from "@/modules/today/types/today.types";

/** Shown if the quotes endpoint is unreachable so the card never looks broken. */
const FALLBACK_MESSAGE: DailyMessage = {
  id: "fallback",
  text: "You are exactly where you need to be. Breathe, and take today one gentle step at a time.",
  author: "HerSpace",
};

interface UseDailyMessageResult {
  message: DailyMessage | null;
  loading: boolean;
  isError: boolean;
}

/**
 * Provides a motivational quote for the Daily Message card. A fresh quote is
 * fetched on every mount (e.g. each login), so the message changes over time.
 */
export function useDailyMessage(): UseDailyMessageResult {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["quotes", "random"],
    queryFn: fetchRandomQuote,
    staleTime: 0,
    refetchOnMount: "always",
    retry: 1,
  });

  return {
    message: isError ? FALLBACK_MESSAGE : (data ?? null),
    loading: isLoading,
    isError,
  };
}
