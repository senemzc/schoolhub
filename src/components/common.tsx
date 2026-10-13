import type { ReactNode } from "react";
import { AlertTriangle, Inbox, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const tones = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/15 text-accent",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground dark:text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatCard({ label, value, hint, icon: Icon, tone = "primary", loading }: {
  label: string; value: ReactNode; hint?: ReactNode; icon: LucideIcon; tone?: keyof typeof tones; loading?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {loading ? <Skeleton className="mt-2 h-8 w-24" /> : <p className="mt-1 font-display text-2xl font-bold sm:text-3xl">{value}</p>}
          {hint && !loading && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("rounded-lg p-2.5", tones[tone])}><Icon className="h-5 w-5" aria-hidden /></div>
      </div>
    </Card>
  );
}

export function EmptyState({ title, description, icon: Icon = Inbox, action }: { title: string; description?: string; icon?: LucideIcon; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
      <Icon className="h-10 w-10 text-muted-foreground" aria-hidden />
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-lg border border-destructive/40 bg-destructive/5 p-8 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden />
      <p className="mt-2 font-semibold">Something went wrong</p>
      <p className="text-sm text-muted-foreground">{message ?? "Could not load data."}</p>
      {onRetry && <Button variant="outline" className="mt-4" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}
    </div>
  );
}

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Confirm", destructive, onConfirm, children }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; confirmLabel?: string;
  destructive?: boolean; onConfirm: () => void; children?: ReactNode;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={cn(destructive && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const statusStyles: Record<string, string> = {
  present: "bg-success/15 text-success", paid: "bg-success/15 text-success", active: "bg-success/15 text-success", sent: "bg-success/15 text-success",
  absent: "bg-destructive/10 text-destructive", overdue: "bg-destructive/10 text-destructive", failed: "bg-destructive/10 text-destructive",
  late: "bg-warning/20 text-warning-foreground dark:text-warning", partial: "bg-warning/20 text-warning-foreground dark:text-warning", queued: "bg-warning/20 text-warning-foreground dark:text-warning",
  leave: "bg-info/15 text-info", inactive: "bg-muted text-muted-foreground", graduated: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold capitalize", statusStyles[status] ?? "bg-muted")}>
      {status}
    </span>
  );
}

export function ComingSoon({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState title="Coming next" description="This page is part of the next build step." />
    </>
  );
}
