"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiDeleteGroup, DeleteGroupOutcome } from "@/lib/api/endpoints";
import { CircleRemovalPrediction } from "@/lib/removal-prediction";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/errors";
import { toast } from "sonner";
import { Trash2, Archive, AlertCircle } from "lucide-react";

export interface DeleteGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  prediction: CircleRemovalPrediction;
  onSuccess?: (outcome: "DELETED" | "ARCHIVED") => void;
}

export function DeleteGroupModal({
  isOpen,
  onClose,
  groupId,
  groupName,
  prediction,
  onSuccess,
}: DeleteGroupModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isArchive = prediction.type === "ARCHIVE";

  const deleteMutation = useMutation({
    mutationFn: () => apiDeleteGroup(groupId),
    onSuccess: (data: DeleteGroupOutcome) => {
      // Invalidate both active and archived circle lists
      queryClient.invalidateQueries({ queryKey: ["groups"] });

      if (data.outcome === "DELETED") {
        // Evict specific circle from cache so back navigation doesn't 404
        queryClient.removeQueries({ queryKey: ["group", groupId] });
        queryClient.removeQueries({ queryKey: ["group-rounds", groupId] });
        toast.success(`Circle "${groupName}" was deleted permanently.`);
        onClose();
        if (onSuccess) {
          onSuccess("DELETED");
        } else {
          router.replace("/groups");
        }
      } else {
        // Archived: circle still exists, now read-only
        queryClient.invalidateQueries({ queryKey: ["group", groupId] });
        queryClient.invalidateQueries({ queryKey: ["group-rounds", groupId] });
        toast.info(
          `Circle "${groupName}" archived. It is now read-only and moved to Archived Circles.`
        );
        onClose();
        if (onSuccess) {
          onSuccess("ARCHIVED");
        } else {
          router.refresh();
        }
      }
    },
    onError: (err) => {
      const msg = getErrorMessage(err);
      setErrorMessage(msg);
      toast.error(msg);
      // Invalidate group state in case status was stale
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group-rounds", groupId] });
    },
  });

  const handleConfirm = () => {
    setErrorMessage(null);
    deleteMutation.mutate();
  };

  const handleClose = () => {
    if (deleteMutation.isPending) return;
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isArchive ? "Archive this circle?" : "Delete this circle?"}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 pt-1">
        {/* Error message banner on 409 or other failure */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3.5 rounded-[12px] bg-red-50 dark:bg-rose-500/10 border border-red-200 dark:border-rose-400/25 text-xs text-red-700 dark:text-rose-300 font-medium leading-relaxed"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Dialog body copy */}
        {isArchive ? (
          <div className="space-y-3 text-xs sm:text-sm text-muted leading-relaxed">
            <p>
              Its rounds, contributions and payouts are all kept and stay readable. The circle
              moves out of your active list and can&apos;t be changed.
            </p>
            <p className="font-medium text-ink/90 dark:text-white/90">
              Anyone who still owes or is owed money in this circle keeps that obligation, and
              repayments still work.
            </p>
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-muted leading-relaxed">
            <p>
              This permanently removes the circle, its members and any invitations. Nothing has
              been contributed to it, so there&apos;s no record to keep.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line/60 dark:border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={deleteMutation.isPending}
            className="text-muted hover:text-ink whitespace-nowrap"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={isArchive ? "primary" : "danger"}
            onClick={handleConfirm}
            isLoading={deleteMutation.isPending}
            loadingText={isArchive ? "Archiving circle..." : "Deleting circle..."}
            disabled={deleteMutation.isPending}
            className="gap-1.5 whitespace-nowrap shrink-0"
          >
            {!deleteMutation.isPending &&
              (isArchive ? (
                <Archive className="w-4 h-4 stroke-[2.2]" />
              ) : (
                <Trash2 className="w-4 h-4 stroke-[2.2]" />
              ))}
            <span>{isArchive ? "Archive circle" : "Delete circle"}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
