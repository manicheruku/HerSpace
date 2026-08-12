import type { JSX, ReactNode } from "react";

export interface HeroCardProps {
  /** Full-bleed background layer (e.g. an illustration or gradient). */
  background?: ReactNode;
  /** Optional layer above the background but below the content (e.g. a scrim). */
  overlay?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Rounded, overflow-clipped hero surface with layered background/overlay slots.
 * Used for prominent, image-backed cards such as the daily greeting.
 */
export function HeroCard({
  background,
  overlay,
  children,
  className = "",
}: HeroCardProps): JSX.Element {
  return (
    <div
      className={`relative overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-raised)] ${className}`}
    >
      {background ? (
        <div className="absolute inset-0" aria-hidden="true">
          {background}
        </div>
      ) : null}
      {overlay ? (
        <div className="absolute inset-0" aria-hidden="true">
          {overlay}
        </div>
      ) : null}
      <div className="relative">{children}</div>
    </div>
  );
}
