import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/common";

export const Route = createFileRoute("/teacher/my-classes")({
  head: () => ({ meta: [{ title: "My Classes · SchoolHub" }, { name: "description", content: "My Classes in SchoolHub." }, { property: "og:title", content: "My Classes · SchoolHub" }, { property: "og:description", content: "My Classes in SchoolHub." }] }),
  component: () => <ComingSoon title="My Classes" />,
});
