import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog, EmptyState, PageHeader, StatusBadge } from "@/components/common";
import { DataTable } from "@/components/DataTable";
import { StudentFormDialog } from "@/components/StudentFormDialog";
import { useClasses, useDeleteStudent, useSections, useStudents } from "@/hooks/use-school";
import type { StudentStatus, StudentWithClass } from "@/types";

export const Route = createFileRoute("/admin/students/")({
  head: () => ({
    meta: [
      { title: "Students · SchoolHub" },
      { name: "description", content: "Search, filter and manage enrolled students." },
      { property: "og:title", content: "Students · SchoolHub" },
      { property: "og:description", content: "Search, filter and manage enrolled students." },
    ],
  }),
  component: StudentsPage,
});

function StudentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("all");
  const [sectionId, setSectionId] = useState("all");
  const [status, setStatus] = useState<StudentStatus | "all">("active");
  const [editing, setEditing] = useState<StudentWithClass | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<StudentWithClass | null>(null);

  const classes = useClasses();
  const sections = useSections(classId === "all" ? undefined : classId);
  const q = useStudents({ search, class_id: classId === "all" ? undefined : classId, section_id: sectionId === "all" ? undefined : sectionId, status });
  const del = useDeleteStudent();

  const clear = () => { setSearch(""); setClassId("all"); setSectionId("all"); setStatus("all"); };

  return (
    <>
      <PageHeader title="Students" description={q.data ? `${q.data.length} students` : "Loading…"}
        actions={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> Add student</Button>} />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_180px_140px_160px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input aria-label="Search students" placeholder="Search name, guardian or phone" className="h-11 pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={classId} onValueChange={(v) => { setClassId(v); setSectionId("all"); }}>
          <SelectTrigger className="h-11" aria-label="Filter by class"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All classes</SelectItem>{classes.data?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={sectionId} onValueChange={setSectionId} disabled={classId === "all"}>
          <SelectTrigger className="h-11" aria-label="Filter by section"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All sections</SelectItem>{sections.data?.map((s) => <SelectItem key={s.id} value={s.id}>Section {s.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as StudentStatus | "all")}>
          <SelectTrigger className="h-11" aria-label="Filter by status"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="graduated">Graduated</SelectItem></SelectContent>
        </Select>
      </div>

      <DataTable
        rows={q.data}
        loading={q.isLoading}
        error={q.error}
        onRetry={() => q.refetch()}
        rowKey={(r) => r.id}
        onRowClick={(r) => navigate({ to: "/admin/students/$studentId", params: { studentId: r.id } })}
        empty={<EmptyState icon={UserX} title="No students found" description="Try changing the search or filters." action={<Button variant="outline" onClick={clear}>Clear filters</Button>} />}
        columns={[
          { header: "Roll", cell: (r) => r.roll_no, className: "w-14" },
          { header: "Name", cell: (r) => <span className="font-semibold">{r.full_name}</span> },
          { header: "Class", cell: (r) => `${r.class_name} – ${r.section_name}` },
          { header: "Guardian", cell: (r) => <div><p>{r.guardian_name}</p><p className="text-sm text-muted-foreground">{r.guardian_phone}</p></div>, className: "hidden md:table-cell" },
          { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          { header: "Actions", className: "w-24 text-right", cell: (r) => (
            <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" aria-label={`Edit ${r.full_name}`} onClick={() => { setEditing(r); setFormOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" aria-label={`Delete ${r.full_name}`} onClick={() => setToDelete(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ) },
        ]}
      />

      <StudentFormDialog open={formOpen} onOpenChange={setFormOpen} student={editing} />
      <ConfirmDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)} destructive confirmLabel="Delete"
        title={`Delete ${toDelete?.full_name}?`} description="This removes the student record. This cannot be undone."
        onConfirm={async () => { if (!toDelete) return; await del.mutateAsync(toDelete.id); toast.success("Student deleted"); setToDelete(null); }} />
    </>
  );
}
