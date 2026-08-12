import { useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface PullToRefreshProps {
  /** Called when the user pulls past the threshold and releases. */
  onRefresh: () => Promise<unknown> | void;
  children: ReactNode;
}

/** Distance (px) the user must pull before a refresh fires. */
const THRESHOLD = 70;
/** Maximum visual pull distance. */
const MAX_PULL = 110;
/** How much the finger movement is dampened for a natural rubber-band feel. */
const DAMPING = 0.5;

/**
 * Wraps a window-scrolled page with a pull-to-refresh gesture. When the page is
 * scrolled to the very top, dragging down reveals a spinner; releasing past the
 * threshold triggers `onRefresh` and keeps the spinner until it resolves.
 */
export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const reduceMotion = useReducedMotion();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);

  function handleTouchStart(event: React.TouchEvent) {
    if (refreshing || window.scrollY > 0) {
      startY.current = null;
      return;
    }
    startY.current = event.touches[0].clientY;
  }

  function handleTouchMove(event: React.TouchEvent) {
    if (startY.current === null || refreshing) return;
    const delta = event.touches[0].clientY - startY.current;
    if (delta <= 0) {
      setPull(0);
      return;
    }
    setPull(Math.min(MAX_PULL, delta * DAMPING));
  }

  async function handleTouchEnd() {
    if (startY.current === null) return;
    startY.current = null;

    if (pull >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPull(THRESHOLD * 0.7);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  }

  const progress = Math.min(1, pull / THRESHOLD);
  const indicatorVisible = pull > 2 || refreshing;

  return (
    <div
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator floating above the content. */}
      <motion.div
        aria-hidden={!refreshing}
        className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center"
        initial={false}
        animate={{
          y: indicatorVisible ? pull - 4 : -40,
          opacity: indicatorVisible ? 1 : 0,
        }}
        transition={
          reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 26 }
        }
      >
        <span className="mt-2 flex size-9 items-center justify-center rounded-full bg-card shadow-[var(--shadow-card)] ring-1 ring-black/5">
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            className="size-5 text-blossom-500"
            animate={
              refreshing && !reduceMotion
                ? { rotate: 360 }
                : { rotate: progress * 270 }
            }
            transition={
              refreshing && !reduceMotion
                ? { repeat: Infinity, ease: "linear", duration: 0.8 }
                : { type: "spring", stiffness: 280, damping: 26 }
            }
            style={{ opacity: refreshing ? 1 : 0.4 + progress * 0.6 }}
          >
            <path d="M21 12a9 9 0 1 1-3.5-7.1" />
            <path d="M21 4v5h-5" />
          </motion.svg>
        </span>
      </motion.div>

      <motion.div
        initial={false}
        animate={{ y: pull }}
        transition={
          reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 30 }
        }
      >
        {children}
      </motion.div>
    </div>
  );
}
