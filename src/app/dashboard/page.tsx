"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  apiGetGroups,
  apiGetGroupRounds,
  apiGetMyInvites,
} from "@/lib/api/endpoints";
import { AuthenticatedLayout } from "@/components/common/authenticated-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, RoundStatusBadge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { formatKobo, formatPoolBalance } from "@/lib/money";
import { GroupSummary, RoundSummary, GroupInviteSummary } from "@/lib/api/types";
import { ViewToggle, ViewMode } from "@/components/common/view-toggle";
import { CreateGroupModal } from "@/components/groups/create-group-modal";
import {
  Coins,
  Users,
  Calendar,
  ArrowRight,
  Plus,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export default function DashboardPage() {
  const { user, isPhoneVerified } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch user's groups (only when authenticated)
  const { data: groups, isLoading: isGroupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: () => apiGetGroups(false),
    enabled: !!user,
  });

  // Fetch user's pending invites (only when authenticated)
  const { data: invites, isLoading: isInvitesLoading } = useQuery({
    queryKey: ["my-invites"],
    queryFn: apiGetMyInvites,
    enabled: !!user,
  });

  const pendingInvites = invites || [];
  const userGroups = groups || [];

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted block mb-0.5">
              Overview
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Good day, {user?.fullName.split(" ")[0]}
            </h1>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Circle
          </Button>
        </div>

        {/* Pending Invites Alert Banner */}
        {pendingInvites.length > 0 && (
          <div className="p-4 rounded-[14px] bg-[#FAF8F5] dark:bg-[#161A24] border border-[#EBE3D5] dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/20">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-ink">
                  You have {pendingInvites.length} pending circle {pendingInvites.length === 1 ? "invitation" : "invitations"}
                </h4>
                <p className="text-xs text-muted mt-0.5">
                  From <strong className="text-ink font-semibold">{pendingInvites[0].inviterName || "a friend"}</strong> to join &quot;{pendingInvites[0].groupName || "Circle"}&quot;
                </p>
              </div>
            </div>

            <Link href="/invites" className="shrink-0 self-start sm:self-auto">
              <Button variant="primary" size="sm">
                Review Invites
              </Button>
            </Link>
          </div>
        )}

        {isGroupsLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : userGroups.length > 0 ? (
          <>
            {/* The One Leading Metric Card per Section 9 */}
            {/* Executive Portfolio Overview Card */}
            <div className="vault-card rounded-[16px] p-5 sm:p-7 text-white relative shadow-vault overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                    Savings Portfolio
                  </span>
                  <span className="text-[11px] bg-white/10 px-2.5 py-0.5 rounded-full text-white/90 border border-white/10 font-medium">
                    Rotation Pools
                  </span>
                </div>

                <div className="font-heading font-black text-2xl sm:text-4xl text-white tabular-nums tracking-tight mb-1.5">
                  {userGroups.length} Active {userGroups.length === 1 ? "Circle" : "Circles"}
                </div>
                <p className="text-xs sm:text-sm text-white/80 max-w-md leading-relaxed">
                  Monthly rotational savings pools under scheduled payout rotations with zero interest.
                </p>

                <div className="pt-4 mt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-white/90">
                  <div>
                    <span className="text-[10px] text-white/60 uppercase tracking-wider block">Total Circles</span>
                    <strong className="text-sm font-bold text-white tabular-nums">{userGroups.length}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/60 uppercase tracking-wider block">Active Rounds</span>
                    <strong className="text-sm font-bold text-white tabular-nums">
                      {userGroups.filter((g) => g.hasActiveRound).length}
                    </strong>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-white/60 uppercase tracking-wider block">Security Standing</span>
                    <strong className="text-sm font-bold text-white flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-positive" />
                      {isPhoneVerified ? "Phone Verified" : "Needs Verification"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* My Active Circles Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-heading font-bold text-lg text-ink">
                    Your Circles
                  </h3>
                  <ViewToggle value={viewMode} onChange={setViewMode} />
                </div>
                <Link
                  href="/groups"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userGroups.map((group) => (
                    <Link key={group.id} href={`/groups/${group.id}`} className="block">
                      <Card interactive className="p-5 flex flex-col justify-between h-full group">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-tint to-primary/10 border border-primary/20 text-primary dark:from-indigo-500/20 dark:to-indigo-500/5 dark:border-indigo-500/30 dark:text-indigo-300 dark:shadow-[0_0_10px_rgba(129,140,248,0.15)] flex items-center justify-center font-heading font-bold text-base shadow-xs">
                                {group.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-heading font-bold text-base text-ink line-clamp-1 group-hover:text-primary transition-colors">
                                  {group.name}
                                </h4>
                                <span className="text-xs text-muted flex items-center gap-1 mt-0.5">
                                  <Users className="w-3 h-3 text-muted" />
                                  <span className="tabular-nums font-medium text-ink">{group.memberCount ?? 1}</span>
                                  <span>{group.memberCount === 1 ? "member" : "members"}</span>
                                </span>
                              </div>
                            </div>

                            {group.hasActiveRound ? (
                              <Badge variant="positive">Active Round</Badge>
                            ) : (
                              <Badge variant="neutral">Forming</Badge>
                            )}
                          </div>

                          <p className="text-xs text-muted line-clamp-2 my-2.5 leading-relaxed">
                            {group.description || "Active rotational savings circle."}
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-line/60 dark:border-white/10 flex items-center justify-between text-xs text-muted">
                          <span className="font-medium text-[11px]">Manage Circle</span>
                          <span className="font-semibold text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            Open <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="bg-surface dark:bg-[#171B22] rounded-[14px] border border-line dark:border-white/[0.08] divide-y divide-line/60 dark:divide-white/[0.05] overflow-hidden shadow-subtle">
                  {userGroups.map((group) => (
                    <Link
                      key={group.id}
                      href={`/groups/${group.id}`}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-canvas/60 dark:hover:bg-white/[0.03] transition-colors group gap-3"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-tint to-primary/10 border border-primary/20 text-primary dark:from-indigo-500/20 dark:to-indigo-500/5 dark:border-indigo-500/30 dark:text-indigo-300 dark:shadow-[0_0_10px_rgba(129,140,248,0.15)] flex items-center justify-center font-heading font-bold text-base shrink-0 shadow-xs">
                          {group.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading font-bold text-sm text-ink truncate group-hover:text-primary transition-colors">
                              {group.name}
                            </h4>
                            {group.hasActiveRound ? (
                              <Badge variant="positive" className="text-[10px] py-0">Active</Badge>
                            ) : (
                              <Badge variant="neutral" className="text-[10px] py-0">Forming</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted truncate max-w-md mt-0.5">
                            {group.description || "Active rotational savings circle"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-13 sm:pl-0">
                        <span className="text-xs text-muted flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-muted" />
                          <span className="tabular-nums font-medium text-ink">{group.memberCount ?? 1}</span>
                          <span>{group.memberCount === 1 ? "member" : "members"}</span>
                        </span>
                        <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>View</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* First-time User Experience per Section 8 & 10 */
          <Card className="p-8 sm:p-12 text-center border-dashed border-2">
            <div className="w-16 h-16 rounded-2xl bg-primary-tint text-primary flex items-center justify-center mx-auto mb-4">
              <Coins className="w-8 h-8" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-ink mb-2">
              Start your first Ajo circle
            </h2>
            <p className="text-sm text-muted max-w-md mx-auto mb-8 leading-relaxed">
              Ajo helps you and your trusted circle save money together and collect lump sums on rotation with total transparency and zero interest.
            </p>

            {/* 3 Step onboarding guide */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8 text-left">
              <div className="bg-canvas dark:bg-[#0C0F14] border border-line dark:border-white/[0.08] rounded-xl p-4">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center mb-2">
                  1
                </span>
                <h3 className="font-heading font-semibold text-xs text-ink mb-1">
                  Create a Circle
                </h3>
                <p className="text-[11px] text-muted">
                  Name your circle and invite trusted colleagues or family.
                </p>
              </div>

              <div className="bg-canvas dark:bg-[#0C0F14] border border-line dark:border-white/[0.08] rounded-xl p-4">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center mb-2">
                  2
                </span>
                <h3 className="font-heading font-semibold text-xs text-ink mb-1">
                  Set Round Terms
                </h3>
                <p className="text-[11px] text-muted">
                  Agree on monthly contributions and assign collection positions.
                </p>
              </div>

              <div className="bg-canvas dark:bg-[#0C0F14] border border-line dark:border-white/[0.08] rounded-xl p-4">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center mb-2">
                  3
                </span>
                <h3 className="font-heading font-semibold text-xs text-ink mb-1">
                  Collect in Turns
                </h3>
                <p className="text-[11px] text-muted">
                  Every month, one member collects the entire pooled pot.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create a Circle Now
              </Button>
              <Link href="/invites">
                <Button variant="outline" size="lg">
                  Check Incoming Invites
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>

      {/* Direct In-Place Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </AuthenticatedLayout>
  );
}
