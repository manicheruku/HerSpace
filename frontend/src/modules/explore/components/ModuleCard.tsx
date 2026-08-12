import type { JSX, PointerEvent } from "react";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Badge, Button } from "@/components/ui";
import type { ExploreModule } from "@/modules/explore/types/explore.types";
import { formatRelativeTime } from "@/modules/explore/utils/format";

export interface ModuleCardProps {
  module: ExploreModule;
  onOpen: (module: ExploreModule) => void;
  onQuickAdd: (module: ExploreModule) => void;
  className?: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const ChevronRight = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-5"
    aria-hidden="true"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

/**
 * Reusable library card representing a single module: gradient icon tile, name,
 * description, quick statistics, last-updated line, and Open / Quick Add
 * actions. Includes hover elevation, tap scale and a subtle tap ripple.
 *
 * Presentational only — navigation and quick-add behaviour are delegated to the
 * `onOpen` / `onQuickAdd` callbacks so future modules can reuse it freely.
 */
export function ModuleCard({
  module,
  onOpen,
  onQuickAdd,
  className = "",
}: ModuleCardProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleId = useRef(0);

  function spawnRipple(event: PointerEvent<HTMLButtonElement>): void {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const id = (rippleId.current += 1);
    const ripple: Ripple = {
      id,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    setRipples((current) => [...current, ripple]);
    window.setTimeout(() => {
      setRipples((current) => current.filter((item) => item.id !== id));
    }, 620);
  }

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -3 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`overflow-hidden rounded-[var(--radius-card)] bg-card shadow-[var(--shadow-card)] ring-1 ring-black/5 transition-shadow hover:shadow-[var(--shadow-raised)] ${className}`}
    >
      <button
        type="button"
        onPointerDown={spawnRipple}
        onClick={() => onOpen(module)}
        aria-label={`Open ${module.name}`}
        className="relative block w-full p-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-blossom-300"
      >
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ opacity: 0.25, scale: 0 }}
              animate={{ opacity: 0, scale: 4.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ left: ripple.x, top: ripple.y }}
              className="pointer-events-none absolute size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blossom-300"
            />
          ))}
        </AnimatePresence>

        <div className="relative flex items-start gap-3.5">
          <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br ${module.gradient} text-2xl shadow-[var(--shadow-card)]`}
            aria-hidden="true"
          >
            {module.icon}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-semibold text-ink-900">{module.name}</h3>
              {module.implemented ? null : <Badge tone="neutral">Soon</Badge>}
            </div>
            <p className="mt-0.5 line-clamp-2 text-sm text-ink-500">{module.description}</p>
          </div>

          <span className="mt-1 shrink-0 text-ink-300">{ChevronRight}</span>
        </div>

        {module.stats.length > 0 ? (
          <div className="relative mt-4 flex flex-wrap gap-2">
            {module.stats.map((stat) => (
              <span
                key={stat.label}
                className="inline-flex items-baseline gap-1 rounded-[var(--radius-pill)] bg-surface px-2.5 py-1 text-xs"
              >
                <span className="font-semibold text-ink-900">{stat.value}</span>
                <span className="text-ink-500">{stat.label}</span>
              </span>
            ))}
          </div>
        ) : null}
      </button>

      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
        <span className="truncate text-xs text-ink-300">
          {formatRelativeTime(module.lastUpdated)}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onOpen(module)}>
            Open
          </Button>
          {module.quickAdd ? (
            <Button size="sm" variant="secondary" leftIcon="+" onClick={() => onQuickAdd(module)}>
              Quick add
            </Button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
