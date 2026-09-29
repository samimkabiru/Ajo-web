"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIdempotencyKey } from "@/lib/idempotency";
import { formatKobo } from "@/lib/money";
import { apiBuyIn } from "@/lib/api/endpoints";
import { ExitRequestSummary, PaymentMethod, UserSummary } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/api/errors";
import { UserCheck, ShieldCheck, AlertCircle, Info, Coins } from "lucide-react";

interface BuyInModalProps {
  isOpen: boolean;
  onClose: () => void;
  exit: ExitRequestSummary | null;
  eligibleReplacements: UserSummary[];
  onSuccess: () => void;
}

export function BuyInModal({
  isOpen,
  onClose,
  exit,
  eligibleReplacements,
  onSuccess,
}: BuyInModalProps) {
  const { key, initIntent, resetIntent } = useIdempotencyKey();

  const [replacementUserId, setReplacementUserId] = useState<string>("");
  const [method, setMethod] = useState<PaymentMethod>("ONLINE");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize idempotency key when modal opens, reset on close
  useEffect(() => {
    if (isOpen) {
      initIntent();
      setErrorMsg(null);
      setReplacementUserId(eligibleReplacements[0]?.id || "");
    } else {
      resetIntent();
    }
  }, [isOpen, initIntent, resetIntent, eligibleReplacements]);

  if (!exit) return null;

  // Amount must match leaver's total contributed exposure exactly
  const buyInAmountKobo = Math.abs(exit.exposureAtRequest || exit.exposureKobo || 0);
  const leaverName =
    ("fullName" in (exit.participant || {})
      ? (exit.participant as UserSummary).fullName
      : (exit.participant as any)?.user?.fullName) || "Leaving Member";

  const handleConfirmBuyIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacementUserId) {
      setErrorMsg("Please select an eligible circle member to fill this slot.");
      return;
    }

    if (!key) {
      setErrorMsg("Missing transaction key. Please reopen the dialog.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await apiBuyIn(
        exit.id,
        {
          replacementUserId,
          amountKobo: buyInAmountKobo,
          method,
        },
        key
      );

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isLoading) onClose();
      }}
      title="Fill Vacant Position (Buy-In)"
      description={`A member has left the circle. Another member can take over their slot by contributing the exact amount already accumulated.`}
    >
      <form onSubmit={handleConfirmBuyIn} className="space-y-4 pt-1">
        {errorMsg && (
          <div className="p-3.5 rounded-[10px] bg-danger/10 border border-danger/20 flex items-start gap-2.5 text-xs text-danger font-medium leading-snug">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Leaver & Fixed Amount Summary */}
        <div className="p-4 rounded-[12px] bg-surface dark:bg-[#14171B] border border-line dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Vacating Member</span>
            <span className="text-xs font-bold text-ink">{leaverName}</span>
          </div>
          <div className="flex items-center justify-between border-t border-line/60 dark:border-white/10 pt-2">
            <span className="text-xs text-muted">Required Buy-In Amount</span>
            <span className="text-sm font-extrabold text-positive tabular-nums">
              {formatKobo(buyInAmountKobo)}
            </span>
          </div>
        </div>

        {/* Replacement Member Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink/85 dark:text-slate-200">
            Select Replacement Member
          </label>
          {eligibleReplacements.length > 0 ? (
            <Select value={replacementUserId} onValueChange={setReplacementUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a member to take over slot" />
              </SelectTrigger>
              <SelectContent>
                {eligibleReplacements.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.fullName} ({member.phone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-xs text-warning">
              No eligible circle members found. Invite new members to the circle first before completing this buy-in.
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink/85 dark:text-slate-200">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMethod("ONLINE")}
              className={`p-3 rounded-[10px] border text-left flex items-center justify-between transition-all ${
                method === "ONLINE"
                  ? "border-primary bg-primary-tint/30 dark:bg-indigo-500/10"
                  : "border-line dark:border-white/10 hover:border-line-hover"
              }`}
            >
              <span className="text-xs font-bold text-ink">Online Payment</span>
              <Coins className="w-4 h-4 text-primary" />
            </button>
            <button
              type="button"
              onClick={() => setMethod("CASH")}
              className={`p-3 rounded-[10px] border text-left flex items-center justify-between transition-all ${
                method === "CASH"
                  ? "border-primary bg-primary-tint/30 dark:bg-indigo-500/10"
                  : "border-line dark:border-white/10 hover:border-line-hover"
              }`}
            >
              <span className="text-xs font-bold text-ink">Cash (Direct)</span>
              <ShieldCheck className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>

        {/* Rule explanation */}
        <div className="p-3 rounded-[10px] bg-canvas dark:bg-white/[0.04] border border-line/60 dark:border-white/10 flex items-start gap-2.5 text-xs text-muted">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            The replacement member inherits the vacating member&apos;s payout position and past contributions. A refund transaction is simultaneously posted to settle the leaver&apos;s ledger.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line/60 dark:border-white/10">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            disabled={!replacementUserId || eligibleReplacements.length === 0}
          >
            <UserCheck className="w-3.5 h-3.5 mr-1" />
            Confirm Buy-In
          </Button>
        </div>
      </form>
    </Modal>
  );
}
