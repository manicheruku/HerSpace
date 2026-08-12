import { api } from "@/shared/api/client";
import { normalizeServerDate } from "@/shared/utils/datetime";
import type {
  Note,
  NoteColor,
  NoteFilters,
  NoteInput,
  NoteSummary,
} from "@/modules/notes/types/notes.types";

/** Raw snake_case note shape returned by the backend. */
interface NoteDto {
  id: number;
  title: string;
  content: string;
  color: NoteColor | null;
  tags: string[];
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

interface NoteSummaryDto {
  count: number;
  pinned_count: number;
  last_updated: string | null;
  latest_title: string | null;
  latest_preview: string | null;
}

/** Convert a snake_case DTO into the camelCase domain note. */
export function mapNote(dto: NoteDto): Note {
  return {
    id: dto.id,
    title: dto.title,
    content: dto.content,
    color: dto.color,
    tags: dto.tags,
    isPinned: dto.is_pinned,
    createdAt: normalizeServerDate(dto.created_at),
    updatedAt: normalizeServerDate(dto.updated_at),
  };
}

function toPayload(input: Partial<NoteInput>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title;
  if (input.content !== undefined) payload.content = input.content;
  if (input.color !== undefined) payload.color = input.color;
  if (input.tags !== undefined) payload.tags = input.tags;
  if (input.isPinned !== undefined) payload.is_pinned = input.isPinned;
  return payload;
}

function buildQuery(filters: NoteFilters): string {
  const params = new URLSearchParams();
  if (filters.pinned) params.set("pinned", "true");
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.query && filters.query.trim()) params.set("q", filters.query.trim());
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchNotes(filters: NoteFilters = {}): Promise<Note[]> {
  const dtos = await api.get<NoteDto[]>(`/notes/entries${buildQuery(filters)}`);
  return dtos.map(mapNote);
}

export async function fetchNote(id: number): Promise<Note> {
  const dto = await api.get<NoteDto>(`/notes/entries/${id}`);
  return mapNote(dto);
}

export async function createNote(input: NoteInput): Promise<Note> {
  const dto = await api.post<NoteDto>("/notes/entries", toPayload(input));
  return mapNote(dto);
}

export async function updateNote(
  id: number,
  input: Partial<NoteInput>,
): Promise<Note> {
  const dto = await api.patch<NoteDto>(`/notes/entries/${id}`, toPayload(input));
  return mapNote(dto);
}

export async function toggleNotePin(id: number): Promise<Note> {
  const dto = await api.post<NoteDto>(`/notes/entries/${id}/pin`);
  return mapNote(dto);
}

export async function deleteNote(id: number): Promise<void> {
  await api.delete<void>(`/notes/entries/${id}`);
}

export async function fetchNoteSummary(): Promise<NoteSummary> {
  const dto = await api.get<NoteSummaryDto>("/notes/summary");
  return {
    count: dto.count,
    pinnedCount: dto.pinned_count,
    lastUpdated: normalizeServerDate(dto.last_updated),
    latestTitle: dto.latest_title,
    latestPreview: dto.latest_preview,
  };
}
