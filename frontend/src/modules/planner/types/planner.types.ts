/** Domain types for the Planner module (camelCase, UI-facing). */

export type TaskPriority = "low" | "medium" | "high";

/** Quick-filter buckets shown in the Planner. */
export type PlannerFilter = "today" | "upcoming" | "completed";

export interface PlannerTask {
  id: number;
  title: string;
  /** Free-form description (persisted as `notes` on the backend). */
  description: string | null;
  priority: TaskPriority;
  isCompleted: boolean;
  completedAt: string | null;
  /** ISO date `YYYY-MM-DD`, or `null` when unscheduled. */
  dueDate: string | null;
  /** 24h time `HH:MM:SS`, or `null` when no specific time. */
  dueTime: string | null;
  category: string | null;
  /** ISO datetime for an optional reminder. */
  reminderAt: string | null;
  position: number;
}

export interface PlannerTaskInput {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  dueDate?: string | null;
  dueTime?: string | null;
  category?: string | null;
  reminderAt?: string | null;
}
