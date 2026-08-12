/** Domain types for the Goals module (camelCase, UI-facing). */

export interface Goal {
  id: number;
  title: string;
  description: string | null;
  unit: string | null;
  targetValue: number;
  currentValue: number;
  dueDate: string | null;
  isCompleted: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  progressPercent: number;
}

export interface GoalInput {
  title: string;
  description?: string | null;
  unit?: string | null;
  targetValue?: number;
  currentValue?: number;
  dueDate?: string | null;
  isCompleted?: boolean;
  isArchived?: boolean;
}

/** Filters applied to the goals list view. */
export interface GoalFilters {
  includeArchived?: boolean;
  query?: string;
}

/** Compact stats powering the Explore Goals card. */
export interface GoalSummary {
  activeCount: number;
  completedCount: number;
  overallProgress: number;
  lastUpdated: string | null;
  latestTitle: string | null;
}
