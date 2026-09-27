import { apiFetch } from "./client";
import {
  AuthResponse,
  UserSummary,
  VerificationCodeRequested,
  GroupSummary,
  GroupDetail,
  GroupInviteSummary,
  GroupMemberSummary,
  RoundDetail,
  RoundSummary,
  PoolBalance,
  ExposureSummary,
  ContributionSummary,
  PayoutSummary,
  ShortfallClaimSummary,
  SwapRequestSummary,
  ExitRequestSummary,
  RepaymentSummary,
  PaymentMethod,
} from "./types";

// ======================== AUTH ========================

export async function apiRegister(body: {
  phone: string;
  password: string;
  fullName: string;
  email?: string | null;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    skipAuth: true,
  });
}

export async function apiLogin(body: {
  phone: string;
  password: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    skipAuth: true,
  });
}

export async function apiLogout(): Promise<void> {
  return apiFetch<void>("/auth/logout", {
    method: "POST",
    skipAuth: true,
  });
}

export async function apiGetMe(): Promise<UserSummary> {
  return apiFetch<UserSummary>("/me");
}

// ======================== VERIFICATION ========================

export async function apiRequestPhoneVerification(): Promise<VerificationCodeRequested> {
  return apiFetch<VerificationCodeRequested>("/me/phone/verification/request", {
    method: "POST",
  });
}

export async function apiConfirmPhoneVerification(code: string): Promise<UserSummary> {
  return apiFetch<UserSummary>("/me/phone/verification/confirm", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

// ======================== PASSWORD RESET ========================

export async function apiRequestPasswordReset(phone: string): Promise<void> {
  return apiFetch<void>("/auth/password-reset/request", {
    method: "POST",
    body: JSON.stringify({ phone }),
    skipAuth: true,
  });
}

export async function apiConfirmPasswordReset(body: {
  phone: string;
  code: string;
  newPassword: string;
}): Promise<void> {
  return apiFetch<void>("/auth/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify(body),
    skipAuth: true,
  });
}

// ======================== GROUPS ========================

export async function apiGetGroups(): Promise<GroupSummary[]> {
  return apiFetch<GroupSummary[]>("/groups");
}

export async function apiCreateGroup(body: {
  name: string;
  description?: string;
}): Promise<GroupDetail> {
  return apiFetch<GroupDetail>("/groups", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiGetGroup(groupId: string): Promise<GroupDetail> {
  return apiFetch<GroupDetail>(`/groups/${groupId}`);
}

export async function apiUpdateGroup(
  groupId: string,
  body: { name?: string; description?: string }
): Promise<GroupDetail> {
  return apiFetch<GroupDetail>(`/groups/${groupId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function apiGetMyInvites(): Promise<GroupInviteSummary[]> {
  return apiFetch<GroupInviteSummary[]>("/groups/my-invites");
}

export async function apiInviteMember(
  groupId: string,
  phone: string
): Promise<GroupInviteSummary> {
  return apiFetch<GroupInviteSummary>(`/groups/${groupId}/invites`, {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export async function apiAcceptInvite(inviteId: string): Promise<void> {
  return apiFetch<void>(`/groups/invites/${inviteId}/accept`, {
    method: "POST",
  });
}

export async function apiDeclineInvite(inviteId: string): Promise<void> {
  return apiFetch<void>(`/groups/invites/${inviteId}/decline`, {
    method: "POST",
  });
}

export async function apiRevokeInvite(inviteId: string): Promise<void> {
  return apiFetch<void>(`/groups/invites/${inviteId}/revoke`, {
    method: "POST",
  });
}

export async function apiGetGroupMembers(groupId: string): Promise<GroupMemberSummary[]> {
  return apiFetch<GroupMemberSummary[]>(`/groups/${groupId}/members`);
}

export async function apiRemoveGroupMember(groupId: string, userId: string): Promise<void> {
  return apiFetch<void>(`/groups/${groupId}/members/${userId}`, {
    method: "DELETE",
  });
}

export async function apiLeaveGroup(groupId: string): Promise<void> {
  return apiFetch<void>(`/groups/${groupId}/leave`, {
    method: "POST",
  });
}

// ======================== ROUNDS ========================

export async function apiGetGroupRounds(groupId: string): Promise<RoundSummary[]> {
  return apiFetch<RoundSummary[]>(`/groups/${groupId}/rounds`);
}

export async function apiCreateRound(
  groupId: string,
  body: { contributionAmountKobo: number; firstPayoutDate?: string }
): Promise<RoundDetail> {
  return apiFetch<RoundDetail>(`/groups/${groupId}/rounds`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiGetRound(roundId: string): Promise<RoundDetail> {
  return apiFetch<RoundDetail>(`/rounds/${roundId}`);
}

export async function apiUpdateRound(
  roundId: string,
  body: { contributionAmountKobo?: number; firstPayoutDate?: string }
): Promise<RoundDetail> {
  return apiFetch<RoundDetail>(`/rounds/${roundId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function apiAddParticipant(
  roundId: string,
  userId: string,
  position?: number
): Promise<void> {
  return apiFetch<void>(`/rounds/${roundId}/participants`, {
    method: "POST",
    body: JSON.stringify({ userId, position }),
  });
}

export async function apiRemoveParticipant(roundId: string, userId: string): Promise<void> {
  return apiFetch<void>(`/rounds/${roundId}/participants/${userId}`, {
    method: "DELETE",
  });
}

export async function apiJoinRound(roundId: string): Promise<void> {
  return apiFetch<void>(`/rounds/${roundId}/join`, {
    method: "POST",
  });
}

export async function apiLeaveRound(roundId: string): Promise<void> {
  return apiFetch<void>(`/rounds/${roundId}/leave`, {
    method: "POST",
  });
}

export async function apiActivateRound(roundId: string): Promise<RoundDetail> {
  return apiFetch<RoundDetail>(`/rounds/${roundId}/activate`, {
    method: "POST",
  });
}

export async function apiCancelRound(roundId: string): Promise<void> {
  return apiFetch<void>(`/rounds/${roundId}/cancel`, {
    method: "POST",
  });
}

export async function apiGetPoolBalance(roundId: string): Promise<PoolBalance> {
  return apiFetch<PoolBalance>(`/rounds/${roundId}/pool-balance`);
}

// ======================== CONTRIBUTIONS & PAYOUTS ========================

export async function apiContribute(
  cycleId: string,
  body: {
    amountKobo: number;
    userId?: string;
    method?: PaymentMethod;
  },
  idempotencyKey: string
): Promise<ContributionSummary> {
  return apiFetch<ContributionSummary>(`/cycles/${cycleId}/contributions`, {
    method: "POST",
    body: JSON.stringify(body),
    idempotencyKey,
  });
}

export async function apiGetCycleContributions(cycleId: string): Promise<ContributionSummary[]> {
  return apiFetch<ContributionSummary[]>(`/cycles/${cycleId}/contributions`);
}

export async function apiGetRoundContributions(roundId: string): Promise<ContributionSummary[]> {
  return apiFetch<ContributionSummary[]>(`/rounds/${roundId}/contributions`);
}

export async function apiCollectPayout(
  cycleId: string,
  body: {
    method: PaymentMethod;
    expectedBeneficiaryUserId: string;
  },
  idempotencyKey: string
): Promise<PayoutSummary> {
  return apiFetch<PayoutSummary>(`/cycles/${cycleId}/payout`, {
    method: "POST",
    body: JSON.stringify(body),
    idempotencyKey,
  });
}

export async function apiGetCyclePayout(cycleId: string): Promise<PayoutSummary | null> {
  try {
    return await apiFetch<PayoutSummary>(`/cycles/${cycleId}/payout`);
  } catch (err: unknown) {
    if ((err as { status?: number }).status === 404) return null;
    throw err;
  }
}

export async function apiGetRoundPayouts(roundId: string): Promise<PayoutSummary[]> {
  return apiFetch<PayoutSummary[]>(`/rounds/${roundId}/payouts`);
}

// ======================== EXPOSURE & CLAIMS ========================

export async function apiGetParticipantExposure(
  participantId: string
): Promise<ExposureSummary> {
  return apiFetch<ExposureSummary>(`/participants/${participantId}/exposure`);
}

export async function apiGetRoundShortfallClaims(
  roundId: string
): Promise<ShortfallClaimSummary[]> {
  return apiFetch<ShortfallClaimSummary[]>(`/rounds/${roundId}/shortfall-claims`);
}

export async function apiGetMyShortfallClaims(
  roundId: string
): Promise<ShortfallClaimSummary[]> {
  return apiFetch<ShortfallClaimSummary[]>(`/rounds/${roundId}/shortfall-claims/mine`);
}

export async function apiRepay(
  participantId: string,
  amountKobo: number,
  idempotencyKey: string
): Promise<RepaymentSummary> {
  return apiFetch<RepaymentSummary>(`/participants/${participantId}/repayments`, {
    method: "POST",
    body: JSON.stringify({ amountKobo }),
    idempotencyKey,
  });
}

// ======================== SWAPS ========================

export async function apiGetRoundSwaps(roundId: string): Promise<SwapRequestSummary[]> {
  return apiFetch<SwapRequestSummary[]>(`/rounds/${roundId}/swaps`);
}

export async function apiGetIncomingSwaps(roundId: string): Promise<SwapRequestSummary[]> {
  return apiFetch<SwapRequestSummary[]>(`/rounds/${roundId}/swaps/incoming`);
}

export async function apiGetOutgoingSwaps(roundId: string): Promise<SwapRequestSummary[]> {
  return apiFetch<SwapRequestSummary[]>(`/rounds/${roundId}/swaps/outgoing`);
}

export async function apiCreateSwap(
  roundId: string,
  targetParticipantId: string
): Promise<SwapRequestSummary> {
  return apiFetch<SwapRequestSummary>(`/rounds/${roundId}/swaps`, {
    method: "POST",
    body: JSON.stringify({ targetParticipantId }),
  });
}

export async function apiAcceptSwap(swapId: string): Promise<void> {
  return apiFetch<void>(`/swaps/${swapId}/accept`, {
    method: "POST",
  });
}

export async function apiDeclineSwap(swapId: string): Promise<void> {
  return apiFetch<void>(`/swaps/${swapId}/decline`, {
    method: "POST",
  });
}

export async function apiCancelSwap(swapId: string): Promise<void> {
  return apiFetch<void>(`/swaps/${swapId}/cancel`, {
    method: "POST",
  });
}

// ======================== EXITS ========================

export async function apiRequestExit(roundId: string): Promise<ExitRequestSummary> {
  return apiFetch<ExitRequestSummary>(`/rounds/${roundId}/exit`, {
    method: "POST",
  });
}

export async function apiGetMyExit(roundId: string): Promise<ExitRequestSummary | null> {
  try {
    return await apiFetch<ExitRequestSummary>(`/rounds/${roundId}/exit/mine`);
  } catch (err: unknown) {
    if ((err as { status?: number }).status === 404) return null;
    throw err;
  }
}

export async function apiCancelExit(exitId: string): Promise<void> {
  return apiFetch<void>(`/exits/${exitId}/cancel`, {
    method: "POST",
  });
}
