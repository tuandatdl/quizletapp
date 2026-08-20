import React from "react";
import { BrowserRouter, HashRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";

import { isStaticRuntime } from "./runtime/runtime";
import { handleAuthRedirect, isAuthCallbackUrl } from "./persistence/supabaseClient";

const lazyNamed = <T extends React.ComponentType<any>>(
  loader: () => Promise<Record<string, unknown>>,
  exportName: string,
) => React.lazy(async () => {
  const module = await loader();
  return { default: module[exportName] as T };
});

const LoginPage = lazyNamed(() => import("./pages/auth/LoginPage"), "LoginPage");
const RegisterPage = lazyNamed(() => import("./pages/auth/RegisterPage"), "RegisterPage");
const HomePage = lazyNamed(() => import("./pages/home/HomePage"), "HomePage");
const VocabularyListPage = lazyNamed(() => import("./pages/vocabulary/VocabularyListPage"), "VocabularyListPage");
const AddVocabularyPage = lazyNamed(() => import("./pages/vocabulary/AddVocabularyPage"), "AddVocabularyPage");
const FlashcardPage = lazyNamed(() => import("./pages/flashcards/FlashcardPage"), "FlashcardPage");
const ReadingListPage = lazyNamed(() => import("./pages/reading/ReadingListPage"), "ReadingListPage");
const AddReadingPage = lazyNamed(() => import("./pages/reading/AddReadingPage"), "AddReadingPage");
const ReadingDetailPage = lazyNamed(() => import("./pages/reading/ReadingDetailPage"), "ReadingDetailPage");
const ShadowingPage = lazyNamed(() => import("./pages/shadowing/ShadowingPage"), "ShadowingPage");
const PronunciationPage = lazyNamed(() => import("./pages/pronunciation/PronunciationPage"), "PronunciationPage");
const QuizPage = lazyNamed(() => import("./pages/quiz/QuizPage"), "QuizPage");
const GamesPage = lazyNamed(() => import("./pages/games/GamesPage"), "GamesPage");
const ProgressPage = lazyNamed(() => import("./pages/progress/ProgressPage"), "ProgressPage");
const SettingsPage = lazyNamed(() => import("./pages/settings/SettingsPage"), "SettingsPage");

const NotFoundPage: React.FC = () => (
  <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "var(--space-6)", textAlign: "center" }}>
    <div>
      <p style={{ color: "var(--text-tertiary)", fontWeight: 700 }}>404</p>
      <h1 style={{ marginTop: "var(--space-2)" }}>Không tìm thấy trang</h1>
      <p style={{ marginTop: "var(--space-3)", color: "var(--text-secondary)" }}>Đường dẫn này không tồn tại.</p>
      <Link to="/" style={{ display: "inline-block", marginTop: "var(--space-5)", color: "var(--accent-en-primary)", fontWeight: 700 }}>Về trang chủ</Link>
    </div>
  </main>
);

/** Minimal splash shown while auth callback is being processed */
const AuthRedirectingPage: React.FC = () => (
  <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "var(--space-6)", textAlign: "center" }}>
    <div>
      <div style={{ width: 40, height: 40, border: "3px solid var(--accent-en-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto var(--space-4)" }} />
      <p style={{ color: "var(--text-secondary)" }}>Đang xác thực đăng nhập…</p>
    </div>
    {/* inline keyframes for the spinner */}
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </main>
);

const RouteLoadingPage: React.FC = () => (
  <main aria-busy="true" style={{ minHeight: "50vh", display: "grid", placeItems: "center", color: "var(--text-secondary)" }}>
    Đang tải…
  </main>
);

export const App: React.FC = () => {
  const staticMode = isStaticRuntime();
  const Router = staticMode ? HashRouter : BrowserRouter;

  /**
   * authRedirectReady:
   * - For server mode: immediately true (no auth callback needed).
   * - For static mode: starts as false when we detect an auth callback URL,
   *   so we can block HashRouter rendering until handleAuthRedirect() finishes.
   *   Normal static page loads start as true and are never blocked.
   */
  const [authRedirectReady, setAuthRedirectReady] = React.useState<boolean>(
    () => !staticMode || !isAuthCallbackUrl(),
  );

  React.useEffect(() => {
    if (!staticMode) {
      setAuthRedirectReady(true);
      return;
    }

    if (!isAuthCallbackUrl()) {
      // Normal non-callback load — nothing to do
      setAuthRedirectReady(true);
      return;
    }

    // Auth callback detected — process it BEFORE HashRouter renders.
    // handleAuthRedirect() will call window.location.replace(…#/settings)
    // on success/failure, which triggers a fresh page load with a clean route.
    void handleAuthRedirect().finally(() => {
      // If replace() was called, this code is never reached (page reloads).
      // Fallback: mark ready so the router renders something.
      setAuthRedirectReady(true);
    });
  }, [staticMode]);

  // While processing an auth callback, show a loading splash instead of the router.
  if (!authRedirectReady) {
    return (
      <ThemeProvider>
        <AuthRedirectingPage />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider>
            <Router>
              <React.Suspense fallback={<RouteLoadingPage />}>
                <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={staticMode ? <Navigate to="/" replace /> : <LoginPage />} />
                <Route path="/register" element={staticMode ? <Navigate to="/" replace /> : <RegisterPage />} />

                {/* Protected Application Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppShell />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<HomePage />} />
                  <Route path="/vocabulary" element={<VocabularyListPage />} />
                  <Route path="/add" element={<AddVocabularyPage />} />
                  <Route path="/flashcards" element={<FlashcardPage />} />
                  <Route path="/reading" element={<ReadingListPage />} />
                  <Route path="/reading/new" element={<AddReadingPage />} />
                  <Route path="/reading/:id" element={<ReadingDetailPage />} />
                  <Route path="/shadowing" element={<ShadowingPage />} />
                  <Route path="/pronunciation" element={<PronunciationPage />} />
                  <Route path="/quiz" element={<QuizPage />} />
                  <Route path="/games" element={<GamesPage />} />
                  <Route path="/progress" element={<ProgressPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* Catch-all fallback */}
                <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </React.Suspense>
            </Router>
          </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
