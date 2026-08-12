import type { JSX } from "react";

import { Chip } from "@/components/ui";
import type { PlannerFilter } from "@/modules/planner/types/planner.types";

const FILTERS: { value: PlannerFilter; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
];

export interface FilterChipsProps {
  value: PlannerFilter;
  onChange: (value: PlannerFilter) => void;
  counts?: Partial<Record<PlannerFilter, number>>;
}

/** Quick-filter row for switching between Planner views. */
export function FilterChips({ value, onChange, counts }: FilterChipsProps): JSX.Element {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {FILTERS.map((filter) => {
        const count = counts?.[filter.value];
        return (
          <Chip
            key={filter.value}
            selected={value === filter.value}
            onClick={() => onChange(filter.value)}
          >
            {filter.label}
            {typeof count === "number" ? (
              <span className={value === filter.value ? "text-white/80" : "text-ink-300"}>
                {count}
              </span>
            ) : null}
          </Chip>
        );
      })}
    </div>
  );
}
