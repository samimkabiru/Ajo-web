"use client";

import React, { useEffect, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/25 relative",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-[#135E48] to-[#0E4F3C] text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.16)] hover:from-[#166B52] hover:to-[#105642] active:from-[#0B3E2F] active:to-[#083025] active:translate-y-[0.5px] border border-[#0B3D2F]",
        accent:
          "bg-gradient-to-b from-[#E29334] to-[#D98A2B] text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.22)] hover:from-[#EA9B3C] hover:to-[#DF8F2F] active:from-[#C57A21] active:to-[#B66F1C] active:translate-y-[0.5px] border border-[#BF751F]",
        secondary:
          "bg-primary-tint text-primary hover:bg-primary-tint/80 active:bg-primary-tint/60 border border-primary/15 shadow-2xs active:translate-y-[0.5px]",
        outline:
          "border border-line bg-surface text-ink hover:bg-canvas hover:border-muted/30 active:bg-line/30 shadow-2xs active:translate-y-[0.5px]",
        ghost:
          "text-ink hover:bg-canvas active:bg-line/20 border border-transparent",
        danger:
          "bg-gradient-to-b from-[#C42E25] to-[#B3261E] text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.18)] hover:from-[#CE342B] hover:to-[#BC2820] active:from-[#9E2019] active:to-[#8E1B15] active:translate-y-[0.5px] border border-[#9A1E17]",
        subtleDanger:
          "bg-danger/8 text-danger hover:bg-danger/15 active:bg-danger/20 border border-danger/15 shadow-2xs",
      },
      size: {
        xs: "h-7 px-2.5 text-[11px] rounded-[6px] gap-1",
        sm: "h-8 px-3 text-xs rounded-[7px] gap-1.5",
        default: "h-9 px-4 text-xs sm:text-sm rounded-[8px] gap-2",
        lg: "h-10.5 px-5 text-sm rounded-[9px] gap-2",
        icon: "h-8 w-8 p-0 rounded-[7px]",
        iconSm: "h-7 w-7 p-0 rounded-[6px]",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
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
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      loadingText,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const [longLoading, setLongLoading] = useState(false);

    useEffect(() => {
      let timer: NodeJS.Timeout | null = null;
      if (isLoading) {
        timer = setTimeout(() => {
          setLongLoading(true);
        }, 8000);
      } else {
        setLongLoading(false);
      }
      return () => {
        if (timer) clearTimeout(timer);
      };
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
            <span>
              {loadingText || (longLoading ? "Still working..." : "Processing...")}
            </span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
