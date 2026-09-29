"use client";

import React from "react";
import { LayoutGrid, List } from "lucide-react";
import { motion } from "framer-motion";
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
      aria-label="View mode toggle"
      className={cn(
        "relative inline-flex items-center p-1 rounded-[10px] bg-canvas border border-line/70 select-none shadow-xs",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={cn(
          "relative flex items-center justify-center gap-1.5 px-3 py-1 rounded-[7px] text-xs font-semibold transition-colors duration-150 touch-press",
          value === "grid" ? "text-ink font-bold" : "text-muted hover:text-ink"
        )}
        title="Grid view"
        aria-pressed={value === "grid"}
      >
        {value === "grid" && (
          <motion.span
            layoutId="activeViewTogglePill"
            className="absolute inset-0 rounded-[7px] bg-surface shadow-xs border border-line/60 z-0"
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
          />
        )}
        <LayoutGrid className="w-3.5 h-3.5 relative z-10" />
        <span className="relative z-10 text-[11px] sm:text-xs">Grid</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("list")}
        className={cn(
          "relative flex items-center justify-center gap-1.5 px-3 py-1 rounded-[7px] text-xs font-semibold transition-colors duration-150 touch-press",
          value === "list" ? "text-ink font-bold" : "text-muted hover:text-ink"
        )}
        title="List view"
        aria-pressed={value === "list"}
      >
        {value === "list" && (
          <motion.span
            layoutId="activeViewTogglePill"
            className="absolute inset-0 rounded-[7px] bg-surface shadow-xs border border-line/60 z-0"
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
          />
        )}
        <List className="w-3.5 h-3.5 relative z-10" />
        <span className="relative z-10 text-[11px] sm:text-xs">List</span>
      </button>
    </div>
  );
}
