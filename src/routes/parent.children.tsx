import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/common";

export const Route = createFileRoute("/parent/children")({
  head: () => ({ meta: [{ title: "Children · SchoolHub" }, { name: "description", content: "Children in SchoolHub." }, { property: "og:title", content: "Children · SchoolHub" }, { property: "og:description", content: "Children in SchoolHub." }] }),
  component: () => <ComingSoon title="Children" />,
});
