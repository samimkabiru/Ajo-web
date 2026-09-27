"use client";

import React from "react";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="View toggle"
      className={cn(
        "inline-flex items-center p-0.5 rounded-[9px] bg-canvas border border-line/80 shadow-xs",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={cn(
          "flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-[7px] text-xs font-semibold transition-all duration-120 touch-press",
          value === "grid"
            ? "bg-surface text-ink shadow-xs border border-line/40"
            : "text-muted hover:text-ink"
        )}
        title="Grid view"
        aria-pressed={value === "grid"}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Grid</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("list")}
        className={cn(
          "flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-[7px] text-xs font-semibold transition-all duration-120 touch-press",
          value === "list"
            ? "bg-surface text-ink shadow-xs border border-line/40"
            : "text-muted hover:text-ink"
        )}
        title="List view"
        aria-pressed={value === "list"}
      >
        <List className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">List</span>
      </button>
    </div>
  );
}
