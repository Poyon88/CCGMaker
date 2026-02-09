import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/config/routes";

export function AuthGuard() {
  const { user, isGuest, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user && !isGuest) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
