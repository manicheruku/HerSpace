import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/shared/auth/AuthContext";

/**
 * Gate for authenticated areas of the app.
 * - While the session is hydrating, render a soft loading state.
 * - If unauthenticated, redirect to the login screen.
 * - Otherwise render the nested routes.
 */
export function ProtectedRoute() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-4 px-8 text-center">
        <span
          className="size-9 animate-spin rounded-full border-[3px] border-blossom-200 border-t-blossom-500"
          aria-hidden="true"
        />
        <p className="text-sm text-text-muted">Getting things ready…</p>
        <span className="sr-only" role="status">
          Loading your session
        </span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
