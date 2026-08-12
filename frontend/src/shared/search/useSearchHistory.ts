import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "herspace_recent_searches";
const MAX_ENTRIES = 6;

function read(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function write(entries: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* localStorage may be unavailable */
  }
}

/**
 * Persisted recent-search history (most-recent-first, de-duplicated, capped).
 */
export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>(() => read());

  useEffect(() => {
    write(history);
  }, [history]);

  const addSearch = useCallback((term: string) => {
    const cleaned = term.trim();
    if (cleaned.length < 2) return;
    setHistory((prev) => {
      const next = [cleaned, ...prev.filter((t) => t.toLowerCase() !== cleaned.toLowerCase())];
      return next.slice(0, MAX_ENTRIES);
    });
  }, []);

  const removeSearch = useCallback((term: string) => {
    setHistory((prev) => prev.filter((t) => t !== term));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addSearch, removeSearch, clearHistory };
}
