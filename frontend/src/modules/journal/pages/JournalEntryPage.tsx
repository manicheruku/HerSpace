import type { JSX } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import { Button, ErrorState, LoadingState, Modal, useToast } from "@/components/ui";
import { JournalEditorSheet } from "@/modules/journal/components/JournalEditorSheet";
import { useJournalEntry } from "@/modules/journal/hooks/useJournalEntries";
import { useJournalMutations } from "@/modules/journal/hooks/useJournalMutations";
import { MOOD_META, formatLongDate } from "@/modules/journal/utils/journal.format";
import type { JournalEntryInput } from "@/modules/journal/types/journal.types";

export function JournalEntryPage(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const params = useParams<{ id: string }>();
  const id = params.id ? Number(params.id) : null;

  const { entry, isLoading, isError, refetch } = useJournalEntry(id);
  const { update, remove, favorite } = useJournalMutations();

  const [editorOpen, setEditorOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleUpdate(input: JournalEntryInput): void {
    if (!entry) return;
    update.mutate(
      { id: entry.id, input },
      {
        onSuccess: () => {
          setEditorOpen(false);
          showToast("Entry updated", "success");
        },
        onError: () => showToast("Couldn't update entry", "error"),
      },
    );
  }

  function handleDelete(): void {
    if (!entry) return;
    remove.mutate(entry.id, {
      onSuccess: () => {
        showToast("Entry deleted", "success");
        navigate("/journal");
      },
      onError: () => showToast("Couldn't delete entry", "error"),
    });
  }

  if (isLoading) return <LoadingState label="Loading entry" />;
  if (isError || !entry) {
    return (
      <ErrorState
        title="Entry not found"
        description="It may have been deleted."
        onRetry={id ? refetch : undefined}
      />
    );
  }

  const mood = entry.mood ? MOOD_META[entry.mood] : null;

  return (
    <>
      <motion.article
        className="flex flex-col gap-4 pb-8"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
      >
        <button
          type="button"
          onClick={() => navigate("/journal")}
          className="flex items-center gap-1 self-start text-sm text-ink-500 transition hover:text-ink-700"
        >
          <span aria-hidden="true">‹</span> Journal
        </button>

        <header className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl font-semibold text-ink-900">{entry.title}</h1>
            <button
              type="button"
              onClick={() => favorite.mutate(entry.id)}
              className="shrink-0 rounded-full p-1 text-2xl transition hover:scale-110"
              aria-pressed={entry.isFavorite}
              aria-label={entry.isFavorite ? "Remove favorite" : "Add favorite"}
            >
              {entry.isFavorite ? "⭐" : "☆"}
            </button>
          </div>
          <div className="flex items-center gap-3 text-sm text-ink-300">
            <span>{formatLongDate(entry.createdAt)}</span>
            {mood ? (
              <span className="flex items-center gap-1">
                <span aria-hidden="true">{mood.emoji}</span>
                {mood.label}
              </span>
            ) : null}
          </div>
        </header>

        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-700">
          {entry.content}
        </p>

        {entry.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-[var(--radius-pill)] bg-lilac-100 px-2.5 py-0.5 text-xs font-medium text-ink-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-2 flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditorOpen(true)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
        </div>
      </motion.article>

      <JournalEditorSheet
        open={editorOpen}
        entry={entry}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleUpdate}
        isSubmitting={update.isPending}
      />

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete entry?">
        <p className="text-sm text-ink-500">
          This will permanently remove “{entry.title}”. This can't be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" isLoading={remove.isPending} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
