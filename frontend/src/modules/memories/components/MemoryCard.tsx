import type { JSX } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  formatLongDate,
  formatRelativeTime,
  MEMORY_MOOD_META,
  previewText,
} from "@/modules/memories/utils/memories.format";
import type { Memory } from "@/modules/memories/types/memories.types";

interface MemoryCardProps {
  memory: Memory;
  onOpen: (memory: Memory) => void;
  onToggleFavorite: (memory: Memory) => void;
}

/** A memory summary card in the list. */
export function MemoryCard({ memory, onOpen, onToggleFavorite }: MemoryCardProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const mood = memory.mood ? MEMORY_MOOD_META[memory.mood] : null;

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
        onClick={() => onOpen(memory)}
        className="flex w-full flex-col gap-2 px-4 py-3.5 text-left"
        aria-label={`Open ${memory.title}`}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 truncate font-display text-base font-semibold text-ink-900">
            {memory.title}
          </h3>
          {memory.isFavorite ? (
            <span className="shrink-0 text-sm" aria-label="Favorited">
              ⭐
            </span>
          ) : null}
        </div>

        <p className="line-clamp-2 text-sm text-ink-500">{previewText(memory.content)}</p>

        <div className="flex items-center justify-between text-xs text-ink-300">
          <span>{formatLongDate(memory.memoryOn)}</span>
          {mood ? (
            <span className="rounded-[var(--radius-pill)] bg-surface px-2 py-0.5 text-ink-500">
              {mood.emoji} {mood.label}
            </span>
          ) : null}
        </div>
      </button>

      <div className="flex items-center justify-between border-t border-border/60 px-4 py-2">
        <span className="text-xs text-ink-300">{formatRelativeTime(memory.updatedAt)}</span>
        <button
          type="button"
          onClick={() => onToggleFavorite(memory)}
          className="rounded-full p-1 text-base transition hover:scale-110"
          aria-pressed={memory.isFavorite}
          aria-label={memory.isFavorite ? "Remove favorite" : "Mark favorite"}
        >
          {memory.isFavorite ? "⭐" : "☆"}
        </button>
      </div>
    </motion.div>
  );
}
