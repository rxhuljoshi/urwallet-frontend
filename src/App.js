import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import Auth from "./pages/Auth";
import CurrencySelector from "./pages/CurrencySelector";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import AIInsights from "./pages/AIInsights";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (user && !user.is_currency_set) {
    return <Navigate to="/currency-select" replace />;
  }

  return children;
}

function CurrencyRoute({ children }) {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (user && user.is_currency_set) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route
        path="/auth"
        element={token ? <Navigate to="/dashboard" replace /> : <Auth />}
      />
      <Route
        path="/currency-select"
        element={
          <CurrencyRoute>
            <CurrencySelector />
          </CurrencyRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-transaction"
        element={
          <ProtectedRoute>
            <AddTransaction />
          </ProtectedRoute>
        }
      />
      {/* Legacy routes - redirect to new add-transaction */}
      <Route
        path="/add-expense"
        element={<Navigate to="/add-transaction?type=expense" replace />}
      />
      <Route
        path="/edit-expense/:id"
        element={<Navigate to="/add-transaction" replace />}
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-insights"
        element={
          <ProtectedRoute>
            <AIInsights />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <div className="App">
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
