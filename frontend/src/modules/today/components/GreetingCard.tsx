import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { useGreeting } from "@/modules/today/hooks/useGreeting";
import { Card } from "@/components/ui";
import {
  dayPeriod,
  GreetingScene,
} from "@/modules/today/components/GreetingScene";

/** Emoji that reflects the current part of the day. */
const PERIOD_EMOJI = {
  morning: "🌅",
  afternoon: "☀️",
  evening: "🌇",
  night: "🌙",
} as const;

export function GreetingCard() {
  const { greeting, date, firstName } = useGreeting();
  const reduceMotion = useReducedMotion();
  const [hasGirl, setHasGirl] = useState(true);

  const period = dayPeriod();
  const darkText = period !== "night";

  return (
    <Card className="relative min-h-52 overflow-hidden px-7 py-8 shadow-[var(--shadow-raised)]">
      <GreetingScene
        period={period}
        className="absolute inset-0 h-full w-full"
      />

      {/* The cozy companion, anchored to the bottom-right, shown in full. */}
      {hasGirl && (
        <img
          src="/greeting-girl.png"
          alt=""
          aria-hidden="true"
          onError={() => setHasGirl(false)}
          className="pointer-events-none absolute -bottom-1 right-1 h-[112%] w-[46%] object-contain object-bottom drop-shadow-[0_6px_14px_rgba(0,0,0,0.22)]"
        />
      )}

      {/* Legibility scrim so the headline reads over any sky. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${
          darkText
            ? "bg-gradient-to-r from-white/70 via-white/25 to-transparent"
            : "bg-gradient-to-r from-black/55 via-black/25 to-transparent"
        }`}
      />

      <div className="relative max-w-[58%]">
        <p
          className={`text-xs font-medium uppercase tracking-wide ${
            darkText ? "text-ink-500" : "text-white/80"
          }`}
        >
          {date}
        </p>
        <h1
          className={`mt-2 flex flex-wrap items-center gap-2 font-display text-2xl leading-tight ${
            darkText
              ? "text-ink-900 [text-shadow:0_1px_6px_rgba(255,255,255,0.55)]"
              : "text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]"
          }`}
        >
          <span>
            {greeting}, {firstName}
          </span>
          <motion.span
            aria-hidden="true"
            className="text-2xl"
            initial={reduceMotion ? false : { rotate: -12, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
          >
            {PERIOD_EMOJI[period]}
          </motion.span>
        </h1>
        <p
          className={`mt-3 text-sm ${
            darkText ? "text-ink-700" : "text-white/85"
          }`}
        >
          Here's your space for today.
        </p>
      </div>
    </Card>
  );
}
