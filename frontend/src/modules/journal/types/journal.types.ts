/** Domain types for the Journal module (camelCase, UI-facing). */

export type JournalMood = "great" | "good" | "okay" | "down" | "awful";

export interface JournalEntry {
  id: number;
  title: string;
  content: string;
  mood: JournalMood | null;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryInput {
  title: string;
  content: string;
  mood?: JournalMood | null;
  tags?: string[];
  isFavorite?: boolean;
}

/** Filters applied to the journal list view. */
export interface JournalFilters {
  favorite?: boolean;
  tag?: string | null;
  query?: string;
}

/** Compact stats powering the Explore Journal card. */
export interface JournalSummary {
  count: number;
  favoriteCount: number;
  lastUpdated: string | null;
  latestTitle: string | null;
  latestPreview: string | null;
}
