import { api } from "@/shared/api/client";
import { normalizeServerDate } from "@/shared/utils/datetime";
import type {
  JournalEntry,
  JournalEntryInput,
  JournalFilters,
  JournalMood,
  JournalSummary,
} from "@/modules/journal/types/journal.types";

/** Raw snake_case entry shape returned by the backend. */
interface JournalEntryDto {
  id: number;
  title: string;
  content: string;
  mood: JournalMood | null;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

interface JournalSummaryDto {
  count: number;
  favorite_count: number;
  last_updated: string | null;
  latest_title: string | null;
  latest_preview: string | null;
}

/** Convert a snake_case DTO into the camelCase domain entry. */
export function mapJournalEntry(dto: JournalEntryDto): JournalEntry {
  return {
    id: dto.id,
    title: dto.title,
    content: dto.content,
    mood: dto.mood,
    tags: dto.tags,
    isFavorite: dto.is_favorite,
    createdAt: normalizeServerDate(dto.created_at),
    updatedAt: normalizeServerDate(dto.updated_at),
  };
}

function toPayload(input: Partial<JournalEntryInput>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title;
  if (input.content !== undefined) payload.content = input.content;
  if (input.mood !== undefined) payload.mood = input.mood;
  if (input.tags !== undefined) payload.tags = input.tags;
  if (input.isFavorite !== undefined) payload.is_favorite = input.isFavorite;
  return payload;
}

function buildQuery(filters: JournalFilters): string {
  const params = new URLSearchParams();
  if (filters.favorite) params.set("favorite", "true");
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.query && filters.query.trim()) params.set("q", filters.query.trim());
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchJournalEntries(
  filters: JournalFilters = {},
): Promise<JournalEntry[]> {
  const dtos = await api.get<JournalEntryDto[]>(
    `/journal/entries${buildQuery(filters)}`,
  );
  return dtos.map(mapJournalEntry);
}

export async function fetchJournalEntry(id: number): Promise<JournalEntry> {
  const dto = await api.get<JournalEntryDto>(`/journal/entries/${id}`);
  return mapJournalEntry(dto);
}

export async function createJournalEntry(
  input: JournalEntryInput,
): Promise<JournalEntry> {
  const dto = await api.post<JournalEntryDto>("/journal/entries", toPayload(input));
  return mapJournalEntry(dto);
}

export async function updateJournalEntry(
  id: number,
  input: Partial<JournalEntryInput>,
): Promise<JournalEntry> {
  const dto = await api.patch<JournalEntryDto>(
    `/journal/entries/${id}`,
    toPayload(input),
  );
  return mapJournalEntry(dto);
}

export async function toggleJournalFavorite(id: number): Promise<JournalEntry> {
  const dto = await api.post<JournalEntryDto>(`/journal/entries/${id}/favorite`);
  return mapJournalEntry(dto);
}

export async function deleteJournalEntry(id: number): Promise<void> {
  await api.delete<void>(`/journal/entries/${id}`);
}

export async function fetchJournalSummary(): Promise<JournalSummary> {
  const dto = await api.get<JournalSummaryDto>("/journal/summary");
  return {
    count: dto.count,
    favoriteCount: dto.favorite_count,
    lastUpdated: normalizeServerDate(dto.last_updated),
    latestTitle: dto.latest_title,
    latestPreview: dto.latest_preview,
  };
}
