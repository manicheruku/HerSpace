import type { JSX } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";

import { Button, EmptyState, ErrorState, useToast } from "@/components/ui";
import { MemoryCard } from "@/modules/memories/components/MemoryCard";
import { MemoryEditorSheet } from "@/modules/memories/components/MemoryEditorSheet";
import { MemoryFilters } from "@/modules/memories/components/MemoryFilters";
import { useMemories } from "@/modules/memories/hooks/useMemories";
import { useMemoryMutations } from "@/modules/memories/hooks/useMemoryMutations";
import type {
  Memory,
  MemoryInput,
  MemoryMood,
} from "@/modules/memories/types/memories.types";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

export function MemoriesListPage(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [activeMood, setActiveMood] = useState<MemoryMood | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);

  const { memories, isLoading, isError, refetch } = useMemories({
    favorite: favoritesOnly,
    mood: activeMood,
    query,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });
  const { create, favorite } = useMemoryMutations();

  function handleOpen(memory: Memory): void {
    navigate(`/memories/${memory.id}`);
  }

  function handleToggleFavorite(memory: Memory): void {
    favorite.mutate(memory.id);
  }

  function handleCreate(input: MemoryInput): void {
    create.mutate(input, {
      onSuccess: () => {
        setEditorOpen(false);
        showToast("Memory saved", "success");
      },
      onError: () => showToast("Couldn't save memory", "error"),
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
          <h1 className="font-display text-2xl font-semibold text-ink-900">Memories</h1>
          <p className="mt-0.5 text-sm text-ink-500">Keep the little moments worth remembering.</p>
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
              className="h-32 animate-pulse rounded-[var(--radius-card)] bg-ink-100/70"
            />
          ))}
        </div>
      );
    }
    if (isError) {
      return (
        <ErrorState
          title="Couldn't load your memories"
          description="Please check your connection and try again."
          onRetry={refetch}
        />
      );
    }
    if (memories.length === 0) {
      return (
        <EmptyState
          icon="📸"
          title="No memories yet"
          description="Capture your first moment so you can revisit it later."
          action={
            <Button size="sm" leftIcon="+" onClick={() => setEditorOpen(true)}>
              New memory
            </Button>
          }
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
          {memories.map((memory) => (
            <motion.div
              key={memory.id}
              variants={reduceMotion ? undefined : itemVariants}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
              layout={!reduceMotion}
            >
              <MemoryCard
                memory={memory}
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
        <MemoryFilters
          query={query}
          onQueryChange={setQuery}
          favoritesOnly={favoritesOnly}
          onToggleFavorites={() => setFavoritesOnly((v) => !v)}
          activeMood={activeMood}
          onMoodChange={setActiveMood}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
        />
        {renderBody()}
      </motion.div>

      <MemoryEditorSheet
        open={editorOpen}
        entry={null}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={create.isPending}
      />
    </>
  );
}
