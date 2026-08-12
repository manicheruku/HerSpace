import type { FormEvent, JSX } from "react";
import { useEffect, useState } from "react";

import { BottomSheet, Button, Input } from "@/components/ui";
import { MoodPicker } from "@/modules/memories/components/MoodPicker";
import type {
  Memory,
  MemoryInput,
  MemoryMood,
} from "@/modules/memories/types/memories.types";

export interface MemoryEditorSheetProps {
  open: boolean;
  /** Memory being edited, or `null` to create a new one. */
  entry: Memory | null;
  onClose: () => void;
  onSubmit: (input: MemoryInput) => void;
  isSubmitting?: boolean;
}

interface DraftState {
  title: string;
  content: string;
  memoryOn: string;
  mood: MemoryMood | null;
  isFavorite: boolean;
}

const todayISO = new Date().toISOString().slice(0, 10);

const EMPTY_DRAFT: DraftState = {
  title: "",
  content: "",
  memoryOn: todayISO,
  mood: null,
  isFavorite: false,
};

/** Create/edit a memory in a bottom sheet. Reused across surfaces. */
export function MemoryEditorSheet({
  open,
  entry,
  onClose,
  onSubmit,
  isSubmitting = false,
}: MemoryEditorSheetProps): JSX.Element {
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);

  useEffect(() => {
    if (!open) return;
    setDraft(
      entry
        ? {
            title: entry.title,
            content: entry.content,
            memoryOn: entry.memoryOn,
            mood: entry.mood,
            isFavorite: entry.isFavorite,
          }
        : EMPTY_DRAFT,
    );
  }, [open, entry]);

  const canSubmit = draft.title.trim().length > 0 && draft.content.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      title: draft.title.trim(),
      content: draft.content.trim(),
      memoryOn: draft.memoryOn,
      mood: draft.mood,
      isFavorite: draft.isFavorite,
    });
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={entry ? "Edit memory" : "New memory"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Title"
          placeholder="Give this moment a title…"
          value={draft.title}
          onChange={(event) => setDraft((d) => ({ ...d, title: event.target.value }))}
          autoFocus
        />

        <Input
          label="Date"
          type="date"
          value={draft.memoryOn}
          onChange={(event) => setDraft((d) => ({ ...d, memoryOn: event.target.value }))}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-700">Memory</span>
          <textarea
            value={draft.content}
            onChange={(event) => setDraft((d) => ({ ...d, content: event.target.value }))}
            placeholder="Capture what happened, how it felt, and why it mattered."
            rows={6}
            className="w-full resize-none rounded-[var(--radius-md)] border border-border bg-card px-3.5 py-2.5 text-sm text-ink-900 outline-none transition focus:border-blossom-300 placeholder:text-ink-300"
          />
        </div>

        <MoodPicker value={draft.mood} onChange={(mood) => setDraft((d) => ({ ...d, mood }))} />

        <button
          type="button"
          onClick={() => setDraft((d) => ({ ...d, isFavorite: !d.isFavorite }))}
          className="flex items-center gap-2 self-start rounded-[var(--radius-pill)] px-1 py-1 text-sm text-ink-500 transition hover:text-ink-700"
          aria-pressed={draft.isFavorite}
        >
          <span className="text-lg">{draft.isFavorite ? "⭐" : "☆"}</span>
          {draft.isFavorite ? "Favorited" : "Mark as favorite"}
        </button>

        <Button type="submit" fullWidth isLoading={isSubmitting} disabled={!canSubmit}>
          {entry ? "Save changes" : "Save memory"}
        </Button>
      </form>
    </BottomSheet>
  );
}
