import { NavLink, useNavigate } from "react-router-dom";

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const items: NavItem[] = [
  { to: "/today", label: "Today", icon: "🏠" },
  { to: "/planner", label: "Planner", icon: "🗓️" },
  { to: "/explore", label: "Explore", icon: "✨" },
  { to: "/profile", label: "Me", icon: "👤" },
];

/** Bottom navigation with a centered quick-add action (Today | Planner | + | Explore | Me). */
export function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="relative flex items-center justify-between rounded-full bg-ink-900/95 px-6 py-3 text-white shadow-lg backdrop-blur">
        {items.slice(0, 2).map((item) => (
          <NavTab key={item.to} item={item} />
        ))}

        <button
          type="button"
          aria-label="Quick add"
          onClick={() => navigate("/quick-add")}
          className="-mt-8 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-blossom-400 to-lilac-300 text-2xl text-white shadow-lg ring-4 ring-surface transition active:scale-95"
        >
          +
        </button>

        {items.slice(2).map((item) => (
          <NavTab key={item.to} item={item} />
        ))}
      </div>
    </nav>
  );
}

function NavTab({ item }: { item: NavItem }) {
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
