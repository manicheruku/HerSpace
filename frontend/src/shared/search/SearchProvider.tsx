import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { SearchOverlay } from "@/shared/search/components/SearchOverlay";

interface SearchContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

/**
 * App-wide search service. Owns the overlay open state and the global
 * Ctrl/Cmd+K shortcut. Mount once inside the authenticated shell so search is
 * reachable from every screen.
 */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isK = event.key.toLowerCase() === "k";
      if (isK && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo<SearchContextValue>(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle],
  );

  return (
    <SearchContext.Provider value={value}>
      {children}
      <SearchOverlay open={isOpen} onClose={close} />
    </SearchContext.Provider>
  );
}

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return ctx;
}
