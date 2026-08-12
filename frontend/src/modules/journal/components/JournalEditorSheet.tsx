import type { FormEvent, JSX } from "react";
import { useEffect, useState } from "react";

import { BottomSheet, Button, Input } from "@/components/ui";
import { MoodPicker } from "@/modules/journal/components/MoodPicker";
import { TagInput } from "@/shared/components/TagInput";
import type {
  JournalEntry,
  JournalEntryInput,
  JournalMood,
} from "@/modules/journal/types/journal.types";

export interface JournalEditorSheetProps {
  open: boolean;
  /** Entry being edited, or `null` to create a new one. */
  entry: JournalEntry | null;
  onClose: () => void;
  onSubmit: (input: JournalEntryInput) => void;
  isSubmitting?: boolean;
}

interface DraftState {
  title: string;
  content: string;
  mood: JournalMood | null;
  tags: string[];
  isFavorite: boolean;
}

const EMPTY_DRAFT: DraftState = {
  title: "",
  content: "",
  mood: null,
  tags: [],
  isFavorite: false,
};

/** Create/edit a journal entry in a bottom sheet. Reused across surfaces. */
export function JournalEditorSheet({
  open,
  entry,
  onClose,
  onSubmit,
  isSubmitting = false,
}: JournalEditorSheetProps): JSX.Element {
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);

  // Seed the draft whenever the sheet opens (edit → prefill, create → blank).
  useEffect(() => {
    if (!open) return;
    setDraft(
      entry
        ? {
            title: entry.title,
            content: entry.content,
            mood: entry.mood,
            tags: entry.tags,
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
      mood: draft.mood,
      tags: draft.tags,
      isFavorite: draft.isFavorite,
    });
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={entry ? "Edit entry" : "New entry"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Title"
          placeholder="Give it a title…"
          value={draft.title}
          onChange={(event) => setDraft((d) => ({ ...d, title: event.target.value }))}
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-700">Entry</span>
          <textarea
            value={draft.content}
            onChange={(event) => setDraft((d) => ({ ...d, content: event.target.value }))}
            placeholder="What's on your mind?"
            rows={6}
            className="w-full resize-none rounded-[var(--radius-md)] border border-border bg-card px-3.5 py-2.5 text-sm text-ink-900 outline-none transition focus:border-blossom-300 placeholder:text-ink-300"
          />
        </div>

        <MoodPicker
          value={draft.mood}
          onChange={(mood) => setDraft((d) => ({ ...d, mood }))}
        />

        <TagInput tags={draft.tags} onChange={(tags) => setDraft((d) => ({ ...d, tags }))} />

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
          {entry ? "Save changes" : "Save entry"}
        </Button>
      </form>
    </BottomSheet>
  );
}
