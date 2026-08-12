import type { JSX } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import { Button, ErrorState, LoadingState, useToast } from "@/components/ui";
import { DaySchedule } from "@/modules/planner/components/DaySchedule";
import { FilterChips } from "@/modules/planner/components/FilterChips";
import { MiniCalendar } from "@/modules/planner/components/MiniCalendar";
import { TaskFormSheet } from "@/modules/planner/components/TaskFormSheet";
import { TaskList } from "@/modules/planner/components/TaskList";
import { usePlannerTasks } from "@/modules/planner/hooks/usePlannerTasks";
import type {
  PlannerFilter,
  PlannerTask,
  PlannerTaskInput,
} from "@/modules/planner/types/planner.types";
import {
  addDaysISO,
  formatDayLabel,
  formatLongDate,
  parseISODate,
  todayISO,
} from "@/modules/planner/utils/date";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

export function PlannerPage(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const { showToast } = useToast();
  const { tasks, isLoading, isError, refetch, addTask, editTask, toggleTask, removeTask } =
    usePlannerTasks();

  const today = todayISO();
  const [filter, setFilter] = useState<PlannerFilter>("today");
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PlannerTask | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Deep-link support: Global Search routes task results to /planner?task={id}.
  // Surface that task in an appropriate view and open it so the user lands on
  // the exact record they searched for instead of a generic planner list.
  useEffect(() => {
    const taskParam = searchParams.get("task");
    if (!taskParam) return;
    const id = Number(taskParam);
    if (Number.isNaN(id)) return;
    const target = tasks.find((task) => task.id === id);
    if (!target) return; // Tasks may still be loading; effect re-runs when they arrive.

    if (target.isCompleted) {
      setFilter("completed");
    } else if (target.dueDate) {
      setSelectedDate(target.dueDate);
      setFilter("today");
    }
    setEditingTask(target);
    setSheetOpen(true);

    // Clear the param so refreshing or closing the sheet doesn't reopen it.
    const next = new URLSearchParams(searchParams);
    next.delete("task");
    setSearchParams(next, { replace: true });
  }, [searchParams, tasks, setSearchParams]);

  const markedDates = useMemo(
    () => new Set(tasks.filter((task) => task.dueDate).map((task) => task.dueDate as string)),
    [tasks],
  );

  const dayTasks = useMemo(
    () => tasks.filter((task) => task.dueDate === selectedDate),
    [tasks, selectedDate],
  );
  const upcoming = useMemo(
    () => tasks.filter((task) => task.dueDate && task.dueDate > today && !task.isCompleted),
    [tasks, today],
  );
  const completed = useMemo(
    () =>
      tasks
        .filter((task) => task.isCompleted)
        .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? "")),
    [tasks],
  );

  const counts: Record<PlannerFilter, number> = {
    today: tasks.filter((task) => task.dueDate === today && !task.isCompleted).length,
    upcoming: upcoming.length,
    completed: completed.length,
  };

  function handleFilterChange(next: PlannerFilter) {
    setFilter(next);
    if (next === "today") setSelectedDate(today);
  }

  function handleSelectDate(iso: string) {
    setSelectedDate(iso);
    setFilter("today");
  }

  function openAdd() {
    setEditingTask(null);
    setSheetOpen(true);
  }

  function openEdit(task: PlannerTask) {
    setEditingTask(task);
    setSheetOpen(true);
  }

  function handleSubmit(input: PlannerTaskInput, id?: number) {
    if (id !== undefined) {
      editTask(id, input);
      showToast("Task updated", "success");
    } else {
      addTask(input);
      showToast("Task added", "success");
    }
  }

  function handleDelete(id: number) {
    removeTask(id);
    showToast("Task deleted", "info");
  }

  const sectionTitle =
    filter === "today"
      ? `${formatDayLabel(selectedDate)}${formatDayLabel(selectedDate) === "Today" ? "’s schedule" : ""}`
      : filter === "upcoming"
        ? "Upcoming"
        : "Completed";

  // The empty "today" schedule renders its own add action, so hide the
  // header button then to avoid two identical add affordances. Adding a
  // "completed" task is meaningless, so no add affordance there at all.
  const showHeaderAdd =
    filter === "completed" ? false : !(filter === "today" && dayTasks.length === 0);

  // From the Upcoming view, default new tasks to tomorrow so they actually
  // land in the list the user is looking at (today-dated tasks wouldn't).
  const addDefaultDate = filter === "upcoming" ? addDaysISO(today, 1) : selectedDate;

  return (
    <>
      <motion.div
        className="flex flex-col gap-5 px-5 pb-28 pt-6"
        variants={reduceMotion ? undefined : containerVariants}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
      >
        <motion.header variants={reduceMotion ? undefined : itemVariants}>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Planner</h1>
          <p className="mt-0.5 text-sm text-ink-500">{formatLongDate(parseISODate(selectedDate))}</p>
        </motion.header>

        <motion.div variants={reduceMotion ? undefined : itemVariants}>
          <MiniCalendar
            selectedDate={selectedDate}
            onSelect={handleSelectDate}
            markedDates={markedDates}
          />
        </motion.div>

        <motion.div variants={reduceMotion ? undefined : itemVariants}>
          <FilterChips value={filter} onChange={handleFilterChange} counts={counts} />
        </motion.div>

        <motion.section variants={reduceMotion ? undefined : itemVariants} className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-display text-lg font-semibold text-ink-900">{sectionTitle}</h2>
            {showHeaderAdd ? (
              <Button size="sm" variant="secondary" leftIcon="+" onClick={openAdd}>
                Add
              </Button>
            ) : null}
          </div>

          {isLoading ? (
            <LoadingState label="Loading your plan" />
          ) : isError ? (
            <ErrorState
              title="Couldn’t load your planner"
              description="Please check your connection and try again."
              onRetry={refetch}
            />
          ) : filter === "today" ? (
            <DaySchedule
              tasks={dayTasks}
              onToggle={toggleTask}
              onEdit={openEdit}
              onDelete={handleDelete}
              onAdd={openAdd}
            />
          ) : filter === "upcoming" ? (
            <TaskList
              tasks={upcoming}
              groupByDate
              emptyIcon="📆"
              emptyTitle="No upcoming tasks"
              emptyDescription="You’re all caught up. Add something to plan ahead."
              onToggle={toggleTask}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ) : (
            <TaskList
              tasks={completed}
              emptyIcon="✅"
              emptyTitle="Nothing completed yet"
              emptyDescription="Finished tasks will gather here."
              onToggle={toggleTask}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          )}
        </motion.section>
      </motion.div>

      <TaskFormSheet
        open={sheetOpen}
        task={editingTask}
        defaultDate={addDefaultDate}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </>
  );
}
