import type { JSX, ReactNode } from "react";
import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "framer-motion";

import { Badge, type BadgeTone } from "./Badge";
import { Checkbox } from "./Checkbox";

export interface TaskItemProps {
  title: string;
  completed: boolean;
  onToggle: (next: boolean) => void;
  /** Priority (or other) label rendered as a trailing badge. */
  priorityLabel?: string;
  priorityTone?: BadgeTone;
  /** Secondary line, e.g. due time or category. */
  meta?: ReactNode;
  /** Open the item for editing. */
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
}

/** Drag distance (px) past which a swipe triggers its action. */
const SWIPE_THRESHOLD = 90;

const TrashIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-4"
    aria-hidden="true"
  >
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
  </svg>
);

const CheckIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-4"
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/**
 * Reusable task row: animated checkbox, title with completed styling, optional
 * meta line, a trailing priority badge and a hover-revealed delete action.
 *
 * On touch/pointer devices the row can be swiped: right to toggle completion,
 * left to delete. Swiping is disabled when the user prefers reduced motion.
 */
export function TaskItem({
  title,
  completed,
  onToggle,
  priorityLabel,
  priorityTone = "neutral",
  meta,
  onClick,
  onDelete,
  className = "",
}: TaskItemProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const completeOpacity = useTransform(x, [12, 72], [0, 1]);
  const deleteOpacity = useTransform(x, [-72, -12], [1, 0]);
  // Set while a drag is in progress so the trailing click/tap that browsers
  // dispatch after a swipe doesn't also open the editor or toggle completion.
  const draggedRef = useRef(false);

  const swipeEnabled = !reduceMotion;

  function handleDragStart(): void {
    draggedRef.current = true;
  }

  function handleDragEnd(
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ): void {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onToggle(!completed);
    } else if (info.offset.x < -SWIPE_THRESHOLD && onDelete) {
      onDelete();
    }
    // Reset after the trailing click has had a chance to be swallowed.
    window.setTimeout(() => {
      draggedRef.current = false;
    }, 0);
  }

  function handleTitleClick(): void {
    if (draggedRef.current) return;
    onClick?.();
  }

  function handleCheckboxChange(next: boolean): void {
    if (draggedRef.current) return;
    onToggle(next);
  }

  const row = (
    <>
      <Checkbox
        checked={completed}
        onChange={handleCheckboxChange}
        ariaLabel={completed ? "Mark task incomplete" : "Mark task complete"}
      />

      <button type="button" onClick={handleTitleClick} className="min-w-0 flex-1 text-left outline-none">
        <span
          className={`block break-words text-base transition-colors ${
            completed ? "text-ink-300 line-through" : "text-ink-900"
          }`}
        >
          {title}
        </span>
        {meta ? <span className="mt-0.5 block text-xs text-ink-500">{meta}</span> : null}
      </button>

      {priorityLabel ? (
        <Badge tone={completed ? "neutral" : priorityTone} dot>
          {priorityLabel}
        </Badge>
      ) : null}

      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete task ${title}`}
          className="hidden size-8 shrink-0 items-center justify-center rounded-[var(--radius-pill)] text-ink-300 opacity-0 transition hover:bg-blossom-100 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100 sm:flex"
        >
          {TrashIcon}
        </button>
      ) : null}
    </>
  );

  const cardClassName =
    "group relative flex items-center gap-3 rounded-[var(--radius-card)] bg-card px-3 py-3 shadow-[var(--shadow-card)] ring-1 ring-black/5";

  return (
    <motion.div
      layout
      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
      className={`relative ${className}`}
    >
      {swipeEnabled ? (
        <>
          <div className="pointer-events-none absolute inset-0 flex items-stretch justify-between overflow-hidden rounded-[var(--radius-card)]">
            <motion.div
              style={{ opacity: completeOpacity }}
              className="flex items-center gap-2 bg-success/15 pl-4 pr-6 text-sm font-semibold text-success"
            >
              {CheckIcon}
              <span>Done</span>
            </motion.div>
            <motion.div
              style={{ opacity: deleteOpacity }}
              className="flex items-center gap-2 bg-danger/15 pl-6 pr-4 text-sm font-semibold text-danger"
            >
              <span>Delete</span>
              {TrashIcon}
            </motion.div>
          </div>

          <motion.div
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.55}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{ x }}
            className={cardClassName}
          >
            {row}
          </motion.div>
        </>
      ) : (
        <div className={cardClassName}>{row}</div>
      )}
    </motion.div>
  );
}

