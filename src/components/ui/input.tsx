import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
  /** Optional leading icon element (e.g. <Mail className="w-4 h-4" />) */
  leadingIcon?: React.ReactNode;
  /** Optional trailing slot — used for password toggle etc */
  trailingSlot?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, hint, id, leadingIcon, trailingSlot, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-ink/85 dark:text-slate-200 tracking-tight select-none mb-1.5"
          >
            {label}
          </label>
        )}

        {/* Input wrapper — handles icon slots and ring */}
        <div
          className={cn(
            // Base — slightly taller than default for fintech feel
            "group relative flex items-center h-11 w-full rounded-[10px] border bg-surface transition-all duration-150",
            "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
            // Dark — deeply recessed well
            "dark:bg-[#0C0F14] dark:border-white/[0.09] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.50)]",
            // Focus ring — indigo
            "focus-within:ring-2 focus-within:ring-indigo-500/25 focus-within:border-indigo-500",
            "dark:focus-within:ring-indigo-400/20 dark:focus-within:border-indigo-400/70",
            // Hover
            "hover:border-[#9CA3AF] dark:hover:border-white/20",
            // Error state
            error
              ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-500/20 " +
                "dark:border-rose-400/50 dark:focus-within:ring-rose-400/20"
              : "border-[#E5E7EB]",
          )}
        >
          {/* Leading icon — distinct and clear out of focus, illuminates on focus */}
          {leadingIcon && (
            <span className="pl-3.5 pr-2 shrink-0 text-slate-400 dark:text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors duration-150 flex items-center justify-center">
              {leadingIcon}
            </span>
          )}

          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "flex-1 h-full bg-transparent px-3 py-2 text-sm text-ink",
              "placeholder:text-muted/40 dark:placeholder:text-white/25",
              "focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              leadingIcon && "pl-0.5",
              trailingSlot && "pr-1",
              className
            )}
            {...props}
          />

          {/* Trailing slot (password toggle, clear button, etc.) */}
          {trailingSlot && (
            <span className="pr-3 pl-1.5 shrink-0 flex items-center justify-center text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              {trailingSlot}
            </span>
          )}
        </div>

        {hint && !error && (
          <p className="text-[11px] text-muted leading-relaxed">{hint}</p>
        )}
        {error && (
          <p className="text-[11px] font-semibold text-danger flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-danger inline-block" />
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
