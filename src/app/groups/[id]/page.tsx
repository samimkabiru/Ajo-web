"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiGetGroup,
  apiGetGroupRounds,
  apiInviteMember,
  apiRevokeInvite,
  apiRemoveGroupMember,
  apiLeaveGroup,
  apiCreateRound,
} from "@/lib/api/endpoints";
import { AuthenticatedLayout } from "@/components/common/authenticated-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { Badge, RoundStatusBadge } from "@/components/ui/badge";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { formatKobo, parseNairaToKobo } from "@/lib/money";
import { getErrorMessage } from "@/lib/api/errors";
import { DatePicker } from "@/components/ui/date-picker";
import { ViewToggle, ViewMode } from "@/components/common/view-toggle";
import { EditGroupModal } from "@/components/groups/edit-group-modal";
import { DeleteGroupModal } from "@/components/groups/delete-group-modal";
import { DeleteRoundModal } from "@/components/rounds/delete-round-modal";
import { predictCircleRemoval, canDeleteRound } from "@/lib/removal-prediction";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  Coins,
  Calendar,
  ShieldCheck,
  Shield,
  ArrowRight,
  Trash2,
  LogOut,
  RefreshCw,
  PlusCircle,
  Clock,
  CheckCircle2,
  Settings,
  Archive,
  MoreVertical,
} from "lucide-react";

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"rounds" | "members" | "invites">("rounds");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [isDeleteGroupModalOpen, setIsDeleteGroupModalOpen] = useState(false);
  const [roundToDelete, setRoundToDelete] = useState<{ id: string; index: number } | null>(null);
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const [isCreateRoundModalOpen, setIsCreateRoundModalOpen] = useState(false);
  const [roundsViewMode, setRoundsViewMode] = useState<ViewMode>("grid");
  const [contributionNaira, setContributionNaira] = useState("20,000");
  const [firstPayoutDate, setFirstPayoutDate] = useState("");
  const [roundError, setRoundError] = useState<string | null>(null);

  // Confirmation modal states
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; fullName: string } | null>(null);
  const [isLeaveGroupModalOpen, setIsLeaveGroupModalOpen] = useState(false);
  const [inviteToRevoke, setInviteToRevoke] = useState<{ id: string; phone: string } | null>(null);

  // Group Details
  const {
    data: group,
    isLoading: isGroupLoading,
    error: groupError,
    refetch: refetchGroup,
  } = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => apiGetGroup(groupId),
    enabled: !!user && !!groupId,
  });

  // Group Rounds
  const {
    data: rounds,
    isLoading: isRoundsLoading,
    refetch: refetchRounds,
  } = useQuery({
    queryKey: ["group-rounds", groupId],
    queryFn: () => apiGetGroupRounds(groupId),
    enabled: !!user && !!groupId,
  });

  // Determine current user's role in this group
  const currentMembership = group?.members.find(
    (m) => m.user?.id === user?.id || (m as { userId?: string }).userId === user?.id
  );
  const isAdmin = currentMembership?.role === "ADMIN" || group?.createdBy === user?.id;
  const isArchived = Boolean(group?.archivedAt);
  const prediction = predictCircleRemoval(rounds);

  // Mutations
  const inviteMutation = useMutation({
    mutationFn: (phone: string) => apiInviteMember(groupId, phone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      setInviteSuccess("Invitation sent successfully!");
      toast.success("Invitation sent successfully!");
      setInvitePhone("");
      setInviteError(null);
      setTimeout(() => {
        setIsInviteModalOpen(false);
        setInviteSuccess(null);
      }, 1500);
    },
    onError: (err) => {
      setInviteError(getErrorMessage(err));
    },
  });

  const createRoundMutation = useMutation({
    mutationFn: (data: { contributionAmountKobo: number; firstPayoutDate?: string }) =>
      apiCreateRound(groupId, data),
    onSuccess: (newRound) => {
      queryClient.invalidateQueries({ queryKey: ["group-rounds", groupId] });
      setIsCreateRoundModalOpen(false);
      setRoundError(null);
      toast.success("Savings round created!");
      router.push(`/rounds/${newRound.id}`);
    },
    onError: (err) => {
      setRoundError(getErrorMessage(err));
    },
  });

  const revokeInviteMutation = useMutation({
    mutationFn: (inviteId: string) => apiRevokeInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      setInviteToRevoke(null);
      toast.info("Invitation revoked.");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => apiRemoveGroupMember(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      setMemberToRemove(null);
      toast.info("Member removed from circle.");
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: () => apiLeaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setIsLeaveGroupModalOpen(false);
      toast.info("You left the circle.");
      router.push("/groups");
    },
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitePhone.trim()) {
      setInviteError("Please enter a phone number to invite.");
      return;
    }
    setInviteError(null);
    inviteMutation.mutate(invitePhone.trim());
  };

  const handleCreateRoundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountKobo = parseNairaToKobo(contributionNaira);
    if (amountKobo <= 0) {
      setRoundError("Contribution amount must be greater than zero.");
      return;
    }
    setRoundError(null);
    createRoundMutation.mutate({
      contributionAmountKobo: amountKobo,
      firstPayoutDate: firstPayoutDate || undefined,
    });
  };

  if (isGroupLoading) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </AuthenticatedLayout>
    );
  }

  if (groupError || !group) {
    return (
      <AuthenticatedLayout>
        <Card className="p-8 text-center space-y-4">
          <p className="text-sm text-danger font-medium">
            {groupError ? getErrorMessage(groupError) : "Circle not found."}
          </p>
          <Link href="/groups">
            <Button variant="outline">Back to Circles</Button>
          </Link>
        </Card>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header Breadcrumb & Info */}
        <div>
          <div className="flex items-center gap-2 text-xs text-muted mb-2">
            <Link href="/groups" className="hover:text-ink">
              Circles
            </Link>
            <span>/</span>
            <span className="text-ink font-medium">{group.name}</span>
          </div>

          {/* Quiet Archived Banner */}
          {isArchived && (
            <div
              role="region"
              aria-label="Archived circle notice"
              className="p-4 rounded-[14px] bg-amber-500/10 border border-amber-500/25 dark:border-amber-400/30 text-amber-950 dark:text-amber-100 flex items-start gap-3 shadow-xs mb-4"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <Archive className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading font-bold text-sm text-amber-950 dark:text-amber-100">
                    This circle is archived and read-only
                  </h2>
                  {group.archivedAt && (
                    <span className="text-[11px] font-semibold text-amber-900/80 dark:text-amber-200/80">
                      • Archived on{" "}
                      {new Date(group.archivedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                  All financial history, completed rounds, payouts and ledgers remain fully browsable.
                  Administration is closed, but participant repayments and cycle settlements remain active.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                  {group.name}
                </h1>
                {isArchived ? (
                  <Badge variant="neutral" className="gap-1 text-xs">
                    <Archive className="w-3 h-3 text-muted" />
                    Archived
                  </Badge>
                ) : isAdmin ? (
                  <Badge variant="primary" className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="neutral">Member</Badge>
                )}
              </div>
              {group.description && (
                <p className="text-sm text-muted mt-1 leading-relaxed">
                  {group.description}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {isArchived ? (
                <Badge variant="neutral" className="gap-1.5 py-1.5 px-3 text-xs">
                  <Archive className="w-3.5 h-3.5 text-muted" />
                  Read-Only Record
                </Badge>
              ) : isAdmin ? (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setRoundError(null);
                      setIsCreateRoundModalOpen(true);
                    }}
                  >
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    New Round
                  </Button>

                  {/* Triple-dot overflow menu for circle actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-9 h-9 p-0 flex items-center justify-center text-muted hover:text-ink shadow-xs"
                        aria-label="Circle actions menu"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[230px]">
                      <DropdownMenuItem onClick={() => setIsEditGroupModalOpen(true)}>
                        <Settings className="w-3.5 h-3.5 text-muted mr-1" />
                        <span>Edit Circle Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />

                      {/* Circle removal action: honest prediction with disable states */}
                      {prediction.canExecute ? (
                        prediction.type === "ARCHIVE" ? (
                          <DropdownMenuItem onClick={() => setIsDeleteGroupModalOpen(true)}>
                            <Archive className="w-3.5 h-3.5 text-muted mr-1" />
                            <span>Archive Circle</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            variant="danger"
                            onClick={() => setIsDeleteGroupModalOpen(true)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            <span>Delete Circle</span>
                          </DropdownMenuItem>
                        )
                      ) : (
                        <SimpleTooltip content={prediction.reason} side="left">
                          <div className="w-full">
                            <DropdownMenuItem
                              disabled
                              className="opacity-50 cursor-not-allowed flex flex-col items-start gap-0.5 py-2"
                            >
                              <div className="flex items-center gap-1.5">
                                {prediction.actionLabel === "Archive Circle" ? (
                                  <Archive className="w-3.5 h-3.5 text-muted" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5 text-muted" />
                                )}
                                <span>{prediction.actionLabel}</span>
                              </div>
                              <span className="text-[10px] text-muted font-normal pl-5">
                                {prediction.reason}
                              </span>
                            </DropdownMenuItem>
                          </div>
                        </SimpleTooltip>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLeaveGroupModalOpen(true)}
                  className="text-muted hover:text-danger hover:bg-danger/8 text-xs font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Leave Circle
                </Button>
              )}
            </div>
          </div>

          {/* Executive Circle Metrics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-[14px] bg-surface dark:bg-[#171B22] border border-line/70 dark:border-white/[0.08] shadow-2xs mt-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-0.5">
                Circle Members
              </span>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" />
                <strong className="text-sm sm:text-base font-bold text-ink tabular-nums">
                  {group.members?.length ?? 1}
                </strong>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-0.5">
                Savings Rounds
              </span>
              <div className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-primary" />
                <strong className="text-sm sm:text-base font-bold text-ink tabular-nums">
                  {rounds?.length ?? 0}
                </strong>
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-0.5">
                Circle Status
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    rounds?.some((r) => r.status === "ACTIVE") ? "bg-positive" : "bg-warning"
                  )}
                />
                <strong className="text-xs sm:text-sm font-bold text-ink">
                  {rounds?.some((r) => r.status === "ACTIVE") ? "Active Rounds" : "Rounds Forming"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation with Radix Animated Sliding Pills */}
        <Tabs defaultValue="rounds" layoutId="circleDetailsTabs" className="w-full space-y-5">
          <div className="border-b border-line dark:border-white/[0.08] pb-3">
            <TabsList>
              <TabsTrigger value="rounds">
                <Coins className="w-4 h-4" />
                <span>Rounds ({rounds?.length ?? 0})</span>
              </TabsTrigger>
              <TabsTrigger value="members">
                <Users className="w-4 h-4" />
                <span>Members ({group.members?.length ?? 0})</span>
              </TabsTrigger>
              {isAdmin && !isArchived && (
                <TabsTrigger value="invites">
                  <UserPlus className="w-4 h-4" />
                  <span>Pending Invites ({group.invites?.length ?? 0})</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* Tab 1: Rounds */}
          <TabsContent value="rounds" className="space-y-4 m-0">
            {isRoundsLoading ? (
              <CardSkeleton />
            ) : rounds && rounds.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted">
                    {rounds.length} {rounds.length === 1 ? "Round" : "Rounds"}
                  </span>
                  <ViewToggle value={roundsViewMode} onChange={setRoundsViewMode} />
                </div>

                {roundsViewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {rounds.map((round, idx) => (
                      <Link key={round.id} href={`/rounds/${round.id}`} className="block">
                        <Card interactive className="p-5 flex flex-col justify-between h-full group">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold uppercase text-muted tracking-wider">
                                  Round #{idx + 1}
                                </span>
                                <RoundStatusBadge status={round.status} />
                              </div>

                              {/* Overflow menu for round deletion if FORMING or CANCELLED */}
                              {isAdmin && !isArchived && canDeleteRound(round.status) && (
                                <div
                                  className="relative z-10"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                >
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                        }}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                                        aria-label={`Options for Round #${idx + 1}`}
                                      >
                                        <MoreVertical className="w-4 h-4" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[170px]">
                                      <DropdownMenuItem asChild>
                                        <Link href={`/rounds/${round.id}`} className="flex items-center gap-2">
                                          <ArrowRight className="w-3.5 h-3.5 text-muted mr-1" />
                                          <span>Open Round</span>
                                        </Link>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        variant="danger"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setRoundToDelete({ id: round.id, index: idx + 1 });
                                        }}
                                      >
                                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                                        <span>Delete Round</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}
                            </div>

                            <div className="space-y-1 mb-4">
                              <span className="text-xs text-muted block">Monthly Contribution</span>
                              <span className="text-2xl font-bold font-heading text-ink tabular-nums">
                                {formatKobo(round.contributionAmountKobo)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-line/60 dark:border-white/10 text-xs text-muted">
                            <span>
                              {round.firstPayoutDate ? (
                                <>First payout: {round.firstPayoutDate}</>
                              ) : (
                                "Payout date pending"
                              )}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                              Enter round <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-surface dark:bg-[#171B22] rounded-[14px] border border-line dark:border-white/[0.08] divide-y divide-line/60 dark:divide-white/[0.05] overflow-hidden shadow-subtle">
                    {rounds.map((round, idx) => (
                      <Link
                        key={round.id}
                        href={`/rounds/${round.id}`}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-canvas/60 dark:hover:bg-white/[0.03] transition-colors group gap-3"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary dark:bg-indigo-500/20 dark:text-indigo-300 dark:shadow-[0_0_10px_rgba(129,140,248,0.15)] flex items-center justify-center font-heading font-bold text-sm shrink-0 shadow-xs">
                            #{idx + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-heading font-bold text-base text-ink tabular-nums group-hover:text-primary transition-colors">
                                {formatKobo(round.contributionAmountKobo)}
                              </span>
                              <span className="text-xs text-muted">/ month</span>
                              <RoundStatusBadge status={round.status} />
                            </div>
                            <span className="text-xs text-muted">
                              {round.firstPayoutDate ? `First payout: ${round.firstPayoutDate}` : "Payout date pending"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 font-semibold text-xs text-primary shrink-0 pl-13 sm:pl-0">
                          <div className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            <span>Enter round</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>

                          {/* Overflow menu for round deletion if FORMING or CANCELLED */}
                          {isAdmin && !isArchived && canDeleteRound(round.status) && (
                            <div
                              className="relative z-10"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                                    aria-label={`Options for Round #${idx + 1}`}
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[170px]">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/rounds/${round.id}`} className="flex items-center gap-2">
                                      <ArrowRight className="w-3.5 h-3.5 text-muted mr-1" />
                                      <span>Open Round</span>
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    variant="danger"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setRoundToDelete({ id: round.id, index: idx + 1 });
                                    }}
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                                    <span>Delete Round</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Card className="p-8 text-center border-dashed border-2 dark:border-white/15 dark:bg-[#14171B]">
                <div className="w-12 h-12 rounded-xl bg-primary-tint text-primary dark:bg-indigo-500/20 dark:text-indigo-300 dark:shadow-[0_0_12px_rgba(129,140,248,0.18)] flex items-center justify-center mx-auto mb-3">
                  <Coins className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-ink mb-1">
                  No rounds started yet
                </h3>
                <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto mb-5">
                  Rounds represent one complete savings cycle. Each member contributes monthly and takes home the full pot once.
                </p>
                {isAdmin && !isArchived ? (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setRoundError(null);
                      setIsCreateRoundModalOpen(true);
                    }}
                  >
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    Configure Round 1
                  </Button>
                ) : isArchived ? (
                  <p className="text-xs text-muted italic">This circle is archived and no new rounds can be configured.</p>
                ) : (
                  <p className="text-xs text-muted italic">Waiting for circle admin to start Round 1.</p>
                )}
              </Card>
            )}
          </TabsContent>

          {/* Tab 2: Members */}
          <TabsContent value="members" className="space-y-4 m-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm text-ink">
                  Circle Members ({group.members.length})
                </h3>
                <p className="text-xs text-muted">
                  Everyone enrolled in this savings circle
                </p>
              </div>
              {isAdmin && !isArchived && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setInviteError(null);
                    setInviteSuccess(null);
                    setIsInviteModalOpen(true);
                  }}
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  Invite Member
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {group.members.map((member) => {
                const memberId = member.user?.id || member.userId || "";
                return (
                  <Card key={memberId} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-tint text-primary dark:bg-indigo-500/20 dark:text-indigo-300 dark:shadow-[0_0_10px_rgba(129,140,248,0.15)] flex items-center justify-center font-bold text-sm">
                        {member.user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-semibold text-sm text-ink">
                            {member.user.fullName}
                          </span>
                          {memberId === user?.id && (
                            <span className="text-[10px] bg-line/60 dark:bg-white/10 text-muted px-1.5 py-0.5 rounded font-medium">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted tabular-nums block">
                          {member.user.phone}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {member.role === "ADMIN" ? (
                        <Badge variant="primary">Admin</Badge>
                      ) : (
                        <Badge variant="neutral">Member</Badge>
                      )}

                      {isAdmin && !isArchived && memberId !== user?.id && (
                        <SimpleTooltip content="Remove member from circle">
                          <button
                            onClick={() => setMemberToRemove({ id: memberId, fullName: member.user.fullName })}
                            className="p-1.5 text-muted hover:text-danger rounded-lg transition-colors touch-press"
                            aria-label="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </SimpleTooltip>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Tab 3: Pending Invites (Admin only, active circles only) */}
          {isAdmin && !isArchived && (
            <TabsContent value="invites" className="space-y-4 m-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-sm text-ink">
                    Pending Invitations ({group.invites?.length || 0})
                  </h3>
                  <p className="text-xs text-muted">
                    Invitations waiting to be accepted
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setInviteError(null);
                    setInviteSuccess(null);
                    setIsInviteModalOpen(true);
                  }}
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  Invite Member
                </Button>
              </div>

              {group.invites && group.invites.length > 0 ? (
                <div className="space-y-3">
                  {group.invites.map((invite) => (
                    <Card key={invite.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-canvas dark:bg-[#0C0F14] border border-line dark:border-white/12 text-muted flex items-center justify-center">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-medium text-sm text-ink block tabular-nums">
                            {invite.phone}
                          </span>
                          <span className="text-xs text-muted">
                            Invited by {invite.inviterName || "Admin"} • {new Date(invite.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="warning">Pending</Badge>
                        <SimpleTooltip content="Revoke invitation">
                          <button
                            onClick={() => setInviteToRevoke({ id: invite.id, phone: invite.phone })}
                            className="p-1.5 text-muted hover:text-danger rounded-lg transition-colors touch-press"
                            aria-label="Revoke invitation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </SimpleTooltip>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center space-y-3 border-dashed border-2">
                  <div className="w-12 h-12 rounded-xl bg-primary-tint text-primary flex items-center justify-center mx-auto mb-2">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <h4 className="font-heading font-bold text-base text-ink">
                    No pending invitations
                  </h4>
                  <p className="text-xs text-muted max-w-sm mx-auto">
                    Invite colleagues, friends, or family by their Nigerian phone number to join this circle.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setInviteError(null);
                      setInviteSuccess(null);
                      setIsInviteModalOpen(true);
                    }}
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                    Invite First Member
                  </Button>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>

        {/* Modal: Invite Member */}
        <Modal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          title="Invite Circle Member"
          description="Enter the Nigerian phone number of the person you want to invite."
        >
          <form onSubmit={handleInviteSubmit} className="space-y-4 pt-2">
            {inviteError && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger font-medium">
                {inviteError}
              </div>
            )}

            {inviteSuccess && (
              <div className="p-3 rounded-lg bg-positive/10 border border-positive/20 text-xs text-positive font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{inviteSuccess}</span>
              </div>
            )}

            <Input
              id="invitePhone"
              label="Phone Number"
              placeholder="e.g. 08012345678 or +234..."
              value={invitePhone}
              onChange={(e) => setInvitePhone(e.target.value)}
              required
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/60">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsInviteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={inviteMutation.isPending}
                loadingText="Inviting..."
              >
                Send Invitation
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Create Round */}
        <Modal
          isOpen={isCreateRoundModalOpen}
          onClose={() => setIsCreateRoundModalOpen(false)}
          title="Create New Round"
          description="Specify what each member contributes every month. The round starts in FORMING status where participants are assigned positions."
        >
          <form onSubmit={handleCreateRoundSubmit} className="space-y-4 pt-2">
            {roundError && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger font-medium">
                {roundError}
              </div>
            )}

            <Input
              id="contribution"
              label="Monthly Contribution (₦)"
              placeholder="e.g. 20,000"
              value={contributionNaira}
              onChange={(e) => setContributionNaira(e.target.value)}
              hint="Parsed cleanly into exact integer kobo (no decimals)"
              required
            />

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                First Payout Date
              </label>
              <DatePicker
                value={firstPayoutDate}
                onChange={setFirstPayoutDate}
                placeholder="Select first payout date"
                minDate={new Date().toISOString().split("T")[0]}
              />
              <p className="text-[11px] text-muted">
                Required before activating the round. Each next cycle pays one month later.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/60">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateRoundModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={createRoundMutation.isPending}
                loadingText="Creating..."
              >
                Create Round
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Edit Group Settings */}
        {group && (
          <EditGroupModal
            isOpen={isEditGroupModalOpen}
            onClose={() => setIsEditGroupModalOpen(false)}
            groupId={groupId}
            initialName={group.name}
            initialDescription={group.description}
          />
        )}

        {/* Modal: Remove Member Confirmation */}
        <ConfirmationModal
          isOpen={!!memberToRemove}
          onClose={() => setMemberToRemove(null)}
          onConfirm={() => {
            if (memberToRemove) {
              removeMemberMutation.mutate(memberToRemove.id);
            }
          }}
          title="Remove Member from Circle"
          confirmText="Remove Member"
          variant="danger"
          isLoading={removeMemberMutation.isPending}
          loadingText="Removing..."
          icon={<Trash2 className="w-4 h-4" />}
        >
          <div className="space-y-3">
            <p className="text-sm text-ink font-medium">
              Are you sure you want to remove <strong className="text-ink font-bold">{memberToRemove?.fullName}</strong> from <strong>{group?.name || "this circle"}</strong>?
            </p>
            <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-xs text-muted leading-relaxed">
              This member will immediately lose access to this circle and all future savings rounds. Their historical contributions in completed rounds remain recorded on the ledger.
            </div>
          </div>
        </ConfirmationModal>

        {/* Modal: Leave Circle Confirmation */}
        <ConfirmationModal
          isOpen={isLeaveGroupModalOpen}
          onClose={() => setIsLeaveGroupModalOpen(false)}
          onConfirm={() => leaveGroupMutation.mutate()}
          title="Leave Circle"
          confirmText="Leave Circle"
          variant="danger"
          isLoading={leaveGroupMutation.isPending}
          loadingText="Leaving..."
          icon={<LogOut className="w-4 h-4" />}
        >
          <div className="space-y-3">
            <p className="text-sm text-ink font-medium">
              Are you sure you want to leave <strong className="text-ink font-bold">{group?.name || "this circle"}</strong>?
            </p>
            <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-xs text-muted leading-relaxed">
              You will no longer have access to this circle or be able to join its upcoming savings rounds unless an admin re-invites you.
            </div>
          </div>
        </ConfirmationModal>

        {/* Modal: Revoke Invite Confirmation */}
        <ConfirmationModal
          isOpen={!!inviteToRevoke}
          onClose={() => setInviteToRevoke(null)}
          onConfirm={() => {
            if (inviteToRevoke) {
              revokeInviteMutation.mutate(inviteToRevoke.id);
            }
          }}
          title="Revoke Invitation"
          confirmText="Revoke Invite"
          variant="danger"
          isLoading={revokeInviteMutation.isPending}
          loadingText="Revoking..."
          icon={<Trash2 className="w-4 h-4" />}
        >
          <div className="space-y-3">
            <p className="text-sm text-ink font-medium">
              Revoke invitation sent to <strong className="text-ink font-bold tabular-nums">{inviteToRevoke?.phone}</strong>?
            </p>
            <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-xs text-muted leading-relaxed">
              This invitation link will be invalidated immediately. If the user tries to accept, they will be notified that the invitation is no longer active.
            </div>
          </div>
        </ConfirmationModal>

        {/* Modal: Delete / Archive Circle */}
        <DeleteGroupModal
          isOpen={isDeleteGroupModalOpen}
          onClose={() => setIsDeleteGroupModalOpen(false)}
          groupId={groupId}
          groupName={group.name}
          prediction={prediction}
        />

        {/* Modal: Delete Round */}
        {roundToDelete && (
          <DeleteRoundModal
            isOpen={Boolean(roundToDelete)}
            onClose={() => setRoundToDelete(null)}
            roundId={roundToDelete.id}
            groupId={groupId}
            roundIndex={roundToDelete.index}
          />
        )}
      </div>
    </AuthenticatedLayout>
  );
}
