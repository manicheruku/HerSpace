import { useNavigate } from "react-router-dom";

import { BottomNavigation, type BottomNavItem } from "@/components/ui";

const items: BottomNavItem[] = [
  { to: "/today", label: "Today", icon: "🏠" },
  { to: "/planner", label: "Planner", icon: "🗓️" },
  { to: "/explore", label: "Explore", icon: "✨" },
  { to: "/profile", label: "Me", icon: "👤" },
];

/** App bottom navigation with a centered quick-add action (Today | Planner | + | Explore | Me). */
export function BottomNav() {
  const navigate = useNavigate();

  return (
    <BottomNavigation
      items={items}
      centerAction={{ label: "Quick add", onClick: () => navigate("/quick-add") }}
    />
  );
}
