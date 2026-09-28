/**
 * Workspace access: who may do what inside a business. Enforced on every business-scoped call.
 */
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { businessMembers } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import type { AuthenticatedUser } from "@/lib/auth";

export const MEMBER_ROLES = ["owner", "manager", "practitioner", "staff"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

/** Capabilities per role. Owners and managers run the business; practitioners serve clients. */
const CAPABILITIES = {
  view: ["owner", "manager", "practitioner", "staff"],
  manageBookings: ["owner", "manager", "practitioner", "staff"],
  manageClients: ["owner", "manager", "practitioner"],
  viewClientNotes: ["owner", "manager", "practitioner"],
  manageServices: ["owner", "manager"],
  manageSchedule: ["owner", "manager"],
  manageInventory: ["owner", "manager", "practitioner"],
  recordPayments: ["owner", "manager", "staff"],
  voidPayments: ["owner", "manager"],
  viewFinance: ["owner", "manager"],
  manageProfile: ["owner", "manager"],
  manageTeam: ["owner"],
  respondReviews: ["owner", "manager"],
  message: ["owner", "manager", "practitioner", "staff"],
} as const satisfies Record<string, readonly MemberRole[]>;

export type Capability = keyof typeof CAPABILITIES;

export function roleCan(role: MemberRole, capability: Capability) {
  return (CAPABILITIES[capability] as readonly MemberRole[]).includes(role);
}

export interface Membership {
  id: string;
  businessId: string;
  role: MemberRole;
}

export async function membershipsOf(userId: string): Promise<Membership[]> {
  const rows = await db
    .select({ id: businessMembers.id, businessId: businessMembers.businessId, role: businessMembers.role })
    .from(businessMembers)
    .where(eq(businessMembers.userId, userId));
  return rows.map((row) => ({ ...row, role: row.role as MemberRole }));
}

/** Throws 404 (not 403) for non-members so business ids cannot be probed. */
export async function requireCapability(user: AuthenticatedUser, businessId: string, capability: Capability): Promise<Membership> {
  const [row] = await db
    .select({ id: businessMembers.id, businessId: businessMembers.businessId, role: businessMembers.role })
    .from(businessMembers)
    .where(and(eq(businessMembers.businessId, businessId), eq(businessMembers.userId, user.id)))
    .limit(1);
  const isPlatformAdmin = user.role === "admin" || user.role === "super_admin";
  if (!row) {
    if (isPlatformAdmin && capability === "view") return { id: "platform-admin", businessId, role: "staff" };
    throw ApiError.notFound("Business");
  }
  const membership = { ...row, role: row.role as MemberRole };
  if (!roleCan(membership.role, capability)) throw ApiError.forbidden("Your role in this business does not allow that.");
  return membership;
}
