import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { onAuthChange, getIdToken, logoutUser } from "@/lib/firebase";

const AuthContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);

  const fetchUser = useCallback(async (idToken) => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          setToken(idToken);
          await fetchUser(idToken);
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

  // tokens expire after 1 hour, refresh every 50 min
  useEffect(() => {
    if (!firebaseUser) return;

    const refreshToken = async () => {
      try {
        const newToken = await firebaseUser.getIdToken(true);
        setToken(newToken);
      } catch (error) {
        console.error("Token refresh failed:", error);
      }
    };

    const interval = setInterval(refreshToken, 50 * 60 * 1000);
    return () => clearInterval(interval);
  }, [firebaseUser]);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      setToken(null);
      setUser(null);
      setFirebaseUser(null);
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
        firebaseUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
