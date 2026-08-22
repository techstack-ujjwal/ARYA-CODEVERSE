"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserRole, AuthenticatedUser } from "@/types/api";
import { getStoredRole, setStoredRole } from "@/lib/api/client";
import { AuthAPI } from "@/lib/api/health";

interface AuthContextType {
  role: UserRole;
  user: AuthenticatedUser | null;
  isLoading: boolean;
  setRole: (role: UserRole) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("admin");
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const res = await AuthAPI.getMe();
      setUser(res);
    } catch {
      // Fallback dev user if backend is offline or loading
      const currentRole = getStoredRole();
      setUser({
        user_id: `user_${currentRole}`,
        email: `${currentRole}@hackathon.eval`,
        role: currentRole,
        metadata: { dev_mode: true },
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialRole = getStoredRole();
    setRoleState(initialRole);
    fetchUser();

    const handleAuthChange = () => {
      const updatedRole = getStoredRole();
      setRoleState(updatedRole);
      fetchUser();
    };

    window.addEventListener("eval_auth_changed", handleAuthChange);
    return () => {
      window.removeEventListener("eval_auth_changed", handleAuthChange);
    };
  }, []);

  const handleSetRole = (newRole: UserRole) => {
    setStoredRole(newRole);
    setRoleState(newRole);
    fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        isLoading,
        setRole: handleSetRole,
        refreshUser: fetchUser,
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
