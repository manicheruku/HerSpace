import type { JSX } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import { Button, ErrorState, LoadingState, Modal, useToast } from "@/components/ui";
import { NoteEditorSheet } from "@/modules/notes/components/NoteEditorSheet";
import { useNote } from "@/modules/notes/hooks/useNotes";
import { useNoteMutations } from "@/modules/notes/hooks/useNoteMutations";
import { NOTE_COLOR_META, formatLongDate } from "@/modules/notes/utils/notes.format";
import type { NoteInput } from "@/modules/notes/types/notes.types";

export function NoteEntryPage(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const params = useParams<{ id: string }>();
  const id = params.id ? Number(params.id) : null;

  const { note, isLoading, isError, refetch } = useNote(id);
  const { update, remove, pin } = useNoteMutations();

  const [editorOpen, setEditorOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleUpdate(input: NoteInput): void {
    if (!note) return;
    update.mutate(
      { id: note.id, input },
      {
        onSuccess: () => {
          setEditorOpen(false);
          showToast("Note updated", "success");
        },
        onError: () => showToast("Couldn't update note", "error"),
      },
    );
  }

  function handleDelete(): void {
    if (!note) return;
    remove.mutate(note.id, {
      onSuccess: () => {
        showToast("Note deleted", "success");
        navigate("/notes");
      },
      onError: () => showToast("Couldn't delete note", "error"),
    });
  }

  if (isLoading) return <LoadingState label="Loading note" />;
  if (isError || !note) {
    return (
      <ErrorState
        title="Note not found"
        description="It may have been deleted."
        onRetry={id ? refetch : undefined}
      />
    );
  }

  const palette = note.color ? NOTE_COLOR_META[note.color] : null;

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
          onClick={() => navigate("/notes")}
          className="flex items-center gap-1 self-start text-sm text-ink-500 transition hover:text-ink-700"
        >
          <span aria-hidden="true">‹</span> Notes
        </button>

        <header className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h1 className="flex min-w-0 items-center gap-2 font-display text-2xl font-semibold text-ink-900">
              {palette ? (
                <span className={`size-3 shrink-0 rounded-full ${palette.dot}`} aria-hidden="true" />
              ) : null}
              <span className="min-w-0 break-words">{note.title}</span>
            </h1>
            <button
              type="button"
              onClick={() => pin.mutate(note.id)}
              className="shrink-0 rounded-full p-1 text-2xl transition hover:scale-110"
              aria-pressed={note.isPinned}
              aria-label={note.isPinned ? "Unpin note" : "Pin note"}
            >
              {note.isPinned ? "📌" : "📍"}
            </button>
          </div>
          <span className="text-sm text-ink-300">{formatLongDate(note.createdAt)}</span>
        </header>

        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-700">
          {note.content}
        </p>

        {note.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag) => (
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

      <NoteEditorSheet
        open={editorOpen}
        entry={note}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleUpdate}
        isSubmitting={update.isPending}
      />

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete note?">
        <p className="text-sm text-ink-500">
          This will permanently remove “{note.title}”. This can't be undone.
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
