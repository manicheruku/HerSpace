import type { JSX } from "react";

import { useSearch } from "@/shared/search/SearchProvider";

const SearchIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="size-4 shrink-0" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * The header search affordance. Looks like a search bar, opens the overlay.
 * Shows the Ctrl/⌘ K hint on wider screens.
 */
export function SearchTrigger(): JSX.Element {
  const { open } = useSearch();

  return (
    <button
      type="button"
      onClick={open}
      className="flex w-full items-center gap-2.5 rounded-[var(--radius-pill)] border border-border bg-card px-4 py-2.5 text-left text-sm text-ink-300 shadow-[var(--shadow-card)] transition hover:border-blossom-200 hover:text-ink-500"
      aria-label="Open search"
    >
      {SearchIcon}
      <span className="flex-1 truncate">Search everything…</span>
      <kbd className="hidden items-center gap-0.5 rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-ink-300 sm:flex">
        ⌘K
      </kbd>
    </button>
  );
}
