import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, type LinkProps } from "@tanstack/react-router";
import {
  BarChart3, Bell, BookOpen, CalendarCheck, ClipboardList, GraduationCap, LayoutDashboard, LogOut,
  Menu, Moon, Receipt, School, Settings2, Sun, Users, UserSquare2, Wallet, type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

interface NavItem { to: NonNullable<LinkProps["to"]>; label: string; icon: LucideIcon; mobile?: boolean }

export const NAV: Record<Role, NavItem[]> = {
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, mobile: true },
    { to: "/admin/students", label: "Students", icon: GraduationCap, mobile: true },
    { to: "/admin/staff", label: "Staff", icon: Users },
    { to: "/admin/classes", label: "Classes", icon: School },
    { to: "/admin/fees", label: "Fees", icon: Wallet, mobile: true },
    { to: "/admin/fee-structure", label: "Fee Structure", icon: Settings2 },
    { to: "/admin/reports", label: "Reports", icon: BarChart3 },
    { to: "/admin/notices", label: "Notices", icon: Bell, mobile: true },
  ],
  teacher: [
    { to: "/teacher", label: "Dashboard", icon: LayoutDashboard, mobile: true },
    { to: "/teacher/my-classes", label: "My Classes", icon: School, mobile: true },
    { to: "/teacher/attendance", label: "Attendance", icon: CalendarCheck, mobile: true },
    { to: "/teacher/gradebook", label: "Gradebook", icon: ClipboardList, mobile: true },
    { to: "/teacher/notices", label: "Notices", icon: Bell },
  ],
  student: [
    { to: "/student", label: "Dashboard", icon: LayoutDashboard, mobile: true },
    { to: "/student/attendance", label: "Attendance", icon: CalendarCheck, mobile: true },
    { to: "/student/results", label: "Results", icon: BookOpen, mobile: true },
    { to: "/student/fees", label: "Fees", icon: Receipt, mobile: true },
    { to: "/student/notices", label: "Notices", icon: Bell },
  ],
  parent: [
    { to: "/parent", label: "Dashboard", icon: LayoutDashboard, mobile: true },
    { to: "/parent/children", label: "Children", icon: UserSquare2 },
    { to: "/parent/attendance", label: "Attendance", icon: CalendarCheck, mobile: true },
    { to: "/parent/results", label: "Results", icon: BookOpen, mobile: true },
    { to: "/parent/fees", label: "Fees", icon: Receipt, mobile: true },
    { to: "/parent/notices", label: "Notices", icon: Bell },
  ],
};

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(localStorage.getItem("schoolhub.theme") === "dark"), []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("schoolhub.theme", dark ? "dark" : "light");
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

function NavLinks({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV[role].map((n) => (
        <Link
          key={n.to}
          to={n.to}
          activeOptions={{ exact: n.to === `/${role}` }}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-primary"
        >
          <n.icon className="h-5 w-5" aria-hidden />
          {n.label}
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-3 py-1">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <GraduationCap className="h-5 w-5" aria-hidden />
      </div>
      <span className="font-display text-lg font-bold text-sidebar-accent-foreground">SchoolHub</span>
    </div>
  );
}

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await logout();
    navigate({ to: "/login", replace: true });
  };

  const sidebar = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col gap-6 bg-sidebar p-4">
      <Brand />
      <NavLinks role={role} onNavigate={onNavigate} />
      <div className="mt-auto border-t border-sidebar-border pt-4">
        <p className="truncate px-3 font-semibold text-sidebar-accent-foreground">{user?.full_name}</p>
        <p className="px-3 text-sm capitalize text-sidebar-foreground/70">{role}</p>
        <button onClick={signOut} className="mt-3 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sidebar-foreground/80 hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          <LogOut className="h-5 w-5" aria-hidden /> Sign out
        </button>
      </div>
    </div>
  );

  const mobileItems = NAV[role].filter((n) => n.mobile).slice(0, 4);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="no-print sticky top-0 hidden h-screen lg:block">{sidebar()}</aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 border-0 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {sidebar(() => setOpen(false))}
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-col">
        <header className="no-print sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </Button>
          <span className="font-display font-bold lg:hidden">SchoolHub</span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </header>
        <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">{children}</main>
        <nav aria-label="Quick" className="no-print fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t bg-card lg:hidden">
          {mobileItems.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === `/${role}` }}
              className={cn("flex flex-col items-center gap-1 py-2.5 text-xs font-semibold text-muted-foreground data-[status=active]:text-primary")}>
              <n.icon className="h-6 w-6" aria-hidden />
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
