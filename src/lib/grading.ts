// Nepal NEB-style grading. Pure functions only.
export type Grade = "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "NG";

export interface GradeResult {
  grade: Grade;
  point: number;
}

export function percentage(obtained: number, full: number): number {
  if (full <= 0) return 0;
  return (obtained / full) * 100;
}

export function gradeFromPercent(pct: number): GradeResult {
  if (pct >= 90) return { grade: "A+", point: 4.0 };
  if (pct >= 80) return { grade: "A", point: 3.6 };
  if (pct >= 70) return { grade: "B+", point: 3.2 };
  if (pct >= 60) return { grade: "B", point: 2.8 };
  if (pct >= 50) return { grade: "C+", point: 2.4 };
  if (pct >= 40) return { grade: "C", point: 2.0 };
  if (pct >= 35) return { grade: "D", point: 1.6 };
  return { grade: "NG", point: 0 };
}

export function gradeFromMarks(obtained: number, full: number): GradeResult {
  return gradeFromPercent(percentage(obtained, full));
}

export function calculateGPA(points: number[]): number {
  if (points.length === 0) return 0;
  const avg = points.reduce((a, b) => a + b, 0) / points.length;
  return Math.round(avg * 100) / 100;
}

export function isFail(grades: Grade[]): boolean {
  return grades.some((g) => g === "NG");
}
