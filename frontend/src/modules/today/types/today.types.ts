export interface Weather {
  tempC: number;
  /** Apparent ("feels like") temperature in Celsius. */
  feelsLikeC: number;
  condition: string;
  city: string;
  /** Emoji icon representing the current weather. */
  icon: string;
}

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  notes: string | null;
  priority: TaskPriority;
  isCompleted: boolean;
  completedAt: string | null;
  position: number;
}

export interface Water {
  /** ISO date (YYYY-MM-DD) the log belongs to. */
  date: string;
  glasses: number;
  goal: number;
}

export type MoodValue = "great" | "good" | "okay" | "down" | "awful";

export interface MoodOption {
  value: MoodValue;
  emoji: string;
  label: string;
}

export interface DailyMessage {
  id: string;
  text: string;
  author?: string;
}
