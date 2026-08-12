import type { FormEvent, JSX } from "react";
import { useEffect, useState } from "react";

import { BottomSheet, Button, Chip, Input } from "@/components/ui";
import type {
  PlannerTask,
  PlannerTaskInput,
  TaskPriority,
} from "@/modules/planner/types/planner.types";
import { PRIORITY_META } from "@/modules/planner/utils/date";

const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

export interface TaskFormSheetProps {
  open: boolean;
  /** Task being edited, or `null` when creating a new one. */
  task: PlannerTask | null;
  /** Prefilled date for new tasks (ISO `YYYY-MM-DD`). */
  defaultDate: string;
  onClose: () => void;
  onSubmit: (input: PlannerTaskInput, id?: number) => void;
  onDelete?: (id: number) => void;
}

interface FormState {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  dueTime: string;
  category: string;
}

function toFormState(task: PlannerTask | null, defaultDate: string): FormState {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: task?.priority ?? "medium",
    dueDate: task?.dueDate ?? defaultDate,
    dueTime: task?.dueTime ? task.dueTime.slice(0, 5) : "",
    category: task?.category ?? "",
  };
}

/** Bottom-sheet form for creating and editing planner tasks. */
export function TaskFormSheet({
  open,
  task,
  defaultDate,
  onClose,
  onSubmit,
  onDelete,
}: TaskFormSheetProps): JSX.Element {
  const [form, setForm] = useState<FormState>(() => toFormState(task, defaultDate));

  useEffect(() => {
    if (open) setForm(toFormState(task, defaultDate));
  }, [open, task, defaultDate]);

  const isEditing = task !== null;
  const canSave = form.title.trim().length > 0;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSave) return;
    const input: PlannerTaskInput = {
      title: form.title.trim(),
      description: form.description.trim() ? form.description.trim() : null,
      priority: form.priority,
      dueDate: form.dueDate ? form.dueDate : null,
      dueTime: form.dueTime ? form.dueTime : null,
      category: form.category.trim() ? form.category.trim() : null,
    };
    onSubmit(input, task?.id);
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={isEditing ? "Edit task" : "New task"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Title"
          placeholder="What needs doing?"
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          autoFocus
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Priority</label>
          <div className="flex gap-2">
            {PRIORITIES.map((priority) => (
              <Chip
                key={priority}
                selected={form.priority === priority}
                onClick={() => setForm((current) => ({ ...current, priority }))}
              >
                {PRIORITY_META[priority].label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <label className="flex-1 text-sm font-medium text-ink-700">
            Date
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
              className="mt-1 w-full rounded-[var(--radius-pill)] border border-border bg-surface px-4 py-2.5 text-base text-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-blossom-300"
            />
          </label>
          <label className="flex-1 text-sm font-medium text-ink-700">
            Time
            <input
              type="time"
              value={form.dueTime}
              onChange={(event) => setForm((current) => ({ ...current, dueTime: event.target.value }))}
              className="mt-1 w-full rounded-[var(--radius-pill)] border border-border bg-surface px-4 py-2.5 text-base text-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-blossom-300"
            />
          </label>
        </div>

        <Input
          label="Category"
          placeholder="e.g. Work, Self-care"
          value={form.category}
          onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
        />

        <Input
          label="Notes"
          placeholder="Add details (optional)"
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
        />

        <div className="mt-1 flex items-center gap-3">
          <Button type="submit" fullWidth disabled={!canSave}>
            {isEditing ? "Save changes" : "Add task"}
          </Button>
          {isEditing && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onDelete(task.id);
                onClose();
              }}
            >
              Delete
            </Button>
          ) : null}
        </div>
      </form>
    </BottomSheet>
  );
}
