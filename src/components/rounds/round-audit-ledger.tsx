"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SimpleTooltip } from "@/components/ui/tooltip";
import {
  apiGetRoundContributions,
  apiGetRoundPayouts,
  apiGetRoundShortfallClaims,
  apiGetOpenShortfallClaims,
  apiGetMyShortfallClaims,
  apiGetRoundRefunds,
  apiGetRoundBuyIns,
} from "@/lib/api/endpoints";
import { formatKobo } from "@/lib/money";
import {
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  CheckCircle2,
  Clock,
  Filter,
  Copy,
} from "lucide-react";

interface RoundAuditLedgerProps {
  roundId: string;
  currentUserId?: string;
}

export function RoundAuditLedger({ roundId, currentUserId }: RoundAuditLedgerProps) {
  const [activeLedgerTab, setActiveLedgerTab] = useState<
    "contributions" | "payouts" | "claims" | "settlements"
  >("contributions");
  const [claimsFilter, setClaimsFilter] = useState<"all" | "open" | "mine">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Queries
  const { data: contributions, isLoading: isContribLoading } = useQuery({
    queryKey: ["round-contributions", roundId],
    queryFn: () => apiGetRoundContributions(roundId),
    enabled: activeLedgerTab === "contributions",
  });

  const { data: payouts, isLoading: isPayoutsLoading } = useQuery({
    queryKey: ["round-payouts", roundId],
    queryFn: () => apiGetRoundPayouts(roundId),
    enabled: activeLedgerTab === "payouts",
  });

  const { data: allClaims, isLoading: isAllClaimsLoading } = useQuery({
    queryKey: ["round-shortfall-claims", roundId],
    queryFn: () => apiGetRoundShortfallClaims(roundId),
    enabled: activeLedgerTab === "claims" && claimsFilter === "all",
  });

  const { data: openClaims, isLoading: isOpenClaimsLoading } = useQuery({
    queryKey: ["round-open-shortfall-claims", roundId],
    queryFn: () => apiGetOpenShortfallClaims(roundId),
    enabled: activeLedgerTab === "claims" && claimsFilter === "open",
  });

  const { data: myClaims, isLoading: isMyClaimsLoading } = useQuery({
    queryKey: ["round-my-shortfall-claims", roundId],
    queryFn: () => apiGetMyShortfallClaims(roundId),
    enabled: activeLedgerTab === "claims" && claimsFilter === "mine",
  });

  const { data: refunds, isLoading: isRefundsLoading } = useQuery({
    queryKey: ["round-refunds", roundId],
    queryFn: () => apiGetRoundRefunds(roundId),
    enabled: activeLedgerTab === "settlements",
  });

  const { data: buyIns, isLoading: isBuyInsLoading } = useQuery({
    queryKey: ["round-buy-ins", roundId],
    queryFn: () => apiGetRoundBuyIns(roundId),
    enabled: activeLedgerTab === "settlements",
  });

  const displayedClaims =
    claimsFilter === "open"
      ? openClaims
      : claimsFilter === "mine"
      ? myClaims
      : allClaims;
  const isClaimsLoading =
    claimsFilter === "open"
      ? isOpenClaimsLoading
      : claimsFilter === "mine"
      ? isMyClaimsLoading
      : isAllClaimsLoading;

  return (
    <Card className="p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary dark:text-indigo-400" />
            <h3 className="font-heading font-extrabold text-lg text-ink">
              Round Financial Audit & Ledgers
            </h3>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Cryptographically sealed, immutable double-entry transaction record.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-canvas dark:bg-[#14171B] border border-line/60 dark:border-white/10 text-xs font-semibold self-start sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveLedgerTab("contributions")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeLedgerTab === "contributions"
                ? "bg-surface dark:bg-[#1E232B] text-primary dark:text-indigo-300 shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Contributions
          </button>

          <button
            type="button"
            onClick={() => setActiveLedgerTab("payouts")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeLedgerTab === "payouts"
                ? "bg-surface dark:bg-[#1E232B] text-primary dark:text-indigo-300 shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Payouts
          </button>

          <button
            type="button"
            onClick={() => setActiveLedgerTab("claims")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeLedgerTab === "claims"
                ? "bg-surface dark:bg-[#1E232B] text-primary dark:text-indigo-300 shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Shortfall Claims
          </button>

          <button
            type="button"
            onClick={() => setActiveLedgerTab("settlements")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeLedgerTab === "settlements"
                ? "bg-surface dark:bg-[#1E232B] text-primary dark:text-indigo-300 shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Refunds & Buy-Ins
          </button>
        </div>
      </div>

      {/* 1. CONTRIBUTIONS TAB */}
      {activeLedgerTab === "contributions" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Total Recorded Payments: {contributions?.length || 0}</span>
            <span className="text-[11px]">All values verified by backend ledger</span>
          </div>

          {isContribLoading ? (
            <div className="py-12 text-center text-xs text-muted">Loading contribution audit ledger...</div>
          ) : contributions && contributions.length > 0 ? (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {contributions.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-[10px] border border-line dark:border-white/10 bg-surface dark:bg-[#171B22] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink text-sm">
                          {c.participant?.fullName || "Member"}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-line/60 dark:bg-white/10 text-muted font-bold uppercase">
                          {c.method || "ONLINE"}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted flex items-center gap-2 mt-0.5">
                        <span className="tabular-nums">
                          {new Date(c.createdAt).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {c.ledgerTransactionId && (
                          <SimpleTooltip content="Click to copy Transaction ID">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(c.ledgerTransactionId!)}
                              className="font-mono text-[10px] text-primary hover:underline flex items-center gap-1"
                              aria-label="Click to copy Transaction ID"
                            >
                              <Copy className="w-3 h-3" />
                              {copiedId === c.ledgerTransactionId
                                ? "Copied!"
                                : `Tx: ${c.ledgerTransactionId.slice(0, 8)}...`}
                            </button>
                          </SimpleTooltip>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right pl-12 sm:pl-0">
                    <span className="font-heading font-extrabold text-sm text-positive block tabular-nums">
                      +{formatKobo(c.amountKobo)}
                    </span>
                    <span className="text-[11px] text-muted">Contribution share</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-muted border border-dashed rounded-xl">
              No contributions have been recorded for this round yet.
            </div>
          )}
        </div>
      )}

      {/* 2. PAYOUTS TAB */}
      {activeLedgerTab === "payouts" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Total Pot Disbursements: {payouts?.length || 0}</span>
          </div>

          {isPayoutsLoading ? (
            <div className="py-12 text-center text-xs text-muted">Loading payouts audit ledger...</div>
          ) : payouts && payouts.length > 0 ? (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {payouts.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-[10px] border border-line dark:border-white/10 bg-surface dark:bg-[#171B22] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent/15 text-accent dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink text-sm">
                          {p.beneficiary?.fullName || "Beneficiary"}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/15 text-accent font-bold uppercase">
                          {p.method || "ONLINE"}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted flex items-center gap-2 mt-0.5">
                        <span className="tabular-nums">
                          {new Date(p.createdAt).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {p.ledgerTransactionId ? (
                          <SimpleTooltip content="Click to copy Transaction ID">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(p.ledgerTransactionId!)}
                              className="font-mono text-[10px] text-primary hover:underline flex items-center gap-1"
                              aria-label="Click to copy Transaction ID"
                            >
                              <Copy className="w-3 h-3" />
                              {copiedId === p.ledgerTransactionId
                                ? "Copied!"
                                : `Tx: ${p.ledgerTransactionId.slice(0, 8)}...`}
                            </button>
                          </SimpleTooltip>
                        ) : (
                          <span className="text-[10px] text-muted italic">Fully withheld</span>
                        )}
                      </div>
                      {(p.shortfallKobo > 0 || p.arrearsWithheldKobo > 0) && (
                        <div className="flex items-center gap-3 mt-1 text-[11px]">
                          {p.shortfallKobo > 0 && (
                            <span className="text-warning">
                              Shortfall claim: <strong>{formatKobo(p.shortfallKobo)}</strong>
                            </span>
                          )}
                          {p.arrearsWithheldKobo > 0 && (
                            <span className="text-danger">
                              Arrears deducted: <strong>{formatKobo(p.arrearsWithheldKobo)}</strong>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-left sm:text-right pl-12 sm:pl-0">
                    <span className="font-heading font-extrabold text-sm text-accent block tabular-nums">
                      {formatKobo(p.actualAmountKobo)}
                    </span>
                    <span className="text-[11px] text-muted">
                      Expected pot: {formatKobo(p.expectedAmountKobo)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-muted border border-dashed rounded-xl">
              No cycle payouts have been disbursed in this round yet.
            </div>
          )}
        </div>
      )}

      {/* 3. SHORTFALL CLAIMS TAB */}
      {activeLedgerTab === "claims" && (
        <div className="space-y-3">
          {/* Claims Filter Sub-Selector */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted font-medium">Filter Claims:</span>
              <div className="inline-flex rounded-lg border border-line dark:border-white/10 p-0.5 bg-canvas dark:bg-[#14171B]">
                <button
                  type="button"
                  onClick={() => setClaimsFilter("all")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    claimsFilter === "all"
                      ? "bg-surface dark:bg-[#1E232B] text-ink shadow-xs"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  All Claims ({allClaims?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setClaimsFilter("open")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    claimsFilter === "open"
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-xs"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  Open Only ({openClaims?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setClaimsFilter("mine")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    claimsFilter === "mine"
                      ? "bg-primary-tint text-primary dark:text-indigo-400 shadow-xs"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  My Claims ({myClaims?.length || 0})
                </button>
              </div>
            </div>
          </div>

          {isClaimsLoading ? (
            <div className="py-12 text-center text-xs text-muted">Loading shortfall claims...</div>
          ) : displayedClaims && displayedClaims.length > 0 ? (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {displayedClaims.map((claim) => {
                const isFullySettled = claim.outstandingKobo === 0;

                return (
                  <div
                    key={claim.id}
                    className="p-3.5 rounded-[10px] border border-line dark:border-white/10 bg-surface dark:bg-[#171B22] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink text-sm">
                          {claim.participant?.fullName || "Member"}
                        </span>
                        {isFullySettled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Fully Settled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                            <Clock className="w-3 h-3" /> Outstanding
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted flex items-center gap-3 mt-1">
                        <span>
                          Raised:{" "}
                          {new Date(claim.createdAt).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {claim.settledAt && (
                          <span className="text-positive">
                            Settled:{" "}
                            {new Date(claim.settledAt).toLocaleDateString("en-NG", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="font-heading font-extrabold text-sm text-warning block tabular-nums">
                        {formatKobo(claim.outstandingKobo)} owed
                      </span>
                      <span className="text-[11px] text-muted">
                        Settled: {formatKobo(claim.settledAmountKobo)} of {formatKobo(claim.amountKobo)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-muted border border-dashed rounded-xl">
              No shortfall claims matching this filter.
            </div>
          )}
        </div>
      )}

      {/* 4. SETTLEMENTS (REFUNDS & BUY-INS) TAB */}
      {activeLedgerTab === "settlements" && (
        <div className="space-y-6">
          {/* Refunds Sub-section */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-muted flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-primary" />
              Vacant Cycle Refunds ({refunds?.length || 0})
            </h4>

            {isRefundsLoading ? (
              <div className="py-6 text-center text-xs text-muted">Loading refunds...</div>
            ) : refunds && refunds.length > 0 ? (
              <div className="space-y-2">
                {refunds.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-lg border border-line dark:border-white/10 bg-surface dark:bg-[#171B22] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-ink block">
                        Refund to {r.recipient?.fullName || "Leaver"}
                      </span>
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
                        +{formatKobo(r.actualAmountKobo)}
                      </span>
                      {r.shortfallKobo > 0 && (
                        <span className="text-[10px] text-warning block">
                          Shortfall: {formatKobo(r.shortfallKobo)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted border border-dashed rounded-lg">
                No vacant-cycle refunds recorded yet.
              </div>
            )}
          </div>

          {/* Buy-Ins Sub-section */}
          <div className="space-y-3 pt-3 border-t border-line/60 dark:border-white/10">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-muted flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-positive" />
              Replacement Buy-Ins ({buyIns?.length || 0})
            </h4>

            {isBuyInsLoading ? (
              <div className="py-6 text-center text-xs text-muted">Loading buy-ins...</div>
            ) : buyIns && buyIns.length > 0 ? (
              <div className="space-y-2">
                {buyIns.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-lg border border-line dark:border-white/10 bg-surface dark:bg-[#171B22] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-ink block">
                        {b.replacement?.fullName || "Replacement"} bought in for {b.leaver?.fullName || "Leaver"}
                      </span>
                      <span className="text-[11px] text-muted tabular-nums">
                        {new Date(b.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })} · Method: {b.method || "ONLINE"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-positive block tabular-nums">
                        {formatKobo(b.amountKobo)}
                      </span>
                      <span className="text-[10px] text-muted">Slot transferred</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted border border-dashed rounded-lg">
                No replacement buy-ins recorded yet.
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
