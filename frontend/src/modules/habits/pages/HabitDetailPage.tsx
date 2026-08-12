import type { JSX } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import { Button, ErrorState, LoadingState, Modal, useToast } from "@/components/ui";
import { HabitEditorSheet } from "@/modules/habits/components/HabitEditorSheet";
import { WeekDots } from "@/modules/habits/components/WeekDots";
import { useHabit } from "@/modules/habits/hooks/useHabits";
import { useHabitMutations } from "@/modules/habits/hooks/useHabitMutations";
import { HABIT_COLOR_META, formatStreak, todayISO } from "@/modules/habits/utils/habits.format";
import type { HabitInput } from "@/modules/habits/types/habits.types";

interface StatProps {
  value: string | number;
  label: string;
}

function Stat({ value, label }: StatProps): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-[var(--radius-md)] bg-surface px-3 py-3">
      <span className="font-display text-xl font-semibold text-ink-900">{value}</span>
      <span className="text-[11px] font-medium text-ink-500">{label}</span>
    </div>
  );
}

export function HabitDetailPage(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const params = useParams<{ id: string }>();
  const id = params.id ? Number(params.id) : null;

  const { habit, isLoading, isError, refetch } = useHabit(id);
  const { update, remove, check } = useHabitMutations();

  const [editorOpen, setEditorOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleUpdate(input: HabitInput): void {
    if (!habit) return;
    update.mutate(
      { id: habit.id, input },
      {
        onSuccess: () => {
          setEditorOpen(false);
          showToast("Habit updated", "success");
        },
        onError: () => showToast("Couldn't update habit", "error"),
      },
    );
  }

  function handleToggleArchive(): void {
    if (!habit) return;
    update.mutate(
      { id: habit.id, input: { isArchived: !habit.isArchived } },
      {
        onSuccess: () =>
          showToast(habit.isArchived ? "Habit restored" : "Habit archived", "success"),
        onError: () => showToast("Couldn't update habit", "error"),
      },
    );
  }

  function handleDelete(): void {
    if (!habit) return;
    remove.mutate(habit.id, {
      onSuccess: () => {
        showToast("Habit deleted", "success");
        navigate("/habits");
      },
      onError: () => showToast("Couldn't delete habit", "error"),
    });
  }

  if (isLoading) return <LoadingState label="Loading habit" />;
  if (isError || !habit) {
    return (
      <ErrorState
        title="Habit not found"
        description="It may have been deleted."
        onRetry={id ? refetch : undefined}
      />
    );
  }

  const palette = habit.color ? HABIT_COLOR_META[habit.color] : null;

  return (
    <>
      <motion.article
        className="flex flex-col gap-5 pb-8"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
      >
        <button
          type="button"
          onClick={() => navigate("/habits")}
          className="flex items-center gap-1 self-start text-sm text-ink-500 transition hover:text-ink-700"
        >
          <span aria-hidden="true">‹</span> Habits
        </button>

        <header className="flex items-center gap-3">
          <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-full text-2xl ${
              palette ? palette.card : "bg-surface"
            }`}
            aria-hidden="true"
          >
            {habit.emoji ?? "🌱"}
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-semibold text-ink-900">
              {habit.name}
            </h1>
            <p className="text-sm text-ink-500">🔥 {formatStreak(habit.currentStreak)}</p>
          </div>
        </header>

        <button
          type="button"
          onClick={() => check.mutate({ id: habit.id, on: todayISO() })}
          disabled={check.isPending}
          aria-pressed={habit.completedToday}
          className={`flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] px-4 py-3 text-sm font-semibold transition disabled:opacity-60 ${
            habit.completedToday
              ? "bg-blossom-50 text-blossom-700 ring-1 ring-blossom-200"
              : "text-white bg-[image:var(--gradient-brand)]"
          }`}
        >
          {habit.completedToday ? "✓ Done today" : "Mark done today"}
        </button>

        <div className="flex flex-col gap-2">
          <span className="px-1 text-sm font-medium text-ink-700">Last 7 days</span>
          <div className="flex justify-center rounded-[var(--radius-card)] bg-card px-4 py-4 shadow-[var(--shadow-card)] ring-1 ring-black/5">
            <WeekDots checkins={habit.recentCheckins} dotClass={palette?.dot} />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Stat value={habit.currentStreak} label="streak" />
          <Stat value={habit.longestStreak} label="best" />
          <Stat value={habit.weekCount} label="this week" />
          <Stat value={habit.totalCheckins} label="total" />
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditorOpen(true)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToggleArchive}>
            {habit.isArchived ? "Restore" : "Archive"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
        </div>
      </motion.article>

      <HabitEditorSheet
        open={editorOpen}
        entry={habit}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleUpdate}
        isSubmitting={update.isPending}
      />

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete habit?">
        <p className="text-sm text-ink-500">
          This will permanently remove “{habit.name}” and its check-in history. This can't be
          undone.
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
