import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import { Card } from "@/components/ui";
import { useAuth } from "@/shared/auth/AuthContext";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "🙂";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

function formatMemberSince(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

/** Account menu rows surfaced on the Me page (moved here from Explore). */
const MENU_ITEMS: { icon: string; label: string }[] = [
  { icon: "🎨", label: "Appearance" },
  { icon: "🔔", label: "Notifications" },
  { icon: "⚙️", label: "Settings" },
  { icon: "ℹ️", label: "About" },
];

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const initials = useMemo(() => initialsOf(user?.name ?? ""), [user?.name]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex flex-col gap-4 px-1 pb-8 pt-6">
      <header className="px-2">
        <h1 className="font-display text-2xl text-ink-900">Me</h1>
        <p className="mt-1 text-sm text-ink-500">
          Your profile and account settings.
        </p>
      </header>

      <Card className="flex items-center gap-4 px-5 py-5">
        <span
          aria-hidden="true"
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-brand)] font-display text-xl font-semibold text-white shadow-[var(--shadow-button)]"
        >
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold text-ink-900">
            {user?.name ?? "Friend"}
          </p>
          <p className="truncate text-sm text-ink-500">{user?.email ?? ""}</p>
          {user?.created_at ? (
            <p className="mt-1 text-xs text-ink-300">
              Member since {formatMemberSince(user.created_at)}
            </p>
          ) : null}
        </div>
      </Card>

      <Card className="px-2 py-2">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled
            className="flex w-full items-center justify-between rounded-[var(--radius-pill)] px-3 py-3 text-left text-ink-500"
          >
            <span className="flex items-center gap-3">
              <span aria-hidden="true">{item.icon}</span>
              <span className="text-ink-700">{item.label}</span>
            </span>
            <span className="text-xs text-ink-300">Coming soon</span>
          </button>
        ))}
      </Card>

      <motion.button
        type="button"
        onClick={handleLogout}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        className="mt-2 flex items-center justify-center gap-2 rounded-[var(--radius-card)] border border-danger/30 bg-card px-5 py-4 font-display text-base font-semibold text-danger shadow-[var(--shadow-card)] transition-colors hover:bg-blossom-50"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="m16 17 5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
        Log out
      </motion.button>
    </div>
  );
}
