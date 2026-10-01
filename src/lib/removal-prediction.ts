import { RoundSummary, RoundStatus } from "./api/types";

export type CircleRemovalPrediction =
  | {
      type: "DELETE";
      canExecute: true;
      actionLabel: "Delete Circle";
    }
  | {
      type: "ARCHIVE";
      canExecute: true;
      actionLabel: "Archive Circle";
    }
  | {
      type: "DISABLED_ACTIVE_ROUND";
      canExecute: false;
      reason: "Finish the active round first";
      actionLabel: "Delete Circle" | "Archive Circle";
    }
  | {
      type: "DISABLED_FORMING_ROUND";
      canExecute: false;
      reason: "Cancel the forming round first";
      formingRoundId: string;
      actionLabel: "Archive Circle";
    };

/**
 * Predicts the server outcome for DELETE /groups/{groupId} based on current round states:
 * - No rounds, or only FORMING / CANCELLED => permanently deleted (204)
 * - Any COMPLETED, no ACTIVE, no FORMING => archived (200)
 * - Any COMPLETED plus a FORMING round => disabled: cancel the forming round first
 * - Any ACTIVE round => disabled: finish the active round first
 */
export function predictCircleRemoval(rounds?: RoundSummary[]): CircleRemovalPrediction {
  if (!rounds || rounds.length === 0) {
    return {
      type: "DELETE",
      canExecute: true,
      actionLabel: "Delete Circle",
    };
  }

  const hasActive = rounds.some((r) => r.status === "ACTIVE");
  const hasCompleted = rounds.some((r) => r.status === "COMPLETED");
  const formingRound = rounds.find((r) => r.status === "FORMING");

  if (hasActive) {
    return {
      type: "DISABLED_ACTIVE_ROUND",
      canExecute: false,
      reason: "Finish the active round first",
      actionLabel: hasCompleted ? "Archive Circle" : "Delete Circle",
    };
  }

  if (hasCompleted && formingRound) {
    return {
      type: "DISABLED_FORMING_ROUND",
      canExecute: false,
      reason: "Cancel the forming round first",
      formingRoundId: formingRound.id,
      actionLabel: "Archive Circle",
    };
  }

  if (hasCompleted) {
    return {
      type: "ARCHIVE",
      canExecute: true,
      actionLabel: "Archive Circle",
    };
  }

  // Only FORMING or CANCELLED rounds, never activated
  return {
    type: "DELETE",
    canExecute: true,
    actionLabel: "Delete Circle",
  };
}

/**
 * Determines whether a round can be deleted via DELETE /rounds/{roundId}.
 * Only FORMING or CANCELLED rounds can be deleted. ACTIVE or COMPLETED rounds cannot.
 */
export function canDeleteRound(status: RoundStatus): boolean {
  return status === "FORMING" || status === "CANCELLED";
}
