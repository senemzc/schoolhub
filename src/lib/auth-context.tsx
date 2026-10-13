import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import * as authSvc from "@/services/auth";
import type { Role, User } from "@/types";

interface AuthState {
  user: User | null;
  ready: boolean;
  login: (p: { email: string; password: string; role: Role }) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setUser(authSvc.getCurrentUser());
    setReady(true);
  }, []);
  const login = useCallback(async (p: { email: string; password: string; role: Role }) => {
    const u = await authSvc.login(p);
    setUser(u);
    return u;
  }, []);
  const logout = useCallback(async () => {
    await authSvc.logout();
    setUser(null);
  }, []);
  return <AuthContext.Provider value={{ user, ready, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
