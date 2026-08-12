import type { JSX } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";

import { Button, EmptyState, ErrorState, useToast } from "@/components/ui";
import { JournalEntryCard } from "@/modules/journal/components/JournalEntryCard";
import { JournalEditorSheet } from "@/modules/journal/components/JournalEditorSheet";
import { JournalFilters } from "@/modules/journal/components/JournalFilters";
import { useJournalEntries } from "@/modules/journal/hooks/useJournalEntries";
import { useJournalMutations } from "@/modules/journal/hooks/useJournalMutations";
import type { JournalEntry, JournalEntryInput } from "@/modules/journal/types/journal.types";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

export function JournalListPage(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { entries, isLoading, isError, refetch } = useJournalEntries();
  const { create, favorite } = useJournalMutations();

  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((entry) => entry.tags.forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (favoritesOnly && !entry.isFavorite) return false;
      if (activeTag && !entry.tags.includes(activeTag)) return false;
      if (q && !`${entry.title} ${entry.content}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [entries, query, favoritesOnly, activeTag]);

  function handleOpen(entry: JournalEntry): void {
    navigate(`/journal/${entry.id}`);
  }

  function handleToggleFavorite(entry: JournalEntry): void {
    favorite.mutate(entry.id);
  }

  function handleCreate(input: JournalEntryInput): void {
    create.mutate(input, {
      onSuccess: () => {
        setEditorOpen(false);
        showToast("Entry saved", "success");
      },
      onError: () => showToast("Couldn't save entry", "error"),
    });
  }

  const header = (
    <div className="flex flex-col gap-3 px-1">
      <button
        type="button"
        onClick={() => navigate("/explore")}
        className="flex items-center gap-1 self-start text-sm text-ink-500 transition hover:text-ink-700"
      >
        <span aria-hidden="true">‹</span> Explore
      </button>
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Journal</h1>
          <p className="mt-0.5 text-sm text-ink-500">Capture how today felt.</p>
        </div>
        <Button size="sm" leftIcon="+" onClick={() => setEditorOpen(true)}>
          New
        </Button>
      </header>
    </div>
  );

  function renderBody(): JSX.Element {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-[var(--radius-card)] bg-ink-100/70"
            />
          ))}
        </div>
      );
    }
    if (isError) {
      return (
        <ErrorState
          title="Couldn't load your journal"
          description="Please check your connection and try again."
          onRetry={refetch}
        />
      );
    }
    if (entries.length === 0) {
      return (
        <EmptyState
          icon="📔"
          title="Your journal is empty"
          description="Write your first entry — a thought, a win, or how your day went."
          action={
            <Button size="sm" leftIcon="+" onClick={() => setEditorOpen(true)}>
              New entry
            </Button>
          }
        />
      );
    }
    if (filtered.length === 0) {
      return (
        <EmptyState
          icon="🔍"
          title="No matching entries"
          description="Try clearing a filter or searching for something else."
        />
      );
    }
    return (
      <motion.div
        className="flex flex-col gap-3"
        variants={reduceMotion ? undefined : containerVariants}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
      >
        <AnimatePresence initial={false}>
          {filtered.map((entry) => (
            <motion.div
              key={entry.id}
              variants={reduceMotion ? undefined : itemVariants}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
              layout={!reduceMotion}
            >
              <JournalEntryCard
                entry={entry}
                onOpen={handleOpen}
                onToggleFavorite={handleToggleFavorite}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className="flex flex-col gap-5 pb-8"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
      >
        {header}
        {entries.length > 0 ? (
          <JournalFilters
            query={query}
            onQueryChange={setQuery}
            favoritesOnly={favoritesOnly}
            onToggleFavorites={() => setFavoritesOnly((v) => !v)}
            tags={allTags}
            activeTag={activeTag}
            onTagChange={setActiveTag}
          />
        ) : null}
        {renderBody()}
      </motion.div>

      <JournalEditorSheet
        open={editorOpen}
        entry={null}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={create.isPending}
      />
    </>
  );
}
