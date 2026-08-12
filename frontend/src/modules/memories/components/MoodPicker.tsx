import type { JSX } from "react";

import { Chip } from "@/components/ui";
import {
  MEMORY_MOOD_META,
  MEMORY_MOOD_ORDER,
} from "@/modules/memories/utils/memories.format";
import type { MemoryMood } from "@/modules/memories/types/memories.types";

interface MoodPickerProps {
  value: MemoryMood | null;
  onChange: (value: MemoryMood | null) => void;
}

/** Choose an optional mood label for a memory. */
export function MoodPicker({ value, onChange }: MoodPickerProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium text-ink-700">Mood</div>
      <div className="flex flex-wrap gap-2">
        <Chip selected={value === null} onClick={() => onChange(null)}>
          None
        </Chip>
        {MEMORY_MOOD_ORDER.map((mood) => {
          const meta = MEMORY_MOOD_META[mood];
          return (
            <Chip
              key={mood}
              selected={value === mood}
              onClick={() => onChange(mood)}
              leftIcon={meta.emoji}
            >
              {meta.label}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}
