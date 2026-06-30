import { Outlet } from "react-router-dom";

import { BottomNav } from "@/shared/components/BottomNav";

/** Mobile-first app shell: a centered column with content and bottom navigation. */
export function AppShell() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col">
      <main className="flex-1 px-4 pb-28 pt-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
