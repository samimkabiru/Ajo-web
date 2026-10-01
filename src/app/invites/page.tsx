"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiGetMyInvites,
  apiAcceptInvite,
  apiDeclineInvite,
} from "@/lib/api/endpoints";
import { AuthenticatedLayout } from "@/components/common/authenticated-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { getErrorMessage } from "@/lib/api/errors";
import { Mail, Check, X, ShieldAlert, Users, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function MyInvitesPage() {
  const { user, isPhoneVerified } = useAuth();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: invites,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["my-invites"],
    queryFn: apiGetMyInvites,
    enabled: !!user,
  });

  const acceptMutation = useMutation({
    mutationFn: (inviteId: string) => apiAcceptInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-invites"] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Joined savings circle!");
      setActionError(null);
    },
    onError: (err) => {
      setActionError(getErrorMessage(err));
    },
  });

  const declineMutation = useMutation({
    mutationFn: (inviteId: string) => apiDeclineInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-invites"] });
      toast.info("Invitation declined.");
      setActionError(null);
    },
    onError: (err) => {
      setActionError(getErrorMessage(err));
    },
  });

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Circle Invitations
          </h1>
          <p className="text-sm text-muted mt-1">
            Invitations from friends and admins to join their savings circles
          </p>
        </div>

        {!isPhoneVerified && (
          <div className="p-4 rounded-[12px] bg-warning/10 border border-warning/20 text-xs sm:text-sm text-ink flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <strong className="block text-warning font-semibold">Phone verification required</strong>
              You must verify your phone number before accepting circle invitations.{" "}
              <Link href="/verify-phone" className="underline font-semibold text-warning">
                Verify phone now →
              </Link>
            </div>
          </div>
        )}

        {actionError && (
          <div className="p-3.5 rounded-[10px] bg-danger/10 border border-danger/20 flex items-start gap-2.5 text-xs sm:text-sm text-danger font-medium leading-snug">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{actionError}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : isError ? (
          <Card className="p-8 text-center space-y-3">
            <p className="text-sm text-danger font-medium">{getErrorMessage(error)}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </Card>
        ) : invites && invites.length > 0 ? (
          <div className="space-y-3">
            {invites.map((invite) => (
              <Card key={invite.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-base text-ink">
                      {invite.groupName || "Savings Circle"}
                    </h2>
                    <p className="text-xs text-muted mt-0.5">
                      Invited by <strong>{invite.inviterName || "Circle Admin"}</strong>
                    </p>
                    <span className="text-[11px] text-muted tabular-nums mt-1 block">
                      Invited on {new Date(invite.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => declineMutation.mutate(invite.id)}
                    isLoading={declineMutation.isPending && declineMutation.variables === invite.id}
                    loadingText="Declining..."
                  >
                    <X className="w-4 h-4 mr-1 text-danger" />
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!isPhoneVerified}
                    onClick={() => acceptMutation.mutate(invite.id)}
                    isLoading={acceptMutation.isPending && acceptMutation.variables === invite.id}
                    loadingText="Accepting..."
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Accept Invite
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 sm:p-12 text-center border-dashed border-2">
            <div className="w-14 h-14 rounded-2xl bg-canvas border border-line text-muted flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7" />
            </div>
            <h2 className="font-heading text-lg font-bold text-ink mb-1">
              No pending invitations
            </h2>
            <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto mb-5">
              When friends or colleagues invite you to their savings circles using your phone number, the invites will appear here.
            </p>
            <Link href="/groups">
              <Button variant="outline">Browse your circles</Button>
            </Link>
          </Card>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
