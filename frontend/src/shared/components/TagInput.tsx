import type { JSX, KeyboardEvent } from "react";
import { useState } from "react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

/** Simple tag editor: type + Enter (or comma) to add, click × to remove. */
export function TagInput({ tags, onChange }: TagInputProps): JSX.Element {
  const [draft, setDraft] = useState("");

  function addTag(raw: string): void {
    const value = raw.trim().replace(/,$/, "").trim();
    if (!value) return;
    if (tags.some((t) => t.toLowerCase() === value.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...tags, value]);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
    } else if (event.key === "Backspace" && draft === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink-700">Tags</span>
      <div className="flex flex-wrap items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-card px-2.5 py-2 focus-within:border-blossom-300">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-lilac-100 px-2 py-0.5 text-xs font-medium text-ink-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="text-ink-300 transition hover:text-ink-500"
              aria-label={`Remove tag ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(draft)}
          placeholder={tags.length === 0 ? "Add a tag…" : ""}
          className="min-w-24 flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-300"
        />
      </div>
    </div>
  );
}
