import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/common";

export const Route = createFileRoute("/admin/staff")({
  head: () => ({ meta: [{ title: "Staff · SchoolHub" }, { name: "description", content: "Staff in SchoolHub." }, { property: "og:title", content: "Staff · SchoolHub" }, { property: "og:description", content: "Staff in SchoolHub." }] }),
  component: () => <ComingSoon title="Staff" />,
});
