import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createJournalEntry,
  deleteJournalEntry,
  toggleJournalFavorite,
  updateJournalEntry,
} from "@/modules/journal/services/journal.api";
import { JOURNAL_KEYS } from "@/modules/journal/hooks/useJournalEntries";
import type { JournalEntryInput } from "@/modules/journal/types/journal.types";

/**
 * Create/update/delete/favorite mutations for journal entries.
 *
 * All of them invalidate the journal queries plus the Explore summary and the
 * global search cache, so every surface that shows journal data stays in sync.
 */
export function useJournalMutations() {
  const queryClient = useQueryClient();

  function invalidateAll(): void {
    void queryClient.invalidateQueries({ queryKey: JOURNAL_KEYS.all });
    void queryClient.invalidateQueries({ queryKey: ["explore", "library"] });
    void queryClient.invalidateQueries({ queryKey: ["search"] });
  }

  const create = useMutation({
    mutationFn: (input: JournalEntryInput) => createJournalEntry(input),
    onSuccess: invalidateAll,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<JournalEntryInput> }) =>
      updateJournalEntry(id, input),
    onSuccess: invalidateAll,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteJournalEntry(id),
    onSuccess: invalidateAll,
  });

  const favorite = useMutation({
    mutationFn: (id: number) => toggleJournalFavorite(id),
    onSuccess: invalidateAll,
  });

  return { create, update, remove, favorite };
}
