"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiCreateGroup } from "@/lib/api/endpoints";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/api/errors";
import { Sparkles, Users, Info } from "lucide-react";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectToGroupOnSuccess?: boolean;
}

export function CreateGroupModal({
  isOpen,
  onClose,
  redirectToGroupOnSuccess = false,
}: CreateGroupModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const createGroupMutation = useMutation({
    mutationFn: apiCreateGroup,
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      onClose();
      setName("");
      setDescription("");
      setFormError(null);
      if (redirectToGroupOnSuccess && newGroup?.id) {
        router.push(`/groups/${newGroup.id}`);
      }
    },
    onError: (err) => {
      setFormError(getErrorMessage(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Please enter a circle name.");
      return;
    }
    setFormError(null);
    createGroupMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!createGroupMutation.isPending) {
          onClose();
          setFormError(null);
        }
      }}
      title="Create New Savings Circle"
      description="Start an Ajo rotation group for your family, friends, or trusted business partners."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {formError && (
          <div className="p-3 rounded-[10px] bg-danger-tint border border-danger/20 text-xs text-danger font-medium">
            {formError}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-ink">
            Circle Name <span className="text-danger">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Lagos Founders Ajo, Family Vault"
            required
            maxLength={60}
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-ink">
            Description <span className="text-muted font-normal">(Optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly state the goal, rules, or intended monthly payout..."
            rows={3}
            maxLength={250}
            className="w-full rounded-[9px] border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/70 transition-all duration-120 hover:border-ink/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>

        <div className="p-3 rounded-[10px] bg-canvas border border-line/60 flex items-start gap-2.5 text-xs text-muted">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            As the creator, you will automatically be designated the <strong className="text-ink">Circle Admin</strong> with full permissions to invite members and launch savings rounds.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={createGroupMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={createGroupMutation.isPending}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Create Circle
          </Button>
        </div>
      </form>
    </Modal>
  );
}
