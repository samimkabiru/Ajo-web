"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiDeleteRound } from "@/lib/api/endpoints";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/errors";
import { toast } from "sonner";
import { Trash2, AlertCircle } from "lucide-react";

export interface DeleteRoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  roundId: string;
  groupId: string;
  roundIndex?: number;
  onSuccess?: () => void;
}

export function DeleteRoundModal({
  isOpen,
  onClose,
  roundId,
  groupId,
  roundIndex,
  onSuccess,
}: DeleteRoundModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: () => apiDeleteRound(roundId),
    onSuccess: () => {
      // Invalidate group rounds list
      queryClient.invalidateQueries({ queryKey: ["group-rounds", groupId] });
      // Evict this round from query cache
      queryClient.removeQueries({ queryKey: ["round", roundId] });

      toast.success(
        roundIndex ? `Round #${roundIndex} was deleted.` : "Round was deleted."
      );
      onClose();

      if (onSuccess) {
        onSuccess();
      } else {
        router.replace(`/groups/${groupId}`);
      }
    },
    onError: (err) => {
      const msg = getErrorMessage(err);
      setErrorMessage(msg);
      toast.error(msg);
      // Invalidate round to resynchronize if status changed
      queryClient.invalidateQueries({ queryKey: ["round", roundId] });
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
      title="Delete this round?"
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

        <div className="text-xs sm:text-sm text-muted leading-relaxed">
          <p>
            It never started, so there are no contributions or payouts to lose. Its participant
            list goes with it.
          </p>
        </div>

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
            variant="danger"
            onClick={handleConfirm}
            isLoading={deleteMutation.isPending}
            loadingText="Deleting round..."
            disabled={deleteMutation.isPending}
            className="gap-1.5 whitespace-nowrap shrink-0"
          >
            {!deleteMutation.isPending && <Trash2 className="w-4 h-4 stroke-[2.2]" />}
            <span>Delete round</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
