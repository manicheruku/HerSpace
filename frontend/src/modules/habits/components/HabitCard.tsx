import type { JSX } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { WeekDots } from "@/modules/habits/components/WeekDots";
import { HABIT_COLOR_META, formatStreak } from "@/modules/habits/utils/habits.format";
import type { Habit } from "@/modules/habits/types/habits.types";

interface HabitCardProps {
  habit: Habit;
  onOpen: (habit: Habit) => void;
  onToggleToday: (habit: Habit) => void;
  isToggling?: boolean;
}

/** A habit summary card with a tap-to-complete-today circle and week dots. */
export function HabitCard({
  habit,
  onOpen,
  onToggleToday,
  isToggling = false,
}: HabitCardProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const palette = habit.color ? HABIT_COLOR_META[habit.color] : null;

  return (
    <motion.div
      layout={!reduceMotion}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className={`relative overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-card)] ring-1 ring-black/5 ${
        palette ? `border ${palette.card}` : "bg-card"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <button
          type="button"
          onClick={() => onToggleToday(habit)}
          disabled={isToggling}
          aria-pressed={habit.completedToday}
          aria-label={
            habit.completedToday ? "Mark not done today" : "Mark done today"
          }
          className={`flex size-11 shrink-0 items-center justify-center rounded-full border-2 text-lg transition disabled:opacity-60 ${
            habit.completedToday
              ? `border-transparent text-white ${palette ? palette.dot : "bg-blossom-500"}`
              : "border-ink-200 text-ink-300 hover:border-blossom-300"
          }`}
        >
          {habit.completedToday ? "✓" : habit.emoji ?? "○"}
        </button>

        <button
          type="button"
          onClick={() => onOpen(habit)}
          className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
          aria-label={`Open ${habit.name}`}
        >
          <span className="flex items-center gap-1.5 truncate font-display text-base font-semibold text-ink-900">
            {habit.emoji ? <span aria-hidden="true">{habit.emoji}</span> : null}
            {habit.name}
          </span>
          <span className="text-xs text-ink-500">
            🔥 {formatStreak(habit.currentStreak)} · {habit.weekCount}/7 this week
          </span>
        </button>

        <div className="hidden sm:block">
          <WeekDots checkins={habit.recentCheckins} dotClass={palette?.dot} />
        </div>
      </div>
    </motion.div>
  );
}
