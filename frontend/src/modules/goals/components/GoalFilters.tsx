import type { JSX } from "react";

import { Chip } from "@/components/ui";

interface GoalFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  showCompleted: boolean;
  onToggleCompleted: () => void;
  showArchived: boolean;
  onToggleArchived: () => void;
}

/** Search + completion/archive filters for the goals list. */
export function GoalFilters({
  query,
  onQueryChange,
  showCompleted,
  onToggleCompleted,
  showArchived,
  onToggleArchived,
}: GoalFiltersProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-[var(--radius-pill)] border border-border bg-card px-4 py-2.5">
        <svg viewBox="0 0 24 24" fill="none" className="size-4 text-ink-300" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search your goals…"
          className="flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-300"
          aria-label="Search goals"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="text-ink-300 transition hover:text-ink-500"
            aria-label="Clear goals search"
          >
            ×
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Chip selected={showCompleted} onClick={onToggleCompleted} leftIcon="✅">
          Completed
        </Chip>
        <Chip selected={showArchived} onClick={onToggleArchived} leftIcon="🗄️">
          Archived
        </Chip>
      </div>
    </div>
  );
}
