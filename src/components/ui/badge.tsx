import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { CycleStatus, RoundStatus } from "@/lib/api/types";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide uppercase transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#F3F4F6] text-[#374151] dark:bg-white/10 dark:text-white/70",

        primary:
          "bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold " +
          "dark:bg-indigo-500/18 dark:text-indigo-300 dark:border-indigo-400/35",

        positive:
          "bg-green-50 text-green-700 border border-green-200 " +
          "dark:bg-green-400/15 dark:text-green-300 dark:border-green-400/32",

        warning:
          "bg-amber-50 text-amber-700 border border-amber-200 " +
          "dark:bg-amber-400/15 dark:text-amber-300 dark:border-amber-400/32",

        danger:
          "bg-red-50 text-red-700 border border-red-200 " +
          "dark:bg-rose-400/15 dark:text-rose-300 dark:border-rose-400/32",

        accent:
          "bg-amber-50 text-amber-700 border border-amber-200 " +
          "dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/32",

        neutral:
          "bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB] " +
          "dark:bg-white/[0.06] dark:border-white/12 dark:text-white/50",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function CycleStatusBadge({ status }: { status: CycleStatus }) {
  switch (status) {
    case "OPEN":
      return (
        <Badge variant="accent" className="font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
          Open
        </Badge>
      );
    case "PAID":
      return (
        <Badge variant="positive">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400" />
          Paid ✓
        </Badge>
      );
    case "SCHEDULED":
      return (
        <Badge variant="neutral">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-white/40" />
          Scheduled
        </Badge>
      );
    case "VACANT":
      return (
        <Badge variant="danger">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-rose-400" />
          Vacant
        </Badge>
      );
    case "SETTLED":
      return (
        <Badge variant="primary">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
          Settled
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}

export function RoundStatusBadge({ status }: { status: RoundStatus }) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="positive">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400" />
          Active
        </Badge>
      );
    case "FORMING":
      return (
        <Badge variant="accent">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
          Forming
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge variant="primary">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
          Completed
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="danger">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-rose-400" />
          Cancelled
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}
