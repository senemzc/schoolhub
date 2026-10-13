// All page data access goes through these TanStack Query hooks.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as studentsSvc from "@/services/students";
import * as staffSvc from "@/services/staff";
import * as classesSvc from "@/services/classes";
import * as attendanceSvc from "@/services/attendance";
import * as gradesSvc from "@/services/grades";
import * as feesSvc from "@/services/fees";
import * as noticesSvc from "@/services/notices";
import type { StudentFilters } from "@/types";

export const useStudents = (f: StudentFilters) =>
  useQuery({ queryKey: ["students", f], queryFn: () => studentsSvc.getStudents(f) });
export const useStudent = (id: string) =>
  useQuery({ queryKey: ["student", id], queryFn: () => studentsSvc.getStudent(id) });

export function useSaveStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: studentsSvc.StudentInput }) =>
      id ? studentsSvc.updateStudent(id, data) : studentsSvc.createStudent(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["student"] });
    },
  });
}
export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: studentsSvc.deleteStudent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export const useStaffCount = () => useQuery({ queryKey: ["staff", "count"], queryFn: staffSvc.countStaff });
export const useClasses = () => useQuery({ queryKey: ["classes"], queryFn: classesSvc.getClasses });
export const useSections = (classId?: string) =>
  useQuery({ queryKey: ["sections", classId ?? "all"], queryFn: () => classesSvc.getSections(classId) });
export const useTeacherSections = (staffId?: string | null) =>
  useQuery({ queryKey: ["sections", "teacher", staffId], queryFn: () => classesSvc.getSectionsForTeacher(staffId!), enabled: !!staffId });

export const useAttendanceTrend = () => useQuery({ queryKey: ["attendance", "trend"], queryFn: () => attendanceSvc.getAttendanceTrend(30) });
export const useTodayAttendance = () => useQuery({ queryKey: ["attendance", "today"], queryFn: attendanceSvc.getTodayAttendancePct });
export const useSectionAttendance = (sectionId: string, date: string) =>
  useQuery({ queryKey: ["attendance", "section", sectionId, date], queryFn: () => attendanceSvc.getSectionAttendance(sectionId, date), enabled: !!sectionId });
export const useStudentAttendance = (id: string) =>
  useQuery({ queryKey: ["attendance", "student", id], queryFn: () => attendanceSvc.getStudentAttendance(id) });
export function useMarkAttendance() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: attendanceSvc.markAttendance, onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }) });
}

export const useExams = () => useQuery({ queryKey: ["exams"], queryFn: gradesSvc.getExams });
export const useStudentMarks = (id: string) =>
  useQuery({ queryKey: ["marks", "student", id], queryFn: () => gradesSvc.getStudentMarks(id) });

export const useFeeSummary = () => useQuery({ queryKey: ["fees", "summary"], queryFn: feesSvc.getFeeSummary });
export const useMonthlyCollection = () => useQuery({ queryKey: ["fees", "monthly"], queryFn: () => feesSvc.getMonthlyCollection(6) });
export const useStudentInvoices = (id: string) =>
  useQuery({ queryKey: ["fees", "invoices", id], queryFn: () => feesSvc.getStudentInvoices(id) });
export const useStudentPayments = (id: string) =>
  useQuery({ queryKey: ["fees", "payments", id], queryFn: () => feesSvc.getStudentPayments(id) });
export const useSendSms = () => useMutation({ mutationFn: feesSvc.sendSms });

export const useNotices = (limit?: number) =>
  useQuery({ queryKey: ["notices", limit ?? "all"], queryFn: () => noticesSvc.getNotices(limit) });
