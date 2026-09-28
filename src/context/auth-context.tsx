"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserSummary, AuthResponse } from "@/lib/api/types";
import { tokenStore } from "@/lib/api/token-store";
import { apiGetMe, apiLogin, apiRegister, apiLogout } from "@/lib/api/endpoints";
import { refreshAccessToken } from "@/lib/api/client";

interface AuthContextType {
  user: UserSummary | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPhoneVerified: boolean;
  login: (phone: string, password: string) => Promise<AuthResponse>;
  register: (data: { phone: string; password: string; fullName: string; email?: string | null }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  setUser: React.Dispatch<React.SetStateAction<UserSummary | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Attempt initial session restore via HttpOnly cookie refresh on mount
  const restoreSession = useCallback(async () => {
    try {
      const auth = await refreshAccessToken();
      if (auth?.user) {
        setUser(auth.user);
        return true;
      }
      if (auth?.accessToken) {
        const me = await apiGetMe();
        setUser(me);
        return true;
      }
    } catch (err) {
      console.warn("Could not restore session:", err);
    } finally {
      setIsLoading(false);
    }
    return false;
  }, []);

  useEffect(() => {
    restoreSession();

    // Listen for global unauthorized events
    const handleUnauthorized = () => {
      tokenStore.clearToken();
      setUser(null);
    };

    window.addEventListener("ajo:auth-unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("ajo:auth-unauthorized", handleUnauthorized);
    };
  }, [restoreSession]);

  const login = async (phone: string, password: string): Promise<AuthResponse> => {
    const res = await apiLogin({ phone, password });
    tokenStore.setToken(res.accessToken);
    setUser(res.user);
    return res;
  };

  const register = async (data: {
    phone: string;
    password: string;
    fullName: string;
    email?: string | null;
  }): Promise<AuthResponse> => {
    const res = await apiRegister(data);
    tokenStore.setToken(res.accessToken);
    setUser(res.user);
    return res;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (e) {
      console.warn("Logout request failed:", e);
    } finally {
      tokenStore.clearToken();
      setUser(null);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    const auth = await refreshAccessToken();
    if (auth?.user) {
      setUser(auth.user);
      return true;
    }
    if (auth?.accessToken) {
      try {
        const me = await apiGetMe();
        setUser(me);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isPhoneVerified: !!user?.phoneVerified,
        login,
        register,
        logout,
        refreshSession,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
