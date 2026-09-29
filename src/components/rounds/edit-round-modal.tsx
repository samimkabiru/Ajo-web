"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUpdateRound } from "@/lib/api/endpoints";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { parseNairaToKobo } from "@/lib/money";
import { getErrorMessage } from "@/lib/api/errors";
import { Sliders, Info } from "lucide-react";

interface EditRoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  roundId: string;
  groupId: string;
  initialContributionAmountKobo: number;
  initialFirstPayoutDate?: string | null;
}

export function EditRoundModal({
  isOpen,
  onClose,
  roundId,
  groupId,
  initialContributionAmountKobo,
  initialFirstPayoutDate,
}: EditRoundModalProps) {
  const queryClient = useQueryClient();

  const [contributionNaira, setContributionNaira] = useState(
    Math.round(initialContributionAmountKobo / 100).toLocaleString()
  );
  const [firstPayoutDate, setFirstPayoutDate] = useState(
    initialFirstPayoutDate || ""
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setContributionNaira(
        Math.round(initialContributionAmountKobo / 100).toLocaleString()
      );
      setFirstPayoutDate(initialFirstPayoutDate || "");
      setFormError(null);
    }
  }, [isOpen, initialContributionAmountKobo, initialFirstPayoutDate]);

  const updateRoundMutation = useMutation({
    mutationFn: (body: { contributionAmountKobo: number; firstPayoutDate?: string }) =>
      apiUpdateRound(roundId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["round", roundId] });
      queryClient.invalidateQueries({ queryKey: ["group-rounds", groupId] });
      onClose();
      setFormError(null);
    },
    onError: (err) => {
      setFormError(getErrorMessage(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const kobo = parseNairaToKobo(contributionNaira);
    if (kobo <= 0) {
      setFormError("Please enter a valid monthly contribution amount.");
      return;
    }

    setFormError(null);
    updateRoundMutation.mutate({
      contributionAmountKobo: kobo,
      firstPayoutDate: firstPayoutDate || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!updateRoundMutation.isPending) {
          onClose();
          setFormError(null);
        }
      }}
      title="Edit Round Terms"
      description="Adjust the monthly contribution amount or scheduled payout date while this round is forming."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {formError && (
          <div className="p-3 rounded-[10px] bg-danger-tint border border-danger/20 text-xs text-danger font-medium">
            {formError}
          </div>
        )}

        <Input
          id="editContribution"
          label="Monthly Contribution (₦)"
          placeholder="e.g. 20,000"
          value={contributionNaira}
          onChange={(e) => setContributionNaira(e.target.value)}
          hint="Parsed cleanly into exact integer kobo (no decimals)"
          required
        />

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-ink/85 dark:text-slate-200">
            First Payout Date
          </label>
          <DatePicker
            value={firstPayoutDate}
            onChange={setFirstPayoutDate}
            placeholder="Select first payout date"
            minDate={new Date().toISOString().split("T")[0]}
          />
          <p className="text-[11px] text-muted">
            The target date for the first member payout once activated.
          </p>
        </div>

        <div className="p-3 rounded-[10px] bg-canvas dark:bg-white/[0.04] border border-line/60 dark:border-white/10 flex items-start gap-2.5 text-xs text-muted">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Terms can only be edited while the round is in <strong className="text-ink">FORMING</strong> status. Once activated, rotation cycles and contribution amounts are locked.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line/60 dark:border-white/10">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={updateRoundMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={updateRoundMutation.isPending}
          >
            <Sliders className="w-3.5 h-3.5 mr-1" />
            Save Terms
          </Button>
        </div>
      </form>
    </Modal>
  );
}
