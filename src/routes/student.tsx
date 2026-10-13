import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { requireRole } from "@/lib/route-guard";

export const Route = createFileRoute("/student")({
  ssr: false,
  beforeLoad: () => requireRole("student"),
  component: StudentLayout,
});

function StudentLayout() {
  return (
    <AppShell role="student">
      <Outlet />
    </AppShell>
  );
}
