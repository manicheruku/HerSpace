import type { JSX } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { MOOD_META, formatRelativeTime, previewText } from "@/modules/journal/utils/journal.format";
import type { JournalEntry } from "@/modules/journal/types/journal.types";

interface JournalEntryCardProps {
  entry: JournalEntry;
  onOpen: (entry: JournalEntry) => void;
  onToggleFavorite: (entry: JournalEntry) => void;
}

/** A journal entry summary card in the list. */
export function JournalEntryCard({
  entry,
  onOpen,
  onToggleFavorite,
}: JournalEntryCardProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const mood = entry.mood ? MOOD_META[entry.mood] : null;

  return (
    <motion.div
      layout={!reduceMotion}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="relative overflow-hidden rounded-[var(--radius-card)] bg-card shadow-[var(--shadow-card)] ring-1 ring-black/5"
    >
      <button
        type="button"
        onClick={() => onOpen(entry)}
        className="flex w-full flex-col gap-2 px-4 py-3.5 text-left"
        aria-label={`Open ${entry.title}`}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 truncate font-display text-base font-semibold text-ink-900">
            {entry.title}
          </h3>
          {mood ? (
            <span className="shrink-0 text-lg" aria-label={mood.label}>
              {mood.emoji}
            </span>
          ) : null}
        </div>
        <p className="line-clamp-2 text-sm text-ink-500">{previewText(entry.content)}</p>
        <div className="flex items-center gap-2">
          {entry.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-[var(--radius-pill)] bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      </button>

      <div className="flex items-center justify-between border-t border-border px-4 py-2">
        <span className="text-xs text-ink-300">{formatRelativeTime(entry.updatedAt)}</span>
        <button
          type="button"
          onClick={() => onToggleFavorite(entry)}
          className="rounded-full p-1 text-lg transition hover:scale-110"
          aria-pressed={entry.isFavorite}
          aria-label={entry.isFavorite ? "Remove favorite" : "Add favorite"}
        >
          {entry.isFavorite ? "⭐" : "☆"}
        </button>
      </div>
    </motion.div>
  );
}
