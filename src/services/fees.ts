import { format, parseISO, subMonths } from "date-fns";
import { delay, feeHeads, invoices, payments, students, uid } from "./_db";
import type { FeeHead, FeeInvoice, InvoiceStatus, Payment, PaymentMethod } from "@/types";

export function invoiceStatus(inv: FeeInvoice): InvoiceStatus {
  if (inv.paid >= inv.total_due) return "paid";
  if (parseISO(inv.due_date) < new Date()) return "overdue";
  return "partial";
}

export async function getFeeSummary(): Promise<{ collected: number; outstanding: number }> {
  await delay();
  const collected = invoices.reduce((a, i) => a + i.paid, 0);
  const total = invoices.reduce((a, i) => a + i.total_due, 0);
  return { collected, outstanding: total - collected };
}

export async function getMonthlyCollection(months = 6): Promise<{ month: string; amount: number }[]> {
  await delay();
  return Array.from({ length: months }, (_, i) => {
    const m = subMonths(new Date(), months - 1 - i);
    const key = format(m, "yyyy-MM");
    return { month: format(m, "MMM"), amount: payments.filter((p) => p.date.startsWith(key)).reduce((a, p) => a + p.amount, 0) };
  });
}

export async function getStudentInvoices(studentId: string): Promise<(FeeInvoice & { status: InvoiceStatus })[]> {
  await delay();
  return invoices.filter((i) => i.student_id === studentId).map((i) => ({ ...i, status: invoiceStatus(i) }));
}

export async function getStudentPayments(studentId: string): Promise<Payment[]> {
  await delay();
  return payments.filter((p) => p.student_id === studentId).sort((a, b) => b.date.localeCompare(a.date));
}

export async function getFeeHeads(classId?: string): Promise<FeeHead[]> {
  await delay();
  return feeHeads.filter((f) => !classId || f.class_id === classId);
}

export interface RecordPaymentPayload { invoice_id: string; amount: number; date: string; method: PaymentMethod; receipt_no: string }

export async function recordPayment(p: RecordPaymentPayload): Promise<Payment> {
  await delay();
  const inv = invoices.find((i) => i.id === p.invoice_id);
  if (!inv) throw new Error("Invoice not found");
  inv.paid += p.amount;
  const pay = { ...p, id: uid(), student_id: inv.student_id };
  payments.push(pay);
  return pay;
}

export async function sendSms(payload: { phones: string[]; message: string }): Promise<{ queued: number }> {
  await delay();
  void students;
  return { queued: payload.phones.length };
}
