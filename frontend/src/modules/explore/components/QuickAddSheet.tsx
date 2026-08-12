import type { FormEvent, JSX } from "react";
import { useEffect, useState } from "react";

import { BottomSheet, Button, Input } from "@/components/ui";
import type { ExploreModule } from "@/modules/explore/types/explore.types";

export interface QuickAddSheetProps {
  open: boolean;
  module: ExploreModule | null;
  onClose: () => void;
  onSubmit: (module: ExploreModule, text: string) => void;
  isSubmitting?: boolean;
}

/**
 * Lightweight quick-add sheet reused across modules. Collects a single line of
 * text and hands it back; the parent decides how to persist it.
 */
export function QuickAddSheet({
  open,
  module,
  onClose,
  onSubmit,
  isSubmitting = false,
}: QuickAddSheetProps): JSX.Element {
  const [text, setText] = useState("");

  // Reset the field whenever a different module's sheet opens.
  useEffect(() => {
    if (open) setText("");
  }, [open, module?.id]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !module) return;
    onSubmit(module, trimmed);
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={module ? module.quickAddLabel : "Quick add"}>
      {module ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br ${module.gradient} text-xl`}
              aria-hidden="true"
            >
              {module.icon}
            </span>
            <p className="text-sm text-ink-500">
              Add to <span className="font-semibold text-ink-900">{module.name}</span> without
              leaving Explore.
            </p>
          </div>

          <Input
            label={module.quickAddLabel}
            placeholder={module.quickAddPlaceholder}
            value={text}
            onChange={(event) => setText(event.target.value)}
            autoFocus
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isSubmitting}
            disabled={text.trim().length === 0}
          >
            Add
          </Button>
        </form>
      ) : null}
    </BottomSheet>
  );
}
