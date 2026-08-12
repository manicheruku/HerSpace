import type { JSX } from "react";

import { HABIT_EMOJI_CHOICES } from "@/modules/habits/utils/habits.format";

interface EmojiPickerProps {
  value: string | null;
  onChange: (emoji: string | null) => void;
}

/** Emoji selector for a habit; tapping the active emoji clears it. */
export function EmojiPicker({ value, onChange }: EmojiPickerProps): JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink-700">Icon</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {HABIT_EMOJI_CHOICES.map((emoji) => {
          const isActive = value === emoji;
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => onChange(isActive ? null : emoji)}
              aria-pressed={isActive}
              aria-label={`Icon ${emoji}`}
              className={`flex size-10 items-center justify-center rounded-[var(--radius-md)] text-xl transition ${
                isActive ? "bg-blossom-50 ring-1 ring-blossom-200" : "hover:bg-surface"
              }`}
            >
              {emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}
