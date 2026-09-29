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
import { Badge, RoundStatusBadge } from "@/components/ui/badge";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { formatKobo, parseNairaToKobo } from "@/lib/money";
import { getErrorMessage } from "@/lib/api/errors";
import { DatePicker } from "@/components/ui/date-picker";
import { ViewToggle, ViewMode } from "@/components/common/view-toggle";
import { EditGroupModal } from "@/components/groups/edit-group-modal";
import { cn } from "@/lib/utils";
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
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const [isCreateRoundModalOpen, setIsCreateRoundModalOpen] = useState(false);
  const [roundsViewMode, setRoundsViewMode] = useState<ViewMode>("grid");
  const [contributionNaira, setContributionNaira] = useState("20,000");
  const [firstPayoutDate, setFirstPayoutDate] = useState("");
  const [roundError, setRoundError] = useState<string | null>(null);

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

  // Mutations
  const inviteMutation = useMutation({
    mutationFn: (phone: string) => apiInviteMember(groupId, phone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      setInviteSuccess("Invitation sent successfully!");
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
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => apiRemoveGroupMember(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: () => apiLeaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                  {group.name}
                </h1>
                {isAdmin ? (
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
              {isAdmin ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditGroupModalOpen(true)}
                  >
                    <Settings className="w-4 h-4 mr-1.5" />
                    Edit Circle
                  </Button>
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
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm("Are you sure you want to leave this circle?")) {
                      leaveGroupMutation.mutate();
                    }
                  }}
                  isLoading={leaveGroupMutation.isPending}
                  loadingText="Leaving..."
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
              {isAdmin && (
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
                              <span className="text-xs font-semibold uppercase text-muted tracking-wider">
                                Round #{idx + 1}
                              </span>
                              <RoundStatusBadge status={round.status} />
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
                          <span>Enter round</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
                {isAdmin ? (
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
              {isAdmin && (
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

                      {isAdmin && memberId !== user?.id && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${member.user.fullName} from this circle?`)) {
                              removeMemberMutation.mutate(memberId);
                            }
                          }}
                          title="Remove member"
                          className="p-1.5 text-muted hover:text-danger rounded-lg transition-colors touch-press"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Tab 3: Pending Invites (Admin only) */}
          {isAdmin && (
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
                            Invited by {invite.invitedBy?.fullName || "Admin"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="warning">Pending</Badge>
                        <button
                          onClick={() => revokeInviteMutation.mutate(invite.id)}
                          title="Revoke invitation"
                          className="p-1.5 text-muted hover:text-danger rounded-lg transition-colors touch-press"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
      </div>
    </AuthenticatedLayout>
  );
}
