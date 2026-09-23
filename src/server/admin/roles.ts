import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { roles, users } from "@/lib/db/schema";
import { ALL_PERMISSIONS } from "@/lib/db/schema/rbac";
import { ApiError } from "@/lib/api/route";

const KNOWN_PERMISSIONS = new Set<string>([...ALL_PERMISSIONS.map((permission) => permission.key), "*"]);

/** Permission lists may only contain keys from the RBAC catalogue; duplicates are removed. */
export const permissionList = z
  .array(z.string(), { message: "Permissions must be an array of permission strings." })
  .transform((list) => [...new Set(list)])
  .superRefine((list, ctx) => {
    const unknown = list.filter((key) => !KNOWN_PERMISSIONS.has(key));
    if (unknown.length) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Unknown permissions: ${unknown.join(", ")}` });
  });

export const newRole = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Role name is required.")
    .transform((name) => name.toLowerCase().replace(/\s+/g, "_"))
    .pipe(z.string().regex(/^[a-z][a-z0-9_]{1,39}$/, "Role names use letters, digits and underscores (2-40 characters).")),
  description: z.string().trim().default(""),
  permissions: permissionList.default([]),
});

export const rolePatch = z.object({
  description: z.string().trim().optional(),
  permissions: permissionList.optional(),
  isActive: z.boolean().optional(),
});

async function requireRole(id: string) {
  const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
  if (!role) throw ApiError.notFound("Role");
  return role;
}

async function memberCounts() {
  const rows = await db.select({ role: users.role, total: count() }).from(users).groupBy(users.role);
  return new Map(rows.map((row) => [row.role, Number(row.total)]));
}

export async function listRoles() {
  const [all, counts] = await Promise.all([db.select().from(roles).orderBy(desc(roles.isSystemRole), roles.name), memberCounts()]);
  return all.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    permissions: role.permissions || [],
    permissionsCount: Array.isArray(role.permissions) ? role.permissions.length : 0,
    isSystemRole: role.isSystemRole,
    isActive: role.isActive,
    userCount: counts.get(role.name) ?? 0,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  }));
}

export async function getRole(id: string) {
  const role = await requireRole(id);
  return { ...role, userCount: (await memberCounts()).get(role.name) ?? 0 };
}

export async function createRole(input: z.infer<typeof newRole>) {
  const [existing] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, input.name)).limit(1);
  if (existing) throw ApiError.conflict(`Role '${input.name}' already exists.`);
  const [role] = await db.insert(roles).values({ ...input, isSystemRole: false, isActive: true }).returning();
  return role;
}

export async function updateRole(id: string, patch: z.infer<typeof rolePatch>) {
  const role = await requireRole(id);
  if (role.name === "super_admin" && patch.permissions && !patch.permissions.includes("*")) {
    throw ApiError.badRequest("The super_admin role must keep the '*' permission.");
  }
  if (role.isSystemRole && patch.isActive === false) throw ApiError.badRequest("System roles cannot be deactivated.");
  const changes = Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined));
  await db.update(roles).set({ ...changes, updatedAt: new Date() }).where(eq(roles.id, id));
  return { previous: role, role: await requireRole(id) };
}

export async function deleteRole(id: string) {
  const role = await requireRole(id);
  if (role.isSystemRole) throw ApiError.forbidden("System roles cannot be deleted.");
  const members = (await memberCounts()).get(role.name) ?? 0;
  if (members > 0) {
    throw ApiError.badRequest(`Cannot delete role '${role.name}' because it is assigned to ${members} user(s). Reassign them first.`);
  }
  await db.delete(roles).where(eq(roles.id, id));
  return { id, name: role.name };
}

export async function listRoleMembers(id: string) {
  const role = await requireRole(id);
  const members = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      phone: users.phone,
      preferredLanguage: users.preferredLanguage,
      region: users.region,
      isActive: users.isActive,
      isSuspended: users.isSuspended,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, role.name))
    .orderBy(desc(users.createdAt));
  return { role: role.name, total: members.length, users: members };
}
