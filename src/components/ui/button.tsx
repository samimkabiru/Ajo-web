"use client";

import React, { useEffect, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-all duration-100 disabled:opacity-50 disabled:pointer-events-none select-none touch-press relative min-h-[44px] min-w-[44px] cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white hover:bg-primary-dark active:bg-primary-dark shadow-sm border border-transparent",
        accent:
          "bg-accent text-white hover:brightness-95 active:brightness-90 shadow-sm border border-transparent",
        secondary:
          "bg-primary-tint text-primary hover:bg-primary-tint/80 active:bg-primary-tint/70 border border-transparent",
        outline:
          "border border-line bg-surface text-ink hover:bg-canvas active:bg-line/40 shadow-xs",
        ghost:
          "text-ink hover:bg-canvas active:bg-line/30 border border-transparent",
        danger:
          "bg-danger text-white hover:brightness-90 active:brightness-85 shadow-sm border border-transparent",
        subtleDanger:
          "bg-danger/10 text-danger hover:bg-danger/15 active:bg-danger/20 border border-transparent",
      },
      size: {
        sm: "h-9 px-3 text-xs rounded-[8px]",
        default: "h-11 px-5 text-sm rounded-[10px]",
        lg: "h-12 px-6 text-base rounded-[10px]",
        icon: "h-11 w-11 p-0 rounded-[10px]",
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
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
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
