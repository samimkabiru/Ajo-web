"use client";

import React from "react";
import { CycleSummary } from "@/lib/api/types";
import { CycleStatusBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, User, Check, Clock, Sparkles } from "lucide-react";

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
      <div className="p-6 text-center text-sm text-muted bg-surface rounded-[14px] border border-line">
        Cycles have not been generated yet. Activate the round to schedule rotation months.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile: Connected Vertical Timeline */}
      <div className="sm:hidden relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-line">
        {cycles.map((cycle, index) => {
          const isSelected = activeCycleId === cycle.id;
          const isUserBeneficiary = cycle.beneficiary?.id === currentUserId;
          const isPaid = cycle.status === "PAID";
          const isOpen = cycle.status === "OPEN";

          return (
            <div key={cycle.id} className="relative">
              {/* Timeline Node Icon */}
              <div
                className={cn(
                  "absolute -left-6 top-3.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all z-10",
                  isPaid
                    ? "bg-positive text-white ring-4 ring-canvas"
                    : isOpen
                    ? "bg-accent text-white ring-4 ring-accent-tint animate-pulse"
                    : isSelected
                    ? "bg-primary text-white ring-4 ring-primary-tint"
                    : "bg-surface border border-line text-muted"
                )}
              >
                {isPaid ? <Check className="w-3 h-3 stroke-[3]" /> : cycle.cycleNumber}
              </div>

              {/* Cycle Card */}
              <div
                onClick={() => onSelectCycle(cycle)}
                className={cn(
                  "p-4 rounded-[12px] border transition-all cursor-pointer touch-press bg-surface",
                  isSelected
                    ? "border-primary ring-2 ring-primary/10 shadow-sm"
                    : "border-line hover:border-muted/40 shadow-xs"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-ink">
                      Month {cycle.cycleNumber}
                    </span>
                    {isUserBeneficiary && (
                      <span className="text-[10px] bg-accent-tint text-accent border border-accent/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        You Collect
                      </span>
                    )}
                  </div>
                  <CycleStatusBadge status={cycle.status} />
                </div>

                <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-line/50">
                  <span className="flex items-center gap-1.5 text-ink font-medium truncate max-w-[160px]">
                    <User className="w-3.5 h-3.5 text-muted shrink-0" />
                    {cycle.status === "VACANT"
                      ? "Vacant (No beneficiary)"
                      : cycle.beneficiary?.fullName || "Unassigned"}
                  </span>

                  <span className="flex items-center gap-1 tabular-nums text-[11px]">
                    <Calendar className="w-3 h-3 text-muted" />
                    {cycle.payoutOn
                      ? new Date(cycle.payoutOn).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: Connected Horizontal Timeline Rail */}
      <div className="hidden sm:block overflow-x-auto pb-4 pt-2">
        <div className="flex items-stretch gap-3 min-w-max relative">
          {cycles.map((cycle) => {
            const isSelected = activeCycleId === cycle.id;
            const isUserBeneficiary = cycle.beneficiary?.id === currentUserId;
            const isPaid = cycle.status === "PAID";
            const isOpen = cycle.status === "OPEN";

            return (
              <div
                key={cycle.id}
                onClick={() => onSelectCycle(cycle)}
                className={cn(
                  "w-60 p-4 rounded-[14px] border bg-surface flex flex-col justify-between cursor-pointer transition-all duration-150 touch-press relative",
                  isSelected
                    ? "border-primary ring-2 ring-primary/10 shadow-card"
                    : "border-line hover:border-primary/30 shadow-subtle hover:-translate-y-0.5",
                  isOpen && "ring-1 ring-accent/30"
                )}
              >
                {/* Active Indicator Micro-pill */}
                {isOpen && (
                  <div className="absolute -top-2.5 left-4 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    Current Active Pot
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-1 mb-2.5 pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                          isPaid
                            ? "bg-positive text-white"
                            : isOpen
                            ? "bg-accent text-white"
                            : "bg-line/70 text-ink"
                        )}
                      >
                        {isPaid ? <Check className="w-3 h-3 stroke-[3]" /> : cycle.cycleNumber}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted">
                        Month {cycle.cycleNumber}
                      </span>
                    </div>

                    <CycleStatusBadge status={cycle.status} />
                  </div>

                  <div className="my-2 p-2.5 rounded-[10px] bg-canvas/70 border border-line/60">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-muted block mb-0.5">
                      Beneficiary
                    </span>
                    <div className="font-heading font-bold text-sm text-ink truncate">
                      {cycle.status === "VACANT"
                        ? "Vacant Slot"
                        : cycle.beneficiary?.fullName || "Unassigned"}
                    </div>
                    {isUserBeneficiary && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-accent-tint text-accent border border-accent/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        <Sparkles className="w-2.5 h-2.5" />
                        You Collect
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-line/60 flex items-center justify-between text-xs text-muted tabular-nums">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-muted" />
                    Due:{" "}
                    {cycle.dueOn
                      ? new Date(cycle.dueOn).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-bold",
                      isSelected ? "text-primary underline" : "text-muted"
                    )}
                  >
                    {isSelected ? "Active" : "Inspect"}
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
