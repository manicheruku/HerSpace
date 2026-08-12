import type { HabitColor } from "@/modules/habits/types/habits.types";

/**
 * Visual metadata for each habit colour. Uses explicit pastel hex tints via
 * arbitrary Tailwind classes so it never depends on theme token availability.
 * (Shares the same palette vocabulary as the Notes module.)
 */
export const HABIT_COLOR_META: Record<
  HabitColor,
  { label: string; swatch: string; card: string; dot: string; ring: string }
> = {
  rose: {
    label: "Rose",
    swatch: "bg-[#fbe6ee]",
    card: "bg-[#fdf3f5] border-[#f7c6cf]",
    dot: "bg-[#ec6788]",
    ring: "ring-[#ec6788]",
  },
  peach: {
    label: "Peach",
    swatch: "bg-[#fde8d8]",
    card: "bg-[#fef4ea] border-[#f7d4b5]",
    dot: "bg-[#e8894e]",
    ring: "ring-[#e8894e]",
  },
  sky: {
    label: "Sky",
    swatch: "bg-[#e0eefb]",
    card: "bg-[#f0f6fd] border-[#c2ddf5]",
    dot: "bg-[#5a9be0]",
    ring: "ring-[#5a9be0]",
  },
  mint: {
    label: "Mint",
    swatch: "bg-[#dcf2e6]",
    card: "bg-[#eef9f2] border-[#bfe6cf]",
    dot: "bg-[#48b27b]",
    ring: "ring-[#48b27b]",
  },
  lilac: {
    label: "Lilac",
    swatch: "bg-[#efe3fb]",
    card: "bg-[#f6effd] border-[#d8c2f0]",
    dot: "bg-[#b388dd]",
    ring: "ring-[#b388dd]",
  },
};

export const HABIT_COLOR_ORDER: HabitColor[] = [
  "rose",
  "peach",
  "sky",
  "mint",
  "lilac",
];

/** A curated set of emoji suggestions for common habits. */
export const HABIT_EMOJI_CHOICES: string[] = [
  "💧",
  "🏃",
  "🧘",
  "📚",
  "🥗",
  "😴",
  "🧹",
  "✍️",
  "🎯",
  "🌱",
  "💊",
  "🚶",
];

/** ISO `YYYY-MM-DD` for the client's local today (used for check-ins). */
export function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** The last `days` calendar dates as ISO strings, oldest first (today last). */
export function lastNDates(days: number): string[] {
  const result: string[] = [];
  const base = new Date();
  base.setHours(12, 0, 0, 0); // avoid DST edge cases
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    result.push(`${y}-${m}-${day}`);
  }
  return result;
}

/** Single-letter weekday label for an ISO date (e.g. "M", "T"). */
export function weekdayInitial(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return ["S", "M", "T", "W", "T", "F", "S"][d.getDay()] ?? "";
}

/** Human streak label, e.g. "5 day streak" / "1 day streak" / "No streak yet". */
export function formatStreak(streak: number): string {
  if (streak <= 0) return "No streak yet";
  return `${streak} day${streak === 1 ? "" : "s"} streak`;
}

/** Full readable date for the habit detail view. */
export function formatLongDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
