import type { JSX } from "react";

interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Renders `text` with case-insensitive occurrences of `query` emphasised. */
export function HighlightedText({ text, query, className }: HighlightedTextProps): JSX.Element {
  const trimmed = query.trim();
  if (!trimmed) return <span className={className}>{text}</span>;

  const parts = text.split(new RegExp(`(${escapeRegExp(trimmed)})`, "ig"));
  const lowered = trimmed.toLowerCase();

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === lowered ? (
          <mark
            key={index}
            className="rounded bg-blossom-100 px-0.5 font-semibold text-blossom-600"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </span>
  );
}
