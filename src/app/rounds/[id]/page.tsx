"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiGetRound,
  apiGetGroup,
  apiGetPoolBalance,
  apiGetParticipantExposure,
  apiGetCycleContributions,
  apiGetCyclePayout,
  apiActivateRound,
  apiCancelRound,
  apiJoinRound,
  apiLeaveRound,
  apiAddParticipant,
  apiRemoveParticipant,
  apiGetRoundShortfallClaims,
} from "@/lib/api/endpoints";
import { AuthenticatedLayout } from "@/components/common/authenticated-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, RoundStatusBadge, CycleStatusBadge } from "@/components/ui/badge";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { CycleTimeline } from "@/components/rounds/cycle-timeline";
import { ContributeSheet } from "@/components/money/contribute-sheet";
import { PayoutSheet } from "@/components/money/payout-sheet";
import { SwapSheet } from "@/components/rounds/swap-sheet";
import { ExitSheet } from "@/components/rounds/exit-sheet";
import { useAuth } from "@/context/auth-context";
import { formatKobo, formatPoolBalance, formatSignedKobo } from "@/lib/money";
import { getErrorMessage } from "@/lib/api/errors";
import { CycleSummary, ParticipantSummary } from "@/lib/api/types";
import {
  Coins,
  Users,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Play,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Clock,
  UserX,
  CreditCard,
  Plus,
  RefreshCw,
  Info,
  ArrowLeftRight,
  LogOut,
} from "lucide-react";

export default function RoundDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roundId = params.id as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedCycle, setSelectedCycle] = useState<CycleSummary | null>(null);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [isActivateConfirmOpen, setIsActivateConfirmOpen] = useState(false);
  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isExitOpen, setIsExitOpen] = useState(false);
  const [selectedMemberUserId, setSelectedMemberUserId] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Round detail
  const {
    data: round,
    isLoading: isRoundLoading,
    error: roundError,
    refetch: refetchRound,
  } = useQuery({
    queryKey: ["round", roundId],
    queryFn: () => apiGetRound(roundId),
    enabled: !!roundId,
  });

  // Group detail (to get members list for admin assignment and group name)
  const { data: group } = useQuery({
    queryKey: ["group", round?.groupId],
    queryFn: () => apiGetGroup(round!.groupId),
    enabled: !!round?.groupId,
  });

  // Pool balance (ledger liability, displayed positive)
  const { data: poolBalance } = useQuery({
    queryKey: ["pool-balance", roundId],
    queryFn: () => apiGetPoolBalance(roundId),
    enabled: !!roundId && round?.status === "ACTIVE",
  });

  // Shortfall claims
  const { data: shortfallClaims } = useQuery({
    queryKey: ["shortfall-claims", roundId],
    queryFn: () => apiGetRoundShortfallClaims(roundId),
    enabled: !!roundId && round?.status === "ACTIVE",
  });

  // Find user's participant entry
  const myParticipant = round?.participants?.find((p) => p.user.id === user?.id);

  // User's exposure if active
  const { data: myExposure } = useQuery({
    queryKey: ["exposure", myParticipant?.id],
    queryFn: () => apiGetParticipantExposure(myParticipant!.id),
    enabled: !!myParticipant?.id && round?.status === "ACTIVE",
  });

  // Current or selected cycle
  const currentCycle =
    selectedCycle ||
    round?.cycles?.find((c) => c.status === "OPEN") ||
    round?.cycles?.[0] ||
    null;

  // Selected cycle contributions
  const {
    data: cycleContributions,
    isLoading: isContributionsLoading,
    refetch: refetchContributions,
  } = useQuery({
    queryKey: ["cycle-contributions", currentCycle?.id],
    queryFn: () => apiGetCycleContributions(currentCycle!.id),
    enabled: !!currentCycle?.id,
  });

  // Selected cycle payout
  const { data: cyclePayout, refetch: refetchPayout } = useQuery({
    queryKey: ["cycle-payout", currentCycle?.id],
    queryFn: () => apiGetCyclePayout(currentCycle!.id),
    enabled: !!currentCycle?.id,
  });

  // Admin status
  const isAdmin = group?.createdBy === user?.id || round?.createdBy === user?.id;

  // Mutations
  const activateRoundMutation = useMutation({
    mutationFn: () => apiActivateRound(roundId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["round", roundId] });
      setIsActivateConfirmOpen(false);
      setActionError(null);
    },
    onError: (err) => {
      setActionError(getErrorMessage(err));
    },
  });

  const cancelRoundMutation = useMutation({
    mutationFn: () => apiCancelRound(roundId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["round", roundId] });
      setActionError(null);
    },
    onError: (err) => {
      setActionError(getErrorMessage(err));
    },
  });

  const joinRoundMutation = useMutation({
    mutationFn: () => apiJoinRound(roundId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["round", roundId] });
      setActionError(null);
    },
    onError: (err) => {
      setActionError(getErrorMessage(err));
    },
  });

  const leaveRoundMutation = useMutation({
    mutationFn: () => apiLeaveRound(roundId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["round", roundId] });
      setActionError(null);
    },
    onError: (err) => {
      setActionError(getErrorMessage(err));
    },
  });

  const addParticipantMutation = useMutation({
    mutationFn: (userId: string) => apiAddParticipant(roundId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["round", roundId] });
      setIsAddParticipantModalOpen(false);
      setSelectedMemberUserId("");
      setActionError(null);
    },
    onError: (err) => {
      setActionError(getErrorMessage(err));
    },
  });

  const removeParticipantMutation = useMutation({
    mutationFn: (userId: string) => apiRemoveParticipant(roundId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["round", roundId] });
      setActionError(null);
    },
    onError: (err) => {
      setActionError(getErrorMessage(err));
    },
  });

  if (isRoundLoading) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </AuthenticatedLayout>
    );
  }

  if (roundError || !round) {
    return (
      <AuthenticatedLayout>
        <Card className="p-8 text-center space-y-4">
          <p className="text-sm text-danger font-medium">
            {roundError ? getErrorMessage(roundError) : "Round not found."}
          </p>
          <Link href="/groups">
            <Button variant="outline">Back to Circles</Button>
          </Link>
        </Card>
      </AuthenticatedLayout>
    );
  }

  // Check if current user has already contributed to selected cycle
  const hasUserContributedToCycle = cycleContributions?.some(
    (c) => c.participant?.id === user?.id
  );

  // Check if current user is beneficiary of selected cycle
  const isUserBeneficiaryOfCycle = currentCycle?.beneficiary?.id === user?.id;

  // Expected payout calculation
  const participantCount = round.participants?.length || 1;
  const expectedPotKobo = participantCount * round.contributionAmountKobo;
  const actualPotKobo = poolBalance?.balanceKobo
    ? Math.min(expectedPotKobo, Math.abs(poolBalance.balanceKobo))
    : 0;

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Breadcrumb & Header */}
        <div>
          <div className="flex items-center gap-2 text-xs text-muted mb-2">
            <Link href="/groups" className="hover:text-ink">
              Circles
            </Link>
            <span>/</span>
            <Link href={`/groups/${round.groupId}`} className="hover:text-ink font-medium">
              {group?.name || "Circle"}
            </Link>
            <span>/</span>
            <span className="text-ink font-medium">Round Detail</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                  {group?.name || "Savings Round"}
                </h1>
                <RoundStatusBadge status={round.status} />
              </div>
              <p className="text-sm text-muted mt-1">
                Monthly Contribution:{" "}
                <strong className="text-ink tabular-nums">
                  {formatKobo(round.contributionAmountKobo)}
                </strong>
              </p>
            </div>

            {/* Top actions */}
            <div className="flex items-center gap-2">
              {round.status === "FORMING" && (
                <>
                  {myParticipant ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => leaveRoundMutation.mutate()}
                      isLoading={leaveRoundMutation.isPending}
                      loadingText="Leaving..."
                    >
                      Leave Round
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => joinRoundMutation.mutate()}
                      isLoading={joinRoundMutation.isPending}
                      loadingText="Joining..."
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Join Round
                    </Button>
                  )}

                  {isAdmin && (
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => {
                        setActionError(null);
                        setIsActivateConfirmOpen(true);
                      }}
                      disabled={round.participants.length < 2}
                    >
                      <Play className="w-4 h-4 mr-1.5" />
                      Activate Round
                    </Button>
                  )}
                </>
              )}

              {round.status === "ACTIVE" && myParticipant && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSwapOpen(true)}
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 mr-1" />
                    Swap Slot
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExitOpen(true)}
                    className="text-muted hover:text-danger"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1" />
                    Exit Round
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {actionError && (
          <div className="p-3.5 rounded-[10px] bg-danger/10 border border-danger/20 flex items-start gap-2.5 text-xs sm:text-sm text-danger font-medium leading-snug">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{actionError}</span>
          </div>
        )}

        {/* ===================== FORMING STATUS ===================== */}
        {round.status === "FORMING" && (
          <div className="space-y-6">
            <Card className="p-6 bg-accent-tint/40 border-accent/30">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-sm text-ink">
                    Round is in Forming Stage
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Participants are being added and assigned positions. Once ready, activating the
                    round will generate fixed monthly cycles and freeze all terms.
                    {round.participants.length < 2 && " Minimum 2 participants required to activate."}
                  </p>
                </div>
              </div>
            </Card>

            {/* Participants Setup List */}
            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-ink">
                    Round Participants ({round.participants.length})
                  </h3>
                  <p className="text-xs text-muted">
                    Positions determine the sequence in which each member collects the pot.
                  </p>
                </div>

                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActionError(null);
                      setIsAddParticipantModalOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Member
                  </Button>
                )}
              </div>

              <div className="space-y-2.5 pt-2">
                {round.participants.length > 0 ? (
                  round.participants.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-[10px] border border-line bg-surface flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-primary-tint text-primary text-xs font-bold flex items-center justify-center tabular-nums">
                          #{p.position || idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-semibold text-sm text-ink">
                              {p.user.fullName}
                            </span>
                            {p.user.id === user?.id && (
                              <span className="text-[10px] bg-line/60 text-muted px-1.5 py-0.5 rounded font-medium">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted tabular-nums">
                            {p.user.phone}
                          </span>
                        </div>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => removeParticipantMutation.mutate(p.user.id)}
                          title="Remove participant"
                          className="p-1.5 text-muted hover:text-danger rounded-lg transition-colors touch-press"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-muted border-dashed border-2 rounded-xl">
                    No participants added yet. Click &quot;Join Round&quot; or &quot;Add Member&quot; to begin.
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ===================== ACTIVE STATUS (CENTREPIECE) ===================== */}
        {round.status === "ACTIVE" && (
          <div className="space-y-6">
            {/* Hero Pot & Obligation Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Pot Balance Card */}
              <Card className="p-5 sm:p-6 bg-primary text-white border-transparent shadow-elevation sm:col-span-2 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/70 block mb-1">
                    Current Circle Pot
                  </span>
                  <div className="font-heading font-extrabold text-3xl sm:text-4xl text-white tabular-nums tracking-tight">
                    {formatPoolBalance(poolBalance?.balanceKobo)}
                  </div>
                  <span className="text-xs text-white/80 block mt-2">
                    Expected pot per month:{" "}
                    <strong className="text-white tabular-nums">
                      {formatKobo(expectedPotKobo)}
                    </strong>{" "}
                    ({round.participants.length} members × {formatKobo(round.contributionAmountKobo)})
                  </span>
                </div>

                <div className="pt-4 mt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/80">
                  <span>
                    Your Slot:{" "}
                    <strong className="text-white">
                      {myParticipant ? `Position #${myParticipant.position}` : "Not a participant"}
                    </strong>
                  </span>
                  <span>
                    {round.cycles?.filter((c) => c.status === "PAID").length || 0} of{" "}
                    {round.cycles?.length || 0} cycles paid
                  </span>
                </div>
              </Card>

              {/* Exposure / Obligation Card */}
              <Card className="p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1">
                    Your Standing
                  </span>
                  {myExposure ? (
                    <div className="mt-2 space-y-2">
                      <div
                        className={`text-sm font-bold font-heading leading-snug ${
                          myExposure.owedByGroup
                            ? "text-positive"
                            : myExposure.owesGroup
                            ? "text-danger"
                            : "text-muted"
                        }`}
                      >
                        {formatSignedKobo(myExposure.exposureKobo).text}
                      </div>
                      <p className="text-xs text-muted leading-relaxed">
                        {myExposure.owedByGroup
                          ? "You have contributed more than you've collected so far."
                          : myExposure.owesGroup
                          ? "You collected your payout and are paying your remaining monthly dues."
                          : "Your contributions and collections are currently square."}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted mt-2">
                      {myParticipant ? "Calculating exposure..." : "You are observing this round."}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-line/60 flex items-center justify-between text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-positive" />
                    Ledger balanced
                  </span>
                  {myParticipant && (
                    <Link
                      href={`/groups/${round.groupId}`}
                      className="text-primary font-semibold hover:underline"
                    >
                      Circle info
                    </Link>
                  )}
                </div>
              </Card>
            </div>

            {/* Cycle Timeline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-ink">
                  Rotation Schedule
                </h3>
                <span className="text-xs text-muted">Select a month to view details</span>
              </div>

              <CycleTimeline
                cycles={round.cycles || []}
                activeCycleId={currentCycle?.id}
                onSelectCycle={(c) => setSelectedCycle(c)}
                currentUserId={user?.id}
              />
            </div>

            {/* Selected Cycle Detail Card */}
            {currentCycle && (
              <Card className="p-5 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line/60">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-extrabold text-xl text-ink">
                        Month {currentCycle.cycleNumber} Cycle Detail
                      </h3>
                      <CycleStatusBadge status={currentCycle.status} />
                    </div>
                    <p className="text-xs text-muted">
                      Due date:{" "}
                      <strong className="text-ink tabular-nums">
                        {currentCycle.dueOn || "—"}
                      </strong>{" "}
                      · Payout scheduled:{" "}
                      <strong className="text-ink tabular-nums">
                        {currentCycle.payoutOn || "—"}
                      </strong>
                    </p>
                  </div>

                  {/* Actions for this cycle */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {currentCycle.status === "OPEN" && !hasUserContributedToCycle && (
                      <Button
                        variant="primary"
                        size="default"
                        onClick={() => setIsContributeOpen(true)}
                      >
                        <CreditCard className="w-4 h-4 mr-1.5" />
                        Contribute {formatKobo(round.contributionAmountKobo)}
                      </Button>
                    )}

                    {hasUserContributedToCycle && (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-positive/10 text-positive font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        You Paid ✓
                      </span>
                    )}

                    {/* Collect pot button */}
                    {(currentCycle.status === "OPEN" || currentCycle.status === "PAID") &&
                      (isUserBeneficiaryOfCycle || isAdmin) &&
                      !cyclePayout && (
                        <Button
                          variant="accent"
                          size="default"
                          onClick={() => setIsPayoutOpen(true)}
                        >
                          <Coins className="w-4 h-4 mr-1.5" />
                          Collect Pot ({formatKobo(actualPotKobo)})
                        </Button>
                      )}
                  </div>
                </div>

                {/* Beneficiary Banner */}
                <div className="p-4 rounded-[12px] bg-canvas border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-tint text-accent flex items-center justify-center font-bold text-sm">
                      {currentCycle.beneficiary?.fullName?.charAt(0) || "?"}
                    </div>
                    <div>
                      <span className="text-xs text-muted block">This Month&apos;s Beneficiary</span>
                      <span className="font-heading font-bold text-base text-ink">
                        {currentCycle.beneficiary?.fullName || "Unassigned"}
                        {isUserBeneficiaryOfCycle && " (You)"}
                      </span>
                    </div>
                  </div>

                  {cyclePayout ? (
                    <div className="text-right">
                      <span className="text-xs text-muted block">Payout Collected</span>
                      <span className="font-heading font-extrabold text-base text-positive tabular-nums">
                        {formatKobo(cyclePayout.actualAmountKobo)}
                      </span>
                    </div>
                  ) : (
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-muted block">Expected Payout</span>
                      <span className="font-heading font-bold text-base text-ink tabular-nums">
                        {formatKobo(expectedPotKobo)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Contributions List for this Cycle */}
                <div>
                  <h4 className="font-heading font-bold text-sm text-ink mb-3">
                    Member Contributions ({cycleContributions?.length || 0} /{" "}
                    {round.participants.length} paid)
                  </h4>

                  <div className="space-y-2">
                    {round.participants.map((p) => {
                      const contribution = cycleContributions?.find(
                        (c) => c.participant?.id === p.user.id
                      );
                      const isPaid = !!contribution;

                      return (
                        <div
                          key={p.id}
                          className="p-3 rounded-[10px] border border-line bg-surface flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-line/50 text-ink flex items-center justify-center text-xs font-bold">
                              {p.user.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-xs sm:text-sm text-ink">
                                  {p.user.fullName}
                                </span>
                                {p.user.id === user?.id && (
                                  <span className="text-[10px] bg-line/60 text-muted px-1 rounded">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-muted tabular-nums">
                                Position #{p.position}
                              </span>
                            </div>
                          </div>

                          <div>
                            {isPaid ? (
                              <div className="text-right">
                                <span className="text-xs font-bold text-positive block tabular-nums">
                                  {formatKobo(contribution.amountKobo)}
                                </span>
                                <span className="text-[10px] text-muted uppercase">
                                  {contribution.method || "Paid"} ✓
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-muted bg-canvas px-2.5 py-1 rounded-full border border-line">
                                Unpaid
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}

            {/* Shortfall Claims Section (if any claims exist) */}
            {shortfallClaims && shortfallClaims.length > 0 && (
              <Card className="p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <h4 className="font-heading font-bold text-sm text-ink">
                    Shortfall Claims ({shortfallClaims.length})
                  </h4>
                </div>
                <p className="text-xs text-muted">
                  Claims recorded in favour of members who were underpaid because others missed contributions. Claims get settled automatically from recovered arrears.
                </p>

                <div className="space-y-2 pt-1">
                  {shortfallClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className="p-3 rounded-lg border border-line bg-canvas flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-ink block">
                          {claim.participant?.fullName || "Member"}
                        </span>
                        <span className="text-muted">
                          Month {claim.cycleId ? "Cycle" : ""}
                        </span>
                      </div>
                      <div className="text-right tabular-nums">
                        <span className="font-bold text-warning block">
                          {formatKobo(claim.outstandingKobo)} owed
                        </span>
                        <span className="text-muted text-[11px]">
                          Settled: {formatKobo(claim.settledAmountKobo)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Modal: Irreversible Activation Warning */}
        <Modal
          isOpen={isActivateConfirmOpen}
          onClose={() => setIsActivateConfirmOpen(false)}
          title="Activate Round Terms"
          description="Activation freezes all round terms and cannot be reversed."
        >
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-xs sm:text-sm text-ink flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
              <div>
                <strong className="block text-danger font-semibold">Important Backend Notice</strong>
                Once activated:
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-muted">
                  <li>Payout positions are permanently assigned</li>
                  <li>Monthly cycle dates are generated on the ledger</li>
                  <li>Contribution amounts ({formatKobo(round.contributionAmountKobo)}) freeze</li>
                  <li>Members cannot simply be removed without standard exit flows</li>
                </ul>
              </div>
            </div>

            <p className="text-xs text-muted">
              Ensure all {round.participants.length} participants have confirmed their slots and agreement before proceeding.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/60">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsActivateConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => activateRoundMutation.mutate()}
                isLoading={activateRoundMutation.isPending}
                loadingText="Activating..."
              >
                Confirm & Activate
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal: Add Participant (Admin) */}
        <Modal
          isOpen={isAddParticipantModalOpen}
          onClose={() => setIsAddParticipantModalOpen(false)}
          title="Add Participant to Round"
          description="Select a circle member to join this round."
        >
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Circle Member
              </label>
              <select
                value={selectedMemberUserId}
                onChange={(e) => setSelectedMemberUserId(e.target.value)}
                className="w-full min-h-[44px] rounded-[10px] border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select a member...</option>
                {group?.members
                  ?.filter((m) => !round.participants.some((p) => p.user.id === (m.user?.id || m.userId)))
                  .map((m) => {
                    const mId = m.user?.id || m.userId || "";
                    return (
                      <option key={mId} value={mId}>
                        {m.user.fullName} ({m.user.phone})
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/60">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddParticipantModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={!selectedMemberUserId}
                onClick={() => addParticipantMutation.mutate(selectedMemberUserId)}
                isLoading={addParticipantMutation.isPending}
                loadingText="Adding..."
              >
                Add Participant
              </Button>
            </div>
          </div>
        </Modal>

        {/* Contribute Confirmation Sheet */}
        {currentCycle && (
          <ContributeSheet
            isOpen={isContributeOpen}
            onClose={() => setIsContributeOpen(false)}
            cycleId={currentCycle.id}
            cycleNumber={currentCycle.cycleNumber}
            contributionAmountKobo={round.contributionAmountKobo}
            isAdmin={isAdmin}
            members={group?.members}
            onSuccess={() => {
              refetchContributions();
              refetchRound();
              queryClient.invalidateQueries({ queryKey: ["pool-balance", roundId] });
              queryClient.invalidateQueries({ queryKey: ["exposure", myParticipant?.id] });
            }}
          />
        )}

        {/* Payout Confirmation Sheet */}
        {currentCycle && currentCycle.beneficiary && (
          <PayoutSheet
            isOpen={isPayoutOpen}
            onClose={() => setIsPayoutOpen(false)}
            cycleId={currentCycle.id}
            cycleNumber={currentCycle.cycleNumber}
            expectedBeneficiaryUserId={currentCycle.beneficiary.id}
            beneficiaryName={currentCycle.beneficiary.fullName}
            expectedAmountKobo={expectedPotKobo}
            actualAmountKobo={actualPotKobo}
            shortfallKobo={Math.max(0, expectedPotKobo - actualPotKobo)}
            onSuccess={() => {
              refetchPayout();
              refetchRound();
              queryClient.invalidateQueries({ queryKey: ["pool-balance", roundId] });
            }}
          />
        )}

        {/* Swap Sheet */}
        <SwapSheet
          isOpen={isSwapOpen}
          onClose={() => setIsSwapOpen(false)}
          roundId={roundId}
          currentParticipant={myParticipant}
          participants={round.participants || []}
        />

        {/* Exit Sheet */}
        <ExitSheet
          isOpen={isExitOpen}
          onClose={() => setIsExitOpen(false)}
          roundId={roundId}
          participantId={myParticipant?.id}
        />
      </div>
    </AuthenticatedLayout>
  );
}
