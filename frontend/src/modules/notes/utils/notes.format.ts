import type { NoteColor } from "@/modules/notes/types/notes.types";

/**
 * Visual metadata for each note colour. Uses explicit pastel hex tints via
 * arbitrary Tailwind classes so it never depends on theme token availability.
 */
export const NOTE_COLOR_META: Record<
  NoteColor,
  { label: string; swatch: string; card: string; dot: string }
> = {
  rose: {
    label: "Rose",
    swatch: "bg-[#fbe6ee]",
    card: "bg-[#fdf3f5] border-[#f7c6cf]",
    dot: "bg-[#ec6788]",
  },
  peach: {
    label: "Peach",
    swatch: "bg-[#fde8d8]",
    card: "bg-[#fef4ea] border-[#f7d4b5]",
    dot: "bg-[#e8894e]",
  },
  sky: {
    label: "Sky",
    swatch: "bg-[#e0eefb]",
    card: "bg-[#f0f6fd] border-[#c2ddf5]",
    dot: "bg-[#5a9be0]",
  },
  mint: {
    label: "Mint",
    swatch: "bg-[#dcf2e6]",
    card: "bg-[#eef9f2] border-[#bfe6cf]",
    dot: "bg-[#48b27b]",
  },
  lilac: {
    label: "Lilac",
    swatch: "bg-[#efe3fb]",
    card: "bg-[#f6effd] border-[#d8c2f0]",
    dot: "bg-[#b388dd]",
  },
};

export const NOTE_COLOR_ORDER: NoteColor[] = [
  "rose",
  "peach",
  "sky",
  "mint",
  "lilac",
];

/** Human-friendly relative time, shared with the Journal formatter. */
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

/** Collapse whitespace into a single-line preview for cards. */
export function previewText(content: string, max = 160): string {
  const flat = content.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max).trimEnd()}…` : flat;
}

/** Full readable date for the note detail view. */
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
