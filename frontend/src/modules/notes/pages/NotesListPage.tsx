import type { JSX } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";

import { Button, EmptyState, ErrorState, useToast } from "@/components/ui";
import { NoteCard } from "@/modules/notes/components/NoteCard";
import { NoteEditorSheet } from "@/modules/notes/components/NoteEditorSheet";
import { NoteFilters } from "@/modules/notes/components/NoteFilters";
import { useNotes } from "@/modules/notes/hooks/useNotes";
import { useNoteMutations } from "@/modules/notes/hooks/useNoteMutations";
import type { Note, NoteInput } from "@/modules/notes/types/notes.types";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

export function NotesListPage(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { notes, isLoading, isError, refetch } = useNotes();
  const { create, pin } = useNoteMutations();

  const [query, setQuery] = useState("");
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((note) => note.tags.forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [notes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((note) => {
      if (pinnedOnly && !note.isPinned) return false;
      if (activeTag && !note.tags.includes(activeTag)) return false;
      if (q && !`${note.title} ${note.content}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [notes, query, pinnedOnly, activeTag]);

  function handleOpen(note: Note): void {
    navigate(`/notes/${note.id}`);
  }

  function handleTogglePin(note: Note): void {
    pin.mutate(note.id);
  }

  function handleCreate(input: NoteInput): void {
    create.mutate(input, {
      onSuccess: () => {
        setEditorOpen(false);
        showToast("Note saved", "success");
      },
      onError: () => showToast("Couldn't save note", "error"),
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
          <h1 className="font-display text-2xl font-semibold text-ink-900">Notes</h1>
          <p className="mt-0.5 text-sm text-ink-500">Capture ideas and lists in a tidy place.</p>
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
          title="Couldn't load your notes"
          description="Please check your connection and try again."
          onRetry={refetch}
        />
      );
    }
    if (notes.length === 0) {
      return (
        <EmptyState
          icon="📝"
          title="No notes yet"
          description="Jot down your first note — an idea, a list, or a quick reminder."
          action={
            <Button size="sm" leftIcon="+" onClick={() => setEditorOpen(true)}>
              New note
            </Button>
          }
        />
      );
    }
    if (filtered.length === 0) {
      return (
        <EmptyState
          icon="🔍"
          title="No matching notes"
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
          {filtered.map((note) => (
            <motion.div
              key={note.id}
              variants={reduceMotion ? undefined : itemVariants}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
              layout={!reduceMotion}
            >
              <NoteCard note={note} onOpen={handleOpen} onTogglePin={handleTogglePin} />
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
        {notes.length > 0 ? (
          <NoteFilters
            query={query}
            onQueryChange={setQuery}
            pinnedOnly={pinnedOnly}
            onTogglePinned={() => setPinnedOnly((v) => !v)}
            tags={allTags}
            activeTag={activeTag}
            onTagChange={setActiveTag}
          />
        ) : null}
        {renderBody()}
      </motion.div>

      <NoteEditorSheet
        open={editorOpen}
        entry={null}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={create.isPending}
      />
    </>
  );
}
