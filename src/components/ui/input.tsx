import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, hint, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] font-bold uppercase tracking-wider text-muted select-none"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "flex w-full h-10 rounded-[8px] border border-line bg-surface px-3 py-2 text-xs sm:text-sm text-ink placeholder:text-muted/50 transition-all duration-150 shadow-2xs",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-canvas",
            error && "border-danger focus:border-danger focus:ring-danger/20",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-[11px] text-muted">{hint}</p>}
        {error && <p className="text-[11px] font-semibold text-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
