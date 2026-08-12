import type { JSX } from "react";

import { Chip } from "@/components/ui";

interface NoteFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  pinnedOnly: boolean;
  onTogglePinned: () => void;
  tags: string[];
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
}

/** Search + pinned + tag filters for the notes list. */
export function NoteFilters({
  query,
  onQueryChange,
  pinnedOnly,
  onTogglePinned,
  tags,
  activeTag,
  onTagChange,
}: NoteFiltersProps): JSX.Element {
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
          placeholder="Search your notes…"
          className="flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-300"
          aria-label="Search notes"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="text-ink-300 transition hover:text-ink-500"
            aria-label="Clear notes search"
          >
            ×
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Chip selected={pinnedOnly} onClick={onTogglePinned} leftIcon="📌">
          Pinned
        </Chip>
        {tags.map((tag) => (
          <Chip
            key={tag}
            selected={activeTag === tag}
            onClick={() => onTagChange(activeTag === tag ? null : tag)}
          >
            #{tag}
          </Chip>
        ))}
      </div>
    </div>
  );
}
