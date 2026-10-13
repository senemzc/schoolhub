// Types mirror a relational (Postgres) schema. IDs are uuid-style strings.
export type Role = "admin" | "teacher" | "student" | "parent";
export type Gender = "male" | "female" | "other";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  staff_id?: string | null;
  student_id?: string | null;
  child_ids?: string[]; // parent -> students
}

export interface Class {
  id: string;
  grade: number; // 1-12
  name: string; // "Grade 10"
}

export interface Section {
  id: string;
  class_id: string;
  name: string; // "A"
  class_teacher_id: string | null;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export type StudentStatus = "active" | "inactive" | "graduated";

export interface Student {
  id: string;
  full_name: string;
  dob: string; // ISO date
  gender: Gender;
  guardian_name: string;
  guardian_phone: string;
  class_id: string;
  section_id: string;
  roll_no: number;
  address: string;
  admission_date: string;
  status: StudentStatus;
}

export interface Staff {
  id: string;
  full_name: string;
  role: "teacher" | "accountant" | "admin" | "support";
  subject: string | null;
  phone: string;
  email: string;
  joining_date: string;
  assigned_section_ids: string[];
}

export type AttendanceStatus = "present" | "absent" | "late" | "leave";

export interface AttendanceRecord {
  id: string;
  student_id: string;
  section_id: string;
  date: string; // yyyy-MM-dd
  status: AttendanceStatus;
  marked_by: string | null;
}

export interface Exam {
  id: string;
  name: "Unit Test" | "Terminal" | "Final";
  academic_year: string;
}

export interface Mark {
  id: string;
  exam_id: string;
  student_id: string;
  subject_id: string;
  full_marks: number;
  pass_marks: number;
  obtained: number | null;
}

export type FeeFrequency = "monthly" | "quarterly" | "yearly" | "one_time";

export interface FeeHead {
  id: string;
  class_id: string;
  name: string;
  amount: number;
  frequency: FeeFrequency;
}

export type InvoiceStatus = "paid" | "partial" | "overdue";

export interface FeeInvoice {
  id: string;
  student_id: string;
  total_due: number;
  paid: number;
  due_date: string;
}

export type PaymentMethod = "cash" | "bank" | "esewa" | "khalti";

export interface Payment {
  id: string;
  invoice_id: string;
  student_id: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  receipt_no: string;
}

export type NoticeAudience = "all" | "class" | "role";

export interface Notice {
  id: string;
  title: string;
  message: string;
  audience: NoticeAudience;
  audience_value: string | null;
  send_sms: boolean;
  delivery_status: "queued" | "sent" | "failed";
  created_by: string;
  created_at: string;
}

// Composite / view types
export interface StudentWithClass extends Student {
  class_name: string;
  section_name: string;
}

export interface StudentFilters {
  search?: string;
  class_id?: string;
  section_id?: string;
  status?: StudentStatus | "all";
}

export interface DashboardStats {
  total_students: number;
  total_staff: number;
  today_attendance_pct: number;
  fees_collected: number;
  fees_outstanding: number;
}
