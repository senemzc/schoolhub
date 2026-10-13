import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/common";

export const Route = createFileRoute("/parent/")({
  head: () => ({ meta: [{ title: "Parent Dashboard · SchoolHub" }, { name: "description", content: "Parent Dashboard in SchoolHub." }, { property: "og:title", content: "Parent Dashboard · SchoolHub" }, { property: "og:description", content: "Parent Dashboard in SchoolHub." }] }),
  component: () => <ComingSoon title="Parent Dashboard" />,
});
