import { useEffect, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { Navbar } from "./components/shared/Navbar";
import { useAuthStore } from "./store/authStore";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SessionListPage } from "./pages/SessionListPage";
import { WorkspacePage } from "./pages/WorkspacePage";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialized = useAuthStore((s) => s.initialized);

  if (!initialized) {
    return <div className="p-8 text-sm">Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const location = useLocation();
  const hideNavbar = ["/", "/login", "/register"].includes(location.pathname);
  return (
    <div className="min-h-screen bg-sand font-body text-ink">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/sessions" replace /> : <LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/sessions"
          element={
            <ProtectedRoute>
              <SessionListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sessions/:id"
          element={
            <ProtectedRoute>
              <WorkspacePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
