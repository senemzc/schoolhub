import { delay, notices, uid } from "./_db";
import type { Notice } from "@/types";

export async function getNotices(limit?: number): Promise<Notice[]> {
  await delay();
  const sorted = [...notices].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return limit ? sorted.slice(0, limit) : sorted;
}

export async function createNotice(data: Omit<Notice, "id" | "created_at" | "delivery_status">): Promise<Notice> {
  await delay();
  const n: Notice = { ...data, id: uid(), created_at: new Date().toISOString(), delivery_status: data.send_sms ? "queued" : "sent" };
  notices.unshift(n);
  return n;
}
