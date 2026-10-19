import crypto from "crypto";
import { CaseEvent, EventType, Role } from "./types";

export interface CaseEventInput {
  caseId: string;
  actorId: string;
  actorRole: Role;
  type: EventType;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  note?: string | null;
}

/**
 * A new audit event, stamped with its id and time. The event log is append-only: the pipeline
 * store inserts events and offers no way to change or delete one.
 */
export function newCaseEvent(input: CaseEventInput): CaseEvent {
  return {
    id: `evt-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    caseId: input.caseId,
    actorId: input.actorId,
    actorRole: input.actorRole,
    type: input.type,
    before: input.before ?? null,
    after: input.after ?? null,
    note: input.note ?? null,
    at: new Date().toISOString(),
  };
}
