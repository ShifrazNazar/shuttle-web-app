import type { User } from "firebase/auth";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; user?: User; error?: Error }>;
  logout: () => Promise<{ success: boolean; error?: Error }>;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export interface FirestoreUserData {
  email?: string;
  username?: string;
  role?: string;
}
