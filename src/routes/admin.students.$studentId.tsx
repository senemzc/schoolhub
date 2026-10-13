import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, ErrorState, PageHeader, StatCard, StatusBadge } from "@/components/common";
import { DataTable } from "@/components/DataTable";
import { StudentFormDialog } from "@/components/StudentFormDialog";
import { useExams, useStudent, useStudentAttendance, useStudentInvoices, useStudentMarks, useStudentPayments } from "@/hooks/use-school";
import { formatDate, formatNPR } from "@/lib/format";
import { calculateGPA, gradeFromMarks, isFail } from "@/lib/grading";
import { CalendarCheck, CalendarX, Clock } from "lucide-react";

export const Route = createFileRoute("/admin/students/$studentId")({
  head: () => ({
    meta: [
      { title: "Student profile · SchoolHub" },
      { name: "description", content: "Student profile, attendance, results and fees." },
      { property: "og:title", content: "Student profile · SchoolHub" },
      { property: "og:description", content: "Student profile, attendance, results and fees." },
    ],
  }),
  component: StudentDetail,
});

function StudentDetail() {
  const { studentId } = Route.useParams();
  const q = useStudent(studentId);
  const [editOpen, setEditOpen] = useState(false);

  if (q.isLoading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-64 w-full" /></div>;
  if (q.error || !q.data) return <ErrorState message={q.error?.message} onRetry={() => q.refetch()} />;
  const s = q.data;

  return (
    <>
      <Button asChild variant="ghost" className="mb-2 -ml-3"><Link to="/admin/students"><ArrowLeft className="h-4 w-4" /> Students</Link></Button>
      <PageHeader title={s.full_name} description={`${s.class_name} – Section ${s.section_name} · Roll ${s.roll_no}`}
        actions={<Button variant="outline" onClick={() => setEditOpen(true)}><Pencil className="h-4 w-4" /> Edit</Button>} />
      <Tabs defaultValue="profile">
        <TabsList className="mb-4 h-auto flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card className="grid gap-x-8 gap-y-4 p-6 sm:grid-cols-2">
            {[
              ["Date of birth", formatDate(s.dob)], ["Gender", s.gender], ["Guardian", s.guardian_name],
              ["Guardian phone", s.guardian_phone], ["Address", s.address], ["Admission date", formatDate(s.admission_date)],
            ].map(([k, v]) => (
              <div key={k}><p className="text-sm text-muted-foreground">{k}</p><p className="font-medium capitalize">{v}</p></div>
            ))}
            <div><p className="text-sm text-muted-foreground">Status</p><StatusBadge status={s.status} /></div>
          </Card>
        </TabsContent>
        <TabsContent value="attendance"><AttendanceTab id={s.id} /></TabsContent>
        <TabsContent value="results"><ResultsTab id={s.id} /></TabsContent>
        <TabsContent value="fees"><FeesTab id={s.id} /></TabsContent>
      </Tabs>
      <StudentFormDialog open={editOpen} onOpenChange={setEditOpen} student={s} />
    </>
  );
}

function AttendanceTab({ id }: { id: string }) {
  const q = useStudentAttendance(id);
  const stats = useMemo(() => {
    const r = q.data ?? [];
    const c = (st: string) => r.filter((x) => x.status === st).length;
    return { total: r.length, present: c("present") + c("late"), absent: c("absent"), late: c("late") };
  }, [q.data]);
  return (
    <>
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Attendance" value={`${stats.total ? Math.round((stats.present / stats.total) * 100) : 0}%`} icon={CalendarCheck} tone="success" loading={q.isLoading} />
        <StatCard label="Absent days" value={stats.absent} icon={CalendarX} tone="destructive" loading={q.isLoading} />
        <StatCard label="Late arrivals" value={stats.late} icon={Clock} tone="warning" loading={q.isLoading} />
      </div>
      <DataTable rows={q.data ? [...q.data].reverse() : undefined} loading={q.isLoading} error={q.error} rowKey={(r) => r.id}
        columns={[{ header: "Date", cell: (r) => formatDate(r.date, "EEE, d MMM yyyy") }, { header: "Status", cell: (r) => <StatusBadge status={r.status} /> }]} />
    </>
  );
}

function ResultsTab({ id }: { id: string }) {
  const marks = useStudentMarks(id);
  const exams = useExams();
  if (marks.isLoading || exams.isLoading) return <Skeleton className="h-64 w-full" />;
  if (marks.error) return <ErrorState onRetry={() => marks.refetch()} />;
  const byExam = exams.data?.map((e) => ({ exam: e, rows: (marks.data ?? []).filter((m) => m.exam_id === e.id) })).filter((x) => x.rows.length);
  if (!byExam?.length) return <EmptyState title="No results yet" />;
  return (
    <div className="space-y-6">
      {byExam.map(({ exam, rows }) => {
        const graded = rows.map((r) => ({ ...r, ...gradeFromMarks(r.obtained ?? 0, r.full_marks) }));
        const gpa = calculateGPA(graded.map((g) => g.point));
        const fail = isFail(graded.map((g) => g.grade));
        return (
          <div key={exam.id}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">{exam.name} {exam.academic_year}</h3>
              <p className="font-semibold">GPA {gpa.toFixed(2)} · <span className={fail ? "text-destructive" : "text-success"}>{fail ? "Fail" : "Pass"}</span></p>
            </div>
            <DataTable rows={graded} rowKey={(r) => r.id} columns={[
              { header: "Subject", cell: (r) => r.subject_name },
              { header: "Full", cell: (r) => r.full_marks }, { header: "Pass", cell: (r) => r.pass_marks },
              { header: "Obtained", cell: (r) => <span className="font-semibold">{r.obtained}</span> },
              { header: "Grade", cell: (r) => <span className={r.grade === "NG" ? "font-bold text-destructive" : "font-bold"}>{r.grade}</span> },
              { header: "GP", cell: (r) => r.point.toFixed(1) },
            ]} />
          </div>
        );
      })}
    </div>
  );
}

function FeesTab({ id }: { id: string }) {
  const inv = useStudentInvoices(id);
  const pay = useStudentPayments(id);
  return (
    <div className="space-y-6">
      <DataTable rows={inv.data} loading={inv.isLoading} error={inv.error} rowKey={(r) => r.id} columns={[
        { header: "Total due", cell: (r) => formatNPR(r.total_due) }, { header: "Paid", cell: (r) => formatNPR(r.paid) },
        { header: "Balance", cell: (r) => <span className="font-semibold">{formatNPR(r.total_due - r.paid)}</span> },
        { header: "Due date", cell: (r) => formatDate(r.due_date) }, { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
      ]} />
      <div>
        <h3 className="mb-2 font-semibold">Payment history</h3>
        <DataTable rows={pay.data} loading={pay.isLoading} error={pay.error} rowKey={(r) => r.id}
          empty={<EmptyState title="No payments recorded" />} columns={[
            { header: "Receipt", cell: (r) => r.receipt_no }, { header: "Date", cell: (r) => formatDate(r.date) },
            { header: "Method", cell: (r) => <span className="capitalize">{r.method === "esewa" ? "eSewa" : r.method}</span> },
            { header: "Amount", cell: (r) => formatNPR(r.amount) },
          ]} />
      </div>
    </div>
  );
}
