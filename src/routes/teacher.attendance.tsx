import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { CheckCheck, Loader2, Search, Send, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog, EmptyState, ErrorState, PageHeader, TableSkeleton } from "@/components/common";
import { useMarkAttendance, useSectionAttendance, useStudents, useTeacherSections } from "@/hooks/use-school";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/types";

export const Route = createFileRoute("/teacher/attendance")({
  validateSearch: (s: Record<string, unknown>) => ({ section: typeof s.section === "string" ? s.section : undefined }),
  head: () => ({
    meta: [
      { title: "Take Attendance · SchoolHub" },
      { name: "description", content: "Mark daily attendance for your class." },
      { property: "og:title", content: "Take Attendance · SchoolHub" },
      { property: "og:description", content: "Mark daily attendance for your class." },
    ],
  }),
  component: AttendancePage,
});

const OPTIONS: { value: AttendanceStatus; label: string; short: string; on: string }[] = [
  { value: "present", label: "Present", short: "P", on: "bg-success text-success-foreground border-success" },
  { value: "absent", label: "Absent", short: "A", on: "bg-destructive text-destructive-foreground border-destructive" },
  { value: "late", label: "Late", short: "L", on: "bg-warning text-warning-foreground border-warning" },
  { value: "leave", label: "Leave", short: "LV", on: "bg-info text-primary-foreground border-info" },
];

function AttendancePage() {
  const { user } = useAuth();
  const { section } = Route.useSearch();
  const sections = useTeacherSections(user?.staff_id);
  const [sectionId, setSectionId] = useState(section ?? "");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [search, setSearch] = useState("");
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (!sectionId && sections.data?.length) setSectionId(sections.data[0].id);
  }, [sections.data, sectionId]);

  const students = useStudents({ section_id: sectionId || "__none__", status: "active" });
  const existing = useSectionAttendance(sectionId, date);
  const save = useMarkAttendance();

  useEffect(() => {
    const m: Record<string, AttendanceStatus> = {};
    existing.data?.forEach((r) => (m[r.student_id] = r.status));
    setMarks(m);
  }, [existing.data]);

  const list = useMemo(() => (students.data ?? []).filter((s) => s.full_name.toLowerCase().includes(search.toLowerCase())), [students.data, search]);
  const all = students.data ?? [];
  const counts = useMemo(() => {
    const c = { present: 0, absent: 0, late: 0, leave: 0, unmarked: 0 };
    all.forEach((s) => (marks[s.id] ? c[marks[s.id]]++ : c.unmarked++));
    return c;
  }, [all, marks]);

  const current = sections.data?.find((s) => s.id === sectionId);

  const submit = async () => {
    try {
      const res = await save.mutateAsync({
        section_id: sectionId, date, marked_by: user?.staff_id ?? null,
        entries: all.map((s) => ({ student_id: s.id, status: marks[s.id] ?? "present" })),
      });
      toast.success(`Attendance saved for ${res.saved} students`);
      if (res.absent_student_ids.length) toast.info(`SMS alerts queued for ${res.absent_student_ids.length} absent students`);
      setConfirm(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save attendance");
    }
  };

  return (
    <>
      <PageHeader title="Attendance" description={current ? `${current.class_name} – Section ${current.name}` : "Select a class"} />

      <Card className="mb-4 grid gap-3 p-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Class & section</Label>
          <Select value={sectionId} onValueChange={setSectionId}>
            <SelectTrigger className="h-12" aria-label="Class and section"><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>{sections.data?.map((s) => <SelectItem key={s.id} value={s.id}>{s.class_name} – {s.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="att-date">Date</Label>
          <Input id="att-date" type="date" className="h-12" value={date} max={format(new Date(), "yyyy-MM-dd")} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="att-search">Find student</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input id="att-search" className="h-12 pl-9" placeholder="Name" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </Card>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button size="lg" variant="secondary" onClick={() => setMarks(Object.fromEntries(all.map((s) => [s.id, "present" as const])))} disabled={!all.length}>
          <CheckCheck className="h-5 w-5" /> Mark all present
        </Button>
        <div className="ml-auto flex flex-wrap gap-3 text-sm font-semibold">
          <span className="text-success">P {counts.present}</span>
          <span className="text-destructive">A {counts.absent}</span>
          <span className="text-warning-foreground dark:text-warning">L {counts.late}</span>
          <span className="text-info">LV {counts.leave}</span>
          <span className="text-muted-foreground">Unmarked {counts.unmarked}</span>
        </div>
      </div>

      {students.error ? <ErrorState onRetry={() => students.refetch()} /> :
        students.isLoading || existing.isLoading || sections.isLoading ? <Card><TableSkeleton rows={8} /></Card> :
        !list.length ? <EmptyState icon={UserX} title="No students" description={search ? "No one matches that name." : "This section has no active students."} /> : (
        <ul className="space-y-2">
          {list.map((s) => (
            <li key={s.id}>
              <Card className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted font-bold">{s.roll_no}</span>
                  <p className="truncate font-semibold">{s.full_name}</p>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:w-[360px]" role="radiogroup" aria-label={`Attendance for ${s.full_name}`}>
                  {OPTIONS.map((o) => {
                    const on = marks[s.id] === o.value;
                    return (
                      <button key={o.value} type="button" role="radio" aria-checked={on}
                        onClick={() => setMarks((m) => ({ ...m, [s.id]: o.value }))}
                        className={cn("h-12 rounded-md border-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          on ? o.on : "border-border bg-card text-muted-foreground hover:bg-muted")}>
                        <span className="sm:hidden">{o.short}</span><span className="hidden sm:inline">{o.label}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <div className="sticky bottom-20 mt-6 lg:bottom-4">
        <Button size="lg" className="h-14 w-full text-base shadow-lg" disabled={!all.length || save.isPending} onClick={() => setConfirm(true)}>
          {save.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} Submit attendance
        </Button>
      </div>

      <ConfirmDialog open={confirm} onOpenChange={setConfirm} title="Submit attendance?" confirmLabel="Submit" onConfirm={submit}
        description={`${current?.class_name ?? ""} – ${current?.name ?? ""} · ${format(new Date(date), "d MMM yyyy")}`}>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p>Present: <b>{counts.present + counts.unmarked}</b>{counts.unmarked > 0 && <span className="text-muted-foreground"> ({counts.unmarked} unmarked)</span>}</p>
          <p>Absent: <b className="text-destructive">{counts.absent}</b></p>
          <p>Late: <b>{counts.late}</b></p>
          <p>Leave: <b>{counts.leave}</b></p>
        </div>
        {counts.absent > 0 && <p className="text-sm text-muted-foreground">Guardians of {counts.absent} absent students will get an SMS.</p>}
      </ConfirmDialog>
    </>
  );
}
