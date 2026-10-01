import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { predictCircleRemoval, canDeleteRound } from "./removal-prediction";
import { RoundSummary } from "./api/types";

function mockRound(status: RoundSummary["status"], id: string = "round-1"): RoundSummary {
  return {
    id,
    groupId: "group-1",
    status,
    contributionAmountKobo: 1000000,
    participantCount: 5,
    createdBy: "user-1",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };
}

describe("removal prediction utilities", () => {
  it("predicts DELETE when circle has no rounds", () => {
    const res = predictCircleRemoval([]);
    assert.equal(res.type, "DELETE");
    assert.equal(res.canExecute, true);
    assert.equal(res.actionLabel, "Delete Circle");
  });

  it("predicts DELETE when rounds are only FORMING or CANCELLED (never activated)", () => {
    const res = predictCircleRemoval([
      mockRound("FORMING", "r1"),
      mockRound("CANCELLED", "r2"),
    ]);
    assert.equal(res.type, "DELETE");
    assert.equal(res.canExecute, true);
    assert.equal(res.actionLabel, "Delete Circle");
  });

  it("predicts ARCHIVE when all rounds are COMPLETED (no active, no forming)", () => {
    const res = predictCircleRemoval([
      mockRound("COMPLETED", "r1"),
      mockRound("COMPLETED", "r2"),
    ]);
    assert.equal(res.type, "ARCHIVE");
    assert.equal(res.canExecute, true);
    assert.equal(res.actionLabel, "Archive Circle");
  });

  it("predicts DISABLED_ACTIVE_ROUND when any round is ACTIVE", () => {
    const res = predictCircleRemoval([
      mockRound("COMPLETED", "r1"),
      mockRound("ACTIVE", "r2"),
    ]);
    assert.equal(res.type, "DISABLED_ACTIVE_ROUND");
    assert.equal(res.canExecute, false);
    assert.equal(res.reason, "Finish the active round first");
  });

  it("predicts DISABLED_FORMING_ROUND when history exists (COMPLETED) plus a FORMING round", () => {
    const res = predictCircleRemoval([
      mockRound("COMPLETED", "r1"),
      mockRound("FORMING", "r-forming"),
    ]);
    assert.equal(res.type, "DISABLED_FORMING_ROUND");
    assert.equal(res.canExecute, false);
    assert.equal(res.reason, "Cancel the forming round first");
    if (res.type === "DISABLED_FORMING_ROUND") {
      assert.equal(res.formingRoundId, "r-forming");
    }
  });

  it("evaluates round deletability correctly", () => {
    assert.equal(canDeleteRound("FORMING"), true);
    assert.equal(canDeleteRound("CANCELLED"), true);
    assert.equal(canDeleteRound("ACTIVE"), false);
    assert.equal(canDeleteRound("COMPLETED"), false);
  });
});
