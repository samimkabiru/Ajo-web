"use client";

import React, { useEffect, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/30 relative overflow-hidden",
  {
    variants: {
      variant: {
        /* ── Primary: indigo gradient ───────────────────────────────── */
        primary:
          // Light: rich indigo gradient with inset specular highlight
          "bg-gradient-to-b from-[#5B52F0] to-[#4338CA] text-white " +
          "shadow-[0_1px_2px_rgba(67,56,202,0.20),inset_0_1px_0_rgba(255,255,255,0.18)] " +
          "border border-[#3730A3] " +
          "hover:from-[#6560F5] hover:to-[#4F46E5] " +
          "active:from-[#3730A3] active:to-[#312E81] active:translate-y-[0.5px] " +
          // Dark: softer indigo, gentle glow — NOT blinding
          "dark:from-[#5B52F0] dark:to-[#4338CA] dark:border-indigo-700/60 " +
          "dark:shadow-[0_1px_2px_rgba(0,0,0,0.50),inset_0_1px_0_rgba(255,255,255,0.14),0_0_18px_rgba(129,140,248,0.22)] " +
          "dark:hover:from-[#6366F1] dark:hover:to-[#4F46E5] " +
          "dark:active:from-[#3730A3] dark:active:to-[#312E81]",

        /* ── Accent: warm amber ─────────────────────────────────────── */
        accent:
          "bg-gradient-to-b from-[#F59E0B] to-[#D97706] text-white " +
          "shadow-[0_1px_2px_rgba(0,0,0,0.10),inset_0_1px_0_rgba(255,255,255,0.22)] " +
          "border border-[#B45309] " +
          "hover:from-[#FBBF24] hover:to-[#F59E0B] " +
          "active:from-[#D97706] active:to-[#B45309] active:translate-y-[0.5px] " +
          "dark:shadow-[0_1px_2px_rgba(0,0,0,0.50),inset_0_1px_0_rgba(255,255,255,0.14),0_0_16px_rgba(251,191,36,0.20)]",

        /* ── Secondary: indigo tint ─────────────────────────────────── */
        secondary:
          "bg-primary-tint text-primary " +
          "border border-primary/15 shadow-xs " +
          "hover:bg-primary/8 active:bg-primary/12 active:translate-y-[0.5px] " +
          "dark:bg-indigo-500/12 dark:border-indigo-400/28 dark:text-indigo-300 " +
          "dark:hover:bg-indigo-500/18",

        /* ── Outline: neutral bordered ──────────────────────────────── */
        outline:
          "border border-line bg-surface text-ink " +
          "shadow-xs hover:bg-canvas hover:border-[#D1D5DB] " +
          "active:bg-line/30 active:translate-y-[0.5px] " +
          "dark:border-white/12 dark:bg-[#1E2330] dark:text-[#EDF0F4] " +
          "dark:hover:bg-[#242B3A] dark:hover:border-white/20",

        /* ── Ghost: no background ───────────────────────────────────── */
        ghost:
          "text-ink border border-transparent " +
          "hover:bg-[#F3F4F6] active:bg-[#E5E7EB] " +
          "dark:text-[#EDF0F4] dark:hover:bg-white/[0.06] dark:active:bg-white/10",

        /* ── Danger: red gradient ───────────────────────────────────── */
        danger:
          "bg-gradient-to-b from-[#EF4444] to-[#DC2626] text-white " +
          "shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.18)] " +
          "border border-[#B91C1C] " +
          "hover:from-[#F87171] hover:to-[#EF4444] " +
          "active:from-[#B91C1C] active:to-[#991B1B] active:translate-y-[0.5px] " +
          "dark:shadow-[0_1px_2px_rgba(0,0,0,0.50),inset_0_1px_0_rgba(255,255,255,0.12),0_0_16px_rgba(248,113,113,0.18)]",

        /* ── Subtle danger: red tint, no fill ──────────────────────── */
        subtleDanger:
          "bg-danger/8 text-danger border border-danger/15 shadow-xs " +
          "hover:bg-danger/14 active:bg-danger/20 " +
          "dark:bg-rose-500/14 dark:border-rose-400/28 dark:text-rose-300 " +
          "dark:hover:bg-rose-500/20",
      },

      size: {
        xs:      "h-7  px-2.5 text-[11px] rounded-[6px]  gap-1",
        sm:      "h-8  px-3   text-xs     rounded-[7px]  gap-1.5",
        default: "h-9  px-4   text-xs sm:text-sm rounded-[8px]  gap-2",
        lg:      "h-10.5 px-5 text-sm     rounded-[9px]  gap-2",
        icon:    "h-8  w-8    p-0         rounded-[7px]",
        iconSm:  "h-7  w-7    p-0         rounded-[6px]",
      },

      fullWidth: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, fullWidth, isLoading = false, loadingText, disabled, children, ...props },
    ref
  ) => {
    const [longLoading, setLongLoading] = useState(false);

    useEffect(() => {
      let timer: NodeJS.Timeout | null = null;
      if (isLoading) {
        timer = setTimeout(() => setLongLoading(true), 8000);
      } else {
        setLongLoading(false);
      }
      return () => { if (timer) clearTimeout(timer); };
    }, [isLoading]);

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            <span>{loadingText || (longLoading ? "Still working…" : "Processing…")}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
