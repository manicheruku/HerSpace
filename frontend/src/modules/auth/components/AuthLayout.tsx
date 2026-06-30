import type { ReactNode } from "react";

interface AuthLayoutProps {
  /** Heading shown in the welcome block (e.g. "Welcome back 🌸"). */
  title: string;
  /** Supporting subtitle under the heading. */
  subtitle: string;
  children: ReactNode;
  /** Footer slot — typically the link to switch between login/register. */
  footer?: ReactNode;
}

/**
 * Shared chrome for the authentication screens: brand header, decorative
 * blossom blobs, a welcome block, and a slot for the form + footer.
 * Mirrors design/login-mockup.html using design tokens only.
 */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative mx-auto flex min-h-full max-w-md flex-col overflow-hidden px-7 pb-8 pt-12">
      {/* Decorative soft blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-14 size-44 rounded-full bg-blossom-200/55 blur-lg"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-12 top-1/2 size-36 rounded-full bg-lilac-200/55 blur-lg"
      />

      {/* Brand */}
      <div className="relative text-center">
        <img
          src="/icon.svg"
          alt="HerSpace logo"
          className="mx-auto mb-3.5 size-[76px] rounded-[22px] shadow-button"
        />
        <h1 className="font-display text-[26px] font-bold tracking-tight">
          HerSpace
        </h1>
        <p className="mt-1.5 text-sm text-text-muted">
          A space for your best life, every day.
        </p>
      </div>

      {/* Welcome */}
      <div className="relative mt-10">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <span className="text-sm text-text-muted">{subtitle}</span>
      </div>

      {children}

      {footer ? (
        <div className="relative mt-auto pt-6 text-center text-sm text-text-muted">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
