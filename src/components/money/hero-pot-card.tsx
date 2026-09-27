"use client";

import React, { useEffect, useState } from "react";
import { formatKobo } from "@/lib/money";
import { ShieldCheck, TrendingUp, Sparkles, Coins, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroPotCardProps {
  balanceKobo: number;
  expectedPotKobo: number;
  monthlyContributionKobo: number;
  participantCount: number;
  myPosition?: number;
  completedCyclesCount: number;
  totalCyclesCount: number;
  className?: string;
}

export function HeroPotCard({
  balanceKobo,
  expectedPotKobo,
  monthlyContributionKobo,
  participantCount,
  myPosition,
  completedCyclesCount,
  totalCyclesCount,
  className,
}: HeroPotCardProps) {
  // Count-up animation for pot balance
  const [displayKobo, setDisplayKobo] = useState(0);

  useEffect(() => {
    const target = Math.abs(balanceKobo);
    if (target === 0) {
      setDisplayKobo(0);
      return;
    }

    const duration = 500; // ms
    const startTime = performance.now();
    const startValue = displayKobo;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (target - startValue) * eased);
      setDisplayKobo(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayKobo(target);
      }
    };

    requestAnimationFrame(animate);
  }, [balanceKobo]);

  const percentCompleted =
    totalCyclesCount > 0
      ? Math.round((completedCyclesCount / totalCyclesCount) * 100)
      : 0;

  // Split formatted string into Naira symbol, whole amount, and kobo part
  const formatted = formatKobo(displayKobo);
  const nairaSymbol = "₦";
  const amountNumber = formatted.replace("₦", "");

  return (
    <div
      className={cn(
        "vault-card rounded-[18px] p-6 sm:p-7 text-white shadow-vault relative select-none",
        className
      )}
    >
      {/* Background Watermark Pattern */}
      <div className="absolute top-4 right-5 text-white/5 pointer-events-none">
        <Coins className="w-36 h-36 -mr-8 -mt-8" />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                Current Pot Balance
              </span>
            </div>
            <div className="flex items-baseline gap-1 font-heading">
              <span className="text-2xl sm:text-3xl font-medium text-white/60">
                {nairaSymbol}
              </span>
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight tabular-nums">
                {amountNumber}
              </span>
            </div>
          </div>

          {myPosition && (
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full text-right shrink-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60 block">
                Your Payout Slot
              </span>
              <span className="text-xs sm:text-sm font-bold text-white tabular-nums">
                Position #{myPosition}
              </span>
            </div>
          )}
        </div>

        {/* Middle Stats Rail */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10">
          <div>
            <span className="text-[11px] text-white/60 block">Target Full Pot</span>
            <span className="text-sm font-bold text-white tabular-nums">
              {formatKobo(expectedPotKobo)}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-white/60 block">Monthly Contribution</span>
            <span className="text-sm font-bold text-white tabular-nums">
              {formatKobo(monthlyContributionKobo)}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <span className="text-[11px] text-white/60 block">Members Rotated</span>
            <span className="text-sm font-bold text-white tabular-nums">
              {completedCyclesCount} of {totalCyclesCount} Collected
            </span>
          </div>
        </div>

        {/* Progress Track */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-[11px] text-white/70 tabular-nums font-medium">
            <span>Round Progress</span>
            <span>{percentCompleted}% complete</span>
          </div>
          <div className="w-full bg-white/15 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-accent h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentCompleted}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
