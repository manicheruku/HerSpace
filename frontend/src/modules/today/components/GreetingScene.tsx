import type { JSX } from "react";

export type DayPeriod = "morning" | "afternoon" | "evening" | "night";

/**
 * Map the current hour to a part of the day. Thresholds match `getGreeting`
 * exactly so the illustration never disagrees with the headline
 * (e.g. 1 AM is "Good Night", not "morning").
 */
export function dayPeriod(date = new Date()): DayPeriod {
  const hour = date.getHours();
  if (hour >= 5 && hour <= 11) return "morning";
  if (hour >= 12 && hour <= 16) return "afternoon";
  if (hour >= 17 && hour <= 20) return "evening";
  return "night";
}

interface GreetingSceneProps {
  period: DayPeriod;
  className?: string;
}

/**
 * A gentle per-period wash layered over the brand gradient. Keeps the pink→
 * lilac identity consistent while still nodding to the time of day (warm at
 * sunrise, deeper at night).
 */
const PERIOD_TINT: Record<DayPeriod, { color: string; opacity: number }> = {
  morning: { color: "#ffd089", opacity: 0.18 },
  afternoon: { color: "#fff2c2", opacity: 0.14 },
  evening: { color: "#f4889a", opacity: 0.2 },
  night: { color: "#221d3f", opacity: 0.44 },
};

/* ------------------------------------------------------------------ */
/* Scene                                                              */
/* ------------------------------------------------------------------ */

/**
 * Soft brand gradient (blossom → lilac) behind the greeting. A single cohesive
 * background is used for every period, with a subtle time-of-day tint on top.
 */
export function GreetingScene({
  period,
  className = "",
}: GreetingSceneProps): JSX.Element {
  const tint = PERIOD_TINT[period];
  return (
    <svg
      viewBox="0 0 480 240"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbe6ee" />
          <stop offset="0.5" stopColor="#f7a8c0" />
          <stop offset="1" stopColor="#b388dd" />
        </linearGradient>
        <radialGradient id="glow" cx="0.72" cy="0.18" r="0.9">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="480" height="240" fill="url(#brand)" />

      {/* Soft translucent blobs add a little dreamy depth. */}
      <circle cx="60" cy="204" r="72" fill="#ffffff" opacity={0.1} />
      <circle cx="250" cy="256" r="92" fill="#ffffff" opacity={0.08} />
      <circle cx="410" cy="150" r="60" fill="#ffd9e8" opacity={0.16} />

      {/* Warm light glow toward the upper right. */}
      <rect width="480" height="240" fill="url(#glow)" />

      {/* Time-of-day accent wash. */}
      <rect width="480" height="240" fill={tint.color} opacity={tint.opacity} />
    </svg>
  );
}
