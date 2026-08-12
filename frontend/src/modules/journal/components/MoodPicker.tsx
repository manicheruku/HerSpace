import type { JSX } from "react";

import { MOOD_META, MOOD_ORDER } from "@/modules/journal/utils/journal.format";
import type { JournalMood } from "@/modules/journal/types/journal.types";

interface MoodPickerProps {
  value: JournalMood | null;
  onChange: (mood: JournalMood | null) => void;
}

/** Emoji mood selector; tapping the active mood clears it. */
export function MoodPicker({ value, onChange }: MoodPickerProps): JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink-700">Mood</span>
      <div className="flex items-center justify-between gap-1.5">
        {MOOD_ORDER.map((mood) => {
          const isActive = value === mood;
          return (
            <button
              key={mood}
              type="button"
              onClick={() => onChange(isActive ? null : mood)}
              aria-pressed={isActive}
              aria-label={MOOD_META[mood].label}
              className={`flex flex-1 flex-col items-center gap-1 rounded-[var(--radius-md)] py-2 text-2xl transition-colors ${
                isActive ? "bg-blossom-50 ring-1 ring-blossom-200" : "hover:bg-surface"
              }`}
            >
              <span>{MOOD_META[mood].emoji}</span>
              <span className="text-[10px] font-medium text-ink-500">
                {MOOD_META[mood].label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
