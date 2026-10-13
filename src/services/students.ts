import { classes, delay, sections, students, uid } from "./_db";
import type { Student, StudentFilters, StudentWithClass } from "@/types";

const withClass = (s: Student): StudentWithClass => ({
  ...s,
  class_name: classes.find((c) => c.id === s.class_id)?.name ?? "—",
  section_name: sections.find((x) => x.id === s.section_id)?.name ?? "—",
});

export async function getStudents(filters: StudentFilters = {}): Promise<StudentWithClass[]> {
  await delay();
  const q = filters.search?.trim().toLowerCase();
  return students
    .filter((s) => !filters.class_id || s.class_id === filters.class_id)
    .filter((s) => !filters.section_id || s.section_id === filters.section_id)
    .filter((s) => !filters.status || filters.status === "all" || s.status === filters.status)
    .filter((s) => !q || s.full_name.toLowerCase().includes(q) || s.guardian_phone.includes(q) || s.guardian_name.toLowerCase().includes(q))
    .map(withClass);
}

export async function getStudent(id: string): Promise<StudentWithClass> {
  await delay();
  const s = students.find((x) => x.id === id);
  if (!s) throw new Error("Student not found");
  return withClass(s);
}

export type StudentInput = Omit<Student, "id">;

export async function createStudent(data: StudentInput): Promise<Student> {
  await delay();
  const s = { ...data, id: uid() };
  students.unshift(s);
  return s;
}

export async function updateStudent(id: string, data: Partial<StudentInput>): Promise<Student> {
  await delay();
  const i = students.findIndex((x) => x.id === id);
  if (i < 0) throw new Error("Student not found");
  students[i] = { ...students[i], ...data };
  return students[i];
}

export async function deleteStudent(id: string): Promise<void> {
  await delay();
  const i = students.findIndex((x) => x.id === id);
  if (i >= 0) students.splice(i, 1);
}
