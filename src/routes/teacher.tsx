import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { requireRole } from "@/lib/route-guard";

export const Route = createFileRoute("/teacher")({
  ssr: false,
  beforeLoad: () => requireRole("teacher"),
  component: TeacherLayout,
});

function TeacherLayout() {
  return (
    <AppShell role="teacher">
      <Outlet />
    </AppShell>
  );
}
