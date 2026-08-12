import type { BadgeTone } from "@/components/ui";
import type { TaskPriority } from "@/modules/planner/types/planner.types";

/** Format a `Date` as a local `YYYY-MM-DD` string (no timezone shift). */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Today's local date as `YYYY-MM-DD`. */
export function todayISO(): string {
  return toISODate(new Date());
}

/** Parse a `YYYY-MM-DD` string into a local `Date` at midnight. */
export function parseISODate(iso: string): Date {
  const parts = iso.split("-");
  const year = Number(parts[0] ?? "1970");
  const month = Number(parts[1] ?? "1");
  const day = Number(parts[2] ?? "1");
  return new Date(year, month - 1, day);
}

/** ISO date `days` after the given ISO date (local, no timezone shift). */
export function addDaysISO(iso: string, days: number): string {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Convert a 24h `HH:MM[:SS]` string into a friendly 12h label, e.g. "2:30 PM". */
export function formatTime(time: string | null): string | null {
  if (!time) return null;
  const parts = time.split(":");
  let hours = Number(parts[0] ?? "0");
  const minutes = Number(parts[1] ?? "0");
  const period = hours >= 12 ? "PM" : "AM";
  hours %= 12;
  if (hours === 0) hours = 12;
  return `${hours}:${String(minutes).padStart(2, "0")} ${period}`;
}

/** Whole-day difference between an ISO date and today (negative = past). */
export function dayDiffFromToday(iso: string): number {
  const target = parseISODate(iso);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** Relative, human-friendly day label such as "Today" or "Mon, Jul 7". */
export function formatDayLabel(iso: string | null): string {
  if (!iso) return "No date";
  const diff = dayDiffFromToday(iso);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return parseISODate(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Long-form date used in headers, e.g. "Wednesday, July 2". */
export function formatLongDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export const PRIORITY_META: Record<TaskPriority, { label: string; tone: BadgeTone }> = {
  low: { label: "Low", tone: "sky" },
  medium: { label: "Medium", tone: "lilac" },
  high: { label: "High", tone: "blossom" },
};
