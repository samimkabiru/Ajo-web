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
import { apiContribute } from "@/lib/api/endpoints";
import { PaymentMethod, UserSummary } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/api/errors";
import { CheckCircle2, AlertCircle, Coins, ShieldCheck } from "lucide-react";

interface ContributeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cycleId: string;
  cycleNumber: number;
  contributionAmountKobo: number;
  onSuccess: () => void;
  isAdmin?: boolean;
  members?: { userId: string; user: UserSummary }[];
}

export function ContributeSheet({
  isOpen,
  onClose,
  cycleId,
  cycleNumber,
  contributionAmountKobo,
  onSuccess,
  isAdmin = false,
  members = [],
}: ContributeSheetProps) {
  // Generate and hold idempotency key when the sheet opens (user intent forms)
  const { key, initIntent, resetIntent } = useIdempotencyKey();

  const [method, setMethod] = useState<PaymentMethod>("ONLINE");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      initIntent();
      setIsSuccess(false);
      setErrorMsg(null);
      setSelectedUserId("");
    } else {
      resetIntent();
    }
  }, [isOpen, initIntent, resetIntent]);

  const handleConfirmContribution = async () => {
    if (!key) {
      setErrorMsg("Missing transaction key. Please reopen the sheet.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await apiContribute(
        cycleId,
        {
          amountKobo: contributionAmountKobo,
          userId: selectedUserId || undefined,
          method,
        },
        key
      );

      // Subtle haptic response on supported mobile devices
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        try {
          navigator.vibrate(10);
        } catch {
          // Ignore vibration failures
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
      title={`Contribute to Month ${cycleNumber}`}
      description="Confirm your scheduled monthly contribution into the circle's pot."
    >
      <div className="space-y-5 pt-1">
        {isSuccess ? (
          <div className="p-6 text-center space-y-3 bg-positive/10 dark:bg-green-500/12 rounded-[12px] border border-positive/20 dark:border-green-500/30">
            <CheckCircle2 className="w-12 h-12 text-positive mx-auto" />
            <h4 className="font-heading text-lg font-bold text-ink">Contribution Confirmed</h4>
            <p className="text-xs text-muted">
              {formatKobo(contributionAmountKobo)} recorded successfully into the circle pot.
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

            {/* Fixed Amount Display per Section 8 Rule */}
            <div className="bg-canvas dark:bg-[#0C0F14] border border-line dark:border-white/10 dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.45)] rounded-[12px] p-5 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1">
                Fixed Round Contribution
              </span>
              <div className="font-heading font-extrabold text-3xl sm:text-4xl text-ink tabular-nums">
                {formatKobo(contributionAmountKobo)}
              </div>
              <span className="text-[11px] text-muted block mt-1">
                Strict integer kobo accounting — no floating point conversion
              </span>
            </div>

            {/* Admin on-behalf or cash options */}
            {isAdmin && members.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-line/60 dark:border-white/10">
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                    Contribute for Member (Optional)
                  </label>
                  <Select
                    value={selectedUserId || "myself"}
                    onValueChange={(val) => setSelectedUserId(val === "myself" ? "" : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Myself" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="myself">
                        <span className="font-medium text-ink">Myself</span>
                      </SelectItem>
                      {members.map((m) => {
                        const mId = m.user?.id || (m as { userId?: string }).userId || "";
                        return (
                          <SelectItem key={mId} value={mId}>
                            <span className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-primary-tint text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                                {m.user.fullName.charAt(0).toUpperCase()}
                              </span>
                              <span className="font-medium text-ink">{m.user.fullName}</span>
                              <span className="text-xs text-muted font-mono">({m.user.phone})</span>
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMethod("ONLINE")}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border touch-press transition-all ${
                        method === "ONLINE"
                          ? "bg-primary-tint border-primary text-primary dark:bg-indigo-500/18 dark:border-indigo-400 dark:text-indigo-300"
                          : "bg-surface border-line text-muted dark:bg-[#0C0F14] dark:border-white/12 hover:border-muted/30"
                      }`}
                    >
                      Online
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("CASH")}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border touch-press transition-all ${
                        method === "CASH"
                          ? "bg-primary-tint border-primary text-primary dark:bg-indigo-500/18 dark:border-indigo-400 dark:text-indigo-300"
                          : "bg-surface border-line text-muted dark:bg-[#0C0F14] dark:border-white/12 hover:border-muted/30"
                      }`}
                    >
                      Cash (Admin Recorded)
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-muted bg-canvas dark:bg-[#0C0F14] p-2.5 rounded-lg border border-line dark:border-white/10">
              <ShieldCheck className="w-4 h-4 text-positive shrink-0" />
              <span>Idempotency-protected: Tap once safely. Duplicate transfers are blocked.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/60 dark:border-white/10">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmContribution}
                isLoading={isLoading}
                loadingText="Sending..."
              >
                Confirm Payment of {formatKobo(contributionAmountKobo)}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
