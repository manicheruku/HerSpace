import { api } from "@/shared/api/client";
import type { Task, TaskPriority } from "@/modules/today/types/today.types";

/** Raw snake_case shape returned by the backend `/tasks` endpoints. */
interface TaskDto {
  id: number;
  title: string;
  notes: string | null;
  priority: TaskPriority;
  is_completed: boolean;
  completed_at: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  priority?: TaskPriority;
  notes?: string;
}

export interface UpdateTaskInput {
  title?: string;
  notes?: string | null;
  priority?: TaskPriority;
  is_completed?: boolean;
}

/** Convert a snake_case task DTO into the camelCase domain `Task`. */
export function mapTask(dto: TaskDto): Task {
  return {
    id: dto.id,
    title: dto.title,
    notes: dto.notes,
    priority: dto.priority,
    isCompleted: dto.is_completed,
    completedAt: dto.completed_at,
    position: dto.position,
  };
}

export async function fetchTasks(): Promise<Task[]> {
  const dtos = await api.get<TaskDto[]>("/tasks");
  return dtos.map(mapTask);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const dto = await api.post<TaskDto>("/tasks", input);
  return mapTask(dto);
}

export async function updateTask(
  id: number,
  patch: UpdateTaskInput,
): Promise<Task> {
  const dto = await api.patch<TaskDto>(`/tasks/${id}`, patch);
  return mapTask(dto);
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete<void>(`/tasks/${id}`);
}
