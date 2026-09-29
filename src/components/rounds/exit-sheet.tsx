"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  apiGetParticipantExposure,
  apiGetMyExit,
  apiRequestExit,
  apiCancelExit,
  apiRepay,
} from "@/lib/api/endpoints";
import { formatKobo, formatSignedKobo, parseNairaToKobo } from "@/lib/money";
import { useIdempotencyKey } from "@/lib/idempotency";
import { getErrorMessage } from "@/lib/api/errors";
import { AlertTriangle, ShieldCheck, CheckCircle2, DollarSign, LogOut } from "lucide-react";

interface ExitSheetProps {
  isOpen: boolean;
  onClose: () => void;
  roundId: string;
  participantId?: string;
}

export function ExitSheet({
  isOpen,
  onClose,
  roundId,
  participantId,
}: ExitSheetProps) {
  const queryClient = useQueryClient();
  const { key, initIntent, resetIntent } = useIdempotencyKey();

  const [repayAmountNaira, setRepayAmountNaira] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initialize idempotency key when user opens the modal; reset on close
  useEffect(() => {
    if (isOpen) {
      initIntent();
      setErrorMsg(null);
      setSuccessMsg(null);
      setRepayAmountNaira("");
    } else {
      resetIntent();
    }
  }, [isOpen, initIntent, resetIntent]);

  // Participant exposure
  const { data: exposure, isLoading: isExposureLoading } = useQuery({
    queryKey: ["exposure", participantId],
    queryFn: () => apiGetParticipantExposure(participantId!),
    enabled: isOpen && !!participantId,
  });

  // Current exit status if any
  const { data: myExit, refetch: refetchExit } = useQuery({
    queryKey: ["my-exit", roundId],
    queryFn: () => apiGetMyExit(roundId),
    enabled: isOpen && !!roundId,
  });

  const requestExitMutation = useMutation({
    mutationFn: () => apiRequestExit(roundId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-exit", roundId] });
      queryClient.invalidateQueries({ queryKey: ["round", roundId] });
      setSuccessMsg("Exit request submitted successfully.");
      setErrorMsg(null);
    },
    onError: (err) => {
      setErrorMsg(getErrorMessage(err));
    },
  });

  const cancelExitMutation = useMutation({
    mutationFn: (exitId: string) => apiCancelExit(exitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-exit", roundId] });
      setSuccessMsg("Exit request cancelled.");
      setErrorMsg(null);
    },
    onError: (err) => {
      setErrorMsg(getErrorMessage(err));
    },
  });

  const repayMutation = useMutation({
    mutationFn: (amountKobo: number) => {
      const idempotencyKey = key || initIntent();
      return apiRepay(participantId!, amountKobo, idempotencyKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exposure", participantId] });
      setSuccessMsg("Repayment recorded on the ledger.");
      setRepayAmountNaira("");
      setErrorMsg(null);
    },
    onError: (err) => {
      setErrorMsg(getErrorMessage(err));
    },
  });

  const handleRepaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const kobo = parseNairaToKobo(repayAmountNaira);
    if (kobo <= 0) {
      setErrorMsg("Please enter a valid repayment amount.");
      return;
    }
    setErrorMsg(null);
    repayMutation.mutate(kobo);
  };

  const exposureKobo = exposure?.exposureKobo || 0;
  const isSquare = exposureKobo === 0;
  const isOwedRefund = exposure?.owedByGroup;
  const owesDebt = exposure?.owesGroup;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Exit Savings Round"
      description="Understand your financial exposure before requesting to leave this active round."
    >
      <div className="space-y-5 pt-1">
        {errorMsg && (
          <div className="p-3.5 rounded-[10px] bg-danger/10 border border-danger/20 flex items-start gap-2.5 text-xs text-danger font-medium leading-snug">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-[10px] bg-positive/10 border border-positive/20 flex items-start gap-2.5 text-xs text-positive font-medium leading-snug">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Existing Exit Request status */}
        {myExit && (
          <div className="p-4 rounded-[12px] bg-accent-tint/50 border border-accent/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-sm text-ink">
                Active Exit Request:{" "}
                <span className="font-semibold text-primary">
                  {myExit.status === "PENDING_SETTLEMENT"
                    ? "Pending Settlement"
                    : myExit.status === "COMPLETED"
                    ? "Completed"
                    : myExit.status}
                </span>
              </span>
              {(myExit.status === "PENDING_SETTLEMENT" || (myExit.status as string) === "PENDING") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cancelExitMutation.mutate(myExit.id)}
                  isLoading={cancelExitMutation.isPending}
                >
                  Cancel Exit
                </Button>
              )}
            </div>
            <p className="text-xs text-muted">
              Submitted on{" "}
              {new Date(
                myExit.requestedAt || myExit.createdAt || Date.now()
              ).toLocaleDateString()}
              .
              {isOwedRefund && " You are queued for a refund when replacement funds arrive."}
            </p>
          </div>
        )}

        {/* Exposure Explanation Breakdown per Section 6 */}
        <div className="bg-canvas border border-line rounded-[12px] p-5 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted block">
            Current Position & Ledger Exposure
          </span>

          <div className="text-lg font-bold font-heading">
            {formatSignedKobo(exposureKobo).text}
          </div>

          {isSquare && (
            <div className="p-3 rounded-lg bg-positive/10 border border-positive/20 text-xs text-positive">
              <strong>All square:</strong> You have contributed exactly what you have collected.
              Your exit can take effect immediately without delays.
            </div>
          )}

          {isOwedRefund && (
            <div className="p-3 rounded-lg bg-primary-tint border border-primary/20 text-xs text-ink space-y-1">
              <strong className="text-primary block font-semibold">Group Owes You a Refund</strong>
              <p className="text-muted leading-relaxed">
                You paid more in contributions than you have collected ({formatKobo(Math.abs(exposureKobo))}).
                When you exit, your slot becomes VACANT and your refund will be disbursed as replacement members buy in or vacant cycles settle.
              </p>
            </div>
          )}

          {owesDebt && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-xs text-ink space-y-2">
              <strong className="text-danger block font-semibold">Repayment Required Before Exit</strong>
              <p className="text-muted leading-relaxed">
                You took home the round pot earlier and still owe {formatKobo(exposureKobo)} in scheduled
                monthly contributions. The platform requires full settlement of this balance before your exit is approved.
              </p>

              {/* Repayment Form */}
              <form onSubmit={handleRepaySubmit} className="pt-2 flex items-center gap-2">
                <Input
                  placeholder="Repay amount (₦)"
                  value={repayAmountNaira}
                  onChange={(e) => setRepayAmountNaira(e.target.value)}
                  className="h-10 text-xs"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={repayMutation.isPending}
                  loadingText="Paying..."
                  className="shrink-0"
                >
                  Repay
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Exit Action Button */}
        {!myExit && (
          <div className="pt-3 border-t border-line/60 flex items-center justify-between">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={owesDebt && !isSquare}
              onClick={() => requestExitMutation.mutate()}
              isLoading={requestExitMutation.isPending}
              loadingText="Submitting..."
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Confirm Exit Request
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
