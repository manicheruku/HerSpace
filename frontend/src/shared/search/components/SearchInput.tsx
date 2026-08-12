import type { ChangeEvent, JSX, KeyboardEvent } from "react";
import { useEffect, useRef } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  isSearching: boolean;
}

const SearchIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="size-5 shrink-0 text-ink-300" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** The search field: autofocus, live spinner, and a clear button. */
export function SearchInput({
  value,
  onChange,
  onKeyDown,
  isSearching,
}: SearchInputProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Delay focus one frame so the overlay's entry animation doesn't fight it.
    const id = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div className="flex items-center gap-3 border-b border-border px-5 py-4">
      {SearchIcon}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Search everything…"
        className="flex-1 bg-transparent text-base text-ink-900 outline-none placeholder:text-ink-300"
        aria-label="Search"
        autoComplete="off"
        spellCheck={false}
      />
      {isSearching ? (
        <span
          className="size-4 shrink-0 animate-spin rounded-full border-2 border-blossom-200 border-t-blossom-500"
          aria-hidden="true"
        />
      ) : value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="rounded-full p-1 text-ink-300 transition hover:bg-surface hover:text-ink-500"
          aria-label="Clear search"
        >
          <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : (
        <kbd className="hidden rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-ink-300 sm:inline">
          ESC
        </kbd>
      )}
    </div>
  );
}
