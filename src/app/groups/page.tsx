"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGetGroups, apiCreateGroup } from "@/lib/api/endpoints";
import { AuthenticatedLayout } from "@/components/common/authenticated-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { getErrorMessage } from "@/lib/api/errors";
import { Users, Plus, ArrowRight, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";

export default function GroupsPage() {
  const { isPhoneVerified } = useAuth();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: groups, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["groups"],
    queryFn: apiGetGroups,
  });

  const createGroupMutation = useMutation({
    mutationFn: apiCreateGroup,
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setIsCreateModalOpen(false);
      setName("");
      setDescription("");
      setFormError(null);
    },
    onError: (err) => {
      setFormError(getErrorMessage(err));
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Please enter a name for the circle.");
      return;
    }
    setFormError(null);
    createGroupMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

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

          <Button
            variant="primary"
            onClick={() => {
              setFormError(null);
              setIsCreateModalOpen(true);
            }}
            className="sm:self-auto self-start"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Circle
          </Button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groups.map((group) => (
              <Link key={group.id} href={`/groups/${group.id}`} className="block">
                <Card interactive className="h-full flex flex-col justify-between p-5">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-primary-tint text-primary flex items-center justify-center font-bold text-sm">
                          {group.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="font-heading font-bold text-base text-ink line-clamp-1">
                          {group.name}
                        </h2>
                      </div>

                      {group.hasActiveRound ? (
                        <Badge variant="positive">Round Active</Badge>
                      ) : (
                        <Badge variant="neutral">Idle</Badge>
                      )}
                    </div>

                    {group.description && (
                      <p className="text-xs sm:text-sm text-muted line-clamp-2 mb-3">
                        {group.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-line/60 text-xs text-muted">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {group.memberCount ?? 1} {(group.memberCount ?? 1) === 1 ? "member" : "members"}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                      View details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          /* Designed empty state per section 10 */
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
                Create your first circle
              </Button>
              <Link href="/invites">
                <Button variant="outline">Check invitations</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Create Group Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Savings Circle"
          description="You will be the circle admin and can configure rounds and invite members."
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            {!isPhoneVerified && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-xs text-ink flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-warning">Phone verification required</strong>
                  The server requires phone verification before creating circles.{" "}
                  <Link href="/verify-phone" className="underline font-semibold">
                    Verify phone now
                  </Link>
                </div>
              </div>
            )}

            {formError && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger font-medium">
                {formError}
              </div>
            )}

            <Input
              id="name"
              label="Circle Name"
              placeholder="e.g. Lagos Tech Builders Ajo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="space-y-1.5 text-left">
              <label
                htmlFor="description"
                className="block text-xs font-semibold uppercase tracking-wider text-muted select-none"
              >
                Description (Optional)
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="What is the goal or rule for this circle?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex w-full rounded-[10px] border border-line bg-surface p-3 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/60">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={createGroupMutation.isPending}
                loadingText="Creating..."
              >
                Create Circle
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AuthenticatedLayout>
  );
}
