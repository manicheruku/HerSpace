import {
  MODULE_CATALOG,
  SECTION_ORDER,
  SECTION_TITLES,
} from "@/modules/explore/data/modules.config";
import type {
  ExploreModule,
  ExploreSection,
  ModuleData,
  ModuleId,
} from "@/modules/explore/types/explore.types";
import { fetchJournalSummary } from "@/modules/journal/services/journal.api";
import { fetchNoteSummary } from "@/modules/notes/services/notes.api";
import { fetchMemorySummary } from "@/modules/memories/services/memories.api";
import { fetchHabitSummary } from "@/modules/habits/services/habits.api";
import { fetchGoalSummary } from "@/modules/goals/services/goals.api";
import { fetchExpenseSummary } from "@/modules/expenses/services/expenses.api";
import { formatCents } from "@/modules/expenses/utils/expenses.format";

/** Resolve to an ISO timestamp `hours` in the past. */
function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

/** Simulate network latency so loading/error states are exercisable. */
function withDelay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

/**
 * MOCK runtime data per module. This is the single place to replace with real
 * per-module API calls later — the card UI binds only to `ModuleData`.
 */
const MOCK_MODULE_DATA: Record<ModuleId, ModuleData> = {
  habits: {
    stats: [
      { value: "5", label: "active" },
      { value: "12d", label: "best streak" },
    ],
    lastUpdated: hoursAgo(3),
  },
  period: {
    stats: [
      { value: "Day 8", label: "cycle" },
      { value: "5d", label: "next window" },
    ],
    lastUpdated: hoursAgo(18),
  },
  water: {
    stats: [{ value: "6/8", label: "glasses today" }],
    lastUpdated: hoursAgo(1),
  },
  mood: {
    stats: [
      { value: "🙂", label: "today" },
      { value: "Good", label: "this week" },
    ],
    lastUpdated: hoursAgo(5),
  },
  journal: {
    stats: [
      { value: "24", label: "entries" },
      { value: "3", label: "this week" },
    ],
    lastUpdated: hoursAgo(26),
  },
  notes: {
    stats: [{ value: "12", label: "notes" }],
    lastUpdated: hoursAgo(52),
  },
  memories: {
    stats: [{ value: "48", label: "moments" }],
    lastUpdated: hoursAgo(140),
  },
  goals: {
    stats: [
      { value: "3", label: "active" },
      { value: "68%", label: "progress" },
    ],
    lastUpdated: hoursAgo(8),
  },
  expenses: {
    stats: [
      { value: "$420", label: "this month" },
      { value: "$1.2k", label: "budget" },
    ],
    lastUpdated: hoursAgo(12),
  },
};

/**
 * Fetch live runtime data for modules that are implemented. Each entry returns
 * a partial `ExploreModule` override (stats, lastUpdated, and optionally a live
 * description). Add a module here as it becomes feature-complete; everything
 * else falls back to `MOCK_MODULE_DATA`.
 */
async function fetchLiveOverrides(): Promise<Partial<Record<ModuleId, Partial<ExploreModule>>>> {
  const overrides: Partial<Record<ModuleId, Partial<ExploreModule>>> = {};

  // Each source is isolated so one failing module never breaks the others.
  const [journalResult, notesResult, memoriesResult, habitsResult, goalsResult, expensesResult] =
    await Promise.allSettled([
    fetchJournalSummary(),
    fetchNoteSummary(),
    fetchMemorySummary(),
    fetchHabitSummary(),
    fetchGoalSummary(),
    fetchExpenseSummary(),
  ]);

  if (journalResult.status === "fulfilled") {
    const journal = journalResult.value;
    overrides.journal = {
      stats: [
        { value: String(journal.count), label: journal.count === 1 ? "entry" : "entries" },
        { value: String(journal.favoriteCount), label: "favorites" },
      ],
      lastUpdated: journal.lastUpdated,
      description: journal.latestPreview ?? "Capture how today felt.",
    };
  }

  if (notesResult.status === "fulfilled") {
    const notes = notesResult.value;
    overrides.notes = {
      stats: [
        { value: String(notes.count), label: notes.count === 1 ? "note" : "notes" },
        { value: String(notes.pinnedCount), label: "pinned" },
      ],
      lastUpdated: notes.lastUpdated,
      description: notes.latestPreview ?? "Capture ideas and lists in a tidy place.",
    };
  }

  if (memoriesResult.status === "fulfilled") {
    const memories = memoriesResult.value;
    overrides.memories = {
      stats: [
        {
          value: String(memories.count),
          label: memories.count === 1 ? "memory" : "memories",
        },
        { value: String(memories.favoriteCount), label: "favorites" },
      ],
      lastUpdated: memories.lastUpdated,
      description: memories.latestPreview ?? "Keep the little moments worth remembering.",
    };
  }

  if (habitsResult.status === "fulfilled") {
    const habits = habitsResult.value;
    overrides.habits = {
      stats: [
        {
          value: String(habits.activeCount),
          label: habits.activeCount === 1 ? "habit" : "habits",
        },
        { value: `${habits.bestStreak}d`, label: "best streak" },
      ],
      description:
        habits.checkedInToday > 0
          ? `${habits.checkedInToday} checked in today`
          : "Build streaks, one day at a time.",
    };
  }

  if (goalsResult.status === "fulfilled") {
    const goals = goalsResult.value;
    overrides.goals = {
      stats: [
        {
          value: String(goals.activeCount),
          label: goals.activeCount === 1 ? "active" : "active",
        },
        { value: `${goals.overallProgress}%`, label: "progress" },
      ],
      lastUpdated: goals.lastUpdated,
      description: goals.latestTitle
        ? `Latest: ${goals.latestTitle}`
        : "Set intentions and watch your progress grow.",
    };
  }

  if (expensesResult.status === "fulfilled") {
    const expenses = expensesResult.value;
    overrides.expenses = {
      stats: [
        {
          value: formatCents(expenses.monthTotalCents),
          label: "this month",
        },
        {
          value: String(expenses.monthCount),
          label: expenses.monthCount === 1 ? "expense" : "expenses",
        },
      ],
      lastUpdated: expenses.lastUpdated,
      description: expenses.latestTitle
        ? `Latest: ${expenses.latestTitle}`
        : "Track spending gently, without the stress.",
    };
  }

  return overrides;
}

/**
 * Fetch the full Explore library: the static catalog merged with runtime data,
 * grouped into ordered sections. Implemented modules pull live stats; the rest
 * use `MOCK_MODULE_DATA` until they ship.
 */
export async function fetchExploreLibrary(): Promise<ExploreSection[]> {
  const overrides = await fetchLiveOverrides();

  const modules: ExploreModule[] = MODULE_CATALOG.map((config) => ({
    ...config,
    ...MOCK_MODULE_DATA[config.id],
    ...overrides[config.id],
  }));

  const sections: ExploreSection[] = SECTION_ORDER.map((id) => ({
    id,
    title: SECTION_TITLES[id],
    modules: modules.filter((module) => module.section === id),
  })).filter((section) => section.modules.length > 0);

  return sections;
}

export interface QuickAddInput {
  moduleId: ModuleId;
  text: string;
}

/**
 * MOCK quick-add. Persists nothing yet; swap for the module's real create
 * endpoint later (e.g. POST /journal/entries).
 */
export async function quickAddToModule(input: QuickAddInput): Promise<QuickAddInput> {
  return withDelay(input, 350);
}
