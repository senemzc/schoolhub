import { delay, exams, marks, subjects, uid } from "./_db";
import type { Exam, Mark } from "@/types";

export async function getExams(): Promise<Exam[]> {
  await delay(100);
  return [...exams];
}

export interface StudentMarkRow extends Mark { subject_name: string }

export async function getStudentMarks(studentId: string, examId?: string): Promise<StudentMarkRow[]> {
  await delay();
  return marks
    .filter((m) => m.student_id === studentId && (!examId || m.exam_id === examId))
    .map((m) => ({ ...m, subject_name: subjects.find((s) => s.id === m.subject_id)?.name ?? "" }));
}

export async function getMarks(params: { exam_id: string; subject_id: string; student_ids: string[] }): Promise<Mark[]> {
  await delay();
  return marks.filter((m) => m.exam_id === params.exam_id && m.subject_id === params.subject_id && params.student_ids.includes(m.student_id));
}

export async function saveMarks(rows: Omit<Mark, "id">[]): Promise<{ saved: number }> {
  await delay(500);
  for (const r of rows) {
    const i = marks.findIndex((m) => m.exam_id === r.exam_id && m.subject_id === r.subject_id && m.student_id === r.student_id);
    if (i >= 0) marks[i] = { ...marks[i], ...r }; else marks.push({ ...r, id: uid() });
  }
  return { saved: rows.length };
}
