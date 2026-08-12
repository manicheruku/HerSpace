import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createNote,
  deleteNote,
  toggleNotePin,
  updateNote,
} from "@/modules/notes/services/notes.api";
import { NOTES_KEYS } from "@/modules/notes/hooks/useNotes";
import type { NoteInput } from "@/modules/notes/types/notes.types";

/**
 * Create/update/delete/pin mutations for notes.
 *
 * All of them invalidate the notes queries plus the Explore summary and the
 * global search cache, so every surface that shows notes data stays in sync.
 */
export function useNoteMutations() {
  const queryClient = useQueryClient();

  function invalidateAll(): void {
    void queryClient.invalidateQueries({ queryKey: NOTES_KEYS.all });
    void queryClient.invalidateQueries({ queryKey: ["explore", "library"] });
    void queryClient.invalidateQueries({ queryKey: ["search"] });
  }

  const create = useMutation({
    mutationFn: (input: NoteInput) => createNote(input),
    onSuccess: invalidateAll,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<NoteInput> }) =>
      updateNote(id, input),
    onSuccess: invalidateAll,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteNote(id),
    onSuccess: invalidateAll,
  });

  const pin = useMutation({
    mutationFn: (id: number) => toggleNotePin(id),
    onSuccess: invalidateAll,
  });

  return { create, update, remove, pin };
}
