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
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch user's groups
  const { data: groups, isLoading: isGroupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: apiGetGroups,
  });

  // Fetch user's pending invites
  const { data: invites, isLoading: isInvitesLoading } = useQuery({
    queryKey: ["my-invites"],
    queryFn: apiGetMyInvites,
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
          <div className="p-4 rounded-[12px] bg-accent-tint border border-accent/30 flex items-center justify-between gap-4 shadow-subtle">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-ink">
                  You have {pendingInvites.length} pending circle {pendingInvites.length === 1 ? "invitation" : "invitations"}
                </h4>
                <p className="text-xs text-muted">
                  From {pendingInvites[0].invitedBy?.fullName || "a friend"} to join &quot;{pendingInvites[0].groupName || "Circle"}&quot;
                </p>
              </div>
            </div>

            <Link href="/invites">
              <Button variant="accent" size="sm">
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
            <div className="vault-card rounded-[18px] p-6 sm:p-8 text-white relative shadow-vault overflow-hidden">
              <div className="absolute top-4 right-5 text-white/5 pointer-events-none">
                <Coins className="w-40 h-40 -mr-10 -mt-10" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                    Your Savings Portfolio
                  </span>
                </div>

                <div className="font-heading font-black text-3xl sm:text-5xl text-white tabular-nums tracking-tight mb-2">
                  {userGroups.length} Active {userGroups.length === 1 ? "Circle" : "Circles"}
                </div>
                <p className="text-xs sm:text-sm text-white/80 max-w-lg leading-relaxed">
                  Rotational savings active across your groups. Each month guarantees a full lump-sum collection for one designated beneficiary.
                </p>

                <div className="pt-5 mt-5 border-t border-white/15 flex flex-wrap items-center gap-4 text-xs text-white/90">
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                    <span>Double-pay protected</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                    <TrendingUp className="w-3.5 h-3.5 text-positive" />
                    <span>Zero interest platform</span>
                  </div>
                </div>
              </div>
            </div>

            {/* My Active Circles Section */}
            <div className="space-y-3">
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
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-tint to-primary/10 border border-primary/20 text-primary flex items-center justify-center font-heading font-bold text-base shadow-xs">
                                {group.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-heading font-bold text-base text-ink line-clamp-1 group-hover:text-primary transition-colors">
                                  {group.name}
                                </h4>
                                <span className="text-xs text-muted flex items-center gap-1">
                                  <Users className="w-3 h-3 text-muted" />
                                  {group.memberCount ?? 1} members
                                </span>
                              </div>
                            </div>

                            {group.hasActiveRound ? (
                              <Badge variant="positive">Active Round</Badge>
                            ) : (
                              <Badge variant="neutral">Forming</Badge>
                            )}
                          </div>

                          {group.description && (
                            <p className="text-xs text-muted line-clamp-2 my-2 leading-relaxed">
                              {group.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 mt-3 border-t border-line/60 flex items-center justify-between text-xs text-muted">
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
                <div className="bg-surface rounded-[14px] border border-line divide-y divide-line/60 overflow-hidden shadow-subtle">
                  {userGroups.map((group) => (
                    <Link
                      key={group.id}
                      href={`/groups/${group.id}`}
                      className="flex items-center justify-between p-4 hover:bg-canvas/60 transition-colors group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-tint to-primary/10 border border-primary/20 text-primary flex items-center justify-center font-heading font-bold text-base shrink-0 shadow-xs">
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
                          {group.description ? (
                            <p className="text-xs text-muted truncate max-w-md">
                              {group.description}
                            </p>
                          ) : (
                            <p className="text-xs text-muted">No description set</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-xs text-muted flex items-center gap-1 hidden sm:flex">
                          <Users className="w-3.5 h-3.5" />
                          {group.memberCount ?? 1} members
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
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
              <div className="bg-canvas border border-line rounded-xl p-4">
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

              <div className="bg-canvas border border-line rounded-xl p-4">
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

              <div className="bg-canvas border border-line rounded-xl p-4">
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
