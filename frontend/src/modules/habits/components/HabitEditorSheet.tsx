import type { FormEvent, JSX } from "react";
import { useEffect, useState } from "react";

import { BottomSheet, Button, Input } from "@/components/ui";
import { ColorPicker } from "@/modules/habits/components/ColorPicker";
import { EmojiPicker } from "@/modules/habits/components/EmojiPicker";
import type { Habit, HabitColor, HabitInput } from "@/modules/habits/types/habits.types";

export interface HabitEditorSheetProps {
  open: boolean;
  /** Habit being edited, or `null` to create a new one. */
  entry: Habit | null;
  onClose: () => void;
  onSubmit: (input: HabitInput) => void;
  isSubmitting?: boolean;
}

interface DraftState {
  name: string;
  emoji: string | null;
  color: HabitColor | null;
}

const EMPTY_DRAFT: DraftState = {
  name: "",
  emoji: null,
  color: null,
};

/** Create/edit a habit in a bottom sheet. Reused across surfaces. */
export function HabitEditorSheet({
  open,
  entry,
  onClose,
  onSubmit,
  isSubmitting = false,
}: HabitEditorSheetProps): JSX.Element {
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);

  // Seed the draft whenever the sheet opens (edit → prefill, create → blank).
  useEffect(() => {
    if (!open) return;
    setDraft(
      entry
        ? { name: entry.name, emoji: entry.emoji, color: entry.color }
        : EMPTY_DRAFT,
    );
  }, [open, entry]);

  const canSubmit = draft.name.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      name: draft.name.trim(),
      emoji: draft.emoji,
      color: draft.color,
    });
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={entry ? "Edit habit" : "New habit"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Name"
          placeholder="e.g. Drink water, Read 10 pages…"
          value={draft.name}
          onChange={(event) => setDraft((d) => ({ ...d, name: event.target.value }))}
          autoFocus
        />

        <EmojiPicker
          value={draft.emoji}
          onChange={(emoji) => setDraft((d) => ({ ...d, emoji }))}
        />

        <ColorPicker
          value={draft.color}
          onChange={(color) => setDraft((d) => ({ ...d, color }))}
        />

        <Button type="submit" fullWidth isLoading={isSubmitting} disabled={!canSubmit}>
          {entry ? "Save changes" : "Create habit"}
        </Button>
      </form>
    </BottomSheet>
  );
}
