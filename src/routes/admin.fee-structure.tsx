import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/common";

export const Route = createFileRoute("/admin/fee-structure")({
  head: () => ({ meta: [{ title: "Fee Structure · SchoolHub" }, { name: "description", content: "Fee Structure in SchoolHub." }, { property: "og:title", content: "Fee Structure · SchoolHub" }, { property: "og:description", content: "Fee Structure in SchoolHub." }] }),
  component: () => <ComingSoon title="Fee Structure" />,
});
