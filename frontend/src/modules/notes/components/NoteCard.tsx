import type { JSX } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { NOTE_COLOR_META, formatRelativeTime, previewText } from "@/modules/notes/utils/notes.format";
import type { Note } from "@/modules/notes/types/notes.types";

interface NoteCardProps {
  note: Note;
  onOpen: (note: Note) => void;
  onTogglePin: (note: Note) => void;
}

/** A note summary card in the list. */
export function NoteCard({ note, onOpen, onTogglePin }: NoteCardProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const palette = note.color ? NOTE_COLOR_META[note.color] : null;

  return (
    <motion.div
      layout={!reduceMotion}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className={`relative overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-card)] ring-1 ring-black/5 ${
        palette ? `border ${palette.card}` : "bg-card"
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(note)}
        className="flex w-full flex-col gap-2 px-4 py-3.5 text-left"
        aria-label={`Open ${note.title}`}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 truncate font-display text-base font-semibold text-ink-900">
            {note.title}
          </h3>
          {note.isPinned ? (
            <span className="shrink-0 text-sm" aria-label="Pinned">
              📌
            </span>
          ) : null}
        </div>
        <p className="line-clamp-2 text-sm text-ink-500">{previewText(note.content)}</p>
        <div className="flex items-center gap-2">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-[var(--radius-pill)] bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      </button>

      <div className="flex items-center justify-between border-t border-border/60 px-4 py-2">
        <span className="text-xs text-ink-300">{formatRelativeTime(note.updatedAt)}</span>
        <button
          type="button"
          onClick={() => onTogglePin(note)}
          className="rounded-full p-1 text-base transition hover:scale-110"
          aria-pressed={note.isPinned}
          aria-label={note.isPinned ? "Unpin note" : "Pin note"}
        >
          {note.isPinned ? "📌" : "📍"}
        </button>
      </div>
    </motion.div>
  );
}
