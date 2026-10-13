import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { requireRole } from "@/lib/route-guard";

export const Route = createFileRoute("/parent")({
  ssr: false,
  beforeLoad: () => requireRole("parent"),
  component: ParentLayout,
});

function ParentLayout() {
  return (
    <AppShell role="parent">
      <Outlet />
    </AppShell>
  );
}
