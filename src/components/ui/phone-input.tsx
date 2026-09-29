"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";

export interface PhoneInputProps {
  id?: string;
  name?: string;
  label?: string;
  hint?: string;
  error?: string;
  value: string; // Can be E.164 (+234...) or raw digits
  onChange: (normalizedValue: string) => void;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  placeholder?: string;
  className?: string;
}

/**
 * Normalizes any typed/pasted Nigerian phone string into:
 * 1. nationalDigits: 10 digits without leading 0 or country code (e.g. "8012345678")
 * 2. e164: full international format with +234 (e.g. "+2348012345678")
 * 3. display: spaced for readability (e.g. "801 234 5678")
 */
export function normalizeNigerianPhone(input: string): {
  nationalDigits: string;
  e164: string;
  display: string;
} {
  // Strip all non-digit characters
  let digits = input.replace(/\D/g, "");

  // If user included country code "234", strip it
  if (digits.startsWith("234")) {
    digits = digits.slice(3);
  }

  // If user included leading trunk prefix "0" (e.g. 080... or 090...), strip it
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Nigerian national phone numbers are 10 digits after +234
  const nationalDigits = digits.slice(0, 10);
  const e164 = nationalDigits.length > 0 ? `+234${nationalDigits}` : "";

  // Visual grouping: 3 - 3 - 4 (e.g. 801 234 5678)
  let display = "";
  if (nationalDigits.length > 0) {
    display = nationalDigits.slice(0, 3);
    if (nationalDigits.length > 3) {
      display += " " + nationalDigits.slice(3, 6);
    }
    if (nationalDigits.length > 6) {
      display += " " + nationalDigits.slice(6, 10);
    }
  }

  return { nationalDigits, e164, display };
}

export function PhoneInput({
  id,
  name,
  label = "Phone Number",
  hint,
  error,
  value,
  onChange,
  required,
  disabled,
  autoComplete = "tel",
  placeholder = "801 234 5678",
  className,
}: PhoneInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const { display } = normalizeNigerianPhone(value || "");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const { e164 } = normalizeNigerianPhone(rawVal);
    onChange(e164);
  };

  return (
    <div className={cn("w-full space-y-1 text-left", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-ink/85 dark:text-slate-200 tracking-tight select-none mb-1.5"
        >
          {label}
        </label>
      )}

      <div
        className={cn(
          "group relative flex items-center h-11 w-full rounded-[10px] border bg-surface transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
          // Dark: recessed well matching Input component
          "dark:bg-[#0C0F14] dark:border-white/[0.09] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.50)]",
          // Focus: indigo ring
          "focus-within:ring-2 focus-within:ring-indigo-500/25 focus-within:border-indigo-500",
          "dark:focus-within:ring-indigo-400/20 dark:focus-within:border-indigo-400/70",
          error
            ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-500/20 dark:border-rose-400/50"
            : "border-[#E5E7EB] hover:border-[#9CA3AF] dark:hover:border-white/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {/* Seamless Country Badge */}
        <div className="flex items-center pl-3.5 pr-2 gap-1.5 shrink-0 select-none">
          <svg
            className="w-4 h-2.5 rounded-[2px] overflow-hidden shrink-0 border border-black/10 dark:border-white/10"
            viewBox="0 0 600 400"
            aria-hidden="true"
          >
            <rect width="200" height="400" fill="#008751" />
            <rect x="200" width="200" height="400" fill="#FFFFFF" />
            <rect x="400" width="200" height="400" fill="#008751" />
          </svg>
          <span className="text-xs font-semibold text-ink/80 dark:text-slate-200 tabular-nums">
            +234
          </span>
          <span className="w-[1px] h-3.5 bg-line/80 dark:bg-white/10 ml-1.5" />
        </div>

        {/* Number Input */}
        <input
          id={inputId}
          name={name}
          type="tel"
          value={display}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className="flex-1 h-full bg-transparent px-2.5 py-2 text-sm text-ink placeholder:text-muted/40 font-medium tabular-nums focus:outline-none disabled:cursor-not-allowed"
        />
      </div>

      {hint && !error && <p className="text-[11px] text-muted">{hint}</p>}
      {error && <p className="text-[11px] font-semibold text-danger">{error}</p>}
    </div>
  );
}
