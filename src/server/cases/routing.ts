import { eq } from "drizzle-orm";
import { ApiError } from "@/lib/api/route";
import { db } from "@/lib/db";
import { roles } from "@/lib/db/schema";
import { getSettings, updateSettings, type CaseRoutingSettings } from "@/server/settings";

function canReviewCases(role: { name: string; permissions: string[]; isActive: boolean }) {
  return role.isActive && (
    role.name === "admin" ||
    role.name === "super_admin" ||
    role.name === "expert" ||
    role.name === "practitioner" ||
    role.permissions.includes("*") ||
    role.permissions.includes("cases:review")
  );
}

export async function listCaseReviewRoles() {
  const available = await db.select({
    name: roles.name,
    description: roles.description,
    permissions: roles.permissions,
    isActive: roles.isActive,
  }).from(roles);

  return available
    .filter(canReviewCases)
    .map(({ name, description }) => ({ name, description }));
}

export async function assertCaseReviewRole(roleName: string) {
  const [role] = await db.select({
    name: roles.name,
    permissions: roles.permissions,
    isActive: roles.isActive,
  }).from(roles).where(eq(roles.name, roleName)).limit(1);

  if (!role || !canReviewCases(role)) {
    throw ApiError.badRequest("Choose an active role with case-review access.");
  }
  return role.name;
}

export async function saveCaseRouting(input: CaseRoutingSettings, actorId: string) {
  const roleNames = [...new Set(Object.values(input.domains))];
  await Promise.all(roleNames.map(assertCaseReviewRole));
  return updateSettings("caseRouting", input, actorId);
}

export async function caseRoutingDesk() {
  const [settings, availableRoles] = await Promise.all([
    getSettings("caseRouting"),
    listCaseReviewRoles(),
  ]);
  return { settings, roles: availableRoles };
}
