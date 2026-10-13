// Fake auth. Replace with a real provider later; keep the same function signatures.
import { delay, users } from "./_db";
import type { Role, User } from "@/types";

const KEY = "schoolhub.user";

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export async function login(payload: { email: string; password: string; role: Role }): Promise<User> {
  await delay(500);
  if (payload.password.length < 4) throw new Error("Invalid email or password");
  const base = users.find((u) => u.role === payload.role)!;
  const user: User = { ...base, email: payload.email || base.email };
  window.localStorage.setItem(KEY, JSON.stringify(user));
  return user;
}

export async function logout(): Promise<void> {
  window.localStorage.removeItem(KEY);
}

export const roleHome: Record<Role, "/admin" | "/teacher" | "/student" | "/parent"> = {
  admin: "/admin", teacher: "/teacher", student: "/student", parent: "/parent",
};
