import type { JSX, ReactNode } from "react";
import { useEffect } from "react";
import type { PanInfo } from "framer-motion";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

/** Slide-up sheet anchored to the bottom, dismissible by drag or backdrop tap. */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className = "",
}: BottomSheetProps): JSX.Element {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function handleDragEnd(_event: unknown, info: PanInfo) {
    if (info.offset.y > 120) onClose();
  }

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <motion.div
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`relative z-10 w-full max-w-md rounded-t-[var(--radius-card)] bg-card px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-[var(--shadow-raised)] ${className}`}
            initial={reduceMotion ? { opacity: 0 } : { y: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: "100%" }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 32 }}
            drag={reduceMotion ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-ink-100" aria-hidden="true" />
            {title ? (
              <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">{title}</h2>
            ) : null}
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
