import type { JSX } from "react";

import { HABIT_COLOR_META, HABIT_COLOR_ORDER } from "@/modules/habits/utils/habits.format";
import type { HabitColor } from "@/modules/habits/types/habits.types";

interface ColorPickerProps {
  value: HabitColor | null;
  onChange: (color: HabitColor | null) => void;
}

/** Colour swatch selector; tapping the active colour clears it. */
export function ColorPicker({ value, onChange }: ColorPickerProps): JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink-700">Colour</span>
      <div className="flex items-center gap-2.5">
        {HABIT_COLOR_ORDER.map((color) => {
          const meta = HABIT_COLOR_META[color];
          const isActive = value === color;
          return (
            <button
              key={color}
              type="button"
              onClick={() => onChange(isActive ? null : color)}
              aria-pressed={isActive}
              aria-label={meta.label}
              title={meta.label}
              className={`flex size-9 items-center justify-center rounded-full transition ${
                isActive ? "ring-2 ring-ink-500 ring-offset-2 ring-offset-card" : "hover:scale-110"
              }`}
            >
              <span className={`size-6 rounded-full ${meta.dot}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
