import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/common";

export const Route = createFileRoute("/teacher/gradebook")({
  head: () => ({ meta: [{ title: "Gradebook · SchoolHub" }, { name: "description", content: "Gradebook in SchoolHub." }, { property: "og:title", content: "Gradebook · SchoolHub" }, { property: "og:description", content: "Gradebook in SchoolHub." }] }),
  component: () => <ComingSoon title="Gradebook" />,
});
