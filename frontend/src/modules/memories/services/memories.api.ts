import { api } from "@/shared/api/client";
import { normalizeServerDate } from "@/shared/utils/datetime";
import type {
  Memory,
  MemoryFilters,
  MemoryInput,
  MemoryMood,
  MemorySummary,
} from "@/modules/memories/types/memories.types";

/** Raw snake_case memory shape returned by the backend. */
interface MemoryDto {
  id: number;
  title: string;
  content: string;
  memory_on: string;
  mood: MemoryMood | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

interface MemorySummaryDto {
  count: number;
  favorite_count: number;
  last_updated: string | null;
  latest_title: string | null;
  latest_preview: string | null;
}

/** Convert a snake_case DTO into the camelCase domain memory. */
export function mapMemory(dto: MemoryDto): Memory {
  return {
    id: dto.id,
    title: dto.title,
    content: dto.content,
    memoryOn: dto.memory_on,
    mood: dto.mood,
    isFavorite: dto.is_favorite,
    createdAt: normalizeServerDate(dto.created_at),
    updatedAt: normalizeServerDate(dto.updated_at),
  };
}

function toPayload(input: Partial<MemoryInput>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title;
  if (input.content !== undefined) payload.content = input.content;
  if (input.memoryOn !== undefined) payload.memory_on = input.memoryOn;
  if (input.mood !== undefined) payload.mood = input.mood;
  if (input.isFavorite !== undefined) payload.is_favorite = input.isFavorite;
  return payload;
}

function buildQuery(filters: MemoryFilters): string {
  const params = new URLSearchParams();
  if (filters.favorite) params.set("favorite", "true");
  if (filters.mood) params.set("mood", filters.mood);
  if (filters.query && filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.fromDate) params.set("from", filters.fromDate);
  if (filters.toDate) params.set("to", filters.toDate);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchMemories(filters: MemoryFilters = {}): Promise<Memory[]> {
  const dtos = await api.get<MemoryDto[]>(`/memories/entries${buildQuery(filters)}`);
  return dtos.map(mapMemory);
}

export async function fetchMemory(id: number): Promise<Memory> {
  const dto = await api.get<MemoryDto>(`/memories/entries/${id}`);
  return mapMemory(dto);
}

export async function createMemory(input: MemoryInput): Promise<Memory> {
  const dto = await api.post<MemoryDto>("/memories/entries", toPayload(input));
  return mapMemory(dto);
}

export async function updateMemory(
  id: number,
  input: Partial<MemoryInput>,
): Promise<Memory> {
  const dto = await api.patch<MemoryDto>(`/memories/entries/${id}`, toPayload(input));
  return mapMemory(dto);
}

export async function toggleMemoryFavorite(id: number): Promise<Memory> {
  const dto = await api.post<MemoryDto>(`/memories/entries/${id}/favorite`);
  return mapMemory(dto);
}

export async function deleteMemory(id: number): Promise<void> {
  await api.delete<void>(`/memories/entries/${id}`);
}

export async function fetchMemorySummary(): Promise<MemorySummary> {
  const dto = await api.get<MemorySummaryDto>("/memories/summary");
  return {
    count: dto.count,
    favoriteCount: dto.favorite_count,
    lastUpdated: normalizeServerDate(dto.last_updated),
    latestTitle: dto.latest_title,
    latestPreview: dto.latest_preview,
  };
}
