import { delay, staff, students, uid } from "./_db";
import type { Staff } from "@/types";

export async function getStaff(search?: string): Promise<Staff[]> {
  await delay();
  const q = search?.toLowerCase();
  return staff.filter((s) => !q || s.full_name.toLowerCase().includes(q));
}

export async function getStaffMember(id: string): Promise<Staff> {
  await delay();
  const s = staff.find((x) => x.id === id);
  if (!s) throw new Error("Staff not found");
  return s;
}

export async function createStaff(data: Omit<Staff, "id">): Promise<Staff> {
  await delay();
  const s = { ...data, id: uid() };
  staff.unshift(s);
  return s;
}

export async function countStaff(): Promise<number> {
  await delay(100);
  void students;
  return staff.length;
}
