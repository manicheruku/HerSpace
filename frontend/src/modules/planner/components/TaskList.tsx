import type { JSX } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { EmptyState, TaskItem } from "@/components/ui";
import type { PlannerTask } from "@/modules/planner/types/planner.types";
import { formatDayLabel, formatTime, PRIORITY_META } from "@/modules/planner/utils/date";

export interface TaskListProps {
  tasks: PlannerTask[];
  emptyIcon: string;
  emptyTitle: string;
  emptyDescription: string;
  /** Group items under relative date headers (used for the Upcoming view). */
  groupByDate?: boolean;
  onToggle: (id: number, isCompleted: boolean) => void;
  onEdit: (task: PlannerTask) => void;
  onDelete: (id: number) => void;
}

function taskMeta(task: PlannerTask): string | undefined {
  const time = formatTime(task.dueTime);
  return [time, task.category].filter(Boolean).join(" · ") || undefined;
}

function groupByDate(tasks: PlannerTask[]): { label: string; items: PlannerTask[] }[] {
  const groups = new Map<string, PlannerTask[]>();
  for (const task of tasks) {
    const key = task.dueDate ?? "none";
    const bucket = groups.get(key);
    if (bucket) bucket.push(task);
    else groups.set(key, [task]);
  }
  return [...groups.entries()].map(([key, items]) => ({
    label: key === "none" ? "No date" : formatDayLabel(key),
    items,
  }));
}

/** Flat or date-grouped task list with per-row completion and edit actions. */
export function TaskList({
  tasks,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  groupByDate: grouped = false,
  onToggle,
  onEdit,
  onDelete,
}: TaskListProps): JSX.Element {
  if (tasks.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;
  }

  function renderRow(task: PlannerTask): JSX.Element {
    return (
      <TaskItem
        key={task.id}
        title={task.title}
        completed={task.isCompleted}
        onToggle={(next) => onToggle(task.id, next)}
        priorityLabel={PRIORITY_META[task.priority].label}
        priorityTone={PRIORITY_META[task.priority].tone}
        meta={taskMeta(task)}
        onClick={() => onEdit(task)}
        onDelete={() => onDelete(task.id)}
      />
    );
  }

  if (!grouped) {
    return (
      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>{tasks.map(renderRow)}</AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {groupByDate(tasks).map((group) => (
        <motion.div key={group.label} layout className="flex flex-col gap-2">
          <p className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-300">
            {group.label}
          </p>
          <AnimatePresence initial={false}>{group.items.map(renderRow)}</AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
