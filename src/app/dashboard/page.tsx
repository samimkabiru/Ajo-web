"use client";

import React from "react";
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

          <Link href="/groups">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              New Circle
            </Button>
          </Link>
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
            <Card className="p-6 sm:p-8 bg-primary text-white border-transparent shadow-elevation relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/70 block mb-1">
                  Active Savings Circles
                </span>
                <div className="font-heading font-extrabold text-3xl sm:text-5xl text-white tabular-nums tracking-tight">
                  {userGroups.length} {userGroups.length === 1 ? "Circle" : "Circles"}
                </div>
                <p className="text-xs sm:text-sm text-white/80 mt-2 max-w-md">
                  Rotational savings active across your groups. Each month guarantees a full lump-sum collection for one member.
                </p>

                <div className="pt-5 mt-5 border-t border-white/15 flex flex-wrap items-center gap-4 text-xs text-white/90">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>Double-pay protected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-white" />
                    <span>Zero interest platform</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* My Active Circles Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-ink">
                  Your Circles
                </h3>
                <Link
                  href="/groups"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userGroups.map((group) => (
                  <Link key={group.id} href={`/groups/${group.id}`} className="block">
                    <Card interactive className="p-5 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center font-bold text-base">
                              {group.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-heading font-bold text-base text-ink line-clamp-1">
                                {group.name}
                              </h4>
                              <span className="text-xs text-muted flex items-center gap-1">
                                <Users className="w-3 h-3" />
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
                          <p className="text-xs text-muted line-clamp-2 my-2">
                            {group.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 mt-2 border-t border-line/60 flex items-center justify-between text-xs text-muted">
                        <span>Circle Management</span>
                        <span className="font-semibold text-primary flex items-center gap-1">
                          Open circle <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
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
              <Link href="/groups">
                <Button variant="primary" size="lg">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create a Circle Now
                </Button>
              </Link>
              <Link href="/invites">
                <Button variant="outline" size="lg">
                  Check Incoming Invites
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
