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
import { Users, Plus, ArrowRight, RefreshCw } from "lucide-react";

export default function GroupsPage() {
  const { user, isPhoneVerified } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const { data: groups, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["groups"],
    queryFn: apiGetGroups,
    enabled: !!user,
  });

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header with action */}
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
            {groups && groups.length > 0 && (
              <ViewToggle value={viewMode} onChange={setViewMode} />
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="sm:self-auto self-start"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Circle
            </Button>
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
        ) : groups && groups.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {groups.map((group) => (
                <Link key={group.id} href={`/groups/${group.id}`} className="block">
                  <Card interactive className="h-full flex flex-col justify-between p-5 group">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-tint to-primary/10 border border-primary/20 text-primary flex items-center justify-center font-heading font-bold text-base shadow-xs">
                            {group.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h2 className="font-heading font-bold text-base text-ink line-clamp-1 group-hover:text-primary transition-colors">
                              {group.name}
                            </h2>
                            <span className="text-xs text-muted flex items-center gap-1">
                              <Users className="w-3 h-3 text-muted" />
                              {group.memberCount ?? 1} {(group.memberCount ?? 1) === 1 ? "member" : "members"}
                            </span>
                          </div>
                        </div>

                        {group.hasActiveRound ? (
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

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-line/60 text-xs text-muted">
                      <span className="font-medium text-[11px]">Circle Management</span>
                      <span className="flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                        View details <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="bg-surface rounded-[14px] border border-line divide-y divide-line/60 overflow-hidden shadow-subtle">
              {groups.map((group) => (
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
                        <h2 className="font-heading font-bold text-sm text-ink truncate group-hover:text-primary transition-colors">
                          {group.name}
                        </h2>
                        {group.hasActiveRound ? (
                          <Badge variant="positive" className="text-[10px] py-0">Round Active</Badge>
                        ) : (
                          <Badge variant="neutral" className="text-[10px] py-0">Idle</Badge>
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
          )
        ) : (
          /* Designed empty state */
          <Card className="p-8 sm:p-12 text-center border-dashed border-2">
            <div className="w-14 h-14 rounded-2xl bg-primary-tint text-primary flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7" />
            </div>
            <h2 className="font-heading text-xl font-bold text-ink mb-2">
              No savings circles yet
            </h2>
            <p className="text-sm text-muted max-w-sm mx-auto mb-6 leading-relaxed">
              You&apos;re not in any savings circle yet. Create one to invite your friends and colleagues, or ask an admin to invite you to theirs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
              >
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
