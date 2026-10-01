"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { formatKobo } from "@/lib/money";
import { apiSettleCycle } from "@/lib/api/endpoints";
import { VacantCycleSummary } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/api/errors";
import { Scale, CheckCircle2, AlertCircle, Info, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface SettleCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycleId: string;
  cycleNumber: number;
  settlement: VacantCycleSummary | null;
  onSuccess: () => void;
}

export function SettleCycleModal({
  isOpen,
  onClose,
  cycleId,
  cycleNumber,
  settlement,
  onSuccess,
}: SettleCycleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!settlement) return null;

  const handleSettle = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await apiSettleCycle(cycleId);
      toast.success("Vacant pot settled! Shortfalls covered and refunds distributed.");
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const remainingKobo = Math.max(
    0,
    settlement.potKobo - settlement.refundOwedKobo - settlement.openClaimsKobo
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isLoading) onClose();
      }}
      title={`Settle Vacant Month #${cycleNumber}`}
      description="The scheduled beneficiary exited without being replaced. Settle this cycle to disburse refunds and resolve open shortfall claims."
    >
      <div className="space-y-4 pt-1">
        {errorMsg && (
          <div className="p-3.5 rounded-[10px] bg-danger/10 border border-danger/20 flex items-start gap-2.5 text-xs text-danger font-medium leading-snug">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Ledger Breakdown Card */}
        <div className="p-4 rounded-[12px] bg-surface dark:bg-[#14171B] border border-line dark:border-white/10 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted">Accumulated Pot</span>
            <span className="font-bold text-ink tabular-nums">
              {formatKobo(settlement.potKobo)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-line/60 dark:border-white/10 pt-2">
            <span className="text-muted">Refund Owed to Leaver</span>
            <span className="font-bold text-positive tabular-nums">
              - {formatKobo(settlement.refundOwedKobo)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-line/60 dark:border-white/10 pt-2">
            <span className="text-muted">Outstanding Shortfall Claims Settled</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              - {formatKobo(settlement.openClaimsKobo)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-line/60 dark:border-white/10 pt-2 text-ink font-extrabold text-sm">
            <span>Remaining Ledger Pool</span>
            <span className="tabular-nums">{formatKobo(remainingKobo)}</span>
          </div>
        </div>

        {/* Readiness Status */}
        {settlement.readyToSettle ? (
          <div className="p-3 rounded-[10px] bg-positive/10 border border-positive/20 flex items-start gap-2.5 text-xs text-positive">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              This cycle is fully balanced and <strong>ready for settlement</strong>. Executing settlement will disburse refunds, settle open member claims, and transition this cycle to <span className="font-bold uppercase">Settled</span>.
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-[10px] bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <p className="leading-relaxed">
              This cycle is not yet ready to settle. Ensure all expected monthly contributions for this cycle have been recorded or due date reached.
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line/60 dark:border-white/10">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSettle}
            isLoading={isLoading}
            disabled={!settlement.readyToSettle}
          >
            <Scale className="w-3.5 h-3.5 mr-1" />
            Execute Settlement
          </Button>
        </div>
      </div>
    </Modal>
  );
}
