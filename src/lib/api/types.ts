/**
 * TypeScript types for Ajo API models, verified against OpenAPI spec.
 */

export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  retryAfterSeconds?: number;
  properties?: Record<string, unknown>;
}

export interface UserSummary {
  id: string;
  phone: string;
  email?: string | null;
  fullName: string;
  phoneVerified: boolean;
  emailVerified?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: UserSummary;
}

export interface VerificationCodeRequested {
  expiresAt: string;
  resendAvailableAt: string;
}

export interface PasswordResetRequested {
  ttlSeconds: number;
  resendCooldownSeconds: number;
}

export type GroupRole = "ADMIN" | "MEMBER";

export interface GroupMemberSummary {
  userId: string;
  user: UserSummary;
  role: GroupRole;
  joinedAt: string;
}

export interface GroupSummary {
  id: string;
  name: string;
  description?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  hasActiveRound?: boolean;
}

export interface GroupDetail {
  id: string;
  name: string;
  description?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members: GroupMemberSummary[];
  rounds?: RoundSummary[];
  invites?: GroupInviteSummary[];
}

export type InviteStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "REVOKED";

export interface GroupInviteSummary {
  id: string;
  groupId: string;
  groupName?: string;
  phone: string;
  invitedBy: UserSummary;
  status: InviteStatus;
  createdAt: string;
  expiresAt: string;
}

export type RoundStatus = "FORMING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface ParticipantSummary {
  id: string;
  roundId: string;
  user: UserSummary;
  position: number;
  joinedAt: string;
}

export type CycleStatus = "SCHEDULED" | "OPEN" | "PAID" | "VACANT" | "SETTLED";

export interface CycleSummary {
  id: string;
  cycleNumber: number;
  beneficiary?: UserSummary | null;
  opensOn: string;
  dueOn: string;
  payoutOn: string;
  status: CycleStatus;
}

export interface RoundSummary {
  id: string;
  groupId: string;
  contributionAmountKobo: number;
  status: RoundStatus;
  createdBy: string;
  activatedAt?: string | null;
  firstPayoutDate?: string | null;
  createdAt: string;
  updatedAt: string;
  participantCount?: number;
  totalCycles?: number;
}

export interface RoundDetail {
  id: string;
  groupId: string;
  contributionAmountKobo: number;
  status: RoundStatus;
  createdBy: string;
  activatedAt?: string | null;
  firstPayoutDate?: string | null;
  createdAt: string;
  updatedAt: string;
  participants: ParticipantSummary[];
  cycles: CycleSummary[];
}

export interface PoolBalance {
  roundId: string;
  balanceKobo: number;
}

export interface ExposureSummary {
  participantId: string;
  exposureKobo: number;
  owesGroup: boolean;
  owedByGroup: boolean;
}

export type PaymentMethod = "ONLINE" | "CASH";

export interface ContributionSummary {
  id: string;
  cycleId: string;
  participantId: string;
  participant: UserSummary;
  amountKobo: number;
  method?: PaymentMethod;
  recordedBy?: string;
  ledgerTransactionId?: string;
  createdAt: string;
}

export interface PayoutSummary {
  id: string;
  cycleId: string;
  participantId: string;
  beneficiary: UserSummary;
  expectedAmountKobo: number;
  actualAmountKobo: number;
  shortfallKobo: number;
  arrearsWithheldKobo: number;
  method?: PaymentMethod;
  recordedBy?: string;
  ledgerTransactionId?: string | null;
  createdAt: string;
}

export interface ShortfallClaimSummary {
  id: string;
  cycleId: string;
  participantId: string;
  participant: UserSummary;
  amountKobo: number;
  settledAmountKobo: number;
  outstandingKobo: number;
  settledAt?: string | null;
  createdAt: string;
}

export type SwapStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED" | "SUPERSEDED";

export interface SwapRequestSummary {
  id: string;
  roundId: string;
  requesterParticipantId?: string;
  requesterParticipant?: ParticipantSummary;
  targetParticipantId?: string;
  targetParticipant?: ParticipantSummary;
  requester?: UserSummary;
  target?: UserSummary;
  requesterPosition: number;
  targetPosition: number;
  status: SwapStatus;
  createdAt: string;
  respondedAt?: string | null;
  resolvedAt?: string | null;
}

export type ExitStatus = "PENDING_SETTLEMENT" | "COMPLETED" | "CANCELLED";

export interface ExitRequestSummary {
  id: string;
  roundId: string;
  participantId?: string;
  participant?: UserSummary | ParticipantSummary;
  status: ExitStatus;
  exposureAtRequest?: number;
  exposureKobo?: number;
  refundKobo?: number;
  repayKobo?: number;
  requestedAt: string;
  createdAt?: string;
  completedAt?: string | null;
}

export interface RepaymentSummary {
  id: string;
  participantId: string;
  amountKobo: number;
  createdAt: string;
}

export type BuyInMethod = "ONLINE" | "CASH";

export interface BuyInSummary {
  id: string;
  roundId: string;
  exitRequestId: string;
  participantId: string;
  leaver: UserSummary;
  replacement: UserSummary;
  amountKobo: number;
  method: BuyInMethod;
  recordedBy: string;
  buyInTransactionId: string;
  refundTransactionId: string | null;
  createdAt: string;
}

export interface RefundSummary {
  id: string;
  cycleId: string;
  exitRequestId: string;
  participantId: string;
  recipient: UserSummary;
  expectedAmountKobo: number;
  actualAmountKobo: number;
  shortfallKobo: number;
  ledgerTransactionId: string;
  createdAt: string;
}

export interface SettlementSummary {
  cycleId: string;
  potKobo: number;
  refund: RefundSummary;
  claimsSettled: ShortfallClaimSummary[];
  remainingKobo: number;
  cycleStatus: CycleStatus;
}

export interface VacantCycleSummary {
  cycleId: string;
  potKobo: number;
  refundOwedKobo: number;
  openClaimsKobo: number;
  readyToSettle: boolean;
}
