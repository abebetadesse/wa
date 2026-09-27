import { CaseStatus } from "./types";

export class PipelineTransitionError extends Error {
  statusCode = 409;
  constructor(message: string) {
    super(message);
    this.name = "PipelineTransitionError";
  }
}

/**
 * Legal state machine transitions.
 * SUBMITTED / EVALUATING are convenience aliases used in the pipeline
 * (they map to CASE_SUBMITTED / CASE_EVALUATING for backward compat).
 */
export const LEGAL_TRANSITIONS: Partial<Record<CaseStatus, CaseStatus[]>> = {
  REGISTERED: ["PROFILE_SUBMITTED"],
  PROFILE_SUBMITTED: ["PRELIMINARY_ANALYSIS_READY"],
  PRELIMINARY_ANALYSIS_READY: ["CASE_SUBMITTED"],
  // Convenience aliases exposed at the API / test level
  CASE_SUBMITTED: ["CASE_EVALUATING", "EVALUATING", "BLOCKED_BY_SAFETY_GATE", "PENDING_PROFESSIONAL"] as CaseStatus[],
  CASE_EVALUATING: ["BLOCKED_BY_SAFETY_GATE", "PENDING_PROFESSIONAL"],
  // Short aliases used by the API routes and tests
  SUBMITTED: ["EVALUATING", "CASE_EVALUATING", "BLOCKED_BY_SAFETY_GATE", "PENDING_PROFESSIONAL"] as CaseStatus[],
  EVALUATING: ["BLOCKED_BY_SAFETY_GATE", "PENDING_PROFESSIONAL"],
  BLOCKED_BY_SAFETY_GATE: ["PENDING_PROFESSIONAL"],
  PENDING_PROFESSIONAL: ["PROFESSIONAL_RETURNED", "PENDING_ADMIN", "APPROVED"],
  PROFESSIONAL_RETURNED: ["CASE_SUBMITTED", "SUBMITTED"],
  PENDING_ADMIN: ["ADMIN_RETURNED", "APPROVED", "PUBLISHED"],
  ADMIN_RETURNED: ["PENDING_PROFESSIONAL"],
  APPROVED: ["PUBLISHED"],
  PUBLISHED: [],
};

export interface TransitionContext {
  isSafetyBlocked?: boolean;
  hasOverride?: boolean;
  actorRole?: "USER" | "PROFESSIONAL" | "ADMIN";
}

/**
 * Validates whether a state transition is legal.
 *
 * @param from        Current status
 * @param to          Target status
 * @param ctxOrBool   Either a TransitionContext object OR a plain boolean `hasOverride`
 *                    (convenience overload used in tests and API routes)
 */
export function canTransition(
  from: CaseStatus,
  to: CaseStatus,
  ctxOrBool?: TransitionContext | boolean
): boolean {
  if (from === to) return true;

  // Normalize overload
  const ctx: TransitionContext =
    typeof ctxOrBool === "boolean"
      ? { hasOverride: ctxOrBool }
      : ctxOrBool ?? {};

  const allowed = LEGAL_TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    return false;
  }

  // Safety gate enforcement: blocked → advanced states require override
  if (from === CaseStatus.BLOCKED_BY_SAFETY_GATE && !ctx.hasOverride) {
    if (
      to === CaseStatus.PENDING_ADMIN ||
      to === CaseStatus.APPROVED ||
      to === CaseStatus.PUBLISHED
    ) {
      return false;
    }
  }

  // Role checks for publication
  if (to === CaseStatus.PUBLISHED && ctx.actorRole && ctx.actorRole !== "ADMIN") {
    return false;
  }

  return true;
}

/**
 * Enforces state machine transitions server-side, throwing PipelineTransitionError (409) on violation.
 *
 * @param from        Current status
 * @param to          Target status
 * @param ctxOrBool   Either a TransitionContext object OR a plain boolean `hasOverride`
 */
export function assertTransition(
  from: CaseStatus,
  to: CaseStatus,
  ctxOrBool?: TransitionContext | boolean
): void {
  const ctx: TransitionContext =
    typeof ctxOrBool === "boolean"
      ? { hasOverride: ctxOrBool }
      : ctxOrBool ?? {};

  if (!canTransition(from, to, ctx)) {
    if (
      from === CaseStatus.BLOCKED_BY_SAFETY_GATE &&
      !ctx.hasOverride &&
      (to === CaseStatus.PENDING_ADMIN || to === CaseStatus.APPROVED || to === CaseStatus.PUBLISHED)
    ) {
      throw new PipelineTransitionError(
        `SAFETY_GATE_BLOCKED: Cannot transition from '${from}' to '${to}'. A high-severity herb-drug conflict requires written clinician override before progression.`
      );
    }
    throw new PipelineTransitionError(
      `ILLEGAL_TRANSITION: Cannot transition case status from '${from}' to '${to}'. Legal targets are: [${(LEGAL_TRANSITIONS[from] || []).join(", ")}].`
    );
  }
}
