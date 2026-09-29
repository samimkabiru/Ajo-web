import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Light: soft warm grey shimmer
        // Dark: lifted slate shimmer matching the 3-tier elevation
        "animate-pulse rounded-[8px] select-none",
        "bg-[#E7E5E4] dark:bg-[#252D3E]",
        className
      )}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-[12px] border border-[#E7E5E4] dark:border-white/8 bg-surface dark:bg-[#171B22] p-5 space-y-4 shadow-card">
      <div className="flex justify-between items-start">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-2/3" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}
