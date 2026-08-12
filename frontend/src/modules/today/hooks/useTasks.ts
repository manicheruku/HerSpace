import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
  type CreateTaskInput,
} from "@/modules/today/services/tasks.api";
import type { Task } from "@/modules/today/types/today.types";

const TASKS_KEY = ["tasks"] as const;

interface UseTasksResult {
  tasks: Task[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  addTask: (input: CreateTaskInput) => void;
  toggleTask: (id: number, isCompleted: boolean) => void;
  removeTask: (id: number) => void;
  isMutating: boolean;
}

export function useTasks(): UseTasksResult {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: TASKS_KEY,
    queryFn: fetchTasks,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      const previous = queryClient.getQueryData<Task[]>(TASKS_KEY);
      const optimistic: Task = {
        id: -Date.now(),
        title: input.title,
        notes: input.notes ?? null,
        priority: input.priority ?? "medium",
        isCompleted: false,
        completedAt: null,
        position: previous?.length ?? 0,
      };
      queryClient.setQueryData<Task[]>(TASKS_KEY, (current) => [
        ...(current ?? []),
        optimistic,
      ]);
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(TASKS_KEY, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: number; isCompleted: boolean }) =>
      updateTask(id, { is_completed: isCompleted }),
    onMutate: async ({ id, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      const previous = queryClient.getQueryData<Task[]>(TASKS_KEY);
      queryClient.setQueryData<Task[]>(TASKS_KEY, (current) =>
        (current ?? []).map((task) =>
          task.id === id
            ? {
                ...task,
                isCompleted,
                completedAt: isCompleted ? new Date().toISOString() : null,
              }
            : task,
        ),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(TASKS_KEY, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      const previous = queryClient.getQueryData<Task[]>(TASKS_KEY);
      queryClient.setQueryData<Task[]>(TASKS_KEY, (current) =>
        (current ?? []).filter((task) => task.id !== id),
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(TASKS_KEY, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TASKS_KEY });
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
    toggleTask: (id, isCompleted) => toggleMutation.mutate({ id, isCompleted }),
    removeTask: (id) => deleteMutation.mutate(id),
    isMutating:
      createMutation.isPending ||
      toggleMutation.isPending ||
      deleteMutation.isPending,
  };
}
