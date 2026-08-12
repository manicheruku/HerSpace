/** Domain types for the Memories module (camelCase, UI-facing). */

export type MemoryMood = "happy" | "grateful" | "calm" | "excited" | "proud" | "nostalgic";

export interface Memory {
  id: number;
  title: string;
  content: string;
  memoryOn: string;
  mood: MemoryMood | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryInput {
  title: string;
  content: string;
  memoryOn: string;
  mood?: MemoryMood | null;
  isFavorite?: boolean;
}

/** Filters applied to the memories list view. */
export interface MemoryFilters {
  favorite?: boolean;
  mood?: MemoryMood | null;
  query?: string;
  fromDate?: string;
  toDate?: string;
}

/** Compact stats powering the Explore Memories card. */
export interface MemorySummary {
  count: number;
  favoriteCount: number;
  lastUpdated: string | null;
  latestTitle: string | null;
  latestPreview: string | null;
}
