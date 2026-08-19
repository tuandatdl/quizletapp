import React from "react";
import { BrowserRouter, HashRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";

// Pages
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { HomePage } from "./pages/home/HomePage";
import { VocabularyListPage } from "./pages/vocabulary/VocabularyListPage";
import { AddVocabularyPage } from "./pages/vocabulary/AddVocabularyPage";
import { FlashcardPage } from "./pages/flashcards/FlashcardPage";
import { ReadingListPage } from "./pages/reading/ReadingListPage";
import { AddReadingPage } from "./pages/reading/AddReadingPage";
import { ReadingDetailPage } from "./pages/reading/ReadingDetailPage";
import { ShadowingPage } from "./pages/shadowing/ShadowingPage";
import { PronunciationPage } from "./pages/pronunciation/PronunciationPage";
import { QuizPage } from "./pages/quiz/QuizPage";
import { GamesPage } from "./pages/games/GamesPage";
import { ProgressPage } from "./pages/progress/ProgressPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { isStaticRuntime } from "./runtime/runtime";
import { handleAuthRedirect } from "./persistence/supabaseClient";

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

export const App: React.FC = () => {
  const staticMode = isStaticRuntime();
  const Router = staticMode ? HashRouter : BrowserRouter;

  React.useEffect(() => {
    if (staticMode) {
      void handleAuthRedirect();
    }
  }, [staticMode]);
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider>
            <Router>
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
            </Router>
          </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
