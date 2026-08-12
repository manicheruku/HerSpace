import { api } from "@/shared/api/client";
import { normalizeServerDate } from "@/shared/utils/datetime";
import type {
  Habit,
  HabitColor,
  HabitFilters,
  HabitInput,
  HabitSummary,
} from "@/modules/habits/types/habits.types";

/** Raw snake_case habit shape returned by the backend. */
interface HabitDto {
  id: number;
  name: string;
  emoji: string | null;
  color: HabitColor | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  current_streak: number;
  longest_streak: number;
  completed_today: boolean;
  total_checkins: number;
  week_count: number;
  recent_checkins: string[];
}

interface HabitSummaryDto {
  active_count: number;
  checked_in_today: number;
  best_streak: number;
  latest_name: string | null;
}

/** Convert a snake_case DTO into the camelCase domain habit. */
export function mapHabit(dto: HabitDto): Habit {
  return {
    id: dto.id,
    name: dto.name,
    emoji: dto.emoji,
    color: dto.color,
    isArchived: dto.is_archived,
    createdAt: normalizeServerDate(dto.created_at),
    updatedAt: normalizeServerDate(dto.updated_at),
    currentStreak: dto.current_streak,
    longestStreak: dto.longest_streak,
    completedToday: dto.completed_today,
    totalCheckins: dto.total_checkins,
    weekCount: dto.week_count,
    // recent_checkins are plain calendar dates (no time) — kept as-is.
    recentCheckins: dto.recent_checkins,
  };
}

function toPayload(input: Partial<HabitInput>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.emoji !== undefined) payload.emoji = input.emoji;
  if (input.color !== undefined) payload.color = input.color;
  if (input.isArchived !== undefined) payload.is_archived = input.isArchived;
  return payload;
}

function buildQuery(filters: HabitFilters): string {
  const params = new URLSearchParams();
  if (filters.includeArchived) params.set("include_archived", "true");
  if (filters.query && filters.query.trim()) params.set("q", filters.query.trim());
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchHabits(filters: HabitFilters = {}): Promise<Habit[]> {
  const dtos = await api.get<HabitDto[]>(`/habits${buildQuery(filters)}`);
  return dtos.map(mapHabit);
}

export async function fetchHabit(id: number): Promise<Habit> {
  const dto = await api.get<HabitDto>(`/habits/${id}`);
  return mapHabit(dto);
}

export async function createHabit(input: HabitInput): Promise<Habit> {
  const dto = await api.post<HabitDto>("/habits", toPayload(input));
  return mapHabit(dto);
}

export async function updateHabit(
  id: number,
  input: Partial<HabitInput>,
): Promise<Habit> {
  const dto = await api.patch<HabitDto>(`/habits/${id}`, toPayload(input));
  return mapHabit(dto);
}

/** Toggle a habit's completion for a day (defaults to the client's local today). */
export async function toggleHabitCheck(id: number, on?: string): Promise<Habit> {
  const qs = on ? `?on=${on}` : "";
  const dto = await api.post<HabitDto>(`/habits/${id}/check${qs}`);
  return mapHabit(dto);
}

export async function deleteHabit(id: number): Promise<void> {
  await api.delete<void>(`/habits/${id}`);
}

export async function fetchHabitSummary(): Promise<HabitSummary> {
  const dto = await api.get<HabitSummaryDto>("/habits/summary");
  return {
    activeCount: dto.active_count,
    checkedInToday: dto.checked_in_today,
    bestStreak: dto.best_streak,
    latestName: dto.latest_name,
  };
}
