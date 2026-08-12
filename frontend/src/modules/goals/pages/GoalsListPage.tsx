import type { JSX } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";

import { Button, EmptyState, ErrorState, useToast } from "@/components/ui";
import { GoalCard } from "@/modules/goals/components/GoalCard";
import { GoalEditorSheet } from "@/modules/goals/components/GoalEditorSheet";
import { GoalFilters } from "@/modules/goals/components/GoalFilters";
import { useGoals } from "@/modules/goals/hooks/useGoals";
import { useGoalMutations } from "@/modules/goals/hooks/useGoalMutations";
import type { Goal, GoalInput } from "@/modules/goals/types/goals.types";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

export function GoalsListPage(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [query, setQuery] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  const { goals, isLoading, isError, refetch } = useGoals({ includeArchived: showArchived });
  const { create, advance } = useGoalMutations();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return goals.filter((goal) => {
      if (!showCompleted && goal.isCompleted) return false;
      if (q && !`${goal.title} ${goal.description ?? ""}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [goals, query, showCompleted]);

  function handleOpen(goal: Goal): void {
    navigate(`/goals/${goal.id}`);
  }

  function handleAdvance(goal: Goal, amount: number): void {
    advance.mutate({ id: goal.id, amount });
  }

  function handleCreate(input: GoalInput): void {
    create.mutate(input, {
      onSuccess: () => {
        setEditorOpen(false);
        showToast("Goal created", "success");
      },
      onError: () => showToast("Couldn't create goal", "error"),
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
          <h1 className="font-display text-2xl font-semibold text-ink-900">Goals</h1>
          <p className="mt-0.5 text-sm text-ink-500">Set intentions and watch your progress grow.</p>
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
              className="h-[154px] animate-pulse rounded-[var(--radius-card)] bg-ink-100/70"
            />
          ))}
        </div>
      );
    }
    if (isError) {
      return (
        <ErrorState
          title="Couldn't load your goals"
          description="Please check your connection and try again."
          onRetry={refetch}
        />
      );
    }
    if (goals.length === 0) {
      return (
        <EmptyState
          icon="🎯"
          title="No goals yet"
          description="Add your first goal and start moving it forward step by step."
          action={
            <Button size="sm" leftIcon="+" onClick={() => setEditorOpen(true)}>
              New goal
            </Button>
          }
        />
      );
    }
    if (filtered.length === 0) {
      return (
        <EmptyState
          icon="🔍"
          title="No matching goals"
          description="Try adjusting your search or filters."
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
          {filtered.map((goal) => (
            <motion.div
              key={goal.id}
              variants={reduceMotion ? undefined : itemVariants}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
              layout={!reduceMotion}
            >
              <GoalCard
                goal={goal}
                onOpen={handleOpen}
                onAdvance={handleAdvance}
                isUpdating={advance.isPending}
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
        {goals.length > 0 ? (
          <GoalFilters
            query={query}
            onQueryChange={setQuery}
            showCompleted={showCompleted}
            onToggleCompleted={() => setShowCompleted((v) => !v)}
            showArchived={showArchived}
            onToggleArchived={() => setShowArchived((v) => !v)}
          />
        ) : null}
        {renderBody()}
      </motion.div>

      <GoalEditorSheet
        open={editorOpen}
        entry={null}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={create.isPending}
      />
    </>
  );
}
