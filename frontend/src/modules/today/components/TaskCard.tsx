import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Card, EmptyState, ErrorState, SectionTitle, Skeleton } from "@/components/ui";
import { useTasks } from "@/modules/today/hooks/useTasks";
import type { Task, TaskPriority } from "@/modules/today/types/today.types";

const PRIORITY_META: Record<
  TaskPriority,
  { label: string; dot: string; text: string }
> = {
  low: { label: "Low", dot: "bg-success", text: "text-success" },
  medium: { label: "Medium", dot: "bg-warning", text: "text-warning" },
  high: { label: "High", dot: "bg-danger", text: "text-danger" },
};

interface TaskRowProps {
  task: Task;
  onToggle: (id: number, isCompleted: boolean) => void;
  onRemove: (id: number) => void;
}

function TaskRow({ task, onToggle, onRemove }: TaskRowProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      layout
      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 500, damping: 40 }
      }
      className="group flex items-center gap-3 rounded-[var(--radius-pill)] px-2 py-2 transition-colors hover:bg-blossom-50"
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={task.isCompleted}
        aria-label={task.isCompleted ? "Mark task incomplete" : "Mark task complete"}
        onClick={() => onToggle(task.id, !task.isCompleted)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          aria-hidden="true"
          className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            task.isCompleted
              ? "border-blossom-500 bg-blossom-500 text-white"
              : "border-border bg-card text-transparent"
          }`}
        >
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3.5"
            initial={false}
            animate={{ scale: task.isCompleted ? 1 : 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 400, damping: 18 }
            }
          >
            <path d="M20 6 9 17l-5-5" />
          </motion.svg>
        </span>
        <span
          className={`min-w-0 flex-1 break-words text-base transition-colors ${
            task.isCompleted ? "text-ink-300 line-through" : "text-ink-900"
          }`}
        >
          {task.title}
        </span>
      </button>
      <span
        className={`flex shrink-0 items-center gap-1.5 text-sm font-medium ${
          task.isCompleted ? "text-ink-300" : PRIORITY_META[task.priority].text
        }`}
      >
        <span
          aria-hidden="true"
          className={`size-2 rounded-full ${
            task.isCompleted ? "bg-ink-300" : PRIORITY_META[task.priority].dot
          }`}
        />
        {PRIORITY_META[task.priority].label}
      </span>
      <button
        type="button"
        onClick={() => onRemove(task.id)}
        aria-label={`Delete task ${task.title}`}
        className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-pill)] text-ink-300 opacity-0 transition-all hover:bg-blossom-100 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
          aria-hidden="true"
        >
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        </svg>
      </button>
    </motion.div>
  );
}

export function TaskCard() {
  const { tasks, isLoading, isError, refetch, addTask, toggleTask, removeTask } =
    useTasks();
  const [draft, setDraft] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const reduceMotion = useReducedMotion();

  function handleAdd() {
    const title = draft.trim();
    if (!title) return;
    addTask({ title, priority });
    setDraft("");
  }

  return (
    <Card className="px-5 py-5">
      <SectionTitle title="Today's Tasks" className="mb-3" />

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-center gap-3">
              <Skeleton className="size-6" rounded />
              <Skeleton className="h-5 flex-1" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Couldn't load tasks"
          description="Please try again."
          onRetry={refetch}
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="🌱"
          title="Add your first task ✨"
          description="Small steps make great days."
        />
      ) : (
        <div className="-mr-1 max-h-64 space-y-1 overflow-y-auto overflow-x-hidden pr-1 [scrollbar-width:thin]">
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onRemove={removeTask}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <form
        className="mt-4 space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          handleAdd();
        }}
      >
        <div className="flex items-center gap-1.5">
          {(Object.keys(PRIORITY_META) as TaskPriority[]).map((value) => {
            const meta = PRIORITY_META[value];
            const selected = priority === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setPriority(value)}
                aria-pressed={selected}
                className={`flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 py-1 text-sm font-medium transition-colors ${
                  selected
                    ? `border-transparent bg-blossom-50 ring-1 ring-blossom-200 ${meta.text}`
                    : "border-border bg-surface text-ink-500 hover:bg-blossom-50"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`size-2 rounded-full ${meta.dot}`}
                />
                {meta.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a task…"
            aria-label="New task title"
            className="flex-1 rounded-[var(--radius-pill)] border border-border bg-surface px-4 py-2 text-base text-ink-900 outline-none placeholder:text-ink-300 focus-visible:ring-2 focus-visible:ring-blossom-300"
          />
          <motion.button
            type="submit"
            whileTap={draft.trim() && !reduceMotion ? { scale: 0.9 } : undefined}
            disabled={!draft.trim()}
            aria-label="Add task"
            className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-blossom-500 text-xl font-semibold text-white shadow-[var(--shadow-button)] transition-opacity disabled:opacity-40"
          >
            +
          </motion.button>
        </div>
      </form>
    </Card>
  );
}
