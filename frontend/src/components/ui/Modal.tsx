import type { JSX, ReactNode } from "react";
import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

/** Centered dialog with a blurred backdrop and spring entrance. */
export function Modal({
  open,
  onClose,
  title,
  children,
  className = "",
}: ModalProps): JSX.Element {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
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
            className={`relative z-10 w-full max-w-md rounded-[var(--radius-card)] bg-card p-5 shadow-[var(--shadow-raised)] ${className}`}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 26 }}
          >
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
