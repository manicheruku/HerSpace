import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createMemory,
  deleteMemory,
  toggleMemoryFavorite,
  updateMemory,
} from "@/modules/memories/services/memories.api";
import { MEMORIES_KEYS } from "@/modules/memories/hooks/useMemories";
import type { MemoryInput } from "@/modules/memories/types/memories.types";

/**
 * Create/update/delete/favorite mutations for memories.
 *
 * All of them invalidate memory queries plus Explore summary and global search
 * cache so every surface stays in sync.
 */
export function useMemoryMutations() {
  const queryClient = useQueryClient();

  function invalidateAll(): void {
    void queryClient.invalidateQueries({ queryKey: MEMORIES_KEYS.all });
    void queryClient.invalidateQueries({ queryKey: ["explore", "library"] });
    void queryClient.invalidateQueries({ queryKey: ["search"] });
  }

  const create = useMutation({
    mutationFn: (input: MemoryInput) => createMemory(input),
    onSuccess: invalidateAll,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<MemoryInput> }) =>
      updateMemory(id, input),
    onSuccess: invalidateAll,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteMemory(id),
    onSuccess: invalidateAll,
  });

  const favorite = useMutation({
    mutationFn: (id: number) => toggleMemoryFavorite(id),
    onSuccess: invalidateAll,
  });

  return { create, update, remove, favorite };
}
