/**
 * Money utilities for Ajo.
 *
 * NON-NEGOTIABLE SPECIFICATION RULES:
 * 1. Every amount in the API is an integer number of kobo (64-bit integer).
 * 2. Never use floating-point arithmetic on money (no parseFloat, no Math.round(x * 100)).
 * 3. Tabular figures font-variant-numeric: tabular-nums everywhere.
 * 4. Signed values need words, never minus signs (-₦20,000 is forbidden).
 * 5. Pool balance is negative on the ledger because it's a liability, but displayed positive to users.
 */

/**
 * Parses user input in Naira into integer kobo without floating-point math.
 * Handles commas, currency symbols, and fractional values accurately.
 * E.g. "10,000" -> 1000000, "10000.50" -> 1000050, "10000.5" -> 1000050.
 */
export function parseNairaToKobo(input: string | number): number {
  if (typeof input === "number") {
    // If an integer was already passed in
    if (!Number.isFinite(input)) return 0;
    input = Math.floor(input).toString();
  }

  if (!input || typeof input !== "string") {
    return 0;
  }

  // Remove currency symbol, spaces, commas
  const cleaned = input.trim().replace(/[₦, ]/g, "");
  if (!cleaned) return 0;

  const parts = cleaned.split(".");
  const wholePartRaw = parts[0].replace(/\D/g, "");
  const wholePart = wholePartRaw === "" ? "0" : wholePartRaw;

  let koboPart = "00";
  if (parts.length > 1) {
    const fractionRaw = parts[1].replace(/\D/g, "");
    if (fractionRaw.length === 1) {
      koboPart = fractionRaw + "0";
    } else if (fractionRaw.length >= 2) {
      koboPart = fractionRaw.slice(0, 2);
    }
  }

  try {
    const totalBigInt = BigInt(wholePart) * BigInt(100) + BigInt(koboPart);
    return Number(totalBigInt);
  } catch {
    return 0;
  }
}

/**
 * Formats an integer kobo value into Nigerian Naira string.
 * Show kobo only when non-zero.
 * 1000000 -> "₦10,000"
 * 1000050 -> "₦10,000.50"
 */
export function formatKobo(kobo: number | bigint | null | undefined): string {
  if (kobo === null || kobo === undefined) {
    return "₦0";
  }

  const koboBigInt = typeof kobo === "bigint" ? kobo : BigInt(Math.round(Number(kobo)));
  const zeroBigInt = BigInt(0);
  const hundredBigInt = BigInt(100);
  const isNegative = koboBigInt < zeroBigInt;
  const absKobo = isNegative ? -koboBigInt : koboBigInt;

  const nairaBigInt = absKobo / hundredBigInt;
  const remKobo = absKobo % hundredBigInt;

  // Format naira part with commas
  const nairaStr = nairaBigInt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (remKobo === zeroBigInt) {
    return `₦${nairaStr}`;
  }

  const koboStr = remKobo.toString().padStart(2, "0");
  return `₦${nairaStr}.${koboStr}`;
}

export type ExposureStatus = "owes" | "owed" | "square";

export interface SignedKoboResult {
  text: string;
  status: ExposureStatus;
  amountFormatted: string;
  amountKobo: number;
}

export type ExposureInput =
  | number
  | bigint
  | null
  | undefined
  | {
      exposureKobo?: number | bigint | null;
      owesGroup?: boolean;
      owedByGroup?: boolean;
    };

/**
 * Formats exposure value as human words, NEVER with a minus sign.
 * Uses explicit API flags `owesGroup` and `owedByGroup` whenever available
 * so the rendering never depends solely on the sign of exposureKobo.
 *
 * - owedByGroup = true: "The group owes you ₦..."
 * - owesGroup = true: "You owe the group ₦..."
 * - Neither / zero: "All square"
 */
export function formatSignedKobo(
  exposure: ExposureInput,
  options?: {
    subject?: "you" | "member";
    memberName?: string;
    owesGroup?: boolean;
    owedByGroup?: boolean;
  }
): SignedKoboResult {
  let amount = 0;
  let owesGroup: boolean | undefined = options?.owesGroup;
  let owedByGroup: boolean | undefined = options?.owedByGroup;

  if (exposure !== null && typeof exposure === "object") {
    amount = Number(exposure.exposureKobo || 0);
    if (owesGroup === undefined) owesGroup = exposure.owesGroup;
    if (owedByGroup === undefined) owedByGroup = exposure.owedByGroup;
  } else {
    amount = Number(exposure || 0);
  }

  const subject = options?.subject || "you";
  const memberName = options?.memberName || "This member";

  // Check if all square based on explicit API flags if present, or amount === 0
  const isSquare =
    owesGroup !== undefined && owedByGroup !== undefined
      ? !owesGroup && !owedByGroup
      : amount === 0;

  if (isSquare || (amount === 0 && !owesGroup && !owedByGroup)) {
    return {
      text: "All square",
      status: "square",
      amountFormatted: "₦0",
      amountKobo: 0,
    };
  }

  const absAmount = Math.abs(amount);
  const formatted = formatKobo(absAmount);

  // Direction strictly determined by API's owedByGroup / owesGroup flags
  const isOwed = owedByGroup !== undefined ? owedByGroup : amount < 0;

  if (isOwed) {
    // Group owes member
    const text =
      subject === "you"
        ? `The group owes you ${formatted}`
        : `The group owes ${memberName} ${formatted}`;

    return {
      text,
      status: "owed",
      amountFormatted: formatted,
      amountKobo: absAmount,
    };
  } else {
    // Member owes group
    const text =
      subject === "you"
        ? `You owe the group ${formatted}`
        : `${memberName} owes the group ${formatted}`;

    return {
      text,
      status: "owes",
      amountFormatted: formatted,
      amountKobo: absAmount,
    };
  }
}

/**
 * Formats pool balance for display.
 * Pool balance in ledger is negative while holding money (liability).
 * Always display to user as a positive amount.
 */
export function formatPoolBalance(balanceKobo: number | bigint | null | undefined): string {
  if (balanceKobo === null || balanceKobo === undefined) return "₦0 in the pot";
  const num = Number(balanceKobo);
  const positiveKobo = Math.abs(num);
  return `${formatKobo(positiveKobo)} in the pot`;
}
