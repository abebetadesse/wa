import { and, count, desc, eq, like, or, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { authSessions, loginHistory, roles, userActivities, users, wellbeingGapReports } from "@/lib/db/schema";
import { getUserPermissions, hashPassword, validateEthiopianPhone, validatePasswordStrength, type AuthenticatedUser } from "@/lib/auth";
import { logAuditEvent, logUserActivity } from "@/lib/audit";
import { ApiError } from "@/lib/api/route";
import {
  assertCanAssignRole,
  assertCanManage,
  assertRoleChangeAllowed,
  assertStatusChangeAllowed,
  csvCell,
  generateTemporaryPassword,
  statusFlags,
  type UserStatus,
} from "./userPolicy";

/** Columns safe to return to administrators. Never includes password hashes or lockout internals. */
const adminUserColumns = {
  id: users.id,
  email: users.email,
  name: users.name,
  role: users.role,
  roleId: users.roleId,
  phone: users.phone,
  preferredLanguage: users.preferredLanguage,
  gender: users.gender,
  region: users.region,
  city: users.city,
  dateOfBirth: users.dateOfBirth,
  isVerified: users.isVerified,
  isActive: users.isActive,
  isSuspended: users.isSuspended,
  suspensionReason: users.suspensionReason,
  loginCount: users.loginCount,
  lastLoginAt: users.lastLoginAt,
  notes: users.notes,
  tags: users.tags,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

export type AdminUserView = Awaited<ReturnType<typeof findUser>>;

async function findUser(id: string) {
  const [user] = await db.select(adminUserColumns).from(users).where(eq(users.id, id)).limit(1);
  return user;
}

async function requireUser(id: string) {
  const user = await findUser(id);
  if (!user) throw ApiError.notFound("User");
  return user;
}

function normalizePhone(phone: string | null | undefined) {
  if (!phone) return null;
  const result = validateEthiopianPhone(phone);
  if (!result.isValid) throw ApiError.badRequest("Invalid Ethiopian phone format.");
  return result.formatted;
}

function assertStrongPassword(password: string) {
  const strength = validatePasswordStrength(password);
  if (!strength.isValid) throw ApiError.badRequest(strength.errors[0], { errors: strength.errors });
}

export interface ListUsersQuery {
  search?: string;
  role?: string;
  status?: UserStatus | "all";
  page: number;
  limit: number;
}

export async function listUsers(query: ListUsersQuery) {
  const conditions: SQL[] = [];
  if (query.search) {
    const pattern = `%${query.search}%`;
    conditions.push(or(like(users.name, pattern), like(users.email, pattern), like(users.phone, pattern))!);
  }
  if (query.role && query.role !== "all") conditions.push(eq(users.role, query.role));
  if (query.status === "active") conditions.push(and(eq(users.isActive, true), eq(users.isSuspended, false))!);
  if (query.status === "inactive") conditions.push(eq(users.isActive, false));
  if (query.status === "suspended") conditions.push(eq(users.isSuspended, true));
  const where = conditions.length ? and(...conditions) : undefined;

  const [{ total }] = await db.select({ total: count() }).from(users).where(where);
  const list = await db
    .select(adminUserColumns)
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(query.limit)
    .offset((query.page - 1) * query.limit);

  return { users: list, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) || 1 };
}

export async function getUserDetail(id: string) {
  const user = await requireUser(id);
  const [permissions, [cases], [sessions], recentActivities] = await Promise.all([
    getUserPermissions(user.id, user.role),
    db.select({ total: count() }).from(wellbeingGapReports).where(eq(wellbeingGapReports.userId, id)),
    db.select({ total: count() }).from(authSessions).where(eq(authSessions.userId, id)),
    db.select().from(userActivities).where(eq(userActivities.userId, id)).orderBy(desc(userActivities.createdAt)).limit(10),
  ]);
  return {
    ...user,
    permissions,
    stats: { casesCount: cases?.total ?? 0, reportsCount: cases?.total ?? 0, sessionsCount: sessions?.total ?? 0 },
    recentActivities,
  };
}

export async function getUserActivity(id: string) {
  const [activities, logins] = await Promise.all([
    db.select().from(userActivities).where(eq(userActivities.userId, id)).orderBy(desc(userActivities.createdAt)).limit(50),
    db.select().from(loginHistory).where(eq(loginHistory.userId, id)).orderBy(desc(loginHistory.createdAt)).limit(20),
  ]);
  return { activities, loginHistory: logins };
}

export async function getUserPermissionSet(id: string) {
  const user = await requireUser(id);
  return { userId: user.id, role: user.role, permissions: await getUserPermissions(user.id, user.role) };
}

export interface CreateUserInput {
  email: string;
  name: string;
  password?: string;
  role: string;
  phone?: string;
  preferredLanguage: string;
  region?: string;
  city?: string;
  gender?: string;
  dateOfBirth?: string;
  status: UserStatus;
  notes?: string;
  tags: string[];
}

export async function createUser(actor: AuthenticatedUser, input: CreateUserInput) {
  assertCanAssignRole(actor, input.role);
  const [role] = await db.select().from(roles).where(eq(roles.name, input.role)).limit(1);
  if (!role) throw ApiError.badRequest(`Role '${input.role}' does not exist.`);

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1);
  if (existing) throw ApiError.conflict("User with this email already exists.");

  const temporaryPassword = input.password ? undefined : generateTemporaryPassword();
  const password = input.password ?? temporaryPassword!;
  assertStrongPassword(password);

  const [created] = await db
    .insert(users)
    .values({
      email: input.email,
      name: input.name,
      passwordHash: hashPassword(password),
      role: input.role,
      roleId: role.id,
      phone: normalizePhone(input.phone),
      preferredLanguage: input.preferredLanguage,
      region: input.region || null,
      city: input.city || null,
      gender: input.gender || null,
      dateOfBirth: input.dateOfBirth || null,
      ...statusFlags(input.status),
      isVerified: true,
      notes: input.notes || null,
      tags: input.tags,
      createdBy: actor.id,
    })
    .returning({ id: users.id });

  await logUserActivity({
    userId: created.id,
    activityType: "account_created",
    description: `Account created by administrator ${actor.name || actor.email}`,
  });
  return { user: await requireUser(created.id), temporaryPassword };
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  preferredLanguage?: string;
  region?: string;
  city?: string;
  gender?: string;
  dateOfBirth?: string;
  notes?: string;
  tags?: string[];
}

export async function updateUser(actor: AuthenticatedUser, id: string, input: UpdateUserInput) {
  assertCanManage(actor, await requireUser(id));
  const changes = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
  if ("phone" in changes) changes.phone = normalizePhone(input.phone);
  if ("dateOfBirth" in changes) changes.dateOfBirth = input.dateOfBirth || null;
  await db.update(users).set({ ...changes, updatedBy: actor.id, updatedAt: new Date() }).where(eq(users.id, id));
  return requireUser(id);
}

export async function deleteUser(actor: AuthenticatedUser, id: string) {
  if (id === actor.id) throw ApiError.badRequest("You cannot delete your own account.");
  const user = await requireUser(id);
  await db.delete(users).where(eq(users.id, id));
  return { id, email: user.email, role: user.role };
}

async function revokeSessions(userId: string) {
  await db.update(authSessions).set({ revokedAt: new Date(), isActive: false }).where(eq(authSessions.userId, userId));
}

export async function setUserStatus(actor: AuthenticatedUser, id: string, status: UserStatus, reason?: string) {
  assertStatusChangeAllowed(actor, id, status);
  const user = await requireUser(id);
  assertCanManage(actor, user);

  const flags = statusFlags(status);
  await db
    .update(users)
    .set({ ...flags, suspensionReason: flags.isSuspended ? reason || null : null, updatedBy: actor.id, updatedAt: new Date() })
    .where(eq(users.id, id));
  if (!flags.isActive || flags.isSuspended) await revokeSessions(id);

  await logUserActivity({
    userId: id,
    activityType: "status_change",
    description: `Account status updated to ${status} by admin ${actor.name || actor.email}`,
    metadata: { reason },
  });
  return requireUser(id);
}

export async function changeUserRole(actor: AuthenticatedUser, id: string, roleName: string) {
  assertRoleChangeAllowed(actor, id, roleName);
  const [role] = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
  if (!role) throw ApiError.notFound(`Role '${roleName}'`);
  const user = await requireUser(id);

  await db.update(users).set({ role: roleName, roleId: role.id, updatedBy: actor.id, updatedAt: new Date() }).where(eq(users.id, id));
  await logUserActivity({
    userId: id,
    activityType: "role_change",
    description: `Role changed from ${user.role} to ${roleName} by Super Admin`,
    metadata: { previousRole: user.role, newRole: roleName },
  });
  return { previousRole: user.role, user: await requireUser(id) };
}

export async function resetUserPassword(actor: AuthenticatedUser, id: string, supplied?: string) {
  const user = await requireUser(id);
  assertCanManage(actor, user);
  const temporaryPassword = supplied ?? generateTemporaryPassword();
  assertStrongPassword(temporaryPassword);

  await db
    .update(users)
    .set({
      passwordHash: hashPassword(temporaryPassword),
      failedLoginAttempts: 0,
      lockoutUntil: null,
      passwordChangedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, id));
  await revokeSessions(id);

  await logUserActivity({
    userId: id,
    activityType: "security",
    description: `Password reset by administrator ${actor.name || actor.email}`,
  });
  return { email: user.email, temporaryPassword };
}

export async function recordImpersonation(actorId: string, target: { id: string; email: string; role: string }) {
  await logAuditEvent({
    userId: actorId,
    action: "user_impersonated",
    resourceType: "user",
    resourceId: target.id,
    details: { targetEmail: target.email, targetRole: target.role },
  });
  await logUserActivity({
    userId: target.id,
    activityType: "impersonation",
    description: `Session impersonated by Super Admin (${actorId})`,
  });
}

export { requireUser as getAdminUser };

const EXPORT_COLUMNS: [string, keyof NonNullable<AdminUserView>][] = [
  ["ID", "id"], ["Email", "email"], ["Full Name", "name"], ["Role", "role"], ["Phone", "phone"],
  ["Language", "preferredLanguage"], ["Region", "region"], ["City", "city"], ["Gender", "gender"],
  ["Date of Birth", "dateOfBirth"], ["Verified", "isVerified"], ["Active", "isActive"], ["Suspended", "isSuspended"],
  ["Login Count", "loginCount"], ["Last Login", "lastLoginAt"], ["Created At", "createdAt"],
];

export async function exportUsers() {
  return db.select(adminUserColumns).from(users).orderBy(desc(users.createdAt));
}

export function usersToCsv(rows: NonNullable<AdminUserView>[]) {
  const header = EXPORT_COLUMNS.map(([label]) => label).join(",");
  const lines = rows.map((row) => EXPORT_COLUMNS.map(([, key]) => csvCell(row[key])).join(","));
  return [header, ...lines].join("\n");
}
