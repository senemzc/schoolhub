import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { roleHome } from "@/services/auth";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in · SchoolHub" },
      { name: "description", content: "Sign in to SchoolHub as admin, teacher, student or parent." },
      { property: "og:title", content: "Sign in · SchoolHub" },
      { property: "og:description", content: "Sign in to SchoolHub as admin, teacher, student or parent." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  role: z.enum(["admin", "teacher", "student", "parent"]),
});
type Form = z.infer<typeof schema>;

const demoEmails: Record<Role, string> = {
  admin: "admin@schoolhub.edu.np", teacher: "teacher@schoolhub.edu.np",
  student: "student@schoolhub.edu.np", parent: "parent@schoolhub.edu.np",
};

function LoginPage() {
  const { user, ready, login } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: demoEmails.admin, password: "demo1234", role: "admin" },
  });

  useEffect(() => {
    if (ready && user) navigate({ to: roleHome[user.role], replace: true });
  }, [ready, user, navigate]);

  const onSubmit = async (v: Form) => {
    setBusy(true);
    try {
      const u = await login(v);
      toast.success(`Welcome, ${u.full_name}`);
      navigate({ to: roleHome[u.role], replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><GraduationCap className="h-6 w-6" /></div>
          <span className="font-display text-xl font-bold text-sidebar-accent-foreground">SchoolHub</span>
        </div>
        <div>
          <h1 className="max-w-md text-4xl font-extrabold leading-tight text-sidebar-accent-foreground">Run your school from one place.</h1>
          <p className="mt-4 max-w-md text-lg">Attendance, SEE / NEB grading, fees and parent notices — built for Nepali schools, Grades 1–12.</p>
        </div>
        <p className="text-sm opacity-70">© 2026 SchoolHub</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-6 sm:p-8">
          <h2 className="text-2xl font-bold">Sign in</h2>
          <p className="mt-1 text-muted-foreground">Demo mode — pick a role to explore.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Role</legend>
              <Controller control={control} name="role" render={({ field }) => (
                <div className="grid grid-cols-2 gap-2" role="radiogroup">
                  {(["admin", "teacher", "student", "parent"] as const).map((r) => (
                    <button type="button" key={r} role="radio" aria-checked={field.value === r}
                      onClick={() => { field.onChange(r); setValue("email", demoEmails[r]); }}
                      className={cn("rounded-md border-2 px-3 py-3 font-semibold capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        field.value === r ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted")}>
                      {r}
                    </button>
                  ))}
                </div>
              )} />
            </fieldset>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" className="h-11" aria-invalid={!!errors.email} {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" className="h-11" aria-invalid={!!errors.password} {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="h-11 w-full text-base" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
