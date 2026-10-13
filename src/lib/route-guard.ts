// Route guard used by each role layout's beforeLoad. Swap getCurrentUser for a
// real session lookup later; pages don't need to change.
import { redirect } from "@tanstack/react-router";
import { getCurrentUser, roleHome } from "@/services/auth";
import type { Role } from "@/types";

export function requireRole(role: Role) {
  const user = getCurrentUser();
  if (!user) throw redirect({ to: "/login" });
  if (user.role !== role) throw redirect({ to: roleHome[user.role] });
  return { user };
}
