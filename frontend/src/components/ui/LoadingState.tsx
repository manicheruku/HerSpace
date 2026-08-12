import type { JSX } from "react";

export interface LoadingStateProps {
  label?: string;
  className?: string;
}

/** Centered spinner with an accessible status label for pending sections. */
export function LoadingState({
  label = "Loading",
  className = "",
}: LoadingStateProps): JSX.Element {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center gap-3 px-6 py-10 text-center ${className}`}
    >
      <span
        className="size-8 animate-spin rounded-full border-[3px] border-blossom-200 border-t-blossom-500"
        aria-hidden="true"
      />
      <span className="text-sm text-ink-500">{label}</span>
    </div>
  );
}
