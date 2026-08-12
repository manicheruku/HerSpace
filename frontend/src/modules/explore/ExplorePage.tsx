import type { JSX } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import { EmptyState, ErrorState, PullToRefresh, useToast } from "@/components/ui";
import { ModuleCard } from "@/modules/explore/components/ModuleCard";
import { ModuleCardSkeleton } from "@/modules/explore/components/ModuleCardSkeleton";
import { QuickAddSheet } from "@/modules/explore/components/QuickAddSheet";
import { SectionHeader } from "@/modules/explore/components/SectionHeader";
import {
  EXPLORE_LIBRARY_KEY,
  useExploreLibrary,
} from "@/modules/explore/hooks/useExploreLibrary";
import { useModuleQuickAdd } from "@/modules/explore/hooks/useModuleQuickAdd";
import type { ExploreModule } from "@/modules/explore/types/explore.types";
import { JournalEditorSheet } from "@/modules/journal/components/JournalEditorSheet";
import { useJournalMutations } from "@/modules/journal/hooks/useJournalMutations";
import type { JournalEntryInput } from "@/modules/journal/types/journal.types";
import { NoteEditorSheet } from "@/modules/notes/components/NoteEditorSheet";
import { useNoteMutations } from "@/modules/notes/hooks/useNoteMutations";
import type { NoteInput } from "@/modules/notes/types/notes.types";
import { MemoryEditorSheet } from "@/modules/memories/components/MemoryEditorSheet";
import { useMemoryMutations } from "@/modules/memories/hooks/useMemoryMutations";
import type { MemoryInput } from "@/modules/memories/types/memories.types";
import { HabitEditorSheet } from "@/modules/habits/components/HabitEditorSheet";
import { useHabitMutations } from "@/modules/habits/hooks/useHabitMutations";
import type { HabitInput } from "@/modules/habits/types/habits.types";
import { GoalEditorSheet } from "@/modules/goals/components/GoalEditorSheet";
import { useGoalMutations } from "@/modules/goals/hooks/useGoalMutations";
import type { GoalInput } from "@/modules/goals/types/goals.types";
import { ExpenseEditorSheet } from "@/modules/expenses/components/ExpenseEditorSheet";
import { useExpenseMutations } from "@/modules/expenses/hooks/useExpenseMutations";
import type { ExpenseInput } from "@/modules/expenses/types/expenses.types";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
};

export function ExplorePage(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { sections, isLoading, isError, refetch } = useExploreLibrary();
  const quickAdd = useModuleQuickAdd();
  const journal = useJournalMutations();
  const notes = useNoteMutations();
  const memories = useMemoryMutations();
  const habits = useHabitMutations();
  const goals = useGoalMutations();
  const expenses = useExpenseMutations();

  const [activeModule, setActiveModule] = useState<ExploreModule | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [journalSheetOpen, setJournalSheetOpen] = useState(false);
  const [notesSheetOpen, setNotesSheetOpen] = useState(false);
  const [memoriesSheetOpen, setMemoriesSheetOpen] = useState(false);
  const [habitsSheetOpen, setHabitsSheetOpen] = useState(false);
  const [goalsSheetOpen, setGoalsSheetOpen] = useState(false);
  const [expensesSheetOpen, setExpensesSheetOpen] = useState(false);

  function handleOpen(module: ExploreModule): void {
    if (module.implemented) {
      navigate(module.route);
    } else {
      showToast(`${module.name} is coming soon`, "info");
    }
  }

  function handleQuickAdd(module: ExploreModule): void {
    // Implemented modules with a rich editor open their own sheet.
    if (module.id === "journal") {
      setJournalSheetOpen(true);
      return;
    }
    if (module.id === "notes") {
      setNotesSheetOpen(true);
      return;
    }
    if (module.id === "memories") {
      setMemoriesSheetOpen(true);
      return;
    }
    if (module.id === "habits") {
      setHabitsSheetOpen(true);
      return;
    }
    if (module.id === "goals") {
      setGoalsSheetOpen(true);
      return;
    }
    if (module.id === "expenses") {
      setExpensesSheetOpen(true);
      return;
    }
    setActiveModule(module);
    setSheetOpen(true);
  }

  function handleJournalAdd(input: JournalEntryInput): void {
    journal.create.mutate(input, {
      onSuccess: () => {
        setJournalSheetOpen(false);
        showToast("Added to Journal", "success");
      },
      onError: () => showToast("Couldn't save entry", "error"),
    });
  }

  function handleNotesAdd(input: NoteInput): void {
    notes.create.mutate(input, {
      onSuccess: () => {
        setNotesSheetOpen(false);
        showToast("Added to Notes", "success");
      },
      onError: () => showToast("Couldn't save note", "error"),
    });
  }

  function handleMemoriesAdd(input: MemoryInput): void {
    memories.create.mutate(input, {
      onSuccess: () => {
        setMemoriesSheetOpen(false);
        showToast("Added to Memories", "success");
      },
      onError: () => showToast("Couldn't save memory", "error"),
    });
  }

  function handleHabitsAdd(input: HabitInput): void {
    habits.create.mutate(input, {
      onSuccess: () => {
        setHabitsSheetOpen(false);
        showToast("Added to Habits", "success");
      },
      onError: () => showToast("Couldn't create habit", "error"),
    });
  }

  function handleGoalsAdd(input: GoalInput): void {
    goals.create.mutate(input, {
      onSuccess: () => {
        setGoalsSheetOpen(false);
        showToast("Added to Goals", "success");
      },
      onError: () => showToast("Couldn't create goal", "error"),
    });
  }

  function handleExpensesAdd(input: ExpenseInput): void {
    expenses.create.mutate(input, {
      onSuccess: () => {
        setExpensesSheetOpen(false);
        showToast("Added to Expenses", "success");
      },
      onError: () => showToast("Couldn't add expense", "error"),
    });
  }

  function handleQuickAddSubmit(module: ExploreModule, text: string): void {
    quickAdd.mutate(
      { moduleId: module.id, text },
      {
        onSuccess: () => {
          setSheetOpen(false);
          showToast(`Added to ${module.name}`, "success");
        },
        onError: () => {
          showToast("Couldn't add that. Please try again.", "error");
        },
      },
    );
  }

  const header = (
    <header className="px-1">
      <h1 className="font-display text-2xl font-semibold text-ink-900">Explore</h1>
      <p className="mt-0.5 text-sm text-ink-500">Your library — every space in one place.</p>
    </header>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 px-5 pb-28 pt-6">
        {header}
        {["a", "b"].map((group) => (
          <div key={group} className="flex flex-col gap-3">
            <div className="h-3 w-20 animate-pulse rounded-[var(--radius-pill)] bg-ink-100" />
            <ModuleCardSkeleton />
            <ModuleCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-6 px-5 pb-28 pt-6">
        {header}
        <ErrorState
          title="Couldn't load your library"
          description="Please check your connection and try again."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <>
      <PullToRefresh
        onRefresh={() => queryClient.invalidateQueries({ queryKey: EXPLORE_LIBRARY_KEY })}
      >
        <motion.div
          className="flex flex-col gap-6 px-5 pb-28 pt-6"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
        >
          {header}

          {sections.length === 0 ? (
            <EmptyState
              icon="✨"
              title="Nothing here yet"
              description="Your modules will appear here as they come online."
            />
          ) : (
            sections.map((section) => (
              <motion.section
                key={section.id}
                className="flex flex-col gap-3"
                variants={reduceMotion ? undefined : containerVariants}
                initial={reduceMotion ? false : "hidden"}
                animate="visible"
              >
                <SectionHeader title={section.title} />
                {section.modules.map((module) => (
                  <motion.div key={module.id} variants={reduceMotion ? undefined : itemVariants}>
                    <ModuleCard module={module} onOpen={handleOpen} onQuickAdd={handleQuickAdd} />
                  </motion.div>
                ))}
              </motion.section>
            ))
          )}
        </motion.div>
      </PullToRefresh>

      <QuickAddSheet
        open={sheetOpen}
        module={activeModule}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleQuickAddSubmit}
        isSubmitting={quickAdd.isPending}
      />

      <JournalEditorSheet
        open={journalSheetOpen}
        entry={null}
        onClose={() => setJournalSheetOpen(false)}
        onSubmit={handleJournalAdd}
        isSubmitting={journal.create.isPending}
      />

      <NoteEditorSheet
        open={notesSheetOpen}
        entry={null}
        onClose={() => setNotesSheetOpen(false)}
        onSubmit={handleNotesAdd}
        isSubmitting={notes.create.isPending}
      />

      <MemoryEditorSheet
        open={memoriesSheetOpen}
        entry={null}
        onClose={() => setMemoriesSheetOpen(false)}
        onSubmit={handleMemoriesAdd}
        isSubmitting={memories.create.isPending}
      />

      <HabitEditorSheet
        open={habitsSheetOpen}
        entry={null}
        onClose={() => setHabitsSheetOpen(false)}
        onSubmit={handleHabitsAdd}
        isSubmitting={habits.create.isPending}
      />

      <GoalEditorSheet
        open={goalsSheetOpen}
        entry={null}
        onClose={() => setGoalsSheetOpen(false)}
        onSubmit={handleGoalsAdd}
        isSubmitting={goals.create.isPending}
      />

      <ExpenseEditorSheet
        open={expensesSheetOpen}
        entry={null}
        onClose={() => setExpensesSheetOpen(false)}
        onSubmit={handleExpensesAdd}
        isSubmitting={expenses.create.isPending}
      />
    </>
  );
}
