import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createPlannerTask,
  deletePlannerTask,
  fetchPlannerTasks,
  reschedulePlannerTask,
  updatePlannerTask,
} from "@/modules/planner/services/planner.api";
import type {
  PlannerTask,
  PlannerTaskInput,
} from "@/modules/planner/types/planner.types";

const PLANNER_KEY = ["planner", "tasks"] as const;

export interface UpdatePlannerInput extends Partial<PlannerTaskInput> {
  isCompleted?: boolean;
}

interface UsePlannerTasksResult {
  tasks: PlannerTask[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  addTask: (input: PlannerTaskInput) => void;
  editTask: (id: number, input: UpdatePlannerInput) => void;
  toggleTask: (id: number, isCompleted: boolean) => void;
  removeTask: (id: number) => void;
  rescheduleTask: (id: number, dueDate: string | null, dueTime: string | null) => void;
  isMutating: boolean;
}

function patchList(list: PlannerTask[] | undefined, id: number, patch: Partial<PlannerTask>): PlannerTask[] {
  return (list ?? []).map((task) => (task.id === id ? { ...task, ...patch } : task));
}

export function usePlannerTasks(): UsePlannerTasksResult {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: PLANNER_KEY,
    queryFn: fetchPlannerTasks,
  });

  const createMutation = useMutation({
    mutationFn: (input: PlannerTaskInput) => createPlannerTask(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: PLANNER_KEY });
      const previous = queryClient.getQueryData<PlannerTask[]>(PLANNER_KEY);
      const optimistic: PlannerTask = {
        id: -Date.now(),
        title: input.title,
        description: input.description ?? null,
        priority: input.priority ?? "medium",
        isCompleted: false,
        completedAt: null,
        dueDate: input.dueDate ?? null,
        dueTime: input.dueTime ?? null,
        category: input.category ?? null,
        reminderAt: input.reminderAt ?? null,
        position: previous?.length ?? 0,
      };
      queryClient.setQueryData<PlannerTask[]>(PLANNER_KEY, (current) => [
        ...(current ?? []),
        optimistic,
      ]);
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(PLANNER_KEY, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: PLANNER_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdatePlannerInput }) =>
      updatePlannerTask(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: PLANNER_KEY });
      const previous = queryClient.getQueryData<PlannerTask[]>(PLANNER_KEY);
      const patch: Partial<PlannerTask> = {};
      if (input.title !== undefined) patch.title = input.title;
      if (input.description !== undefined) patch.description = input.description;
      if (input.priority !== undefined) patch.priority = input.priority;
      if (input.dueDate !== undefined) patch.dueDate = input.dueDate;
      if (input.dueTime !== undefined) patch.dueTime = input.dueTime;
      if (input.category !== undefined) patch.category = input.category;
      if (input.reminderAt !== undefined) patch.reminderAt = input.reminderAt;
      if (input.isCompleted !== undefined) {
        patch.isCompleted = input.isCompleted;
        patch.completedAt = input.isCompleted ? new Date().toISOString() : null;
      }
      queryClient.setQueryData<PlannerTask[]>(PLANNER_KEY, (current) =>
        patchList(current, id, patch),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(PLANNER_KEY, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: PLANNER_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePlannerTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: PLANNER_KEY });
      const previous = queryClient.getQueryData<PlannerTask[]>(PLANNER_KEY);
      queryClient.setQueryData<PlannerTask[]>(PLANNER_KEY, (current) =>
        (current ?? []).filter((task) => task.id !== id),
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(PLANNER_KEY, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: PLANNER_KEY });
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, dueDate, dueTime }: { id: number; dueDate: string | null; dueTime: string | null }) =>
      reschedulePlannerTask(id, dueDate, dueTime),
    onMutate: async ({ id, dueDate, dueTime }) => {
      await queryClient.cancelQueries({ queryKey: PLANNER_KEY });
      const previous = queryClient.getQueryData<PlannerTask[]>(PLANNER_KEY);
      queryClient.setQueryData<PlannerTask[]>(PLANNER_KEY, (current) =>
        patchList(current, id, { dueDate, dueTime }),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(PLANNER_KEY, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: PLANNER_KEY });
    },
  });

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch();
    },
    addTask: (input) => createMutation.mutate(input),
    editTask: (id, input) => updateMutation.mutate({ id, input }),
    toggleTask: (id, isCompleted) => updateMutation.mutate({ id, input: { isCompleted } }),
    removeTask: (id) => deleteMutation.mutate(id),
    rescheduleTask: (id, dueDate, dueTime) =>
      rescheduleMutation.mutate({ id, dueDate, dueTime }),
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      rescheduleMutation.isPending,
  };
}
