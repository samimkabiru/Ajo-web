"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { toast } from "sonner";
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
  apiGetRoundSwaps,
  apiCreateSwap,
  apiAcceptSwap,
  apiDeclineSwap,
  apiCancelSwap,
} from "@/lib/api/endpoints";
import { ParticipantSummary, SwapStatus } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/api/errors";
import {
  ArrowLeftRight,
  Check,
  X,
  AlertCircle,
  Info,
  CheckCircle2,
  History,
  Clock,
  Ban,
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"requests" | "history">("requests");
  const [selectedTargetUserId, setSelectedTargetUserId] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: incomingSwaps } = useQuery({
    queryKey: ["incoming-swaps", roundId],
    queryFn: () => apiGetIncomingSwaps(roundId),
    enabled: isOpen && !!roundId,
  });

  const { data: outgoingSwaps } = useQuery({
    queryKey: ["outgoing-swaps", roundId],
    queryFn: () => apiGetOutgoingSwaps(roundId),
    enabled: isOpen && !!roundId,
  });

  const { data: allSwaps } = useQuery({
    queryKey: ["round-swaps", roundId],
    queryFn: () => apiGetRoundSwaps(roundId),
    enabled: isOpen && !!roundId,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["incoming-swaps", roundId] });
    queryClient.invalidateQueries({ queryKey: ["outgoing-swaps", roundId] });
    queryClient.invalidateQueries({ queryKey: ["round-swaps", roundId] });
    queryClient.invalidateQueries({ queryKey: ["round", roundId] });
  };

  const createSwapMutation = useMutation({
    mutationFn: (targetUserId: string) => apiCreateSwap(roundId, targetUserId),
    onSuccess: () => {
      invalidateAll();
      setSuccessMsg("Swap request sent to the participant.");
      toast.success("Swap request sent to the participant.");
      setSelectedTargetUserId("");
      setErrorMsg(null);
    },
    onError: (err) => {
      setErrorMsg(getErrorMessage(err));
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (swapId: string) => apiAcceptSwap(swapId),
    onSuccess: () => {
      invalidateAll();
      setSuccessMsg("Position swap accepted! Rotation order updated.");
      toast.success("Position swap accepted! Rotation order updated.");
      setErrorMsg(null);
    },
    onError: (err) => {
      setErrorMsg(getErrorMessage(err));
    },
  });

  const declineMutation = useMutation({
    mutationFn: (swapId: string) => apiDeclineSwap(swapId),
    onSuccess: () => {
      invalidateAll();
      setErrorMsg(null);
      setSuccessMsg("Swap request declined.");
      toast.info("Swap request declined.");
    },
    onError: (err) => {
      setErrorMsg(getErrorMessage(err));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (swapId: string) => apiCancelSwap(swapId),
    onSuccess: () => {
      invalidateAll();
      setErrorMsg(null);
      setSuccessMsg("Outgoing swap request withdrawn.");
      toast.info("Outgoing swap request withdrawn.");
    },
    onError: (err) => {
      setErrorMsg(getErrorMessage(err));
    },
  });

  // Eligible targets: participants other than current user who are active and haven't collected
  const eligibleTargets = participants.filter(
    (p) => p.user.id !== currentParticipant?.user.id
  );

  const renderStatusBadge = (status: SwapStatus) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Check className="w-3 h-3" /> Accepted
          </span>
        );
      case "DECLINED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
            <X className="w-3 h-3" /> Declined
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400">
            <Ban className="w-3 h-3" /> Cancelled
          </span>
        );
      case "SUPERSEDED":
        return (
          <SimpleTooltip content="A subsequent rotation change superseded this proposal">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 cursor-help">
              <Clock className="w-3 h-3" /> Superseded
            </span>
          </SimpleTooltip>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payout Position Swaps"
      description="Trade rotation dates with another member before either of you has collected."
    >
      <div className="space-y-4 pt-1">
        {/* Sub-tab navigation */}
        <div className="flex border-b border-line dark:border-white/10 gap-5 text-xs font-semibold overflow-x-auto no-scrollbar select-none">
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={cn(
              "relative pb-2.5 transition-colors duration-150 flex items-center gap-1.5 touch-press select-none whitespace-nowrap shrink-0",
              activeTab === "requests"
                ? "text-primary dark:text-indigo-400 font-bold"
                : "text-muted hover:text-ink"
            )}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Active & Propose</span>
            {activeTab === "requests" && (
              <motion.div
                layoutId="swapSheetTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary dark:bg-indigo-400 rounded-full z-10"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={cn(
              "relative pb-2.5 transition-colors duration-150 flex items-center gap-1.5 touch-press select-none whitespace-nowrap shrink-0",
              activeTab === "history"
                ? "text-primary dark:text-indigo-400 font-bold"
                : "text-muted hover:text-ink"
            )}
          >
            <History className="w-3.5 h-3.5" />
            <span>All Swaps History ({allSwaps?.length || 0})</span>
            {activeTab === "history" && (
              <motion.div
                layoutId="swapSheetTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary dark:bg-indigo-400 rounded-full z-10"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>
        </div>

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

        {activeTab === "requests" ? (
          <div className="space-y-5">
            {/* Platform Rule notice */}
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
                  {incomingSwaps.map((swap) => {
                    const requesterName =
                      swap.requester?.fullName ||
                      swap.requesterParticipant?.user?.fullName ||
                      "Member";

                    return (
                      <div
                        key={swap.id}
                        className="p-3.5 rounded-[10px] border border-line dark:border-white/10 bg-surface dark:bg-[#171B22] flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-sm text-ink block">
                            {requesterName} wants to swap
                          </span>
                          <span className="text-xs text-muted">
                            They offer Position #{swap.requesterPosition} for your Position #
                            {swap.targetPosition}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <SimpleTooltip content="Decline swap proposal">
                            <span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => declineMutation.mutate(swap.id)}
                                isLoading={declineMutation.isPending}
                                aria-label="Decline"
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </span>
                          </SimpleTooltip>
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
                    );
                  })}
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
                  {outgoingSwaps.map((swap) => {
                    const targetName =
                      swap.target?.fullName ||
                      swap.targetParticipant?.user?.fullName ||
                      "Member";

                    return (
                      <div
                        key={swap.id}
                        className="p-3.5 rounded-[10px] border border-line dark:border-white/10 bg-surface dark:bg-[#171B22] flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-sm text-ink block">
                            Sent to {targetName}
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
                    );
                  })}
                </div>
              </div>
            )}

            {/* Propose New Swap */}
            <div className="space-y-3 pt-2 border-t border-line/60 dark:border-white/10">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-muted">
                Request Swap with a Member
              </h4>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                  Target Member
                </label>
                <Select
                  value={selectedTargetUserId}
                  onValueChange={setSelectedTargetUserId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select participant to swap with..." />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleTargets.map((p) => (
                      <SelectItem key={p.user.id} value={p.user.id}>
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
                  disabled={!selectedTargetUserId || createSwapMutation.isPending}
                  onClick={() => createSwapMutation.mutate(selectedTargetUserId)}
                  isLoading={createSwapMutation.isPending}
                  loadingText="Sending request..."
                >
                  <ArrowLeftRight className="w-4 h-4 mr-1.5" />
                  Propose Swap
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* History View (GET /rounds/{roundId}/swaps) */
          <div className="space-y-3">
            {allSwaps && allSwaps.length > 0 ? (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {allSwaps.map((swap) => {
                  const requesterName =
                    swap.requester?.fullName ||
                    swap.requesterParticipant?.user?.fullName ||
                    "Member";
                  const targetName =
                    swap.target?.fullName ||
                    swap.targetParticipant?.user?.fullName ||
                    "Member";

                  return (
                    <div
                      key={swap.id}
                      className="p-3 rounded-lg border border-line dark:border-white/10 bg-surface dark:bg-[#171B22] text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-ink">
                          {requesterName} ↔ {targetName}
                        </span>
                        {renderStatusBadge(swap.status)}
                      </div>
                      <div className="flex items-center justify-between text-muted text-[11px]">
                        <span>
                          Offered #{swap.requesterPosition} for #{swap.targetPosition}
                        </span>
                        <span className="tabular-nums">
                          {new Date(swap.createdAt).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted border-dashed border rounded-xl">
                No position swaps requested in this round yet.
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
