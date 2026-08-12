import type { FormEvent, JSX } from "react";
import { useEffect, useState } from "react";

import { BottomSheet, Button, Input } from "@/components/ui";
import { ColorPicker } from "@/modules/notes/components/ColorPicker";
import { TagInput } from "@/shared/components/TagInput";
import type { Note, NoteColor, NoteInput } from "@/modules/notes/types/notes.types";

export interface NoteEditorSheetProps {
  open: boolean;
  /** Note being edited, or `null` to create a new one. */
  entry: Note | null;
  onClose: () => void;
  onSubmit: (input: NoteInput) => void;
  isSubmitting?: boolean;
}

interface DraftState {
  title: string;
  content: string;
  color: NoteColor | null;
  tags: string[];
  isPinned: boolean;
}

const EMPTY_DRAFT: DraftState = {
  title: "",
  content: "",
  color: null,
  tags: [],
  isPinned: false,
};

/** Create/edit a note in a bottom sheet. Reused across surfaces. */
export function NoteEditorSheet({
  open,
  entry,
  onClose,
  onSubmit,
  isSubmitting = false,
}: NoteEditorSheetProps): JSX.Element {
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);

  // Seed the draft whenever the sheet opens (edit → prefill, create → blank).
  useEffect(() => {
    if (!open) return;
    setDraft(
      entry
        ? {
            title: entry.title,
            content: entry.content,
            color: entry.color,
            tags: entry.tags,
            isPinned: entry.isPinned,
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
      color: draft.color,
      tags: draft.tags,
      isPinned: draft.isPinned,
    });
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={entry ? "Edit note" : "New note"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Title"
          placeholder="Give it a title…"
          value={draft.title}
          onChange={(event) => setDraft((d) => ({ ...d, title: event.target.value }))}
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-700">Note</span>
          <textarea
            value={draft.content}
            onChange={(event) => setDraft((d) => ({ ...d, content: event.target.value }))}
            placeholder="Write your note…"
            rows={6}
            className="w-full resize-none rounded-[var(--radius-md)] border border-border bg-card px-3.5 py-2.5 text-sm text-ink-900 outline-none transition focus:border-blossom-300 placeholder:text-ink-300"
          />
        </div>

        <ColorPicker
          value={draft.color}
          onChange={(color) => setDraft((d) => ({ ...d, color }))}
        />

        <TagInput tags={draft.tags} onChange={(tags) => setDraft((d) => ({ ...d, tags }))} />

        <button
          type="button"
          onClick={() => setDraft((d) => ({ ...d, isPinned: !d.isPinned }))}
          className="flex items-center gap-2 self-start rounded-[var(--radius-pill)] px-1 py-1 text-sm text-ink-500 transition hover:text-ink-700"
          aria-pressed={draft.isPinned}
        >
          <span className="text-lg">{draft.isPinned ? "📌" : "📍"}</span>
          {draft.isPinned ? "Pinned to top" : "Pin to top"}
        </button>

        <Button type="submit" fullWidth isLoading={isSubmitting} disabled={!canSubmit}>
          {entry ? "Save changes" : "Save note"}
        </Button>
      </form>
    </BottomSheet>
  );
}
