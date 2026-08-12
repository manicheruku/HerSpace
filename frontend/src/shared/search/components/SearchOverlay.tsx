import type { JSX, KeyboardEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { SearchInput } from "@/shared/search/components/SearchInput";
import { SearchResults } from "@/shared/search/components/SearchResults";
import {
  RecentSearches,
  SearchError,
  SearchLoading,
  SearchNoResults,
} from "@/shared/search/components/SearchStates";
import { useGlobalSearch } from "@/shared/search/useGlobalSearch";
import { useSearchHistory } from "@/shared/search/useSearchHistory";
import type { FlatHit } from "@/shared/search/types";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

/**
 * The Spotlight/Raycast-style search experience: a centered panel on desktop
 * and a top sheet on mobile, with grouped results and full keyboard control.
 */
export function SearchOverlay({ open, onClose }: SearchOverlayProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const { data, isSearching, isError, refetch, hasQuery } = useGlobalSearch(query);
  const { history, addSearch, removeSearch, clearHistory } = useSearchHistory();

  // A single flat list of hits mirrors the visual order for keyboard nav.
  const flatHits = useMemo<FlatHit[]>(
    () =>
      data.groups.flatMap((group) =>
        group.hits.map((hit) => ({
          ...hit,
          module: group.module,
          moduleTitle: group.title,
          moduleIcon: group.icon,
        })),
      ),
    [data.groups],
  );

  // Reset transient state whenever the overlay opens or the query changes.
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, data.groups]);

  function handleSelect(hit: FlatHit): void {
    addSearch(query);
    onClose();
    navigate(hit.route);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (flatHits.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % flatHits.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + flatHits.length) % flatHits.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const hit = flatHits[activeIndex];
      if (hit) handleSelect(hit);
    }
  }

  function renderBody(): JSX.Element {
    if (!hasQuery) {
      return (
        <RecentSearches
          history={history}
          onPick={setQuery}
          onRemove={removeSearch}
          onClear={clearHistory}
        />
      );
    }
    if (isError) return <SearchError onRetry={refetch} />;
    if (isSearching && data.groups.length === 0) return <SearchLoading />;
    if (data.total === 0) return <SearchNoResults query={query.trim()} />;
    return (
      <SearchResults
        groups={data.groups}
        query={query.trim()}
        activeIndex={activeIndex}
        onSelect={handleSelect}
        onHover={setActiveIndex}
      />
    );
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[8vh] sm:pt-[12vh]"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-ink-900/30 backdrop-blur-sm"
            aria-label="Close search"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Global search"
            className="relative z-10 flex max-h-[76vh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius-card)] bg-card shadow-[var(--shadow-raised)] ring-1 ring-black/5"
            initial={reduceMotion ? false : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <SearchInput
              value={query}
              onChange={setQuery}
              onKeyDown={handleKeyDown}
              isSearching={isSearching}
            />
            <div className="min-h-0 flex-1 overflow-y-auto">{renderBody()}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
