/**
 * Experts are real accounts: role `expert` or `practitioner`, credentials verified by an admin,
 * and the case domain listed in their credentials. There is no built-in roster.
 */
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import type { ExpertSummary } from "./views";
import type { WorkflowDomain } from "./types";

export const EXPERT_ROLES = ["expert", "practitioner"] as const;

export interface ExpertCredentials {
  verifiedAt?: string;
  title?: string;
  domains?: string[];
}

export interface ExpertCandidate {
  id: string;
  role: string;
  isActive?: boolean;
  isSuspended?: boolean;
  practitionerCredentials?: ExpertCredentials | null;
}

export function reviewableDomains(user: ExpertCandidate): WorkflowDomain[] {
  const credentials = user.practitionerCredentials;
  if (!(EXPERT_ROLES as readonly string[]).includes(user.role)) return [];
  if (user.isActive === false || user.isSuspended) return [];
  if (!credentials?.verifiedAt) return [];
  return (credentials.domains ?? []) as WorkflowDomain[];
}

export function canReview(user: ExpertCandidate, domain: WorkflowDomain) {
  return reviewableDomains(user).includes(domain);
}

export async function loadExpert(userId: string): Promise<ExpertCandidate> {
  const [row] = await db
    .select({ id: users.id, role: users.role, isActive: users.isActive, isSuspended: users.isSuspended, practitionerCredentials: users.practitionerCredentials })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row) throw ApiError.forbidden("Expert access required.");
  return row;
}

export async function expertSummaries(ids: string[]): Promise<Map<string, ExpertSummary>> {
  if (!ids.length) return new Map();
  const rows = await db
    .select({ id: users.id, name: users.name, practitionerCredentials: users.practitionerCredentials })
    .from(users)
    .where(inArray(users.id, [...new Set(ids)]));
  return new Map(rows.map((row) => [row.id, { id: row.id, name: row.name, credential: row.practitionerCredentials?.title ?? null }]));
}
