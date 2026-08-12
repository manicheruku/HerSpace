import type { JSX } from "react";

export interface SectionHeaderProps {
  title: string;
}

/** Small uppercase label introducing a library section. */
export function SectionHeader({ title }: SectionHeaderProps): JSX.Element {
  return (
    <h2 className="px-1 font-display text-xs font-semibold uppercase tracking-[0.14em] text-ink-300">
      {title}
    </h2>
  );
}
