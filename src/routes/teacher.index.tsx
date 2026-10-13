import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { CalendarCheck, ClipboardList, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, PageHeader } from "@/components/common";
import { useTeacherSections } from "@/hooks/use-school";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/teacher/")({
  head: () => ({
    meta: [
      { title: "Teacher Dashboard · SchoolHub" },
      { name: "description", content: "Today's classes and pending attendance." },
      { property: "og:title", content: "Teacher Dashboard · SchoolHub" },
      { property: "og:description", content: "Today's classes and pending attendance." },
    ],
  }),
  component: TeacherDashboard,
});

function TeacherDashboard() {
  const { user } = useAuth();
  const q = useTeacherSections(user?.staff_id);
  return (
    <>
      <PageHeader title={`Namaste, ${user?.full_name.split(" ")[0] ?? ""}`} description={format(new Date(), "EEEE, d MMMM yyyy")}
        actions={<>
          <Button asChild size="lg"><Link to="/teacher/attendance"><CalendarCheck className="h-5 w-5" /> Take attendance</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/teacher/gradebook"><ClipboardList className="h-5 w-5" /> Gradebook</Link></Button>
        </>} />
      <h2 className="mb-3 font-semibold">Today's classes</h2>
      {q.isLoading ? <Skeleton className="h-32 w-full" /> : !q.data?.length ? <EmptyState icon={School} title="No classes assigned" /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {q.data.map((s) => (
            <Card key={s.id} className="p-5">
              <p className="text-sm text-muted-foreground">{s.class_teacher_id === user?.staff_id ? "Class teacher" : "Subject teacher"}</p>
              <p className="font-display text-xl font-bold">{s.class_name} – {s.name}</p>
              <p className="text-muted-foreground">{s.student_count} students</p>
              <p className="mt-3 inline-flex rounded-full bg-warning/20 px-2.5 py-0.5 text-sm font-semibold text-warning-foreground dark:text-warning">Attendance pending</p>
              <Button asChild className="mt-4 w-full" variant="secondary">
                <Link to="/teacher/attendance" search={{ section: s.id }}>Mark attendance</Link>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
