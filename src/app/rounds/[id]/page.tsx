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
  apiGetRoundExits,
  apiGetCycleSettlement,
} from "@/lib/api/endpoints";
import { AuthenticatedLayout } from "@/components/common/authenticated-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, RoundStatusBadge, CycleStatusBadge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { SimpleTooltip } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CycleTimeline } from "@/components/rounds/cycle-timeline";
import { ContributeSheet } from "@/components/money/contribute-sheet";
import { PayoutSheet } from "@/components/money/payout-sheet";
import { HeroPotCard } from "@/components/money/hero-pot-card";
import { SwapSheet } from "@/components/rounds/swap-sheet";
import { ExitSheet } from "@/components/rounds/exit-sheet";
import { EditRoundModal } from "@/components/rounds/edit-round-modal";
import { BuyInModal } from "@/components/rounds/buy-in-modal";
import { SettleCycleModal } from "@/components/rounds/settle-cycle-modal";
import { ParticipantHistoryModal } from "@/components/rounds/participant-history-modal";
import { RoundAuditLedger } from "@/components/rounds/round-audit-ledger";
import { DeleteRoundModal } from "@/components/rounds/delete-round-modal";
import { useAuth } from "@/context/auth-context";
import { formatKobo, formatPoolBalance, formatSignedKobo } from "@/lib/money";
import { getErrorMessage } from "@/lib/api/errors";
import { toast } from "sonner";
import {
  CycleSummary,
  ParticipantSummary,
  ExitRequestSummary,
  VacantCycleSummary,
  UserSummary,
} from "@/lib/api/types";
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
  XCircle,
  Sliders,
  Scale,
  Eye,
  CalendarDays,
  FileText,
  MoreVertical,
  Trash2,
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
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isEditRoundTermsOpen, setIsEditRoundTermsOpen] = useState(false);
  const [isDeleteRoundModalOpen, setIsDeleteRoundModalOpen] = useState(false);
  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isExitOpen, setIsExitOpen] = useState(false);
  const [isBuyInOpen, setIsBuyInOpen] = useState(false);
  const [selectedExitForBuyIn, setSelectedExitForBuyIn] = useState<ExitRequestSummary | null>(null);
  const [isSettleCycleOpen, setIsSettleCycleOpen] = useState(false);
  const [selectedMemberUserId, setSelectedMemberUserId] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedParticipantForHistory, setSelectedParticipantForHistory] = useState<ParticipantSummary | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<"cycles" | "ledger">("cycles");

  // Confirmation modal states
  const [participantToRemove, setParticipantToRemove] = useState<ParticipantSummary | null>(null);
  const [isLeaveRoundModalOpen, setIsLeaveRoundModalOpen] = useState(false);

  // Round detail
  const {
    data: round,
    isLoading: isRoundLoading,
    error: roundError,
    refetch: refetchRound,
  } = useQuery({
    queryKey: ["round", roundId],
    queryFn: () => apiGetRound(roundId),
    enabled: !!user && !!roundId,
  });

  // Group detail (to get members list for admin assignment and group name)
  const { data: group } = useQuery({
    queryKey: ["group", round?.groupId],
    queryFn: () => apiGetGroup(round!.groupId),
    enabled: !!user && !!round?.groupId,
  });

  const isCircleArchived = Boolean(group?.archivedAt);

  // Pool balance (ledger liability, displayed positive)
  const { data: poolBalance } = useQuery({
    queryKey: ["pool-balance", roundId],
    queryFn: () => apiGetPoolBalance(roundId),
    enabled: !!user && !!roundId && round?.status === "ACTIVE",
  });

  // Shortfall claims
  const { data: shortfallClaims } = useQuery({
    queryKey: ["shortfall-claims", roundId],
    queryFn: () => apiGetRoundShortfallClaims(roundId),
    enabled: !!user && !!roundId && round?.status === "ACTIVE",
  });

  // Find user's participant entry
  const myParticipant = round?.participants?.find((p) => p.user.id === user?.id);

  // User's exposure if active
  const { data: myExposure } = useQuery({
    queryKey: ["exposure", myParticipant?.id],
    queryFn: () => apiGetParticipantExposure(myParticipant!.id),
    enabled: !!user && !!myParticipant?.id && round?.status === "ACTIVE",
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
    enabled: !!user && !!currentCycle?.id,
  });

  // Selected cycle payout
  const { data: cyclePayout, refetch: refetchPayout } = useQuery({
    queryKey: ["cycle-payout", currentCycle?.id],
    queryFn: () => apiGetCyclePayout(currentCycle!.id),
    enabled: !!user && !!currentCycle?.id,
  });

  // Round exits for admins (to offer buy-ins)
  const { data: roundExits, refetch: refetchRoundExits } = useQuery({
    queryKey: ["round-exits", roundId],
    queryFn: () => apiGetRoundExits(roundId),
    enabled: !!user && !!roundId && round?.status === "ACTIVE",
  });

  // Vacant settlement preview for selected cycle
  const { data: vacantSettlement, refetch: refetchSettlement } = useQuery({
    queryKey: ["cycle-settlement", currentCycle?.id],
    queryFn: () => apiGetCycleSettlement(currentCycle!.id),
    enabled: !!currentCycle?.id && currentCycle?.status === "VACANT",
  });

  // Admin status
  const isAdmin = group?.createdBy === user?.id || round?.createdBy === user?.id;

  // Eligible replacement members from the circle who are not yet participating in this round
  const eligibleReplacements: UserSummary[] =
    group?.members
      ?.map((m) => m.user)
      .filter((u): u is UserSummary => !!u && !round?.participants?.some((p) => p.user?.id === u.id)) || [];

  const pendingExits = roundExits?.filter((e) => e.status === "PENDING_SETTLEMENT") || [];

  // Mutations
  const activateRoundMutation = useMutation({
    mutationFn: () => apiActivateRound(roundId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["round", roundId] });
      setIsActivateConfirmOpen(false);
      toast.success("Round activated! Monthly cycle schedule is live.");
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
      toast.info("Round has been cancelled.");
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
      toast.success("You joined this savings round!");
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
      setIsLeaveRoundModalOpen(false);
      toast.info("You left this forming round.");
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
      toast.success("Participant added to round.");
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
      setParticipantToRemove(null);
      toast.info("Participant removed from round.");
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
            <div className="flex items-center gap-2 shrink-0">
              {round.status === "FORMING" && (
                <>
                  {!myParticipant && (
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
                    <SimpleTooltip
                      content={
                        round.participants.length < 2
                          ? "At least 2 participants required to activate"
                          : "Activate round and begin cycle rotation"
                      }
                    >
                      <span className="inline-block">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setActionError(null);
                            setIsActivateConfirmOpen(true);
                          }}
                          disabled={round.participants.length < 2}
                        >
                          <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                          Activate Round
                        </Button>
                      </span>
                    </SimpleTooltip>
                  )}

                  {(isAdmin || myParticipant) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs font-semibold text-muted hover:text-ink shadow-xs"
                          aria-label="Manage round options"
                        >
                          <MoreVertical className="w-3.5 h-3.5 text-muted" />
                          <span>Manage</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isAdmin && (
                          <DropdownMenuItem
                            onClick={() => {
                              setActionError(null);
                              setIsEditRoundTermsOpen(true);
                            }}
                          >
                            <Sliders className="w-3.5 h-3.5 mr-1 text-muted" />
                            <span>Edit Terms</span>
                          </DropdownMenuItem>
                        )}

                        {isAdmin && myParticipant && <DropdownMenuSeparator />}

                        {myParticipant && (
                          <DropdownMenuItem
                            variant="danger"
                            onClick={() => setIsLeaveRoundModalOpen(true)}
                          >
                            <UserX className="w-3.5 h-3.5 mr-1" />
                            <span>Leave Round</span>
                          </DropdownMenuItem>
                        )}

                        {isAdmin && (
                          <DropdownMenuItem
                            variant="danger"
                            onClick={() => {
                              setActionError(null);
                              setIsCancelConfirmOpen(true);
                            }}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            <span>Cancel Round</span>
                          </DropdownMenuItem>
                        )}

                        {/* Removal item sits last, separated from others, in destructive style */}
                        {isAdmin && !isCircleArchived && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="danger"
                              onClick={() => {
                                setActionError(null);
                                setIsDeleteRoundModalOpen(true);
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              <span>Delete Round</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              )}

              {/* Cancelled Round: admin can delete if circle not archived */}
              {round.status === "CANCELLED" && isAdmin && !isCircleArchived && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs font-semibold text-muted hover:text-ink shadow-xs"
                      aria-label="Manage cancelled round"
                    >
                      <MoreVertical className="w-3.5 h-3.5 text-muted" />
                      <span>Manage</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      variant="danger"
                      onClick={() => {
                        setActionError(null);
                        setIsDeleteRoundModalOpen(true);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      <span>Delete Round</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {round.status === "ACTIVE" && myParticipant && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSwapOpen(true)}
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5" />
                    Swap Slot
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs font-semibold text-muted hover:text-ink shadow-xs"
                        aria-label="Round options"
                      >
                        <MoreVertical className="w-3.5 h-3.5 text-muted" />
                        <span>Manage</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        variant="danger"
                        onClick={() => setIsExitOpen(true)}
                      >
                        <LogOut className="w-3.5 h-3.5 mr-1" />
                        <span>Exit Round</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
            <Card className="p-5 sm:p-6 bg-surface border-line shadow-card">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-primary-tint text-primary flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-sm text-ink">
                    Round is in Forming Stage
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Participants are being added and assigned positions. Once ready, activating the
                    round will generate fixed monthly cycles and freeze all terms.
                    {round.participants.length < 2 && (
                      <span className="text-accent font-semibold block mt-1">
                        Minimum 2 participants required to activate.
                      </span>
                    )}
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
                      className="p-3.5 rounded-[10px] border border-line dark:border-white/10 bg-surface dark:bg-[#14171B] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-primary-tint text-primary dark:bg-indigo-500/20 dark:text-indigo-300 dark:shadow-[0_0_8px_rgba(129,140,248,0.18)] text-xs font-bold flex items-center justify-center tabular-nums">
                          #{p.position || idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-semibold text-sm text-ink">
                              {p.user.fullName}
                            </span>
                            {p.user.id === user?.id && (
                              <span className="text-[10px] bg-line/60 dark:bg-white/10 text-muted px-1.5 py-0.5 rounded font-medium">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted tabular-nums">
                            {p.user.phone}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <SimpleTooltip content="View member audit record">
                          <button
                            type="button"
                            onClick={() => setSelectedParticipantForHistory(p)}
                            className="p-1.5 text-muted hover:text-primary rounded-lg transition-colors touch-press"
                            aria-label="View member audit record"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </SimpleTooltip>
                        {isAdmin && (
                          <SimpleTooltip content="Remove participant from round">
                            <button
                              type="button"
                              onClick={() => setParticipantToRemove(p)}
                              className="p-1.5 text-muted hover:text-danger rounded-lg transition-colors touch-press"
                              aria-label="Remove participant"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          </SimpleTooltip>
                        )}
                      </div>
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

        {/* ===================== ACTIVE OR COMPLETED STATUS (CENTREPIECE) ===================== */}
        {(round.status === "ACTIVE" || round.status === "COMPLETED") && (
          <div className="space-y-6">
            {/* Completion Banner */}
            {round.status === "COMPLETED" && (
              <div className="p-4 rounded-[12px] bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-heading font-bold text-sm text-ink block">
                      Round Fully Completed
                    </span>
                    <span className="text-muted">
                      All rotation cycles have completed disbursement. Full audit logs are available below.
                    </span>
                  </div>
                </div>
                <Badge variant="positive">Completed</Badge>
              </div>
            )}

            {/* Hero Pot & Obligation Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Hero Pot Balance Card with Count-Up and Progress Rail */}
              <HeroPotCard
                balanceKobo={poolBalance?.balanceKobo || 0}
                expectedPotKobo={expectedPotKobo}
                monthlyContributionKobo={round.contributionAmountKobo}
                participantCount={round.participants.length}
                myPosition={myParticipant?.position}
                completedCyclesCount={round.cycles?.filter((c) => c.status === "PAID").length || 0}
                totalCyclesCount={round.cycles?.length || 0}
                className="sm:col-span-2"
              />

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
                        {formatSignedKobo(myExposure).text}
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

            {/* Pending Exits Banner (Admin Buy-In opportunity) */}
            {isAdmin && pendingExits.length > 0 && (
              <div className="p-4 rounded-[12px] bg-indigo-500/10 border border-indigo-500/25 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserX className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-heading font-bold text-sm text-ink">
                      Active Exit Request ({pendingExits.length})
                    </span>
                  </div>
                  <span className="text-xs text-muted">Awaiting replacement member or cycle settlement</span>
                </div>
                <div className="space-y-2">
                  {pendingExits.map((exit) => {
                    const leaverName =
                      ("fullName" in (exit.participant || {})
                        ? (exit.participant as UserSummary).fullName
                        : (exit.participant as any)?.user?.fullName) || "Member";
                    const buyInKobo = Math.abs(exit.exposureAtRequest || exit.exposureKobo || 0);

                    return (
                      <div
                        key={exit.id}
                        className="p-3 rounded-lg bg-surface dark:bg-[#14171B] border border-line/60 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <strong className="text-ink font-semibold">{leaverName}</strong> has requested to leave the round. Required Buy-In:{" "}
                          <strong className="text-positive tabular-nums">{formatKobo(buyInKobo)}</strong>.
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedExitForBuyIn(exit);
                            setIsBuyInOpen(true);
                          }}
                        >
                          <UserCheck className="w-3.5 h-3.5 mr-1" />
                          Fill Slot (Buy-In)
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View Switcher: Rotation Schedule vs Financial Audit Ledger */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 p-1 rounded-xl bg-canvas dark:bg-[#14171B] border border-line dark:border-white/10 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveViewTab("cycles")}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeViewTab === "cycles"
                      ? "bg-surface dark:bg-[#1E232B] text-primary dark:text-indigo-300 shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  Monthly Rotation ({round.cycles?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveViewTab("ledger")}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeViewTab === "ledger"
                      ? "bg-surface dark:bg-[#1E232B] text-primary dark:text-indigo-300 shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Financial Audit Ledger
                </button>
              </div>
            </div>

            {activeViewTab === "cycles" ? (
              <>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line/60 dark:border-white/10">
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
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-positive/10 text-positive dark:bg-emerald-500/15 dark:border dark:border-emerald-500/30 dark:shadow-[0_0_12px_rgba(16,185,129,0.2)] font-bold text-xs">
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

                    {/* Settle vacant cycle button */}
                    {currentCycle.status === "VACANT" && isAdmin && (
                      <Button
                        variant="primary"
                        size="default"
                        onClick={() => setIsSettleCycleOpen(true)}
                        disabled={!vacantSettlement?.readyToSettle}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                      >
                        <Scale className="w-4 h-4 mr-1.5" />
                        Settle Vacant Month
                      </Button>
                    )}
                  </div>
                </div>

                {/* Vacant Settlement Breakdown */}
                {currentCycle.status === "VACANT" && (
                  <div className="p-4 rounded-[12px] bg-amber-500/10 border border-amber-500/25 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="font-heading font-bold text-sm text-ink">
                          Vacant Month — Beneficiary Exited Round
                        </span>
                      </div>
                      <Badge variant="danger">Vacant</Badge>
                    </div>

                    {vacantSettlement ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                        <div className="p-2.5 rounded-lg bg-surface/70 border border-line/40">
                          <span className="text-muted block text-[11px]">Accumulated Pot</span>
                          <span className="font-bold text-ink tabular-nums">{formatKobo(vacantSettlement.potKobo)}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-surface/70 border border-line/40">
                          <span className="text-muted block text-[11px]">Refund Owed</span>
                          <span className="font-bold text-positive tabular-nums">{formatKobo(vacantSettlement.refundOwedKobo)}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-surface/70 border border-line/40">
                          <span className="text-muted block text-[11px]">Open Shortfall Claims</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">{formatKobo(vacantSettlement.openClaimsKobo)}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-surface/70 border border-line/40">
                          <span className="text-muted block text-[11px]">Settlement Status</span>
                          <span className={`font-bold ${vacantSettlement.readyToSettle ? "text-positive" : "text-amber-600"}`}>
                            {vacantSettlement.readyToSettle ? "Ready to Settle ✓" : "Contributions Pending"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted">Calculating vacant cycle settlement values…</p>
                    )}
                  </div>
                )}

                {/* Beneficiary Banner */}
                <div className="p-4 rounded-[12px] bg-canvas dark:bg-[#14171B] border border-line dark:border-white/10 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-tint text-accent dark:bg-amber-500/20 dark:text-amber-400 dark:shadow-[0_0_10px_rgba(245,158,11,0.2)] flex items-center justify-center font-bold text-sm">
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
                          className="p-3 rounded-[10px] border border-line dark:border-white/10 bg-surface dark:bg-[#14171B] flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-line/50 dark:bg-white/10 text-ink flex items-center justify-center text-xs font-bold">
                              {p.user.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-xs sm:text-sm text-ink">
                                  {p.user.fullName}
                                </span>
                                {p.user.id === user?.id && (
                                  <span className="text-[10px] bg-line/60 dark:bg-white/10 text-muted px-1 rounded">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-muted tabular-nums">
                                Position #{p.position}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <SimpleTooltip content="View member audit record">
                              <button
                                type="button"
                                onClick={() => setSelectedParticipantForHistory(p)}
                                className="p-1.5 text-muted hover:text-primary rounded-lg transition-colors touch-press"
                                aria-label="View member audit record"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </SimpleTooltip>
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
                              <span className="text-xs font-medium text-muted bg-canvas dark:bg-white/5 px-2.5 py-1 rounded-full border border-line dark:border-white/10">
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
              </>
            ) : (
              <RoundAuditLedger roundId={roundId} currentUserId={user?.id} />
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

        {/* Modal: Cancel Round (Admin) */}
        <Modal
          isOpen={isCancelConfirmOpen}
          onClose={() => setIsCancelConfirmOpen(false)}
          title="Cancel Round"
          description="Are you sure you want to cancel this round?"
        >
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-xs sm:text-sm text-ink flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
              <div>
                <strong className="block text-danger font-semibold">Round Cancellation</strong>
                Cancelling this round terminates it permanently before activation.
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-muted">
                  <li>No cycles or ledger obligations will be created</li>
                  <li>All participants will see the round as cancelled</li>
                  <li>This action cannot be reversed</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/60">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCancelConfirmOpen(false)}
              >
                Keep Round
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  cancelRoundMutation.mutate(undefined, {
                    onSuccess: () => setIsCancelConfirmOpen(false),
                  });
                }}
                isLoading={cancelRoundMutation.isPending}
                loadingText="Cancelling..."
              >
                Confirm Cancellation
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
              <Select
                value={selectedMemberUserId}
                onValueChange={setSelectedMemberUserId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a circle member..." />
                </SelectTrigger>
                <SelectContent>
                  {group?.members
                    ?.filter((m) => !round.participants.some((p) => p.user.id === (m.user?.id || m.userId)))
                    .map((m) => {
                      const mId = m.user?.id || m.userId || "";
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
            currentUserId={user?.id}
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
            onConflict={() => {
              refetchRound();
              refetchPayout();
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

        {/* Modal: Edit Round Terms */}
        {round && (
          <EditRoundModal
            isOpen={isEditRoundTermsOpen}
            onClose={() => setIsEditRoundTermsOpen(false)}
            roundId={round.id}
            groupId={round.groupId}
            initialContributionAmountKobo={round.contributionAmountKobo}
            initialFirstPayoutDate={round.firstPayoutDate}
          />
        )}

        {/* Modal: Replacement Buy-In */}
        <BuyInModal
          isOpen={isBuyInOpen}
          onClose={() => {
            setIsBuyInOpen(false);
            setSelectedExitForBuyIn(null);
          }}
          exit={selectedExitForBuyIn}
          eligibleReplacements={eligibleReplacements}
          onSuccess={() => {
            refetchRound();
            refetchRoundExits();
            queryClient.invalidateQueries({ queryKey: ["group", round.groupId] });
          }}
        />

        {/* Modal: Settle Vacant Cycle */}
        {currentCycle && (
          <SettleCycleModal
            isOpen={isSettleCycleOpen}
            onClose={() => setIsSettleCycleOpen(false)}
            cycleId={currentCycle.id}
            cycleNumber={currentCycle.cycleNumber}
            settlement={vacantSettlement || null}
            onSuccess={() => {
              refetchRound();
              refetchSettlement();
              queryClient.invalidateQueries({ queryKey: ["shortfall-claims", roundId] });
              queryClient.invalidateQueries({ queryKey: ["pool-balance", roundId] });
            }}
          />
        )}

        {/* Modal: Participant History Record */}
        <ParticipantHistoryModal
          isOpen={!!selectedParticipantForHistory}
          onClose={() => setSelectedParticipantForHistory(null)}
          participant={selectedParticipantForHistory}
          roundStatus={round.status}
        />

        {/* Modal: Remove Participant from Round */}
        <ConfirmationModal
          isOpen={!!participantToRemove}
          onClose={() => setParticipantToRemove(null)}
          onConfirm={() => {
            if (participantToRemove) {
              removeParticipantMutation.mutate(participantToRemove.user.id);
            }
          }}
          title="Remove Participant from Round"
          confirmText="Remove Participant"
          variant="danger"
          isLoading={removeParticipantMutation.isPending}
          loadingText="Removing..."
          icon={<UserX className="w-4 h-4" />}
        >
          <div className="space-y-3">
            <p className="text-sm text-ink font-medium">
              Remove <strong className="text-ink font-bold">{participantToRemove?.user.fullName}</strong> from Slot #{participantToRemove?.position}?
            </p>
            <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-xs text-muted leading-relaxed">
              This member will be unassigned from payout slot #{participantToRemove?.position}. Their slot will become vacant and open for other circle members to claim before the round begins.
            </div>
          </div>
        </ConfirmationModal>

        {/* Modal: Leave Round Confirmation */}
        <ConfirmationModal
          isOpen={isLeaveRoundModalOpen}
          onClose={() => setIsLeaveRoundModalOpen(false)}
          onConfirm={() => leaveRoundMutation.mutate()}
          title="Leave Round"
          confirmText="Leave Round"
          variant="danger"
          isLoading={leaveRoundMutation.isPending}
          loadingText="Leaving..."
          icon={<UserX className="w-4 h-4" />}
        >
          <div className="space-y-3">
            <p className="text-sm text-ink font-medium">
              Are you sure you want to leave this savings round?
            </p>
            <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-xs text-muted leading-relaxed">
              Your assigned payout position (Slot #{myParticipant?.position || 1}) will be released back to the circle. You can rejoin before this round activates if positions remain available.
            </div>
          </div>
        </ConfirmationModal>

        {/* Modal: Delete Round */}
        <DeleteRoundModal
          isOpen={isDeleteRoundModalOpen}
          onClose={() => setIsDeleteRoundModalOpen(false)}
          roundId={roundId}
          groupId={round.groupId}
        />
      </div>
    </AuthenticatedLayout>
  );
}
