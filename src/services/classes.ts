import { classes, delay, sections, staff, students, subjects } from "./_db";
import type { Class, Section, Subject } from "@/types";

export interface SectionWithMeta extends Section {
  class_name: string;
  grade: number;
  class_teacher_name: string | null;
  student_count: number;
}

export async function getClasses(): Promise<Class[]> {
  await delay(150);
  return [...classes];
}

export async function getSections(classId?: string): Promise<SectionWithMeta[]> {
  await delay(150);
  return sections
    .filter((s) => !classId || s.class_id === classId)
    .map((s) => {
      const c = classes.find((x) => x.id === s.class_id)!;
      return {
        ...s,
        class_name: c.name,
        grade: c.grade,
        class_teacher_name: staff.find((t) => t.id === s.class_teacher_id)?.full_name ?? null,
        student_count: students.filter((st) => st.section_id === s.id && st.status === "active").length,
      };
    });
}

export async function getSectionsForTeacher(staffId: string): Promise<SectionWithMeta[]> {
  const all = await getSections();
  const t = staff.find((s) => s.id === staffId);
  return all.filter((s) => t?.assigned_section_ids.includes(s.id) || s.class_teacher_id === staffId);
}

export async function getSubjects(): Promise<Subject[]> {
  await delay(100);
  return [...subjects];
}
