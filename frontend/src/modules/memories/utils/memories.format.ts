import type { MemoryMood } from "@/modules/memories/types/memories.types";

export const MEMORY_MOOD_META: Record<MemoryMood, { label: string; emoji: string }> = {
  happy: { label: "Happy", emoji: "😊" },
  grateful: { label: "Grateful", emoji: "🙏" },
  calm: { label: "Calm", emoji: "🌿" },
  excited: { label: "Excited", emoji: "✨" },
  proud: { label: "Proud", emoji: "🏅" },
  nostalgic: { label: "Nostalgic", emoji: "📷" },
};

export const MEMORY_MOOD_ORDER: MemoryMood[] = [
  "happy",
  "grateful",
  "calm",
  "excited",
  "proud",
  "nostalgic",
];

/** Human-friendly relative time. */
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
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Full readable date for the memory detail view. */
export function formatLongDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Collapse whitespace into a single-line preview for cards. */
export function previewText(content: string, max = 160): string {
  const flat = content.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max).trimEnd()}…` : flat;
}
