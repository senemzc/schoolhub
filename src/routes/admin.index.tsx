import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bell, CalendarCheck, GraduationCap, Plus, Users, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, PageHeader, StatCard } from "@/components/common";
import { useAttendanceTrend, useFeeSummary, useMonthlyCollection, useNotices, useStaffCount, useStudents, useTodayAttendance } from "@/hooks/use-school";
import { formatDate, formatNPR } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard · SchoolHub" },
      { name: "description", content: "School-wide attendance, fees and notices at a glance." },
      { property: "og:title", content: "Admin Dashboard · SchoolHub" },
      { property: "og:description", content: "School-wide attendance, fees and notices at a glance." },
    ],
  }),
  component: AdminDashboard,
});

const tooltipStyle = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--popover-foreground)" };

function AdminDashboard() {
  const students = useStudents({ status: "active" });
  const staff = useStaffCount();
  const today = useTodayAttendance();
  const fees = useFeeSummary();
  const trend = useAttendanceTrend();
  const monthly = useMonthlyCollection();
  const notices = useNotices(4);

  return (
    <>
      <PageHeader title="Dashboard" description={formatDate(new Date().toISOString(), "EEEE, d MMMM yyyy")}
        actions={<>
          <Button asChild><Link to="/admin/students"><Plus className="h-4 w-4" /> Add student</Link></Button>
          <Button asChild variant="outline"><Link to="/admin/fees"><Wallet className="h-4 w-4" /> Record payment</Link></Button>
          <Button asChild variant="outline"><Link to="/admin/notices"><Bell className="h-4 w-4" /> New notice</Link></Button>
        </>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total students" value={students.data?.length ?? 0} icon={GraduationCap} loading={students.isLoading} />
        <StatCard label="Total staff" value={staff.data ?? 0} icon={Users} tone="accent" loading={staff.isLoading} />
        <StatCard label="Attendance (latest day)" value={`${today.data ?? 0}%`} icon={CalendarCheck} tone={(today.data ?? 0) >= 85 ? "success" : "warning"} loading={today.isLoading} />
        <StatCard label="Fees collected" value={formatNPR(fees.data?.collected ?? 0)} hint={<span className="text-destructive">{formatNPR(fees.data?.outstanding ?? 0)} outstanding</span>} icon={Wallet} tone="success" loading={fees.isLoading} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold">Attendance trend — last 30 days</h2>
          <div className="mt-4 h-64">
            {trend.isLoading ? <Skeleton className="h-full w-full" /> : trend.error ? <ErrorState onRetry={() => trend.refetch()} /> : (
              <ResponsiveContainer>
                <AreaChart data={trend.data}>
                  <defs><linearGradient id="att" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(d) => formatDate(d, "d MMM")} stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis domain={[60, 100]} stroke="var(--muted-foreground)" fontSize={12} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={(d) => formatDate(String(d))} formatter={(v) => [`${v}%`, "Present"]} />
                  <Area type="monotone" dataKey="percent" stroke="var(--chart-2)" strokeWidth={2.5} fill="url(#att)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Fee collection — monthly</h2>
          <div className="mt-4 h-64">
            {monthly.isLoading ? <Skeleton className="h-full w-full" /> : monthly.error ? <ErrorState onRetry={() => monthly.refetch()} /> : (
              <ResponsiveContainer>
                <BarChart data={monthly.data}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} formatter={(v) => [formatNPR(Number(v)), "Collected"]} />
                  <Bar dataKey="amount" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent notices</h2>
          <Link to="/admin/notices" className="text-sm font-semibold text-primary hover:underline">View all</Link>
        </div>
        <div className="mt-3 divide-y">
          {notices.isLoading ? <Skeleton className="h-24 w-full" /> : !notices.data?.length ? <EmptyState title="No notices yet" /> :
            notices.data.map((n) => (
              <div key={n.id} className="py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold">{n.title}</p>
                  <span className="shrink-0 text-sm text-muted-foreground">{formatDate(n.created_at)}</span>
                </div>
                <p className="line-clamp-1 text-muted-foreground">{n.message}</p>
              </div>
            ))}
        </div>
      </Card>
    </>
  );
}
