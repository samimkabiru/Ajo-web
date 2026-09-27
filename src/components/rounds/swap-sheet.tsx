"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  apiGetIncomingSwaps,
  apiGetOutgoingSwaps,
  apiCreateSwap,
  apiAcceptSwap,
  apiDeclineSwap,
  apiCancelSwap,
} from "@/lib/api/endpoints";
import { ParticipantSummary, UserSummary } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/api/errors";
import { ArrowLeftRight, Check, X, AlertCircle, Info, CheckCircle2 } from "lucide-react";

interface SwapSheetProps {
  isOpen: boolean;
  onClose: () => void;
  roundId: string;
  currentParticipant?: ParticipantSummary;
  participants: ParticipantSummary[];
}

export function SwapSheet({
  isOpen,
  onClose,
  roundId,
  currentParticipant,
  participants,
}: SwapSheetProps) {
  const queryClient = useQueryClient();
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: incomingSwaps, refetch: refetchIncoming } = useQuery({
    queryKey: ["incoming-swaps", roundId],
    queryFn: () => apiGetIncomingSwaps(roundId),
    enabled: isOpen && !!roundId,
  });

  const { data: outgoingSwaps, refetch: refetchOutgoing } = useQuery({
    queryKey: ["outgoing-swaps", roundId],
    queryFn: () => apiGetOutgoingSwaps(roundId),
    enabled: isOpen && !!roundId,
  });

  const createSwapMutation = useMutation({
    mutationFn: (targetParticipantId: string) =>
      apiCreateSwap(roundId, targetParticipantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoing-swaps", roundId] });
      setSuccessMsg("Swap request sent to the participant.");
      setSelectedTargetId("");
      setErrorMsg(null);
    },
    onError: (err) => {
      setErrorMsg(getErrorMessage(err));
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (swapId: string) => apiAcceptSwap(swapId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incoming-swaps", roundId] });
      queryClient.invalidateQueries({ queryKey: ["round", roundId] });
      setSuccessMsg("Position swap accepted! Rotation order updated.");
      setErrorMsg(null);
    },
    onError: (err) => {
      setErrorMsg(getErrorMessage(err));
    },
  });

  const declineMutation = useMutation({
    mutationFn: (swapId: string) => apiDeclineSwap(swapId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incoming-swaps", roundId] });
      setErrorMsg(null);
    },
    onError: (err) => {
      setErrorMsg(getErrorMessage(err));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (swapId: string) => apiCancelSwap(swapId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoing-swaps", roundId] });
      setErrorMsg(null);
    },
    onError: (err) => {
      setErrorMsg(getErrorMessage(err));
    },
  });

  // Other participants eligible to swap with
  const eligibleTargets = participants.filter(
    (p) => p.id !== currentParticipant?.id
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Position Swaps"
      description="Trade payout positions with another member. No money changes hands — only who collects when."
    >
      <div className="space-y-6 pt-1">
        {errorMsg && (
          <div className="p-3.5 rounded-[10px] bg-danger/10 border border-danger/20 flex items-start gap-2.5 text-xs text-danger font-medium leading-snug">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-[10px] bg-positive/10 border border-positive/20 flex items-start gap-2.5 text-xs text-positive font-medium leading-snug">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Rule note per Section 6 */}
        <div className="p-3 rounded-lg bg-canvas border border-line text-xs text-muted flex items-start gap-2">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>
            <strong>Platform Rule:</strong> A member in their first round cannot move ahead of
            someone who has completed a round before. Both parties must confirm before the swap
            takes effect.
          </span>
        </div>

        {/* Incoming Swap Requests */}
        {incomingSwaps && incomingSwaps.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-muted">
              Incoming Requests ({incomingSwaps.length})
            </h4>
            <div className="space-y-2">
              {incomingSwaps.map((swap) => (
                <div
                  key={swap.id}
                  className="p-3.5 rounded-[10px] border border-line bg-surface flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-sm text-ink block">
                      {swap.requesterParticipant?.user?.fullName || "Member"} wants to swap
                    </span>
                    <span className="text-xs text-muted">
                      They offer Position #{swap.requesterPosition} for your Position #
                      {swap.targetPosition}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => declineMutation.mutate(swap.id)}
                      isLoading={declineMutation.isPending}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => acceptMutation.mutate(swap.id)}
                      isLoading={acceptMutation.isPending}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outgoing Swap Requests */}
        {outgoingSwaps && outgoingSwaps.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-muted">
              Pending Outgoing Request
            </h4>
            <div className="space-y-2">
              {outgoingSwaps.map((swap) => (
                <div
                  key={swap.id}
                  className="p-3.5 rounded-[10px] border border-line bg-surface flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-sm text-ink block">
                      Sent to {swap.targetParticipant?.user?.fullName || "Member"}
                    </span>
                    <span className="text-xs text-muted">
                      Offering Position #{swap.requesterPosition} for their Position #
                      {swap.targetPosition}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cancelMutation.mutate(swap.id)}
                    isLoading={cancelMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Propose New Swap */}
        <div className="space-y-3 pt-2 border-t border-line/60">
          <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-muted">
            Request Swap with a Member
          </h4>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Target Member
            </label>
            <Select
              value={selectedTargetId}
              onValueChange={setSelectedTargetId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select participant to swap with..." />
              </SelectTrigger>
              <SelectContent>
                {eligibleTargets.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary-tint text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                        #{p.position}
                      </span>
                      <span className="font-medium text-ink">{p.user.fullName}</span>
                      <span className="text-xs text-muted font-mono">({p.user.phone})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="primary"
              disabled={!selectedTargetId || createSwapMutation.isPending}
              onClick={() => createSwapMutation.mutate(selectedTargetId)}
              isLoading={createSwapMutation.isPending}
              loadingText="Sending request..."
            >
              <ArrowLeftRight className="w-4 h-4 mr-1.5" />
              Propose Swap
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
