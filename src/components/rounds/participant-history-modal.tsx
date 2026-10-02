"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SimpleTooltip } from "@/components/ui/tooltip";
import {
  apiGetParticipantExposure,
  apiGetParticipantContributions,
  apiGetParticipantPayouts,
  apiGetParticipantRepayments,
} from "@/lib/api/endpoints";
import { ParticipantSummary, ParticipantStatus } from "@/lib/api/types";
import { formatKobo, formatSignedKobo } from "@/lib/money";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
} from "lucide-react";

interface ParticipantHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: ParticipantSummary | null;
  roundStatus?: string;
}

export function ParticipantHistoryModal({
  isOpen,
  onClose,
  participant,
  roundStatus,
}: ParticipantHistoryModalProps) {
  const [activeTab, setActiveTab] = useState<"contributions" | "payouts" | "repayments">("contributions");

  const participantId = participant?.id || "";

  // Exposure
  const { data: exposure, isLoading: isExposureLoading } = useQuery({
    queryKey: ["participant-exposure", participantId],
    queryFn: () => apiGetParticipantExposure(participantId),
    enabled: isOpen && !!participantId && roundStatus === "ACTIVE",
  });

  // Contributions
  const { data: contributions, isLoading: isContributionsLoading } = useQuery({
    queryKey: ["participant-contributions", participantId],
    queryFn: () => apiGetParticipantContributions(participantId),
    enabled: isOpen && !!participantId,
  });

  // Payouts
  const { data: payouts, isLoading: isPayoutsLoading } = useQuery({
    queryKey: ["participant-payouts", participantId],
    queryFn: () => apiGetParticipantPayouts(participantId),
    enabled: isOpen && !!participantId,
  });

  // Repayments
  const { data: repayments, isLoading: isRepaymentsLoading } = useQuery({
    queryKey: ["participant-repayments", participantId],
    queryFn: () => apiGetParticipantRepayments(participantId),
    enabled: isOpen && !!participantId,
  });

  if (!participant) return null;

  const renderStatusBadge = (status?: ParticipantStatus) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="positive">Active Member</Badge>;
      case "PENDING_EXIT":
        return <Badge variant="warning">Exit Pending</Badge>;
      case "EXITED":
        return <Badge variant="neutral">Exited</Badge>;
      default:
        return <Badge variant="positive">Active Member</Badge>;
    }
  };

  const slotNumber = participant.payoutPosition ?? participant.position ?? "—";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={participant.user.fullName}
      description={`Participant record · Slot #${slotNumber}`}
    >
      <div className="space-y-4 pt-1">
        {/* Participant Header Details */}
        <div className="p-3.5 rounded-[12px] bg-canvas dark:bg-[#14171B] border border-line dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-tint text-primary dark:bg-indigo-500/20 dark:text-indigo-300 font-bold flex items-center justify-center text-sm">
              #{slotNumber}
            </div>
            <div>
              <span className="font-heading font-bold text-sm text-ink block">
                {participant.user.fullName}
              </span>
              <span className="text-xs text-muted font-mono">{participant.user.phone}</span>
            </div>
          </div>
          <div>{renderStatusBadge(participant.status)}</div>
        </div>

        {/* Ledger Exposure Standing */}
        {roundStatus === "ACTIVE" && exposure && (
          <div className="p-3.5 rounded-[12px] bg-surface dark:bg-[#171B22] border border-line dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                Current Exposure
              </span>
              <span className="text-[11px] text-muted flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-positive" /> Real-time
              </span>
            </div>
            <div
              className={`text-base font-heading font-extrabold tabular-nums ${
                exposure.owedByGroup
                  ? "text-positive"
                  : exposure.owesGroup
                  ? "text-danger"
                  : "text-muted"
              }`}
            >
              {formatSignedKobo(exposure, { subject: "member", memberName: participant.user.fullName }).text}
            </div>
            <p className="text-xs text-muted">
              {exposure.owedByGroup
                ? "This member has contributed more than they have received."
                : exposure.owesGroup
                ? "This member has collected their pot and is repaying monthly dues."
                : "Member is currently square with the rotation pool."}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-line dark:border-white/10 gap-5 text-xs font-semibold overflow-x-auto no-scrollbar select-none">
          <button
            type="button"
            onClick={() => setActiveTab("contributions")}
            className={cn(
              "relative pb-2.5 transition-colors duration-150 flex items-center gap-1.5 touch-press select-none whitespace-nowrap shrink-0",
              activeTab === "contributions"
                ? "text-primary dark:text-indigo-400 font-bold"
                : "text-muted hover:text-ink"
            )}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Contributions ({contributions?.length || 0})</span>
            {activeTab === "contributions" && (
              <motion.div
                layoutId="participantHistoryTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary dark:bg-indigo-400 rounded-full z-10"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("payouts")}
            className={cn(
              "relative pb-2.5 transition-colors duration-150 flex items-center gap-1.5 touch-press select-none whitespace-nowrap shrink-0",
              activeTab === "payouts"
                ? "text-primary dark:text-indigo-400 font-bold"
                : "text-muted hover:text-ink"
            )}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Payouts ({payouts?.length || 0})</span>
            {activeTab === "payouts" && (
              <motion.div
                layoutId="participantHistoryTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary dark:bg-indigo-400 rounded-full z-10"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("repayments")}
            className={cn(
              "relative pb-2.5 transition-colors duration-150 flex items-center gap-1.5 touch-press select-none whitespace-nowrap shrink-0",
              activeTab === "repayments"
                ? "text-primary dark:text-indigo-400 font-bold"
                : "text-muted hover:text-ink"
            )}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Repayments ({repayments?.length || 0})</span>
            {activeTab === "repayments" && (
              <motion.div
                layoutId="participantHistoryTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary dark:bg-indigo-400 rounded-full z-10"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[300px] overflow-y-auto pr-1">
          {activeTab === "contributions" && (
            <div className="space-y-2">
              {isContributionsLoading ? (
                <div className="py-6 text-center text-xs text-muted">Loading contributions...</div>
              ) : contributions && contributions.length > 0 ? (
                contributions.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-lg border border-line dark:border-white/10 bg-surface dark:bg-[#14171B] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-ink">Monthly Share</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-line/50 dark:bg-white/10 text-muted uppercase">
                          {c.method || "ONLINE"}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted tabular-nums">
                        {new Date(c.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-positive block tabular-nums">
                        +{formatKobo(c.amountKobo)}
                      </span>
                      {c.ledgerTransactionId && (
                        <SimpleTooltip content={`Tx ID: ${c.ledgerTransactionId}`}>
                          <span className="text-[10px] text-muted font-mono cursor-help">
                            Tx: {c.ledgerTransactionId.slice(0, 8)}...
                          </span>
                        </SimpleTooltip>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-muted border border-dashed rounded-lg">
                  No contributions recorded for this participant yet.
                </div>
              )}
            </div>
          )}

          {activeTab === "payouts" && (
            <div className="space-y-2">
              {isPayoutsLoading ? (
                <div className="py-6 text-center text-xs text-muted">Loading disbursements...</div>
              ) : payouts && payouts.length > 0 ? (
                payouts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-lg border border-line dark:border-white/10 bg-surface dark:bg-[#14171B] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-ink">Cycle Pot Payout</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/15 text-accent uppercase font-bold">
                          {p.method || "ONLINE"}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted tabular-nums">
                        {new Date(p.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {p.shortfallKobo > 0 && (
                        <span className="text-[10px] text-warning block mt-0.5">
                          Shortfall owed: {formatKobo(p.shortfallKobo)}
                        </span>
                      )}
                      {p.arrearsWithheldKobo > 0 && (
                        <span className="text-[10px] text-danger block mt-0.5">
                          Arrears withheld: {formatKobo(p.arrearsWithheldKobo)}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-accent block tabular-nums">
                        {formatKobo(p.actualAmountKobo)}
                      </span>
                      <span className="text-[10px] text-muted">
                        of {formatKobo(p.expectedAmountKobo)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-muted border border-dashed rounded-lg">
                  No payouts disbursed to this participant yet.
                </div>
              )}
            </div>
          )}

          {activeTab === "repayments" && (
            <div className="space-y-2">
              {isRepaymentsLoading ? (
                <div className="py-6 text-center text-xs text-muted">Loading repayments...</div>
              ) : repayments && repayments.length > 0 ? (
                repayments.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-lg border border-line dark:border-white/10 bg-surface dark:bg-[#14171B] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-ink block">Exposure Repayment</span>
                      <span className="text-[11px] text-muted tabular-nums">
                        {new Date(r.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-positive block tabular-nums">
                        {formatKobo(r.amountKobo)}
                      </span>
                      {r.method && (
                        <span className="text-[10px] text-muted uppercase">{r.method}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-muted border border-dashed rounded-lg">
                  No post-payout repayments made yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
