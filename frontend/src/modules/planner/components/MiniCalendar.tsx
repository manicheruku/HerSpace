import type { JSX } from "react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Card } from "@/components/ui";
import { toISODate } from "@/modules/planner/utils/date";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export interface MiniCalendarProps {
  selectedDate: string;
  onSelect: (iso: string) => void;
  /** ISO dates that have at least one task (renders a dot). */
  markedDates: Set<string>;
}

interface Cell {
  iso: string;
  day: number;
  inMonth: boolean;
}

function buildMonth(viewYear: number, viewMonth: number): Cell[] {
  const first = new Date(viewYear, viewMonth, 1);
  const startOffset = first.getDay();
  const gridStart = new Date(viewYear, viewMonth, 1 - startOffset);
  const cells: Cell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    cells.push({
      iso: toISODate(date),
      day: date.getDate(),
      inMonth: date.getMonth() === viewMonth,
    });
  }
  return cells;
}

/** Monthly mini calendar with task markers and month navigation. */
export function MiniCalendar({ selectedDate, onSelect, markedDates }: MiniCalendarProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const initial = new Date(selectedDate);
  const [view, setView] = useState({ year: initial.getFullYear(), month: initial.getMonth() });
  const [direction, setDirection] = useState(0);

  const todayIso = toISODate(new Date());
  const cells = useMemo(() => buildMonth(view.year, view.month), [view]);
  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  function shiftMonth(delta: number) {
    setDirection(delta);
    setView((current) => {
      const next = new Date(current.year, current.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  return (
    <Card variant="plain" className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => shiftMonth(-1)}
          className="flex size-8 items-center justify-center rounded-full text-ink-500 transition hover:bg-blossom-50"
        >
          ‹
        </button>
        <span className="font-display text-sm font-semibold text-ink-900">{monthLabel}</span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => shiftMonth(1)}
          className="flex size-8 items-center justify-center rounded-full text-ink-500 transition hover:bg-blossom-50"
        >
          ›
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center text-[0.65rem] font-medium text-ink-300">
        {WEEKDAYS.map((day, index) => (
          <span key={index}>{day}</span>
        ))}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div
            key={`${view.year}-${view.month}`}
            custom={direction}
            initial={reduceMotion ? false : { x: direction >= 0 ? 40 : -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { x: direction >= 0 ? -40 : 40, opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
            className="grid grid-cols-7 gap-y-1"
          >
            {cells.map((cell) => {
              const isSelected = cell.iso === selectedDate;
              const isToday = cell.iso === todayIso;
              const marked = markedDates.has(cell.iso);
              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => onSelect(cell.iso)}
                  className="flex flex-col items-center justify-center py-0.5"
                >
                  <span
                    className={`flex size-8 items-center justify-center rounded-full text-sm transition ${
                      isSelected
                        ? "bg-[image:var(--gradient-brand)] font-semibold text-white shadow-[var(--shadow-button)]"
                        : isToday
                          ? "font-semibold text-blossom-600"
                          : cell.inMonth
                            ? "text-ink-700"
                            : "text-ink-100"
                    }`}
                  >
                    {cell.day}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 size-1 rounded-full ${
                      marked && !isSelected ? "bg-blossom-400" : "bg-transparent"
                    }`}
                  />
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  );
}
