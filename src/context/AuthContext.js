import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { onAuthChange, getAccessToken, logoutUser } from "@/lib/supabase";

const AuthContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  const fetchUser = useCallback(async (accessToken) => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (supabaseUser, supabaseSession) => {
      setSession(supabaseSession);

      if (supabaseSession) {
        try {
          const accessToken = supabaseSession.access_token;
          setToken(accessToken);
          await fetchUser(accessToken);
        } catch (error) {
          console.error("Error getting token:", error);
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUser]);

  // Supabase handles token refresh automatically
  // but we can manually refresh if needed
  useEffect(() => {
    if (!session) return;

    const refreshToken = async () => {
      try {
        const newToken = await getAccessToken();
        if (newToken) {
          setToken(newToken);
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
      }
    };

    // Refresh every 50 minutes (tokens expire after 1 hour)
    const interval = setInterval(refreshToken, 50 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session]);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      setToken(null);
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
  };

  const refreshUser = useCallback(async () => {
    if (token) {
      await fetchUser(token);
    }
  }, [token, fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        logout,
        updateUser,
        refreshUser,
        session
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
