import { Suspense, lazy, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/config/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { SkipToContent } from "@/components/common/skip-to-content";
import { migrateGuestData } from "@/lib/migrate-guest-data";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// Lazy-loaded pages
const LandingPage = lazy(() => import("@/pages/landing-page"));
const LoginPage = lazy(() => import("@/pages/login-page"));
const SignupPage = lazy(() => import("@/pages/signup-page"));
const ForgotPasswordPage = lazy(() => import("@/pages/forgot-password-page"));
const DashboardPage = lazy(() => import("@/pages/dashboard-page"));
const ProjectPage = lazy(() => import("@/pages/project-page"));
const ProjectOverviewPage = lazy(
  () => import("@/pages/project-overview-page")
);
const RulesPage = lazy(() => import("@/pages/rules-page"));
const TemplateListPage = lazy(() => import("@/pages/template-list-page"));
const TemplateEditorPage = lazy(() => import("@/pages/template-editor-page"));
const CardListPage = lazy(() => import("@/pages/card-list-page"));
const CardEditorPage = lazy(() => import("@/pages/card-editor-page"));
const CardDetailPage = lazy(() => import("@/pages/card-detail-page"));
const AICardPage = lazy(() => import("@/pages/ai-card-page"));
const ExportPage = lazy(() => import("@/pages/export-page"));
const SettingsPage = lazy(() => import("@/pages/settings-page"));
const NotFoundPage = lazy(() => import("@/pages/not-found-page"));

const AppLayout = lazy(() => import("@/components/layout/app-layout"));
const AuthLayout = lazy(() => import("@/components/layout/auth-layout"));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function AuthListener({ children }: { children: React.ReactNode }) {
  const { setUser, setSession, setGuest, setLoading } = useAuthStore();
  const migrating = useRef(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Migrate guest data when a guest signs in/up
      if (
        event === "SIGNED_IN" &&
        session?.user &&
        useAuthStore.getState().isGuest &&
        !migrating.current
      ) {
        migrating.current = true;
        try {
          await migrateGuestData(session.user.id);
          setGuest(false);
          queryClient.invalidateQueries();
          toast.success("Your guest data has been saved to your account");
        } catch (err) {
          console.error("Guest data migration failed:", err);
          toast.error("Failed to migrate guest data. You can re-create your projects.");
        } finally {
          migrating.current = false;
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setGuest, setLoading]);

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <SkipToContent />
            <AuthListener>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />

                {/* Auth routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                  />
                </Route>

                {/* Protected app routes (with sidebar layout) */}
                <Route element={<AuthGuard />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />

                    <Route
                      path="/projects/:projectId"
                      element={<ProjectPage />}
                    >
                      <Route index element={<ProjectOverviewPage />} />
                      <Route path="rules" element={<RulesPage />} />
                      <Route path="templates" element={<TemplateListPage />} />
                      <Route
                        path="templates/new"
                        element={<TemplateEditorPage />}
                      />
                      <Route
                        path="templates/:templateId"
                        element={<TemplateEditorPage />}
                      />
                      <Route path="cards" element={<CardListPage />} />
                      <Route path="cards/new" element={<CardEditorPage />} />
                      <Route
                        path="cards/:cardId"
                        element={<CardDetailPage />}
                      />
                      <Route
                        path="cards/:cardId/edit"
                        element={<CardEditorPage />}
                      />
                      <Route path="ai-create" element={<AICardPage />} />
                    </Route>

                    <Route path="/cards" element={<CardListPage />} />
                    <Route path="/export" element={<ExportPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </AuthListener>
          </BrowserRouter>
        </ErrorBoundary>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
