import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/common";

export const Route = createFileRoute("/student/results")({
  head: () => ({ meta: [{ title: "Results · SchoolHub" }, { name: "description", content: "Results in SchoolHub." }, { property: "og:title", content: "Results · SchoolHub" }, { property: "og:description", content: "Results in SchoolHub." }] }),
  component: () => <ComingSoon title="Results" />,
});
