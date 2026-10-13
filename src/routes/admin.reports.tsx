import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/common";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports · SchoolHub" }, { name: "description", content: "Reports in SchoolHub." }, { property: "og:title", content: "Reports · SchoolHub" }, { property: "og:description", content: "Reports in SchoolHub." }] }),
  component: () => <ComingSoon title="Reports" />,
});
