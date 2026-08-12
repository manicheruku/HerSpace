import { useMutation } from "@tanstack/react-query";

import { quickAddToModule } from "@/modules/explore/services/explore.api";

/**
 * Mutation for the module Quick Add shortcut. Mock-backed today; each module
 * will later point `quickAddToModule` at its own create endpoint.
 */
export function useModuleQuickAdd() {
  return useMutation({ mutationFn: quickAddToModule });
}
