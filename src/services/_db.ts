// In-memory mock database. ONLY services may import this file.
import { format, subDays } from "date-fns";
import type {
  AttendanceRecord, AttendanceStatus, Class, Exam, FeeHead, FeeInvoice, Mark, Notice,
  Payment, Section, Staff, Student, Subject, User,
} from "@/types";

export const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));
let counter = 0;
export const uid = () =>
  `${Date.now().toString(16)}-${(++counter).toString(16).padStart(4, "0")}-4${Math.random().toString(16).slice(2, 5)}-a${Math.random().toString(16).slice(2, 5)}-${Math.random().toString(16).slice(2, 14).padEnd(12, "0")}`;

// deterministic PRNG so seed data is stable between reloads
let seed = 42;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const sid = (p: string, n: number) => `${p}-0000-4000-8000-${n.toString().padStart(12, "0")}`;

const maleFirst = ["Aarav", "Bibek", "Sujan", "Prakash", "Rohan", "Sandesh", "Kiran", "Nabin", "Anish", "Suman", "Bikash", "Ramesh", "Saugat", "Pratik", "Dipesh"];
const femaleFirst = ["Aastha", "Sita", "Pooja", "Srijana", "Anjali", "Sabina", "Asmita", "Riya", "Puja", "Kritika", "Sarita", "Nisha", "Manisha", "Prerana", "Smriti"];
const lastNames = ["Shrestha", "Sharma", "Adhikari", "Thapa", "Gurung", "Tamang", "Rai", "Magar", "Karki", "Poudel", "Bhattarai", "Maharjan", "KC", "Joshi", "Basnet"];
const places = ["Baneshwor, Kathmandu", "Lalitpur-5, Patan", "Bhaktapur-3", "Kirtipur-2", "Budhanilkantha-4", "Koteshwor, Kathmandu", "Chabahil, Kathmandu", "Balkumari, Lalitpur"];
const phone = () => `+977 98${Math.floor(rand() * 10)}${Math.floor(1000000 + rand() * 8999999)}`;
const iso = (d: Date) => format(d, "yyyy-MM-dd");

export const subjects: Subject[] = [
  ["English", "ENG"], ["Nepali", "NEP"], ["Mathematics", "MTH"], ["Science", "SCI"],
  ["Social Studies", "SOC"], ["Computer", "COM"],
].map(([name, code], i) => ({ id: sid("sub", i + 1), name, code }));

export const classes: Class[] = Array.from({ length: 12 }, (_, i) => ({
  id: sid("cls", i + 1), grade: i + 1, name: `Grade ${i + 1}`,
}));

export const staff: Staff[] = Array.from({ length: 28 }, (_, i) => {
  const female = rand() > 0.5;
  const first = pick(female ? femaleFirst : maleFirst);
  const last = pick(lastNames);
  const role: Staff["role"] = i < 24 ? "teacher" : i < 26 ? "accountant" : "support";
  return {
    id: sid("stf", i + 1),
    full_name: `${first} ${last}`,
    role,
    subject: role === "teacher" ? subjects[i % subjects.length].name : null,
    phone: phone(),
    email: `${first.toLowerCase()}.${last.toLowerCase()}@schoolhub.edu.np`,
    joining_date: iso(subDays(new Date(), 200 + Math.floor(rand() * 3000))),
    assigned_section_ids: [],
  };
});

export const sections: Section[] = classes.flatMap((c, ci) =>
  ["A", "B"].map((name, si) => {
    const teacher = staff[(ci * 2 + si) % 24];
    const id = sid("sec", ci * 2 + si + 1);
    teacher.assigned_section_ids.push(id);
    return { id, class_id: c.id, name, class_teacher_id: teacher.id };
  }),
);

export const students: Student[] = [];
let sn = 0;
for (const sec of sections) {
  const grade = classes.find((c) => c.id === sec.class_id)!.grade;
  for (let r = 1; r <= 8; r++) {
    const female = rand() > 0.5;
    const last = pick(lastNames);
    const dob = new Date(2026 - 5 - grade, Math.floor(rand() * 12), 1 + Math.floor(rand() * 27));
    students.push({
      id: sid("stu", ++sn),
      full_name: `${pick(female ? femaleFirst : maleFirst)} ${last}`,
      dob: iso(dob),
      gender: female ? "female" : "male",
      guardian_name: `${pick(maleFirst)} ${last}`,
      guardian_phone: phone(),
      class_id: sec.class_id,
      section_id: sec.id,
      roll_no: r,
      address: pick(places),
      admission_date: iso(subDays(new Date(), 100 + Math.floor(rand() * 2500))),
      status: rand() > 0.96 ? "inactive" : "active",
    });
  }
}

// 30 days of attendance (skip Saturdays — Nepali weekend)
export const attendance: AttendanceRecord[] = [];
const statusFor = (): AttendanceStatus => {
  const x = rand();
  return x < 0.86 ? "present" : x < 0.93 ? "absent" : x < 0.97 ? "late" : "leave";
};
for (let d = 30; d >= 1; d--) {
  const date = subDays(new Date(), d);
  if (date.getDay() === 6) continue;
  for (const s of students) {
    attendance.push({ id: uid(), student_id: s.id, section_id: s.section_id, date: iso(date), status: statusFor(), marked_by: null });
  }
}

export const exams: Exam[] = (["Unit Test", "Terminal", "Final"] as const).map((name, i) => ({
  id: sid("exm", i + 1), name, academic_year: "2026",
}));

export const marks: Mark[] = [];
for (const s of students) {
  for (const sub of subjects) {
    for (const ex of exams.slice(0, 2)) {
      marks.push({ id: uid(), exam_id: ex.id, student_id: s.id, subject_id: sub.id, full_marks: 100, pass_marks: 35, obtained: Math.round(28 + rand() * 72) });
    }
  }
}

export const feeHeads: FeeHead[] = classes.flatMap((c) => [
  { id: uid(), class_id: c.id, name: "Tuition", amount: 2500 + c.grade * 250, frequency: "monthly" as const },
  { id: uid(), class_id: c.id, name: "Exam", amount: 1500, frequency: "quarterly" as const },
  { id: uid(), class_id: c.id, name: "Transport", amount: 1800, frequency: "monthly" as const },
]);

export const invoices: FeeInvoice[] = students.map((s) => {
  const grade = classes.find((c) => c.id === s.class_id)!.grade;
  const total = (2500 + grade * 250) * 6 + 1500 * 2;
  const x = rand();
  const paid = x < 0.55 ? total : x < 0.8 ? Math.round((total * (0.3 + rand() * 0.5)) / 100) * 100 : 0;
  return { id: uid(), student_id: s.id, total_due: total, paid, due_date: iso(subDays(new Date(), Math.floor(rand() * 40) - 10)) };
});

export const payments: Payment[] = [];
let receipt = 1000;
for (let m = 5; m >= 0; m--) {
  invoices.forEach((inv) => {
    if (inv.paid > 0 && rand() > 0.3) {
      const d = subDays(new Date(), m * 30 + Math.floor(rand() * 25));
      payments.push({ id: uid(), invoice_id: inv.id, student_id: inv.student_id, amount: Math.round(inv.paid / 6 / 100) * 100, date: iso(d), method: pick(["cash", "bank", "esewa", "khalti"] as const), receipt_no: `RCP-${++receipt}` });
    }
  });
}

export const notices: Notice[] = [
  { title: "Dashain Vacation", message: "School will remain closed from Ashwin 20 to Kartik 2 for Dashain. Classes resume on Kartik 3.", audience: "all" as const },
  { title: "Terminal Exam Routine Published", message: "The second terminal examination routine is available at the reception and on the notice board.", audience: "all" as const },
  { title: "Parent-Teacher Meeting: Grade 10", message: "PTM for Grade 10 parents on Friday at 11 AM in the main hall.", audience: "class" as const, audience_value: classes[9].id },
  { title: "Staff Meeting", message: "All teaching staff are requested to attend the meeting on Sunday at 3 PM.", audience: "role" as const, audience_value: "teacher" },
].map((n, i) => ({
  id: uid(), audience_value: null, ...n, send_sms: i % 2 === 0, delivery_status: "sent" as const,
  created_by: sid("usr", 1), created_at: subDays(new Date(), i * 3 + 1).toISOString(),
}));

const teacherStaff = staff[0];
const demoStudent = students[72]; // Grade 5-A roll 1
export const users: User[] = [
  { id: sid("usr", 1), email: "admin@schoolhub.edu.np", full_name: "Rajendra Pokharel", role: "admin" },
  { id: sid("usr", 2), email: teacherStaff.email, full_name: teacherStaff.full_name, role: "teacher", staff_id: teacherStaff.id },
  { id: sid("usr", 3), email: "student@schoolhub.edu.np", full_name: demoStudent.full_name, role: "student", student_id: demoStudent.id },
  { id: sid("usr", 4), email: "parent@schoolhub.edu.np", full_name: demoStudent.guardian_name, role: "parent", child_ids: [demoStudent.id, students[150].id] },
];
