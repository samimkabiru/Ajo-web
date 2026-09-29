"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useIdempotencyKey } from "@/lib/idempotency";
import { formatKobo } from "@/lib/money";
import { apiCollectPayout } from "@/lib/api/endpoints";
import { PaymentMethod, UserSummary } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/api/errors";
import { CheckCircle2, AlertCircle, ShieldCheck, ArrowDownCircle, Info } from "lucide-react";

interface PayoutSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cycleId: string;
  cycleNumber: number;
  expectedBeneficiaryUserId: string;
  beneficiaryName: string;
  expectedAmountKobo: number;
  actualAmountKobo: number;
  shortfallKobo?: number;
  arrearsWithheldKobo?: number;
  onSuccess: () => void;
}

export function PayoutSheet({
  isOpen,
  onClose,
  cycleId,
  cycleNumber,
  expectedBeneficiaryUserId,
  beneficiaryName,
  expectedAmountKobo,
  actualAmountKobo,
  shortfallKobo = 0,
  arrearsWithheldKobo = 0,
  onSuccess,
}: PayoutSheetProps) {
  const { key, initIntent, resetIntent } = useIdempotencyKey();
  const [method, setMethod] = useState<PaymentMethod>("ONLINE");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      initIntent();
      setIsSuccess(false);
      setErrorMsg(null);
    } else {
      resetIntent();
    }
  }, [isOpen, initIntent, resetIntent]);

  const handleConfirmPayout = async () => {
    if (!key) {
      setErrorMsg("Missing transaction key. Please reopen the sheet.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await apiCollectPayout(
        cycleId,
        {
          expectedBeneficiaryUserId,
          method,
        },
        key
      );

      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        try {
          navigator.vibrate(10);
        } catch {
          // Ignore
        }
      }

      setIsSuccess(true);
      onSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Collect Pot for Month ${cycleNumber}`}
      description={`Disburse the accumulated savings pot to ${beneficiaryName}.`}
    >
      <div className="space-y-5 pt-1">
        {isSuccess ? (
          <div className="p-6 text-center space-y-3 bg-positive/10 dark:bg-emerald-500/15 rounded-[12px] border border-positive/20 dark:border-emerald-500/40 dark:shadow-[0_0_24px_rgba(16,185,129,0.18)]">
            <CheckCircle2 className="w-12 h-12 text-positive mx-auto" />
            <h4 className="font-heading text-lg font-bold text-ink">Payout Disbursed</h4>
            <p className="text-xs text-muted">
              {formatKobo(actualAmountKobo)} successfully collected and recorded on the ledger.
            </p>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="p-3.5 rounded-[10px] bg-danger/10 border border-danger/20 flex items-start gap-2.5 text-xs text-danger font-medium leading-snug">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Expected vs Actual Breakdown */}
            <div className="bg-canvas dark:bg-[#0C0F14] border border-line dark:border-white/10 dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.45)] rounded-[12px] p-5 space-y-3">
              <div className="flex justify-between items-center text-xs text-muted">
                <span>Expected Full Pot</span>
                <span className="font-semibold text-ink tabular-nums">
                  {formatKobo(expectedAmountKobo)}
                </span>
              </div>

              {shortfallKobo > 0 && (
                <div className="flex justify-between items-center text-xs text-warning bg-warning/10 dark:bg-amber-500/15 p-2.5 rounded-lg border border-warning/20 dark:border-amber-500/30">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Shortfall (unpaid member contributions)</span>
                  </div>
                  <span className="font-semibold tabular-nums">-{formatKobo(shortfallKobo)}</span>
                </div>
              )}

              {arrearsWithheldKobo > 0 && (
                <div className="flex justify-between items-center text-xs text-danger bg-danger/10 dark:bg-rose-500/15 p-2.5 rounded-lg border border-danger/20 dark:border-rose-500/30">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Held back for missed earlier months</span>
                  </div>
                  <span className="font-semibold tabular-nums">-{formatKobo(arrearsWithheldKobo)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-line/60 dark:border-white/10 flex justify-between items-center">
                <span className="font-heading font-bold text-sm text-ink">Take-Home Payout</span>
                <span className="font-heading font-extrabold text-2xl text-positive tabular-nums">
                  {formatKobo(actualAmountKobo)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted bg-canvas dark:bg-[#0C0F14] p-2.5 rounded-lg border border-line dark:border-white/10">
              <ShieldCheck className="w-4 h-4 text-positive shrink-0" />
              <span>Idempotency-protected: Tap once safely. Duplicate payouts are blocked.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/60 dark:border-white/10">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmPayout}
                isLoading={isLoading}
                loadingText="Disbursing..."
              >
                Confirm Payout of {formatKobo(actualAmountKobo)}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
