import type { JSX } from "react";

import { lastNDates, weekdayInitial } from "@/modules/habits/utils/habits.format";

interface WeekDotsProps {
  /** Completed dates as ISO `YYYY-MM-DD` strings. */
  checkins: string[];
  /** Optional dot colour class for completed days (defaults to brand pink). */
  dotClass?: string;
}

/** A row of the last 7 days, filled when the habit was completed that day. */
export function WeekDots({ checkins, dotClass }: WeekDotsProps): JSX.Element {
  const done = new Set(checkins);
  const days = lastNDates(7);
  const fill = dotClass ?? "bg-blossom-500";

  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {days.map((iso, index) => {
        const completed = done.has(iso);
        const isToday = index === days.length - 1;
        return (
          <div key={iso} className="flex flex-col items-center gap-1">
            <span
              className={`size-5 rounded-full transition ${
                completed ? fill : "bg-ink-100"
              } ${isToday ? "ring-2 ring-blossom-200 ring-offset-1 ring-offset-card" : ""}`}
            />
            <span className="text-[9px] font-medium text-ink-300">{weekdayInitial(iso)}</span>
          </div>
        );
      })}
    </div>
  );
}
