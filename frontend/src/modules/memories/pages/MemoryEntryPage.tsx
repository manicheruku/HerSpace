import type { JSX } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import { Button, ErrorState, LoadingState, Modal, useToast } from "@/components/ui";
import { MemoryEditorSheet } from "@/modules/memories/components/MemoryEditorSheet";
import { useMemory } from "@/modules/memories/hooks/useMemories";
import { useMemoryMutations } from "@/modules/memories/hooks/useMemoryMutations";
import {
  formatLongDate,
  MEMORY_MOOD_META,
} from "@/modules/memories/utils/memories.format";
import type { MemoryInput } from "@/modules/memories/types/memories.types";

export function MemoryEntryPage(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const params = useParams<{ id: string }>();
  const id = params.id ? Number(params.id) : null;

  const { memory, isLoading, isError, refetch } = useMemory(id);
  const { update, remove, favorite } = useMemoryMutations();

  const [editorOpen, setEditorOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleUpdate(input: MemoryInput): void {
    if (!memory) return;
    update.mutate(
      { id: memory.id, input },
      {
        onSuccess: () => {
          setEditorOpen(false);
          showToast("Memory updated", "success");
        },
        onError: () => showToast("Couldn't update memory", "error"),
      },
    );
  }

  function handleDelete(): void {
    if (!memory) return;
    remove.mutate(memory.id, {
      onSuccess: () => {
        showToast("Memory deleted", "success");
        navigate("/memories");
      },
      onError: () => showToast("Couldn't delete memory", "error"),
    });
  }

  if (isLoading) return <LoadingState label="Loading memory" />;
  if (isError || !memory) {
    return (
      <ErrorState
        title="Memory not found"
        description="It may have been deleted."
        onRetry={id ? refetch : undefined}
      />
    );
  }

  const mood = memory.mood ? MEMORY_MOOD_META[memory.mood] : null;

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
          onClick={() => navigate("/memories")}
          className="flex items-center gap-1 self-start text-sm text-ink-500 transition hover:text-ink-700"
        >
          <span aria-hidden="true">‹</span> Memories
        </button>

        <header className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h1 className="flex min-w-0 items-center gap-2 font-display text-2xl font-semibold text-ink-900">
              <span className="min-w-0 break-words">{memory.title}</span>
            </h1>
            <button
              type="button"
              onClick={() => favorite.mutate(memory.id)}
              className="shrink-0 rounded-full p-1 text-2xl transition hover:scale-110"
              aria-pressed={memory.isFavorite}
              aria-label={memory.isFavorite ? "Remove favorite" : "Mark favorite"}
            >
              {memory.isFavorite ? "⭐" : "☆"}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-ink-400">
            <span>{formatLongDate(memory.memoryOn)}</span>
            {mood ? (
              <>
                <span>•</span>
                <span>
                  {mood.emoji} {mood.label}
                </span>
              </>
            ) : null}
          </div>
        </header>

        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-700">
          {memory.content}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditorOpen(true)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
        </div>
      </motion.article>

      <MemoryEditorSheet
        open={editorOpen}
        entry={memory}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleUpdate}
        isSubmitting={update.isPending}
      />

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete memory?">
        <p className="text-sm text-ink-500">
          This will permanently remove “{memory.title}”. This can't be undone.
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
