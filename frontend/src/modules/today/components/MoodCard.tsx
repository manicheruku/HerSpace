import { motion, useReducedMotion } from "framer-motion";

import { Card, SectionTitle } from "@/components/ui";
import { useMood } from "@/modules/today/hooks/useMood";
import type { MoodValue } from "@/modules/today/types/today.types";

/** Soft background tint applied to the whole card based on the selected mood. */
const CARD_TINT: Record<MoodValue, string> = {
  great: "bg-blossom-50",
  good: "bg-blossom-50",
  okay: "bg-card",
  down: "bg-lilac-50",
  awful: "bg-lilac-50",
};

export function MoodCard() {
  const { options, selected, select } = useMood();
  const reduceMotion = useReducedMotion();

  const tint = selected ? CARD_TINT[selected] : "bg-card";

  return (
    <Card className={`px-5 py-5 transition-colors duration-500 ${tint}`}>
      <SectionTitle title="How are you feeling?" className="mb-4" />
      <div className="flex items-center justify-between gap-2">
        {options.map((option) => {
          const isSelected = option.value === selected;
          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => select(option.value)}
              aria-label={option.label}
              aria-pressed={isSelected}
              whileTap={reduceMotion ? undefined : { scale: 0.85 }}
              animate={
                reduceMotion ? undefined : { scale: isSelected ? 1.18 : 1 }
              }
              transition={{ type: "spring", stiffness: 320, damping: 14 }}
              className={`flex size-14 items-center justify-center rounded-full text-3xl transition-shadow ${
                isSelected
                  ? "bg-card shadow-[var(--shadow-card)] ring-2 ring-blossom-400"
                  : "bg-card/60"
              }`}
            >
              <span aria-hidden="true">{option.emoji}</span>
            </motion.button>
          );
        })}
      </div>
    </Card>
  );
}
