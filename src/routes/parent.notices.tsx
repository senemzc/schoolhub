import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/common";

export const Route = createFileRoute("/parent/notices")({
  head: () => ({ meta: [{ title: "Notices · SchoolHub" }, { name: "description", content: "Notices in SchoolHub." }, { property: "og:title", content: "Notices · SchoolHub" }, { property: "og:description", content: "Notices in SchoolHub." }] }),
  component: () => <ComingSoon title="Notices" />,
});
