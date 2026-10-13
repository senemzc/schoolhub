import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/common";

export const Route = createFileRoute("/student/attendance")({
  head: () => ({ meta: [{ title: "Attendance · SchoolHub" }, { name: "description", content: "Attendance in SchoolHub." }, { property: "og:title", content: "Attendance · SchoolHub" }, { property: "og:description", content: "Attendance in SchoolHub." }] }),
  component: () => <ComingSoon title="Attendance" />,
});
