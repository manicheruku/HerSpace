import type { InputHTMLAttributes, JSX, ReactNode } from "react";
import { forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
}

/** Labeled text input with optional leading icon, hint and error states. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftIcon, className = "", id, name, ...rest },
  ref,
): JSX.Element {
  const inputId = id ?? name;

  return (
    <div className={`w-full ${className}`}>
      {label ? (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-ink-700">
          {label}
        </label>
      ) : null}

      <div className="relative flex items-center">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 text-ink-300" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          name={name}
          aria-invalid={error ? true : undefined}
          className={`w-full rounded-[var(--radius-pill)] border bg-surface py-2.5 text-base text-ink-900 outline-none placeholder:text-ink-300 focus-visible:ring-2 ${
            leftIcon ? "pl-10 pr-4" : "px-4"
          } ${
            error
              ? "border-danger focus-visible:ring-danger/40"
              : "border-border focus-visible:ring-blossom-300"
          }`}
          {...rest}
        />
      </div>

      {error ? (
        <p className="mt-1 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
});
