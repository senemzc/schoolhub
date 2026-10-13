import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/common";

export const Route = createFileRoute("/admin/classes")({
  head: () => ({ meta: [{ title: "Classes · SchoolHub" }, { name: "description", content: "Classes in SchoolHub." }, { property: "og:title", content: "Classes · SchoolHub" }, { property: "og:description", content: "Classes in SchoolHub." }] }),
  component: () => <ComingSoon title="Classes" />,
});
