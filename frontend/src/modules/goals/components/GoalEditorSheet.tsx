import type { FormEvent, JSX } from "react";
import { useEffect, useState } from "react";

import { BottomSheet, Button, Input } from "@/components/ui";
import type { Goal, GoalInput } from "@/modules/goals/types/goals.types";

export interface GoalEditorSheetProps {
  open: boolean;
  /** Goal being edited, or `null` to create a new one. */
  entry: Goal | null;
  onClose: () => void;
  onSubmit: (input: GoalInput) => void;
  isSubmitting?: boolean;
}

interface DraftState {
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  dueDate: string;
}

const EMPTY_DRAFT: DraftState = {
  title: "",
  description: "",
  targetValue: 1,
  currentValue: 0,
  unit: "",
  dueDate: "",
};

/** Create/edit a goal in a bottom sheet. Reused across surfaces. */
export function GoalEditorSheet({
  open,
  entry,
  onClose,
  onSubmit,
  isSubmitting = false,
}: GoalEditorSheetProps): JSX.Element {
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);

  useEffect(() => {
    if (!open) return;
    setDraft(
      entry
        ? {
            title: entry.title,
            description: entry.description ?? "",
            targetValue: entry.targetValue,
            currentValue: entry.currentValue,
            unit: entry.unit ?? "",
            dueDate: entry.dueDate ?? "",
          }
        : EMPTY_DRAFT,
    );
  }, [open, entry]);

  const canSubmit = draft.title.trim().length > 0 && draft.targetValue >= 1;

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!canSubmit) return;

    const targetValue = Math.max(1, Math.floor(draft.targetValue));
    const currentValue = Math.max(0, Math.floor(draft.currentValue));

    onSubmit({
      title: draft.title.trim(),
      description: draft.description.trim() || null,
      targetValue,
      currentValue,
      unit: draft.unit.trim() || null,
      dueDate: draft.dueDate || null,
    });
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={entry ? "Edit goal" : "New goal"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Title"
          placeholder="e.g. Read 12 books this year"
          value={draft.title}
          onChange={(event) => setDraft((d) => ({ ...d, title: event.target.value }))}
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-700">Description</span>
          <textarea
            value={draft.description}
            onChange={(event) => setDraft((d) => ({ ...d, description: event.target.value }))}
            placeholder="Optional details"
            rows={4}
            className="w-full resize-none rounded-[var(--radius-md)] border border-border bg-card px-3.5 py-2.5 text-sm text-ink-900 outline-none transition focus:border-blossom-300 placeholder:text-ink-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Current"
            type="number"
            min={0}
            value={String(draft.currentValue)}
            onChange={(event) =>
              setDraft((d) => ({ ...d, currentValue: Number(event.target.value || "0") }))
            }
          />
          <Input
            label="Target"
            type="number"
            min={1}
            value={String(draft.targetValue)}
            onChange={(event) =>
              setDraft((d) => ({ ...d, targetValue: Number(event.target.value || "1") }))
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Unit"
            placeholder="books, km, sessions…"
            value={draft.unit}
            onChange={(event) => setDraft((d) => ({ ...d, unit: event.target.value }))}
          />
          <Input
            label="Due date"
            type="date"
            value={draft.dueDate}
            onChange={(event) => setDraft((d) => ({ ...d, dueDate: event.target.value }))}
          />
        </div>

        <Button type="submit" fullWidth isLoading={isSubmitting} disabled={!canSubmit}>
          {entry ? "Save changes" : "Create goal"}
        </Button>
      </form>
    </BottomSheet>
  );
}
