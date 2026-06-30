/** Visual-only social sign-in buttons (non-functional, disabled). */
export function SocialButtons() {
  return (
    <>
      <div className="relative my-6 flex items-center gap-3 text-xs text-ink-300">
        <span className="h-px flex-1 bg-border" />
        or continue with
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="relative flex gap-3">
        <button
          type="button"
          disabled
          aria-label="Continue with Google (coming soon)"
          className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-[14px] border border-border bg-card py-3 text-sm text-ink-700 opacity-70"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 11v3.3h4.6c-.2 1.2-1.5 3.5-4.6 3.5-2.8 0-5-2.3-5-5.1S9.2 6.6 12 6.6c1.6 0 2.6.7 3.2 1.2l2.2-2.1C16 4.4 14.2 3.6 12 3.6 7.6 3.6 4 7.1 4 11.5S7.6 19.5 12 19.5c4.6 0 7.6-3.2 7.6-7.7 0-.5 0-.9-.1-1.3H12Z"
            />
          </svg>
          Google
        </button>
        <button
          type="button"
          disabled
          aria-label="Continue with Apple (coming soon)"
          className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-[14px] border border-border bg-card py-3 text-sm text-ink-700 opacity-70"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1d1d1f" aria-hidden="true">
            <path d="M16.4 12.7c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.2 2-1.4 2.4-.4 6 1 7.9.7.9 1.4 2 2.4 1.9 1-.04 1.3-.6 2.5-.6s1.5.6 2.6.6c1 0 1.7-.9 2.4-1.9.5-.7.7-1.4.7-1.4s-1.5-.6-1.5-2.3Zm-2-6.6c.5-.7.9-1.6.8-2.5-.8 0-1.7.5-2.3 1.2-.5.6-.9 1.5-.8 2.4.9.07 1.8-.4 2.3-1.1Z" />
          </svg>
          Apple
        </button>
      </div>
    </>
  );
}
