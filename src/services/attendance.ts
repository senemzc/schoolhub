import { format, subDays } from "date-fns";
import { attendance, delay, students, uid } from "./_db";
import type { AttendanceRecord, AttendanceStatus } from "@/types";

export interface AttendanceTrendPoint { date: string; percent: number }

export async function getAttendanceTrend(days = 30): Promise<AttendanceTrendPoint[]> {
  await delay();
  const out: AttendanceTrendPoint[] = [];
  for (let d = days; d >= 0; d--) {
    const date = format(subDays(new Date(), d), "yyyy-MM-dd");
    const recs = attendance.filter((a) => a.date === date);
    if (!recs.length) continue;
    const present = recs.filter((a) => a.status === "present" || a.status === "late").length;
    out.push({ date, percent: Math.round((present / recs.length) * 1000) / 10 });
  }
  return out;
}

export async function getTodayAttendancePct(): Promise<number> {
  const trend = await getAttendanceTrend(7);
  return trend.at(-1)?.percent ?? 0;
}

export async function getSectionAttendance(sectionId: string, date: string): Promise<AttendanceRecord[]> {
  await delay();
  return attendance.filter((a) => a.section_id === sectionId && a.date === date);
}

export async function getStudentAttendance(studentId: string): Promise<AttendanceRecord[]> {
  await delay();
  return attendance.filter((a) => a.student_id === studentId).sort((a, b) => a.date.localeCompare(b.date));
}

export interface MarkAttendancePayload {
  section_id: string;
  date: string;
  marked_by: string | null;
  entries: { student_id: string; status: AttendanceStatus }[];
}

export async function markAttendance(p: MarkAttendancePayload): Promise<{ saved: number; absent_student_ids: string[] }> {
  await delay(600);
  for (const e of p.entries) {
    const i = attendance.findIndex((a) => a.student_id === e.student_id && a.date === p.date);
    const rec = { id: i >= 0 ? attendance[i].id : uid(), student_id: e.student_id, section_id: p.section_id, date: p.date, status: e.status, marked_by: p.marked_by };
    if (i >= 0) attendance[i] = rec; else attendance.push(rec);
  }
  void students;
  return { saved: p.entries.length, absent_student_ids: p.entries.filter((e) => e.status === "absent").map((e) => e.student_id) };
}
