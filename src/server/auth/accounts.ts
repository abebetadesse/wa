import { and, count, desc, eq, gt, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { emailVerifications, passwordResets, roles, users, wellbeingGapReports, wellbeingProfiles } from "@/lib/db/schema";
import {
  establishAuth,
  getUserPermissions,
  hashPassword,
  revokeAllSessions,
  validateEthiopianPhone,
  validatePasswordStrength,
  verifyPassword,
  type AuthenticatedUser,
} from "@/lib/auth";
import { logAuditEvent, logLoginAttempt, logUserActivity } from "@/lib/audit";
import { ApiError } from "@/lib/api/route";
import { createOtpCode, createSecretToken, deliverCode, digest } from "./codes";

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;
const RESET_TTL_MS = 60 * 60 * 1000;
const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const MIN_AGE_YEARS = 13;

interface RequestMeta { request: Request; ip: string; userAgent: string }

function normalizePhone(phone?: string | null) {
  if (!phone) return null;
  const result = validateEthiopianPhone(phone);
  if (!result.isValid) throw ApiError.badRequest("Please enter a valid Ethiopian phone number (+251 9... or +251 7...).");
  return result.formatted;
}

export function assertStrongPassword(password: string) {
  const strength = validatePasswordStrength(password);
  if (!strength.isValid) throw ApiError.badRequest(strength.errors[0], { errors: strength.errors });
}

export function assertMinimumAge(dateOfBirth: string | undefined, now = new Date()) {
  if (!dateOfBirth) return;
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) throw ApiError.badRequest("Date of birth is not a valid date.");
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - MIN_AGE_YEARS);
  if (birth > cutoff) throw ApiError.badRequest(`You must be at least ${MIN_AGE_YEARS} years old to register.`);
}

async function sessionSummary(user: { id: string; email: string; name: string | null; role: string; roleId: string | null; preferredLanguage: string; isVerified: boolean }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    roleId: user.roleId,
    preferredLanguage: user.preferredLanguage,
    isVerified: user.isVerified,
    permissions: await getUserPermissions(user.id, user.role),
  };
}

// ── Login ────────────────────────────────────────────────────────────────────

export async function login(input: { email: string; password: string; rememberMe: boolean }, meta: RequestMeta) {
  const attempt = { email: input.email, ipAddress: meta.ip, userAgent: meta.userAgent };
  const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);

  if (!user) {
    await logLoginAttempt({ ...attempt, status: "failed", failureReason: "User account not found" });
    throw ApiError.unauthorized("Invalid email or password.");
  }

  if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
    const minutes = Math.ceil((new Date(user.lockoutUntil).getTime() - Date.now()) / 60_000);
    await logLoginAttempt({ ...attempt, userId: user.id, status: "locked", failureReason: `Account locked for ${minutes} more minutes` });
    throw new ApiError(423, `Account is temporarily locked due to repeated failed attempts. Please wait ${minutes} minutes before trying again.`);
  }

  const valid = user.passwordHash ? verifyPassword(input.password, user.passwordHash) : false;
  if (!valid) {
    const attempts = (user.failedLoginAttempts || 0) + 1;
    const locked = attempts >= MAX_LOGIN_ATTEMPTS;
    await db
      .update(users)
      .set({ failedLoginAttempts: attempts, lockoutUntil: locked ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000) : null, updatedAt: new Date() })
      .where(eq(users.id, user.id));
    await logLoginAttempt({
      ...attempt,
      userId: user.id,
      status: locked ? "locked" : "failed",
      failureReason: locked ? "Max failed attempts exceeded - locked" : `Incorrect password (attempt ${attempts}/${MAX_LOGIN_ATTEMPTS})`,
    });
    if (locked) throw new ApiError(423, `Too many failed attempts. Your account is locked for ${LOCKOUT_MINUTES} minutes.`);
    throw ApiError.unauthorized("Invalid email or password.");
  }

  // Account status is only revealed to someone who knows the password.
  if (user.isSuspended) {
    await logLoginAttempt({ ...attempt, userId: user.id, status: "failed", failureReason: "Account suspended" });
    throw ApiError.forbidden(`This account has been suspended. ${user.suspensionReason || "Please contact platform support."}`);
  }
  if (!user.isActive) throw ApiError.forbidden("This account is inactive. Please contact support.");

  await db
    .update(users)
    .set({ failedLoginAttempts: 0, lockoutUntil: null, lastLoginAt: new Date(), loginCount: (user.loginCount || 0) + 1, updatedAt: new Date() })
    .where(eq(users.id, user.id));
  await logLoginAttempt({ ...attempt, userId: user.id, status: "success" });

  const session = await establishAuth(
    { id: user.id, role: user.role },
    { rememberMe: input.rememberMe, request: meta.request, deviceInfo: { userAgent: meta.userAgent, ip: meta.ip } },
  );
  await logAuditEvent({
    userId: user.id,
    action: "user_login",
    resourceType: "user",
    resourceId: user.id,
    details: { rememberMe: input.rememberMe, role: user.role },
    ipAddress: meta.ip,
    sessionId: session.sessionId,
  });
  await logUserActivity({
    userId: user.id,
    activityType: "login",
    description: `Logged in successfully (${input.rememberMe ? "Extended session" : "Standard session"})`,
  });
  return sessionSummary(user);
}

// ── Registration & verification ──────────────────────────────────────────────

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  dateOfBirth?: string;
  preferredLanguage: string;
  gender?: string;
  region?: string;
  city?: string;
}

async function issueVerification(user: { id: string; email: string }) {
  const token = createSecretToken();
  const otpCode = createOtpCode();
  // Invalidate earlier outstanding codes so only the newest one works.
  await db.update(emailVerifications).set({ expiresAt: new Date() }).where(and(eq(emailVerifications.userId, user.id), isNull(emailVerifications.verifiedAt)));
  await db.insert(emailVerifications).values({
    userId: user.id,
    token: digest(token),
    otpCode: digest(otpCode),
    expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
  });
  return deliverCode({ to: user.email, purpose: "email_verification", code: otpCode, token });
}

export async function register(input: RegisterInput, meta: RequestMeta) {
  assertStrongPassword(input.password);
  assertMinimumAge(input.dateOfBirth);
  const phone = normalizePhone(input.phone);

  const [existing] = await db
    .select({ email: users.email })
    .from(users)
    .where(phone ? or(eq(users.email, input.email), eq(users.phone, phone)) : eq(users.email, input.email))
    .limit(1);
  if (existing) {
    throw ApiError.conflict(
      existing.email.toLowerCase() === input.email
        ? "An account with this email address already exists."
        : "An account with this phone number already exists.",
    );
  }

  const [userRole] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, "user")).limit(1);
  const [created] = await db
    .insert(users)
    .values({
      email: input.email,
      name: input.name || input.email.split("@")[0],
      passwordHash: hashPassword(input.password),
      role: "user",
      roleId: userRole?.id || null,
      phone,
      dateOfBirth: input.dateOfBirth || null,
      gender: input.gender || null,
      region: input.region || null,
      city: input.city || null,
      preferredLanguage: input.preferredLanguage,
      isVerified: false,
      isActive: true,
    })
    .returning({ id: users.id });

  const dev = await issueVerification({ id: created.id, email: input.email });
  await establishAuth({ id: created.id, role: "user" }, { request: meta.request });
  await logAuditEvent({
    userId: created.id,
    action: "user_registered",
    resourceType: "user",
    resourceId: created.id,
    details: { email: input.email, preferredLanguage: input.preferredLanguage, region: input.region },
    ipAddress: meta.ip,
  });
  await logUserActivity({
    userId: created.id,
    activityType: "registration",
    description: "Created new wellbeing account",
    metadata: { preferredLanguage: input.preferredLanguage, region: input.region },
  });

  return {
    id: created.id,
    email: input.email,
    name: input.name || input.email.split("@")[0],
    role: "user",
    preferredLanguage: input.preferredLanguage,
    isVerified: false,
    requiresVerification: true,
    ...dev,
  };
}

/**
 * Verifies an email with a link token or a 6-digit code. It never signs anyone in: codes prove
 * control of the inbox, not knowledge of the password.
 */
export async function verifyEmail(input: { token?: string; code?: string; email?: string }, current: AuthenticatedUser | null) {
  let userId = current?.id;
  if (!userId && input.email) {
    const [found] = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1);
    userId = found?.id;
  }
  if (!input.token && !(userId && input.code)) {
    throw ApiError.badRequest("Please log in or provide your registered email and code.");
  }

  const fresh = and(isNull(emailVerifications.verifiedAt), gt(emailVerifications.expiresAt, new Date()));
  const [record] = input.token
    ? await db.select().from(emailVerifications).where(and(eq(emailVerifications.token, digest(input.token)), fresh)).limit(1)
    : await db
        .select()
        .from(emailVerifications)
        .where(and(eq(emailVerifications.userId, userId!), eq(emailVerifications.otpCode, digest(input.code!)), fresh))
        .orderBy(desc(emailVerifications.createdAt))
        .limit(1);
  if (!record) throw ApiError.badRequest("Invalid or expired verification code. Please request a new one.");

  await db.update(emailVerifications).set({ verifiedAt: new Date() }).where(eq(emailVerifications.id, record.id));
  await db.update(users).set({ isVerified: true, updatedAt: new Date() }).where(eq(users.id, record.userId));
  await logUserActivity({ userId: record.userId, activityType: "verification", description: "Email address verified successfully" });
  return { userId: record.userId, isVerified: true, message: "Account verified successfully! Welcome to the Ethiopian Wisdom Platform." };
}

export async function resendVerification(email: string | undefined, current: AuthenticatedUser | null) {
  const [user] = email
    ? await db.select({ id: users.id, email: users.email, isVerified: users.isVerified }).from(users).where(eq(users.email, email)).limit(1)
    : current
      ? await db.select({ id: users.id, email: users.email, isVerified: users.isVerified }).from(users).where(eq(users.id, current.id)).limit(1)
      : [];
  const message = "If the account exists and is unverified, a new verification code has been sent.";
  // Same response whether or not the account exists, to avoid account enumeration.
  if (!user || user.isVerified) return { message };
  return { message, ...(await issueVerification(user)) };
}

// ── Password reset & change ──────────────────────────────────────────────────

export async function requestPasswordReset(email: string) {
  const message = "If an account matches that email address, a password reset link has been sent.";
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !user.isActive || user.isSuspended) return { message };

  const token = createSecretToken();
  await db.update(passwordResets).set({ usedAt: new Date() }).where(and(eq(passwordResets.userId, user.id), isNull(passwordResets.usedAt)));
  await db.insert(passwordResets).values({ userId: user.id, token: digest(token), expiresAt: new Date(Date.now() + RESET_TTL_MS) });
  await logAuditEvent({ userId: user.id, action: "password_reset_requested", resourceType: "user", resourceId: user.id, details: { email } });
  await logUserActivity({ userId: user.id, activityType: "security", description: "Password reset token requested" });
  return { message, ...(await deliverCode({ to: user.email, purpose: "password_reset", token })) };
}

export async function resetPassword(token: string, password: string) {
  assertStrongPassword(password);
  const [record] = await db
    .select()
    .from(passwordResets)
    .where(and(eq(passwordResets.token, digest(token)), isNull(passwordResets.usedAt), gt(passwordResets.expiresAt, new Date())))
    .limit(1);
  if (!record) throw ApiError.badRequest("Invalid, expired, or already used password reset token.");

  await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.id, record.id));
  await db
    .update(users)
    .set({ passwordHash: hashPassword(password), passwordChangedAt: new Date(), failedLoginAttempts: 0, lockoutUntil: null, updatedAt: new Date() })
    .where(eq(users.id, record.userId));
  await revokeAllSessions(record.userId);
  await logAuditEvent({ userId: record.userId, action: "password_reset_completed", resourceType: "user", resourceId: record.userId });
  await logUserActivity({ userId: record.userId, activityType: "security", description: "Password reset completed successfully" });
  return { message: "Your password has been reset successfully. Please log in with your new credentials." };
}

export async function changePassword(user: AuthenticatedUser, currentPassword: string, newPassword: string, request: Request) {
  const [row] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, user.id)).limit(1);
  if (!row?.passwordHash || !verifyPassword(currentPassword, row.passwordHash)) {
    throw ApiError.badRequest("Current password does not match our records.");
  }
  assertStrongPassword(newPassword);
  await db.update(users).set({ passwordHash: hashPassword(newPassword), passwordChangedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, user.id));
  // Sign out every other device, keep this one signed in.
  await revokeAllSessions(user.id);
  await establishAuth({ id: user.id, role: user.role }, { request });
  await logUserActivity({ userId: user.id, activityType: "security", description: "Updated account password" });
  return { message: "Password updated successfully." };
}

// ── Own profile ──────────────────────────────────────────────────────────────

export async function getOwnAccount(user: AuthenticatedUser) {
  const [[cases], [wellbeingProfile]] = await Promise.all([
    db.select({ count: count() }).from(wellbeingGapReports).where(eq(wellbeingGapReports.userId, user.id)),
    db.select().from(wellbeingProfiles).where(eq(wellbeingProfiles.userId, user.id)).limit(1),
  ]);
  return { ...user, stats: { casesCount: cases?.count ?? 0 }, wellbeingProfile: wellbeingProfile ?? null };
}

export interface OwnAccountInput {
  name?: string;
  phone?: string;
  preferredLanguage?: string;
  region?: string;
  city?: string;
  gender?: string;
  dateOfBirth?: string;
}

export async function updateOwnAccount(user: AuthenticatedUser, input: OwnAccountInput) {
  const changes: Record<string, unknown> = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
  if ("phone" in changes) changes.phone = normalizePhone(input.phone);
  if ("dateOfBirth" in changes) {
    assertMinimumAge(input.dateOfBirth);
    changes.dateOfBirth = input.dateOfBirth || null;
  }
  await db.update(users).set({ ...changes, updatedAt: new Date() }).where(eq(users.id, user.id));
  await logUserActivity({ userId: user.id, activityType: "profile", description: "Updated personal account details" });

  const [updated] = await db
    .select({
      id: users.id, email: users.email, name: users.name, phone: users.phone, preferredLanguage: users.preferredLanguage,
      region: users.region, city: users.city, gender: users.gender, dateOfBirth: users.dateOfBirth, role: users.role,
      isVerified: users.isVerified,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  return updated;
}
