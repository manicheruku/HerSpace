import { useId, type InputHTMLAttributes, type ReactNode } from "react";

interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className"> {
  label: string;
  /** Leading icon rendered inside the input shell. */
  icon?: ReactNode;
  /** Optional inline validation / error message. */
  error?: string;
  /** Optional helper hint shown beneath the field. */
  hint?: string;
}

/** Token-styled, accessible text input with a leading icon slot. */
export function TextField({
  label,
  icon,
  error,
  hint,
  required,
  ...inputProps
}: TextFieldProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="flex flex-col">
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-[13px] font-medium text-ink-700"
      >
        {label}
      </label>
      <div
        className={`flex items-center gap-2.5 rounded-2xl border bg-card px-4 py-3.5 shadow-[0_4px_14px_rgba(120,80,130,0.06)] transition focus-within:border-blossom-300 focus-within:ring-2 focus-within:ring-blossom-200 ${
          error ? "border-danger" : "border-border"
        }`}
      >
        {icon ? (
          <span className="flex size-[18px] flex-none items-center justify-center text-ink-300">
            {icon}
          </span>
        ) : null}
        <input
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="w-full border-none bg-transparent text-[15px] text-ink-900 outline-none placeholder:text-ink-300"
          {...inputProps}
        />
      </div>
      {hint && !error ? (
        <p id={hintId} className="mt-1.5 text-xs text-text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
