"use client";

import { createContext, useContext, type PropsWithChildren } from "react";
import { type User } from "firebase/auth";
import { useAuth } from "~/hooks/use-auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; user?: User; error?: Error }>;
  signInWithGoogle: () => Promise<{
    success: boolean;
    user?: User;
    error?: Error;
  }>;
  logout: () => Promise<{ success: boolean; error?: Error }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
