import type { JSX, ReactNode } from "react";
import { NavLink } from "react-router-dom";

export interface BottomNavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

export interface BottomNavCenterAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

export interface BottomNavigationProps {
  items: BottomNavItem[];
  centerAction?: BottomNavCenterAction;
  className?: string;
}

/**
 * Generic bottom navigation bar. When a `centerAction` is provided, items are
 * split evenly around a raised central action button.
 */
export function BottomNavigation({
  items,
  centerAction,
  className = "",
}: BottomNavigationProps): JSX.Element {
  const mid = Math.ceil(items.length / 2);
  const left = centerAction ? items.slice(0, mid) : items;
  const right = centerAction ? items.slice(mid) : [];

  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] ${className}`}
    >
      <div className="relative flex items-center justify-between rounded-full bg-ink-900/95 px-6 py-3 text-white shadow-lg backdrop-blur">
        {left.map((item) => (
          <NavTab key={item.to} item={item} />
        ))}

        {centerAction ? (
          <button
            type="button"
            aria-label={centerAction.label}
            onClick={centerAction.onClick}
            className="-mt-8 flex size-14 items-center justify-center rounded-full bg-[image:var(--gradient-brand)] text-2xl text-white shadow-lg ring-4 ring-surface transition active:scale-95"
          >
            {centerAction.icon ?? "+"}
          </button>
        ) : null}

        {right.map((item) => (
          <NavTab key={item.to} item={item} />
        ))}
      </div>
    </nav>
  );
}

function NavTab({ item }: { item: BottomNavItem }): JSX.Element {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 text-[0.65rem] transition ${
          isActive ? "text-blossom-200" : "text-white/60"
        }`
      }
    >
      <span className="text-lg">{item.icon}</span>
      {item.label}
    </NavLink>
  );
}
