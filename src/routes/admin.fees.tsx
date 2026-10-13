import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/common";

export const Route = createFileRoute("/admin/fees")({
  head: () => ({ meta: [{ title: "Fees · SchoolHub" }, { name: "description", content: "Fees in SchoolHub." }, { property: "og:title", content: "Fees · SchoolHub" }, { property: "og:description", content: "Fees in SchoolHub." }] }),
  component: () => <ComingSoon title="Fees" />,
});
