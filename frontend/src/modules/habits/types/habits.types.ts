/** Domain types for the Habits module (camelCase, UI-facing). */

export type HabitColor = "rose" | "peach" | "sky" | "mint" | "lilac";

export interface Habit {
  id: number;
  name: string;
  emoji: string | null;
  color: HabitColor | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  /** Consecutive days completed, ending today (or yesterday if today is pending). */
  currentStreak: number;
  /** Longest run of consecutive completed days ever. */
  longestStreak: number;
  /** Whether the habit has been checked in today. */
  completedToday: boolean;
  /** Total number of days ever completed. */
  totalCheckins: number;
  /** Days completed within the last 7 days (today inclusive). */
  weekCount: number;
  /** The most recent completed dates as ISO `YYYY-MM-DD` strings (newest first). */
  recentCheckins: string[];
}

export interface HabitInput {
  name: string;
  emoji?: string | null;
  color?: HabitColor | null;
  isArchived?: boolean;
}

/** Filters applied to the habits list view. */
export interface HabitFilters {
  includeArchived?: boolean;
  query?: string;
}

/** Compact stats powering the Explore Habits card. */
export interface HabitSummary {
  activeCount: number;
  checkedInToday: number;
  bestStreak: number;
  latestName: string | null;
}
