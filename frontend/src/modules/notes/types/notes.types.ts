/** Domain types for the Notes module (camelCase, UI-facing). */

export type NoteColor = "rose" | "peach" | "sky" | "mint" | "lilac";

export interface Note {
  id: number;
  title: string;
  content: string;
  color: NoteColor | null;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteInput {
  title: string;
  content: string;
  color?: NoteColor | null;
  tags?: string[];
  isPinned?: boolean;
}

/** Filters applied to the notes list view. */
export interface NoteFilters {
  pinned?: boolean;
  tag?: string | null;
  query?: string;
}

/** Compact stats powering the Explore Notes card. */
export interface NoteSummary {
  count: number;
  pinnedCount: number;
  lastUpdated: string | null;
  latestTitle: string | null;
  latestPreview: string | null;
}
