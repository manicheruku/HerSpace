import type { JSX } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { HighlightedText } from "@/shared/search/components/HighlightedText";
import type { FlatHit } from "@/shared/search/types";

interface SearchResultItemProps {
  hit: FlatHit;
  query: string;
  isActive: boolean;
  onSelect: (hit: FlatHit) => void;
  onHover: () => void;
}

const ChevronRight = (
  <svg viewBox="0 0 24 24" fill="none" className="size-4 shrink-0 text-ink-300" aria-hidden="true">
    <path
      d="m9 6 6 6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** A single search result row with keyword highlighting and active styling. */
export function SearchResultItem({
  hit,
  query,
  isActive,
  onSelect,
  onHover,
}: SearchResultItemProps): JSX.Element {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      layout={!reduceMotion}
      onClick={() => onSelect(hit)}
      onMouseEnter={onHover}
      className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left transition-colors ${
        isActive ? "bg-blossom-50" : "hover:bg-surface"
      }`}
      aria-label={`Open ${hit.title}`}
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-surface text-lg"
        aria-hidden="true"
      >
        {hit.moduleIcon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink-900">
          <HighlightedText text={hit.title} query={query} />
        </span>
        {hit.preview ? (
          <span className="block truncate text-xs text-ink-500">
            <HighlightedText text={hit.preview} query={query} />
          </span>
        ) : null}
      </span>
      {ChevronRight}
    </motion.button>
  );
}
