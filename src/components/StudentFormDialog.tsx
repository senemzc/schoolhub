import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useClasses, useSaveStudent, useSections } from "@/hooks/use-school";
import type { Student } from "@/types";

const schema = z.object({
  full_name: z.string().trim().min(2, "Name is required").max(100),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  guardian_name: z.string().trim().min(2, "Guardian name is required").max(100),
  guardian_phone: z.string().trim().regex(/^\+977\s?9\d{9}$/, "Use format +977 98XXXXXXXX"),
  class_id: z.string().min(1, "Select a class"),
  section_id: z.string().min(1, "Select a section"),
  roll_no: z.coerce.number().int().min(1, "Roll no. must be 1 or more"),
  address: z.string().trim().min(2, "Address is required").max(200),
  admission_date: z.string().min(1, "Admission date is required"),
  status: z.enum(["active", "inactive", "graduated"]),
});
type FormValues = z.infer<typeof schema>;

const empty: FormValues = {
  full_name: "", dob: "", gender: "male", guardian_name: "", guardian_phone: "+977 ", class_id: "", section_id: "",
  roll_no: 1, address: "", admission_date: new Date().toISOString().slice(0, 10), status: "active",
};

export function StudentFormDialog({ open, onOpenChange, student }: { open: boolean; onOpenChange: (o: boolean) => void; student?: Student | null }) {
  const save = useSaveStudent();
  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema), defaultValues: empty,
  });
  const classId = watch("class_id");
  const classes = useClasses();
  const sections = useSections(classId || undefined);

  useEffect(() => {
    if (open) reset(student ? { ...student } : empty);
  }, [open, student, reset]);

  const onSubmit = async (v: FormValues) => {
    try {
      await save.mutateAsync({ id: student?.id, data: v });
      toast.success(student ? "Student updated" : "Student added");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    }
  };

  const err = (k: keyof FormValues) => errors[k] && <p className="text-sm text-destructive">{errors[k]?.message}</p>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{student ? "Edit student" : "Add student"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="full_name">Full name</Label><Input id="full_name" {...register("full_name")} />{err("full_name")}</div>
          <div className="space-y-1.5"><Label htmlFor="dob">Date of birth</Label><Input id="dob" type="date" {...register("dob")} />{err("dob")}</div>
          <div className="space-y-1.5"><Label>Gender</Label>
            <Controller control={control} name="gender" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}><SelectTrigger aria-label="Gender"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select>
            )} />
          </div>
          <div className="space-y-1.5"><Label htmlFor="guardian_name">Guardian name</Label><Input id="guardian_name" {...register("guardian_name")} />{err("guardian_name")}</div>
          <div className="space-y-1.5"><Label htmlFor="guardian_phone">Guardian phone</Label><Input id="guardian_phone" inputMode="tel" {...register("guardian_phone")} />{err("guardian_phone")}</div>
          <div className="space-y-1.5"><Label>Class</Label>
            <Controller control={control} name="class_id" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => { field.onChange(v); setValue("section_id", ""); }}>
                <SelectTrigger aria-label="Class"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>{classes.data?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
            )} />{err("class_id")}
          </div>
          <div className="space-y-1.5"><Label>Section</Label>
            <Controller control={control} name="section_id" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={!classId}>
                <SelectTrigger aria-label="Section"><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>{sections.data?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select>
            )} />{err("section_id")}
          </div>
          <div className="space-y-1.5"><Label htmlFor="roll_no">Roll no.</Label><Input id="roll_no" type="number" min={1} {...register("roll_no")} />{err("roll_no")}</div>
          <div className="space-y-1.5"><Label htmlFor="admission_date">Admission date</Label><Input id="admission_date" type="date" {...register("admission_date")} />{err("admission_date")}</div>
          <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="address">Address</Label><Textarea id="address" rows={2} {...register("address")} />{err("address")}</div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}{student ? "Save changes" : "Add student"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
