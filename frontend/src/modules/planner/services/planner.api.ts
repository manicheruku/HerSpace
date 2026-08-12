import { api } from "@/shared/api/client";
import type {
  PlannerTask,
  PlannerTaskInput,
  TaskPriority,
} from "@/modules/planner/types/planner.types";

/** Raw snake_case task shape returned by the backend. */
interface PlannerTaskDto {
  id: number;
  title: string;
  notes: string | null;
  priority: TaskPriority;
  is_completed: boolean;
  completed_at: string | null;
  position: number;
  due_date: string | null;
  due_time: string | null;
  category: string | null;
  reminder_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Convert a snake_case DTO into the camelCase domain `PlannerTask`. */
export function mapPlannerTask(dto: PlannerTaskDto): PlannerTask {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.notes,
    priority: dto.priority,
    isCompleted: dto.is_completed,
    completedAt: dto.completed_at,
    dueDate: dto.due_date,
    dueTime: dto.due_time,
    category: dto.category,
    reminderAt: dto.reminder_at,
    position: dto.position,
  };
}

/** Serialize a camelCase input into the backend snake_case payload. */
function toPayload(input: PlannerTaskInput): Record<string, unknown> {
  const payload: Record<string, unknown> = { title: input.title };
  if (input.description !== undefined) payload.notes = input.description;
  if (input.priority !== undefined) payload.priority = input.priority;
  if (input.dueDate !== undefined) payload.due_date = input.dueDate;
  if (input.dueTime !== undefined) payload.due_time = input.dueTime;
  if (input.category !== undefined) payload.category = input.category;
  if (input.reminderAt !== undefined) payload.reminder_at = input.reminderAt;
  return payload;
}

/** Fetch every planner task (scheduled first); the UI derives the buckets. */
export async function fetchPlannerTasks(): Promise<PlannerTask[]> {
  const dtos = await api.get<PlannerTaskDto[]>("/planner/tasks?filter=all");
  return dtos.map(mapPlannerTask);
}

export async function createPlannerTask(
  input: PlannerTaskInput,
): Promise<PlannerTask> {
  const dto = await api.post<PlannerTaskDto>("/tasks", toPayload(input));
  return mapPlannerTask(dto);
}

export async function updatePlannerTask(
  id: number,
  input: Partial<PlannerTaskInput> & { isCompleted?: boolean },
): Promise<PlannerTask> {
  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title;
  if (input.description !== undefined) payload.notes = input.description;
  if (input.priority !== undefined) payload.priority = input.priority;
  if (input.dueDate !== undefined) payload.due_date = input.dueDate;
  if (input.dueTime !== undefined) payload.due_time = input.dueTime;
  if (input.category !== undefined) payload.category = input.category;
  if (input.reminderAt !== undefined) payload.reminder_at = input.reminderAt;
  if (input.isCompleted !== undefined) payload.is_completed = input.isCompleted;
  const dto = await api.patch<PlannerTaskDto>(`/tasks/${id}`, payload);
  return mapPlannerTask(dto);
}

export async function deletePlannerTask(id: number): Promise<void> {
  await api.delete<void>(`/tasks/${id}`);
}

export async function reschedulePlannerTask(
  id: number,
  dueDate: string | null,
  dueTime: string | null,
): Promise<PlannerTask> {
  const dto = await api.post<PlannerTaskDto>(
    `/planner/tasks/${id}/reschedule`,
    { due_date: dueDate, due_time: dueTime },
  );
  return mapPlannerTask(dto);
}
