import type { JSX } from "react";
import { AnimatePresence } from "framer-motion";

import { Button, EmptyState, TaskItem } from "@/components/ui";
import type { PlannerTask } from "@/modules/planner/types/planner.types";
import { formatTime, PRIORITY_META } from "@/modules/planner/utils/date";

export interface DayScheduleProps {
  tasks: PlannerTask[];
  onToggle: (id: number, isCompleted: boolean) => void;
  onEdit: (task: PlannerTask) => void;
  onDelete: (id: number) => void;
  onAdd?: () => void;
}

function timeValue(task: PlannerTask): number {
  if (!task.dueTime) return Number.POSITIVE_INFINITY;
  const [h, m] = task.dueTime.split(":");
  return Number(h ?? "0") * 60 + Number(m ?? "0");
}

/** Vertical daily timeline: timed tasks first (ordered), then all-day tasks. */
export function DaySchedule({ tasks, onToggle, onEdit, onDelete, onAdd }: DayScheduleProps): JSX.Element {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon="🌿"
        title="Nothing scheduled"
        description="Enjoy the open space, or plan something for this day."
        action={
          onAdd ? (
            <Button size="sm" leftIcon="+" onClick={onAdd}>
              Add task
            </Button>
          ) : undefined
        }
      />
    );
  }

  const timed = tasks.filter((task) => task.dueTime).sort((a, b) => timeValue(a) - timeValue(b));
  const untimed = tasks.filter((task) => !task.dueTime);

  return (
    <div className="flex flex-col gap-5">
      {timed.length > 0 ? (
        <div className="relative pl-16">
          <span
            aria-hidden="true"
            className="absolute bottom-2 left-[4.25rem] top-2 w-px bg-border"
          />
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {timed.map((task) => (
                <div key={task.id} className="relative">
                  <span className="absolute -left-16 top-3 w-12 text-right text-xs font-medium text-ink-500">
                    {formatTime(task.dueTime)}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute -left-[2.65rem] top-4 size-2.5 rounded-full border-2 border-card bg-blossom-400"
                  />
                  <TaskItem
                    title={task.title}
                    completed={task.isCompleted}
                    onToggle={(next) => onToggle(task.id, next)}
                    priorityLabel={PRIORITY_META[task.priority].label}
                    priorityTone={PRIORITY_META[task.priority].tone}
                    meta={task.category ?? undefined}
                    onClick={() => onEdit(task)}
                    onDelete={() => onDelete(task.id)}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ) : null}

      {untimed.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-300">
            All day
          </p>
          <AnimatePresence initial={false}>
            {untimed.map((task) => (
              <TaskItem
                key={task.id}
                title={task.title}
                completed={task.isCompleted}
                onToggle={(next) => onToggle(task.id, next)}
                priorityLabel={PRIORITY_META[task.priority].label}
                priorityTone={PRIORITY_META[task.priority].tone}
                meta={task.category ?? undefined}
                onClick={() => onEdit(task)}
                onDelete={() => onDelete(task.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
}
