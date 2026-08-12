import { api } from "@/shared/api/client";
import { normalizeServerDate } from "@/shared/utils/datetime";
import type {
  Goal,
  GoalFilters,
  GoalInput,
  GoalSummary,
} from "@/modules/goals/types/goals.types";

/** Raw snake_case goal shape returned by the backend. */
interface GoalDto {
  id: number;
  title: string;
  description: string | null;
  unit: string | null;
  target_value: number;
  current_value: number;
  due_date: string | null;
  is_completed: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  progress_percent: number;
}

interface GoalSummaryDto {
  active_count: number;
  completed_count: number;
  overall_progress: number;
  last_updated: string | null;
  latest_title: string | null;
}

/** Convert a snake_case DTO into the camelCase domain goal. */
export function mapGoal(dto: GoalDto): Goal {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    unit: dto.unit,
    targetValue: dto.target_value,
    currentValue: dto.current_value,
    dueDate: dto.due_date,
    isCompleted: dto.is_completed,
    isArchived: dto.is_archived,
    createdAt: normalizeServerDate(dto.created_at),
    updatedAt: normalizeServerDate(dto.updated_at),
    progressPercent: dto.progress_percent,
  };
}

function toPayload(input: Partial<GoalInput>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title;
  if (input.description !== undefined) payload.description = input.description;
  if (input.unit !== undefined) payload.unit = input.unit;
  if (input.targetValue !== undefined) payload.target_value = input.targetValue;
  if (input.currentValue !== undefined) payload.current_value = input.currentValue;
  if (input.dueDate !== undefined) payload.due_date = input.dueDate;
  if (input.isCompleted !== undefined) payload.is_completed = input.isCompleted;
  if (input.isArchived !== undefined) payload.is_archived = input.isArchived;
  return payload;
}

function buildQuery(filters: GoalFilters): string {
  const params = new URLSearchParams();
  if (filters.includeArchived) params.set("include_archived", "true");
  if (filters.query && filters.query.trim()) params.set("q", filters.query.trim());
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchGoals(filters: GoalFilters = {}): Promise<Goal[]> {
  const dtos = await api.get<GoalDto[]>(`/goals${buildQuery(filters)}`);
  return dtos.map(mapGoal);
}

export async function fetchGoal(id: number): Promise<Goal> {
  const dto = await api.get<GoalDto>(`/goals/${id}`);
  return mapGoal(dto);
}

export async function createGoal(input: GoalInput): Promise<Goal> {
  const dto = await api.post<GoalDto>("/goals", toPayload(input));
  return mapGoal(dto);
}

export async function updateGoal(
  id: number,
  input: Partial<GoalInput>,
): Promise<Goal> {
  const dto = await api.patch<GoalDto>(`/goals/${id}`, toPayload(input));
  return mapGoal(dto);
}

export async function advanceGoal(id: number, amount: number): Promise<Goal> {
  const dto = await api.post<GoalDto>(`/goals/${id}/advance`, { amount });
  return mapGoal(dto);
}

export async function deleteGoal(id: number): Promise<void> {
  await api.delete<void>(`/goals/${id}`);
}

export async function fetchGoalSummary(): Promise<GoalSummary> {
  const dto = await api.get<GoalSummaryDto>("/goals/summary");
  return {
    activeCount: dto.active_count,
    completedCount: dto.completed_count,
    overallProgress: dto.overall_progress,
    lastUpdated: normalizeServerDate(dto.last_updated),
    latestTitle: dto.latest_title,
  };
}
