import { Outlet } from "react-router-dom";

import { BottomNav } from "@/shared/components/BottomNav";
import { SearchProvider, SearchTrigger } from "@/shared/search";

/** Mobile-first app shell: a centered column with content and bottom navigation. */
export function AppShell() {
  return (
    <SearchProvider>
      <div className="mx-auto flex min-h-full max-w-md flex-col">
        <header className="sticky top-0 z-20 bg-surface/80 px-4 pb-2 pt-4 backdrop-blur-md">
          <SearchTrigger />
        </header>
        <main className="flex-1 px-4 pb-28 pt-2">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </SearchProvider>
  );
}
