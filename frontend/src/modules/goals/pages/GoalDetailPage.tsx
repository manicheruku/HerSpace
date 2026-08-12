import type { JSX } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import { Button, ErrorState, LoadingState, Modal, ProgressBar, useToast } from "@/components/ui";
import { GoalEditorSheet } from "@/modules/goals/components/GoalEditorSheet";
import { useGoal } from "@/modules/goals/hooks/useGoals";
import { useGoalMutations } from "@/modules/goals/hooks/useGoalMutations";
import { formatDueDate, formatPercent } from "@/modules/goals/utils/goals.format";
import type { GoalInput } from "@/modules/goals/types/goals.types";

export function GoalDetailPage(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const params = useParams<{ id: string }>();
  const id = params.id ? Number(params.id) : null;

  const { goal, isLoading, isError, refetch } = useGoal(id);
  const { update, remove, advance } = useGoalMutations();

  const [editorOpen, setEditorOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleUpdate(input: GoalInput): void {
    if (!goal) return;
    update.mutate(
      { id: goal.id, input },
      {
        onSuccess: () => {
          setEditorOpen(false);
          showToast("Goal updated", "success");
        },
        onError: () => showToast("Couldn't update goal", "error"),
      },
    );
  }

  function handleDelete(): void {
    if (!goal) return;
    remove.mutate(goal.id, {
      onSuccess: () => {
        showToast("Goal deleted", "success");
        navigate("/goals");
      },
      onError: () => showToast("Couldn't delete goal", "error"),
    });
  }

  function handleArchiveToggle(): void {
    if (!goal) return;
    update.mutate(
      { id: goal.id, input: { isArchived: !goal.isArchived } },
      {
        onSuccess: () => showToast(goal.isArchived ? "Goal restored" : "Goal archived", "success"),
        onError: () => showToast("Couldn't update goal", "error"),
      },
    );
  }

  if (isLoading) return <LoadingState label="Loading goal" />;
  if (isError || !goal) {
    return (
      <ErrorState
        title="Goal not found"
        description="It may have been deleted."
        onRetry={id ? refetch : undefined}
      />
    );
  }

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
          onClick={() => navigate("/goals")}
          className="flex items-center gap-1 self-start text-sm text-ink-500 transition hover:text-ink-700"
        >
          <span aria-hidden="true">‹</span> Goals
        </button>

        <header className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-semibold text-ink-900">{goal.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
            <span>{formatDueDate(goal.dueDate)}</span>
            <span>•</span>
            <span>{formatPercent(goal.progressPercent)}</span>
            <span>•</span>
            <span>{goal.currentValue}/{goal.targetValue}{goal.unit ? ` ${goal.unit}` : ""}</span>
          </div>
        </header>

        {goal.description ? (
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-700">
            {goal.description}
          </p>
        ) : null}

        <ProgressBar value={goal.progressPercent} max={100} />

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => advance.mutate({ id: goal.id, amount: -1 })}>
            -1
          </Button>
          <Button size="sm" onClick={() => advance.mutate({ id: goal.id, amount: 1 })}>
            +1
          </Button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditorOpen(true)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={handleArchiveToggle}>
            {goal.isArchived ? "Restore" : "Archive"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
        </div>
      </motion.article>

      <GoalEditorSheet
        open={editorOpen}
        entry={goal}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleUpdate}
        isSubmitting={update.isPending}
      />

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete goal?">
        <p className="text-sm text-ink-500">
          This will permanently remove “{goal.title}”. This can't be undone.
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
