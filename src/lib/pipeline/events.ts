import fs from "fs";
import path from "path";
import crypto from "crypto";
import { CaseEvent, EventType, Role } from "./types";

const globalForEvents = globalThis as unknown as {
  _caseEvents?: Map<string, CaseEvent[]>;
};

export const inMemoryEvents: Map<string, CaseEvent[]> =
  globalForEvents._caseEvents ?? new Map<string, CaseEvent[]>();
globalForEvents._caseEvents = inMemoryEvents;

const AUDIT_DIR = path.resolve(process.cwd(), ".cases_cache", "events");

function persistEventToDisk(event: CaseEvent): void {
  try {
    if (!fs.existsSync(AUDIT_DIR)) {
      fs.mkdirSync(AUDIT_DIR, { recursive: true });
    }
    const filePath = path.join(AUDIT_DIR, `${event.caseId}.jsonl`);
    fs.appendFileSync(filePath, `${JSON.stringify(event)}\n`, "utf8");
  } catch {
    // Non-fatal if filesystem is restricted
  }
}

function loadEventsFromDisk(caseId: string): CaseEvent[] {
  try {
    const filePath = path.join(AUDIT_DIR, `${caseId}.jsonl`);
    if (fs.existsSync(filePath)) {
      const lines = fs.readFileSync(filePath, "utf8").trim().split("\n");
      return lines.filter(Boolean).map((l) => JSON.parse(l) as CaseEvent);
    }
  } catch {
    // Non-fatal
  }
  return [];
}

/**
 * Object-based overload for append (used by repository.ts and API routes).
 * Supports:
 *   appendCaseEvent({ caseId, actorId, actorRole, type, before, after, note })
 */
export async function appendCaseEvent(
  eventInput: {
    caseId: string;
    actorId: string;
    actorRole: Role;
    type: EventType;
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
    note?: string | null;
  }
): Promise<CaseEvent>;

/**
 * Positional overload for backward compatibility.
 */
export async function appendCaseEvent(
  caseId: string,
  actorId: string,
  actorRole: Role,
  type: EventType,
  options?: {
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
    note?: string | null;
  }
): Promise<CaseEvent>;

export async function appendCaseEvent(
  caseIdOrInput: string | {
    caseId: string;
    actorId: string;
    actorRole: Role;
    type: EventType;
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
    note?: string | null;
  },
  actorId?: string,
  actorRole?: Role,
  type?: EventType,
  options?: {
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
    note?: string | null;
  }
): Promise<CaseEvent> {
  let resolvedCaseId: string;
  let resolvedActorId: string;
  let resolvedActorRole: Role;
  let resolvedType: EventType;
  let resolvedBefore: Record<string, unknown> | null;
  let resolvedAfter: Record<string, unknown> | null;
  let resolvedNote: string | null;

  if (typeof caseIdOrInput === "object") {
    resolvedCaseId = caseIdOrInput.caseId;
    resolvedActorId = caseIdOrInput.actorId;
    resolvedActorRole = caseIdOrInput.actorRole;
    resolvedType = caseIdOrInput.type;
    resolvedBefore = caseIdOrInput.before ?? null;
    resolvedAfter = caseIdOrInput.after ?? null;
    resolvedNote = caseIdOrInput.note ?? null;
  } else {
    resolvedCaseId = caseIdOrInput;
    resolvedActorId = actorId!;
    resolvedActorRole = actorRole!;
    resolvedType = type!;
    resolvedBefore = options?.before ?? null;
    resolvedAfter = options?.after ?? null;
    resolvedNote = options?.note ?? null;
  }

  const event: CaseEvent = {
    id: `evt-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    caseId: resolvedCaseId,
    actorId: resolvedActorId,
    actorRole: resolvedActorRole,
    type: resolvedType,
    before: resolvedBefore,
    after: resolvedAfter,
    note: resolvedNote,
    at: new Date().toISOString(),
  };

  const existing = inMemoryEvents.get(resolvedCaseId) || [];
  existing.push(event);
  inMemoryEvents.set(resolvedCaseId, existing);

  persistEventToDisk(event);
  return event;
}

/**
 * Retrieves the complete immutable event log for a given case.
 * Append-only: no delete or update methods exist in this module.
 */
export function getCaseEvents(caseId: string): CaseEvent[] {
  const mem = inMemoryEvents.get(caseId);
  if (mem && mem.length > 0) return [...mem];

  const disk = loadEventsFromDisk(caseId);
  if (disk.length > 0) {
    inMemoryEvents.set(caseId, disk);
    return [...disk];
  }

  return [];
}
