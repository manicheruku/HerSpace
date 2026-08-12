import type { JSX } from "react";

interface RecentSearchesProps {
  history: string[];
  onPick: (term: string) => void;
  onRemove: (term: string) => void;
  onClear: () => void;
}

/** Idle state: shows recent searches with per-item remove and a clear-all. */
export function RecentSearches({
  history,
  onPick,
  onRemove,
  onClear,
}: RecentSearchesProps): JSX.Element {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
        <span className="text-3xl" aria-hidden="true">
          🔍
        </span>
        <p className="text-sm font-medium text-ink-900">Search across everything</p>
        <p className="text-xs text-ink-500">
          Journal, tasks, notes, goals and more — all in one place.
        </p>
      </div>
    );
  }

  return (
    <div className="px-3 py-3">
      <div className="flex items-center justify-between px-3 pb-1">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-300">Recent</h3>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-blossom-500 transition hover:text-blossom-600"
        >
          Clear
        </button>
      </div>
      <ul className="flex flex-col">
        {history.map((term) => (
          <li key={term} className="flex items-center">
            <button
              type="button"
              onClick={() => onPick(term)}
              className="flex flex-1 items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left transition-colors hover:bg-surface"
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-4 text-ink-300" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="truncate text-sm text-ink-700">{term}</span>
            </button>
            <button
              type="button"
              onClick={() => onRemove(term)}
              className="rounded-full p-1.5 text-ink-300 transition hover:bg-surface hover:text-ink-500"
              aria-label={`Remove ${term} from recent searches`}
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface SearchStateProps {
  query: string;
}

/** No-results state. */
export function SearchNoResults({ query }: SearchStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <span className="text-3xl" aria-hidden="true">
        🫧
      </span>
      <p className="text-sm font-medium text-ink-900">No results for “{query}”</p>
      <p className="text-xs text-ink-500">Try a different word or check your spelling.</p>
    </div>
  );
}

interface SearchErrorProps {
  onRetry: () => void;
}

/** Error state with retry. */
export function SearchError({ onRetry }: SearchErrorProps): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="text-3xl" aria-hidden="true">
        😕
      </span>
      <p className="text-sm font-medium text-ink-900">Something went wrong</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-[var(--radius-pill)] bg-blossom-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-blossom-600"
      >
        Try again
      </button>
    </div>
  );
}

/** Loading skeleton rows. */
export function SearchLoading(): JSX.Element {
  return (
    <div className="flex flex-col gap-2 px-6 py-6">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="size-9 shrink-0 animate-pulse rounded-[var(--radius-md)] bg-ink-100" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-1/2 animate-pulse rounded-[var(--radius-pill)] bg-ink-100" />
            <div className="h-2.5 w-3/4 animate-pulse rounded-[var(--radius-pill)] bg-ink-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
