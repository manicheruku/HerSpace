import type { JSX } from "react";

import { Chip, Input } from "@/components/ui";
import {
  MEMORY_MOOD_META,
  MEMORY_MOOD_ORDER,
} from "@/modules/memories/utils/memories.format";
import type { MemoryMood } from "@/modules/memories/types/memories.types";

interface MemoryFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  favoritesOnly: boolean;
  onToggleFavorites: () => void;
  activeMood: MemoryMood | null;
  onMoodChange: (value: MemoryMood | null) => void;
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
}

/** Search + favorite + mood + date filters for the memories list. */
export function MemoryFilters({
  query,
  onQueryChange,
  favoritesOnly,
  onToggleFavorites,
  activeMood,
  onMoodChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}: MemoryFiltersProps): JSX.Element {
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
          placeholder="Search your memories…"
          className="flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-300"
          aria-label="Search memories"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="text-ink-300 transition hover:text-ink-500"
            aria-label="Clear memories search"
          >
            ×
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip selected={favoritesOnly} onClick={onToggleFavorites} leftIcon="⭐">
          Favorites
        </Chip>
        <Chip selected={activeMood === null} onClick={() => onMoodChange(null)}>
          All moods
        </Chip>
        {MEMORY_MOOD_ORDER.map((mood) => {
          const meta = MEMORY_MOOD_META[mood];
          return (
            <Chip
              key={mood}
              selected={activeMood === mood}
              onClick={() => onMoodChange(activeMood === mood ? null : mood)}
              leftIcon={meta.emoji}
            >
              {meta.label}
            </Chip>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="From"
          type="date"
          value={fromDate}
          onChange={(event) => onFromDateChange(event.target.value)}
        />
        <Input
          label="To"
          type="date"
          value={toDate}
          onChange={(event) => onToDateChange(event.target.value)}
        />
      </div>
    </div>
  );
}
