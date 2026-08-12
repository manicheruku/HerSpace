import type { JournalMood } from "@/modules/journal/types/journal.types";

/** Display metadata for each mood value (shared vocabulary with Today). */
export const MOOD_META: Record<JournalMood, { emoji: string; label: string }> = {
  great: { emoji: "😀", label: "Great" },
  good: { emoji: "🙂", label: "Good" },
  okay: { emoji: "😐", label: "Okay" },
  down: { emoji: "😔", label: "Down" },
  awful: { emoji: "😭", label: "Awful" },
};

export const MOOD_ORDER: JournalMood[] = ["great", "good", "okay", "down", "awful"];

/** Human-friendly relative time, mirroring the Explore formatter. */
export function formatRelativeTime(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Full readable date for entry detail views. */
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

/** Collapse whitespace and clip content to a short preview. */
export function previewText(content: string, length = 140): string {
  const collapsed = content.replace(/\s+/g, " ").trim();
  return collapsed.length <= length ? collapsed : `${collapsed.slice(0, length).trimEnd()}…`;
}
