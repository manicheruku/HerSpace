import type { JSX, ReactNode } from "react";

export interface SectionTitleProps {
  title: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

/** Card/section header row: optional leading icon, title, and a right-aligned action slot. */
export function SectionTitle({
  title,
  action,
  icon,
  className = "",
}: SectionTitleProps): JSX.Element {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {icon ? <span className="flex shrink-0 items-center text-blossom-500">{icon}</span> : null}
      <h3 className="font-display text-base font-semibold text-ink-900">{title}</h3>
      {action ? <div className="ml-auto flex items-center">{action}</div> : null}
    </div>
  );
}
