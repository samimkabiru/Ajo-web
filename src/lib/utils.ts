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
