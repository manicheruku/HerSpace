import { createBrowserRouter, Navigate } from "react-router-dom";

import { LoginPage } from "@/modules/auth/LoginPage";
import { RegisterPage } from "@/modules/auth/RegisterPage";
import { ExplorePage } from "@/modules/explore/ExplorePage";
import { PlannerPage } from "@/modules/planner/PlannerPage";
import { ProfilePage } from "@/modules/profile/ProfilePage";
import { QuickAddPage } from "@/modules/quick-add/QuickAddPage";
import { TodayPage } from "@/modules/today/TodayPage";
import { NotFoundPage } from "@/routes/NotFoundPage";
import { AppShell } from "@/shared/components/AppShell";
import { ProtectedRoute } from "@/shared/auth/ProtectedRoute";
import { useAuth } from "@/shared/auth/AuthContext";

/** Landing redirect: route users to their home or to login based on session. */
function IndexRedirect() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="mx-auto flex min-h-full max-w-md items-center justify-center px-8">
        <span
          className="size-9 animate-spin rounded-full border-[3px] border-blossom-200 border-t-blossom-500"
          aria-hidden="true"
        />
        <span className="sr-only" role="status">
          Loading
        </span>
      </div>
    );
  }

  return <Navigate to={status === "authenticated" ? "/today" : "/login"} replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <IndexRedirect />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/today", element: <TodayPage /> },
          { path: "/planner", element: <PlannerPage /> },
          { path: "/explore", element: <ExplorePage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/quick-add", element: <QuickAddPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
