import type { JSX } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";

import { Button, EmptyState, ErrorState, useToast } from "@/components/ui";
import { HabitCard } from "@/modules/habits/components/HabitCard";
import { HabitEditorSheet } from "@/modules/habits/components/HabitEditorSheet";
import { HabitFilters } from "@/modules/habits/components/HabitFilters";
import { useHabits } from "@/modules/habits/hooks/useHabits";
import { useHabitMutations } from "@/modules/habits/hooks/useHabitMutations";
import { todayISO } from "@/modules/habits/utils/habits.format";
import type { Habit, HabitInput } from "@/modules/habits/types/habits.types";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

export function HabitsListPage(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  const { habits, isLoading, isError, refetch } = useHabits({
    includeArchived: showArchived,
  });
  const { create, check } = useHabitMutations();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return habits;
    return habits.filter((habit) => habit.name.toLowerCase().includes(q));
  }, [habits, query]);

  function handleOpen(habit: Habit): void {
    navigate(`/habits/${habit.id}`);
  }

  function handleToggleToday(habit: Habit): void {
    check.mutate({ id: habit.id, on: todayISO() });
  }

  function handleCreate(input: HabitInput): void {
    create.mutate(input, {
      onSuccess: () => {
        setEditorOpen(false);
        showToast("Habit created", "success");
      },
      onError: () => showToast("Couldn't create habit", "error"),
    });
  }

  const header = (
    <div className="flex flex-col gap-3 px-1">
      <button
        type="button"
        onClick={() => navigate("/explore")}
        className="flex items-center gap-1 self-start text-sm text-ink-500 transition hover:text-ink-700"
      >
        <span aria-hidden="true">‹</span> Explore
      </button>
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Habits</h1>
          <p className="mt-0.5 text-sm text-ink-500">Build streaks, one day at a time.</p>
        </div>
        <Button size="sm" leftIcon="+" onClick={() => setEditorOpen(true)}>
          New
        </Button>
      </header>
    </div>
  );

  function renderBody(): JSX.Element {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[68px] animate-pulse rounded-[var(--radius-card)] bg-ink-100/70"
            />
          ))}
        </div>
      );
    }
    if (isError) {
      return (
        <ErrorState
          title="Couldn't load your habits"
          description="Please check your connection and try again."
          onRetry={refetch}
        />
      );
    }
    if (habits.length === 0) {
      return (
        <EmptyState
          icon="🌱"
          title="No habits yet"
          description="Start small — add a habit and check in daily to grow a streak."
          action={
            <Button size="sm" leftIcon="+" onClick={() => setEditorOpen(true)}>
              New habit
            </Button>
          }
        />
      );
    }
    if (filtered.length === 0) {
      return (
        <EmptyState
          icon="🔍"
          title="No matching habits"
          description="Try a different search."
        />
      );
    }
    return (
      <motion.div
        className="flex flex-col gap-3"
        variants={reduceMotion ? undefined : containerVariants}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
      >
        <AnimatePresence initial={false}>
          {filtered.map((habit) => (
            <motion.div
              key={habit.id}
              variants={reduceMotion ? undefined : itemVariants}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
              layout={!reduceMotion}
            >
              <HabitCard
                habit={habit}
                onOpen={handleOpen}
                onToggleToday={handleToggleToday}
                isToggling={check.isPending}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className="flex flex-col gap-5 pb-8"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
      >
        {header}
        {habits.length > 0 || showArchived || query ? (
          <HabitFilters
            query={query}
            onQueryChange={setQuery}
            showArchived={showArchived}
            onToggleArchived={() => setShowArchived((v) => !v)}
          />
        ) : null}
        {renderBody()}
      </motion.div>

      <HabitEditorSheet
        open={editorOpen}
        entry={null}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={create.isPending}
      />
    </>
  );
}
