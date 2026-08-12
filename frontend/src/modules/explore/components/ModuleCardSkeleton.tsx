import type { JSX } from "react";

import { Skeleton } from "@/components/ui";

/** Loading placeholder mirroring the ModuleCard layout. */
export function ModuleCardSkeleton(): JSX.Element {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] bg-card shadow-[var(--shadow-card)] ring-1 ring-black/5">
      <div className="p-5">
        <div className="flex items-start gap-3.5">
          <Skeleton className="size-12 shrink-0" rounded />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-6 w-20" rounded />
          <Skeleton className="h-6 w-24" rounded />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-8 w-28" rounded />
      </div>
    </div>
  );
}
