import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

/** Soft, rounded surface used throughout the app per the HerSpace design language. */
export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-card)] bg-card p-5 shadow-sm ring-1 ring-black/5 ${className}`}
    >
      {children}
    </div>
  );
}
