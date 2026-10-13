import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/common";

export const Route = createFileRoute("/student/")({
  head: () => ({ meta: [{ title: "Student Dashboard · SchoolHub" }, { name: "description", content: "Student Dashboard in SchoolHub." }, { property: "og:title", content: "Student Dashboard · SchoolHub" }, { property: "og:description", content: "Student Dashboard in SchoolHub." }] }),
  component: () => <ComingSoon title="Student Dashboard" />,
});
