import type { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/common";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T>({ columns, rows, rowKey, loading, error, onRetry, empty, onRowClick }: {
  columns: Column<T>[]; rows: T[] | undefined; rowKey: (r: T) => string; loading?: boolean;
  error?: Error | null; onRetry?: () => void; empty?: ReactNode; onRowClick?: (r: T) => void;
}) {
  if (error) return <ErrorState message={error.message} onRetry={onRetry} />;
  return (
    <Card className="overflow-hidden p-0">
      {loading ? <TableSkeleton /> : !rows?.length ? (
        <div className="p-4">{empty ?? <EmptyState title="Nothing here yet" />}</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {columns.map((c) => <TableHead key={c.header} className={c.className}>{c.header}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={rowKey(r)} className={onRowClick ? "cursor-pointer" : undefined} onClick={onRowClick ? () => onRowClick(r) : undefined}>
                  {columns.map((c) => <TableCell key={c.header} className={c.className}>{c.cell(r)}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
