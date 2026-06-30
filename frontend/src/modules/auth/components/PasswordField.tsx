import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

interface PasswordFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "id" | "className" | "type"
  > {
  label: string;
  /** Leading icon rendered inside the input shell. */
  icon?: ReactNode;
  /** Optional inline validation / error message. */
  error?: string;
  /** Optional helper hint shown beneath the field. */
  hint?: string;
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="4" y="10" width="16" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
      <path d="M9.4 5.2A9.5 9.5 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3.1" />
      <path d="M6.2 6.2A17 17 0 0 0 2 12s3.5 7 10 7a9.4 9.4 0 0 0 3-.5" />
    </svg>
  );
}

/** Token-styled, accessible password input with a show/hide toggle. */
export function PasswordField({
  label,
  icon,
  error,
  hint,
  required,
  ...inputProps
}: PasswordFieldProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const [visible, setVisible] = useState(false);

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
        <span className="flex size-[18px] flex-none items-center justify-center text-ink-300">
          {icon ?? <LockIcon />}
        </span>
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="w-full border-none bg-transparent text-[15px] text-ink-900 outline-none placeholder:text-ink-300"
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="flex size-[18px] flex-none items-center justify-center rounded text-ink-300 transition hover:text-ink-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blossom-300"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
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
