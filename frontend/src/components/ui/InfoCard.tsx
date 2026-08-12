import type { JSX, ReactNode } from "react";
import { Card } from "./Card";

export interface InfoCardProps {
  icon?: ReactNode;
  label: string;
  value: string;
  className?: string;
}

/** Compact stat surface: a large value with a muted label and an optional leading icon. */
export function InfoCard({ icon, label, value, className = "" }: InfoCardProps): JSX.Element {
  return (
    <Card className={className}>
      <div className="flex items-center gap-3">
        {icon ? <span className="flex shrink-0 items-center text-2xl text-blossom-500">{icon}</span> : null}
        <div className="flex flex-col">
          <span className="font-display text-3xl font-semibold text-ink-900">{value}</span>
          <span className="text-sm text-ink-500">{label}</span>
        </div>
      </div>
    </Card>
  );
}
