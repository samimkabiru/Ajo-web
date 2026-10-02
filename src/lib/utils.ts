import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes Nigerian phone numbers loosely for UI presentation
 */
export function formatPhone(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\s+/g, "");
  return cleaned;
}

/**
 * Formats phone numbers with dashes between each 3 digits (e.g. 080-123-456-78 or +234-801-234-567-8)
 */
export function formatPhoneWithDashes(phone?: string | null): string {
  if (!phone) return "";
  const trimmed = phone.trim();
  if (!trimmed) return "";
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return trimmed;

  const chunks = digits.match(/.{1,3}/g) || [];
  const dashed = chunks.join("-");
  return hasPlus ? `+${dashed}` : dashed;
}

/**
 * Checks whether the current date has reached or passed the scheduled payout/due date (start-of-day comparison).
 * Returns true if no date is provided or date is invalid (to avoid blocking when date isn't set).
 */
export function isPayoutDateReached(payoutOn?: string | null, now: Date = new Date()): boolean {
  if (!payoutOn) return true;
  const trimmed = payoutOn.trim();
  if (!trimmed) return true;

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-").map(Number);
    const targetStart = new Date(y, m - 1, d).getTime();
    return todayStart >= targetStart;
  }

  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return true;
  const targetStart = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();
  return todayStart >= targetStart;
}

/**
 * Formats a date string nicely for UI display (e.g. "Oct 15, 2026").
 */
export function formatDisplayDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const trimmed = dateStr.trim();
  if (!trimmed) return "—";

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return trimmed;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats an ISO date/timestamp into a friendly relative time (e.g. "just now", "5m ago", "2h ago", "3 days ago").
 */
export function formatRelativeTime(dateStr?: string | null, now: Date = new Date()): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSecs < 60) return "just now";
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
