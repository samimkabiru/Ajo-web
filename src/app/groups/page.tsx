"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiGetGroups } from "@/lib/api/endpoints";
import { AuthenticatedLayout } from "@/components/common/authenticated-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { getErrorMessage } from "@/lib/api/errors";
import { CreateGroupModal } from "@/components/groups/create-group-modal";
import { ViewToggle, ViewMode } from "@/components/common/view-toggle";
import { cn } from "@/lib/utils";
import { Users, Plus, ArrowRight, RefreshCw, Archive, Clock } from "lucide-react";

export default function GroupsPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<"active" | "archived">("active");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Query for active circles (default)
  const {
    data: activeGroups,
    isLoading: isActiveLoading,
    isError: isActiveError,
    error: activeError,
    refetch: refetchActive,
  } = useQuery({
    queryKey: ["groups", false],
    queryFn: () => apiGetGroups(false),
    enabled: !!user,
  });

  // Query for archived circles
  const {
    data: archivedGroups,
    isLoading: isArchivedLoading,
    isError: isArchivedError,
    error: archivedError,
    refetch: refetchArchived,
  } = useQuery({
    queryKey: ["groups", true],
    queryFn: () => apiGetGroups(true),
    enabled: !!user,
  });

  const isArchived = activeCategory === "archived";
  const currentGroups = isArchived ? archivedGroups : activeGroups;
  const isLoading = isArchived ? isArchivedLoading : isActiveLoading;
  const isError = isArchived ? isArchivedError : isActiveError;
  const error = isArchived ? archivedError : activeError;
  const refetch = isArchived ? refetchArchived : refetchActive;

  const formatArchiveDate = (isoString?: string | null) => {
    if (!isoString) return "Archived";
    try {
      return `Archived on ${new Date(isoString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    } catch {
      return "Archived";
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header with Title and Category Segmented Control */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Savings Circles
            </h1>
            <p className="text-sm text-muted mt-1">
              Groups where you contribute and collect rotational funds
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentGroups && currentGroups.length > 0 && (
              <ViewToggle value={viewMode} onChange={setViewMode} />
            )}
            {!isArchived && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                className="sm:self-auto self-start"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create Circle
              </Button>
            )}
          </div>
        </div>

        {/* Segmented Control: Active vs Archived */}
        <div className="flex items-center justify-between border-b border-line/80 dark:border-white/10 pb-3">
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-line/60 dark:border-white/10">
            <button
              type="button"
              onClick={() => setActiveCategory("active")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-[9px] text-xs font-bold transition-all",
                !isArchived
                  ? "bg-surface dark:bg-[#1A1F2B] text-ink dark:text-white shadow-xs"
                  : "text-muted hover:text-ink dark:hover:text-white"
              )}
            >
              <span>Active Circles</span>
              {activeGroups && activeGroups.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-primary/10 text-primary dark:bg-indigo-500/20 dark:text-indigo-300">
                  {activeGroups.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("archived")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] text-xs font-bold transition-all",
                isArchived
                  ? "bg-surface dark:bg-[#1A1F2B] text-ink dark:text-white shadow-xs"
                  : "text-muted hover:text-ink dark:hover:text-white"
              )}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archived</span>
              {archivedGroups && archivedGroups.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-muted/15 text-muted dark:text-slate-300">
                  {archivedGroups.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content list */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : isError ? (
          <Card className="p-8 text-center space-y-3">
            <p className="text-sm text-danger font-medium">{getErrorMessage(error)}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Try again
            </Button>
          </Card>
        ) : currentGroups && currentGroups.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentGroups.map((group) => (
                <Link key={group.id} href={`/groups/${group.id}`} className="block">
                  <Card
                    interactive
                    className={cn(
                      "h-full flex flex-col justify-between p-5 group",
                      isArchived && "opacity-90 hover:opacity-100"
                    )}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center font-heading font-bold text-base shadow-xs",
                              isArchived
                                ? "bg-muted/15 text-muted border border-muted/25 dark:bg-white/[0.06] dark:text-slate-300 dark:border-white/10"
                                : "bg-gradient-to-br from-primary-tint to-primary/10 border border-primary/20 text-primary dark:from-indigo-500/20 dark:to-indigo-500/5 dark:border-indigo-500/30 dark:text-indigo-300 dark:shadow-[0_0_10px_rgba(129,140,248,0.15)]"
                            )}
                          >
                            {isArchived ? (
                              <Archive className="w-4 h-4" />
                            ) : (
                              group.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h2 className="font-heading font-bold text-base text-ink line-clamp-1 group-hover:text-primary transition-colors">
                              {group.name}
                            </h2>
                            <span className="text-xs text-muted flex items-center gap-1">
                              <Users className="w-3 h-3 text-muted" />
                              {group.memberCount ?? 1}{" "}
                              {(group.memberCount ?? 1) === 1 ? "member" : "members"}
                            </span>
                          </div>
                        </div>

                        {isArchived ? (
                          <Badge variant="neutral" className="gap-1 text-[11px]">
                            <Archive className="w-3 h-3 text-muted" />
                            Archived
                          </Badge>
                        ) : group.hasActiveRound ? (
                          <Badge variant="positive">Round Active</Badge>
                        ) : (
                          <Badge variant="neutral">Idle</Badge>
                        )}
                      </div>

                      {group.description && (
                        <p className="text-xs sm:text-sm text-muted line-clamp-2 my-2 leading-relaxed">
                          {group.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-line/60 dark:border-white/10 text-xs text-muted">
                      {isArchived ? (
                        <span className="flex items-center gap-1 font-medium text-[11px] text-muted">
                          <Clock className="w-3 h-3 text-muted" />
                          {formatArchiveDate(group.archivedAt)}
                        </span>
                      ) : (
                        <span className="font-medium text-[11px]">Circle Management</span>
                      )}
                      <span className="flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                        <span>{isArchived ? "View History" : "View Details"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="bg-surface dark:bg-[#171B22] rounded-[14px] border border-line dark:border-white/[0.08] divide-y divide-line/60 dark:divide-white/[0.05] overflow-hidden shadow-subtle">
              {currentGroups.map((group) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-canvas/60 dark:hover:bg-white/[0.03] transition-colors group gap-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-heading font-bold text-base shrink-0 shadow-xs",
                        isArchived
                          ? "bg-muted/15 text-muted border border-muted/25 dark:bg-white/[0.06] dark:text-slate-300 dark:border-white/10"
                          : "bg-gradient-to-br from-primary-tint to-primary/10 border border-primary/20 text-primary dark:from-indigo-500/20 dark:to-indigo-500/5 dark:border-indigo-500/30 dark:text-indigo-300 dark:shadow-[0_0_10px_rgba(129,140,248,0.15)]"
                      )}
                    >
                      {isArchived ? (
                        <Archive className="w-4 h-4" />
                      ) : (
                        group.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading font-bold text-sm text-ink truncate group-hover:text-primary transition-colors">
                          {group.name}
                        </h2>
                        {isArchived ? (
                          <Badge variant="neutral" className="text-[10px] py-0 gap-1">
                            <Archive className="w-2.5 h-2.5" />
                            Archived
                          </Badge>
                        ) : group.hasActiveRound ? (
                          <Badge variant="positive" className="text-[10px] py-0">
                            Round Active
                          </Badge>
                        ) : (
                          <Badge variant="neutral" className="text-[10px] py-0">
                            Idle
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted truncate max-w-md mt-0.5">
                        {isArchived
                          ? formatArchiveDate(group.archivedAt)
                          : group.description || "Active rotational savings circle"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-13 sm:pl-0">
                    <span className="text-xs text-muted flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-muted" />
                      <span className="tabular-nums font-medium text-ink">
                        {group.memberCount ?? 1}
                      </span>
                      <span>{(group.memberCount ?? 1) === 1 ? "member" : "members"}</span>
                    </span>
                    <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>{isArchived ? "View History" : "View"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : isArchived ? (
          /* Empty state for archived circles */
          <Card className="p-8 sm:p-12 text-center border-dashed border-2">
            <div className="w-14 h-14 rounded-2xl bg-muted/10 text-muted flex items-center justify-center mx-auto mb-4">
              <Archive className="w-7 h-7" />
            </div>
            <h2 className="font-heading text-xl font-bold text-ink mb-2">
              No archived circles yet
            </h2>
            <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
              Circles with completed rounds that you archive will appear here for audit history
              and financial records.
            </p>
          </Card>
        ) : (
          /* Empty state for active circles */
          <Card className="p-8 sm:p-12 text-center border-dashed border-2">
            <div className="w-14 h-14 rounded-2xl bg-primary-tint text-primary flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7" />
            </div>
            <h2 className="font-heading text-xl font-bold text-ink mb-2">
              No savings circles yet
            </h2>
            <p className="text-sm text-muted max-w-sm mx-auto mb-6 leading-relaxed">
              You&apos;re not in any savings circle yet. Create one to invite your friends and
              colleagues, or ask an admin to invite you to theirs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Create a Circle Now
              </Button>
            </div>
          </Card>
        )}
      </div>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        redirectToGroupOnSuccess={true}
      />
    </AuthenticatedLayout>
  );
}
