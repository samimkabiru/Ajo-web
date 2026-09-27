import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { CycleStatus, RoundStatus } from "@/lib/api/types";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide uppercase transition-colors select-none",
  {
    variants: {
      variant: {
        default: "bg-line/70 text-ink",
        primary: "bg-primary-tint text-primary font-semibold",
        positive: "bg-positive/10 text-positive border border-positive/20",
        warning: "bg-warning/10 text-warning border border-warning/20",
        danger: "bg-danger/10 text-danger border border-danger/20",
        accent: "bg-accent-tint text-accent border border-accent/20",
        neutral: "bg-canvas border border-line text-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/**
 * Cycle Status Badge handling all 5 cycle states explicitly:
 * SCHEDULED, OPEN, PAID, VACANT, SETTLED
 */
export function CycleStatusBadge({ status }: { status: CycleStatus }) {
  switch (status) {
    case "OPEN":
      return (
        <Badge variant="accent" className="font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Open
        </Badge>
      );
    case "PAID":
      return (
        <Badge variant="positive">
          <span className="w-1.5 h-1.5 rounded-full bg-positive" />
          Paid ✓
        </Badge>
      );
    case "SCHEDULED":
      return (
        <Badge variant="neutral">
          <span className="w-1.5 h-1.5 rounded-full bg-muted" />
          Scheduled
        </Badge>
      );
    case "VACANT":
      return (
        <Badge variant="danger">
          <span className="w-1.5 h-1.5 rounded-full bg-danger" />
          Vacant
        </Badge>
      );
    case "SETTLED":
      return (
        <Badge variant="primary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Settled
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}

/**
 * Round Status Badge handling all states:
 * FORMING, ACTIVE, COMPLETED, CANCELLED
 */
export function RoundStatusBadge({ status }: { status: RoundStatus }) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="positive">
          <span className="w-1.5 h-1.5 rounded-full bg-positive" />
          Active
        </Badge>
      );
    case "FORMING":
      return (
        <Badge variant="accent">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Forming
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge variant="primary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Completed
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="danger">
          <span className="w-1.5 h-1.5 rounded-full bg-danger" />
          Cancelled
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}
