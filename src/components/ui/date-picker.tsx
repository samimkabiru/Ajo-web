"use client";

import * as React from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  disabled,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const formattedDisplay = React.useMemo(() => {
    if (!value) return null;
    const parts = value.split("-");
    if (parts.length !== 3) return value;
    const [year, month, day] = parts;
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn("relative flex items-center w-full", className)}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-[9px] border border-line bg-surface px-3 py-2 text-sm transition-all duration-120 touch-press text-left",
              "hover:border-ink/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              disabled && "cursor-not-allowed opacity-50",
              !value && "text-muted",
              open && "border-primary ring-2 ring-primary/20"
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <CalendarIcon className="w-4 h-4 text-muted flex-shrink-0" />
              <span className={cn("truncate font-medium", !value ? "text-muted" : "text-ink")}>
                {formattedDisplay || placeholder}
              </span>
            </span>
            {value && (
              <span className="text-[11px] font-mono text-muted/80 ml-2">
                {value}
              </span>
            )}
          </button>
        </PopoverTrigger>

        {value && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="absolute right-2.5 p-1 rounded-full text-muted hover:text-ink hover:bg-canvas transition-colors touch-press"
            title="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <PopoverContent className="w-auto p-0 border-line shadow-elevation" align="start">
        <Calendar
          selectedDate={value}
          onSelectDate={(date) => {
            onChange(date);
            setOpen(false);
          }}
          minDate={minDate}
        />
      </PopoverContent>
    </Popover>
  );
}
