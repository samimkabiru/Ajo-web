"use client";

import React from "react";
import { CycleSummary, CycleStatus } from "@/lib/api/types";
import { CycleStatusBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, User, ArrowRight, CheckCircle2, Clock } from "lucide-react";

interface CycleTimelineProps {
  cycles: CycleSummary[];
  activeCycleId?: string;
  onSelectCycle: (cycle: CycleSummary) => void;
  currentUserId?: string;
}

export function CycleTimeline({
  cycles,
  activeCycleId,
  onSelectCycle,
  currentUserId,
}: CycleTimelineProps) {
  if (!cycles || cycles.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted bg-surface rounded-[12px] border border-line">
        Cycles have not been generated yet. Activate the round to schedule cycles.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile: Vertical timeline */}
      <div className="sm:hidden space-y-2.5">
        {cycles.map((cycle, index) => {
          const isSelected = activeCycleId === cycle.id;
          const isUserBeneficiary = cycle.beneficiary?.id === currentUserId;

          return (
            <div
              key={cycle.id}
              onClick={() => onSelectCycle(cycle)}
              className={cn(
                "p-3.5 rounded-[12px] border transition-all cursor-pointer touch-press bg-surface",
                isSelected
                  ? "border-primary ring-2 ring-primary/10 shadow-sm"
                  : "border-line hover:border-muted/40"
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary-tint text-primary text-xs font-bold flex items-center justify-center">
                    {cycle.cycleNumber}
                  </span>
                  <span className="font-heading font-semibold text-sm text-ink">
                    Month {cycle.cycleNumber}
                  </span>
                  {isUserBeneficiary && (
                    <span className="text-[10px] bg-accent-tint text-accent border border-accent/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      Your Turn
                    </span>
                  )}
                </div>
                <CycleStatusBadge status={cycle.status} />
              </div>

              <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-line/50">
                <span className="flex items-center gap-1.5 text-ink font-medium">
                  <User className="w-3.5 h-3.5 text-muted" />
                  {cycle.status === "VACANT"
                    ? "Vacant (No beneficiary)"
                    : cycle.beneficiary?.fullName || "Unassigned"}
                </span>

                <span className="flex items-center gap-1 tabular-nums">
                  <Calendar className="w-3.5 h-3.5" />
                  {cycle.payoutOn ? new Date(cycle.payoutOn).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: Horizontal timeline */}
      <div className="hidden sm:block overflow-x-auto pb-3 pt-1">
        <div className="flex items-stretch gap-3 min-w-max">
          {cycles.map((cycle, index) => {
            const isSelected = activeCycleId === cycle.id;
            const isUserBeneficiary = cycle.beneficiary?.id === currentUserId;

            return (
              <div
                key={cycle.id}
                onClick={() => onSelectCycle(cycle)}
                className={cn(
                  "w-56 p-4 rounded-[12px] border bg-surface flex flex-col justify-between cursor-pointer transition-all duration-150 touch-press",
                  isSelected
                    ? "border-primary ring-2 ring-primary/10 shadow-sm"
                    : "border-line hover:border-muted/40 shadow-subtle"
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">
                      Month {cycle.cycleNumber}
                    </span>
                    <CycleStatusBadge status={cycle.status} />
                  </div>

                  <div className="my-2">
                    <span className="text-xs text-muted block mb-0.5">Beneficiary</span>
                    <div className="font-heading font-bold text-sm text-ink truncate">
                      {cycle.status === "VACANT"
                        ? "Vacant Slot"
                        : cycle.beneficiary?.fullName || "Unassigned"}
                    </div>
                    {isUserBeneficiary && (
                      <span className="inline-block mt-1 text-[10px] bg-accent-tint text-accent border border-accent/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        You Collect
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-line/60 flex items-center justify-between text-xs text-muted tabular-nums">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Due: {cycle.dueOn ? new Date(cycle.dueOn).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}
                  </span>
                  <span className="text-primary font-semibold text-[11px]">
                    {isSelected ? "Selected" : "View"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
