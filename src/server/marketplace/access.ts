/**
 * Workspace access: who may do what inside a business. Enforced on every business-scoped call.
 */
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { businessMembers } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import type { AuthenticatedUser } from "@/lib/auth";

import { roleCan, type Capability, type MemberRole } from "./roles";

export { MEMBER_ROLES, roleCan, type Capability, type MemberRole } from "./roles";

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
