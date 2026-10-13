import { format, parseISO } from "date-fns";

export function formatNPR(amount: number): string {
  return `Rs. ${Math.round(amount).toLocaleString("en-IN")}`;
}

export function formatDate(iso: string, pattern = "d MMM yyyy"): string {
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return iso;
  }
}

/**
 * Placeholder for Bikram Sambat conversion. Dates are shown in AD for now;
 * plug a BS converter in here later and every caller picks it up.
 */
export function toBS(iso: string): string {
  return formatDate(iso);
}

export function useDateDisplay() {
  return { format: formatDate, toBS };
}
