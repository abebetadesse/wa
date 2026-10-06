import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { authSessions, users, roles } from "@/lib/db/schema";
import { eq, and, isNull, gt, desc } from "drizzle-orm";
import { getAuthSecret } from "./auth/secret";
import { DEFAULT_ROLE_PERMISSIONS, roleHasPermission, RoleName } from "./db/schema/rbac";
import { insertReturning } from "@/lib/db/write";

const ACCESS_COOKIE = "ethio_access";
const REFRESH_COOKIE = "ethio_refresh";
const IMPERSONATE_COOKIE = "ethio_impersonate";

const ACCESS_TTL_SECONDS = 15 * 60; // 15 minutes as per specification
const REFRESH_TTL_DAYS_STANDARD = 7;
const REFRESH_TTL_DAYS_REMEMBER = 30;

function authSecret(): string {
  return getAuthSecret();
}

function encode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return crypto.createHmac("sha256", authSecret()).update(value).digest("base64url");
}

export function createAccessToken(userId: string, role: string, permissions: string[] = []) {
  const payload = encode(
    JSON.stringify({
      sub: userId,
      role,
      permissions,
      exp: Math.floor(Date.now() / 1000) + ACCESS_TTL_SECONDS,
      iat: Math.floor(Date.now() / 1000),
    })
  );
  return `${payload}.${sign(payload)}`;
}

export function verifyAccessToken(token: string): { sub: string; role: string; permissions?: string[]; exp: number } | null {
  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sign(payload)), Buffer.from(signature))) return null;
    const value = JSON.parse(decode(payload)) as { sub: string; role: string; permissions?: string[]; exp: number };
    return value.exp > Math.floor(Date.now() / 1000) ? value : null;
  } catch {
    return null;
  }
}

/**
 * Enterprise Scrypt Password Hashing & Verification
 * Guaranteed compatibility with existing test suites.
 */
export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(password: string, encoded: string) {
  try {
    const [, salt, expected] = encoded.split(":");
    if (!salt || !expected) return false;
    const actual = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * Strict Password Strength Validation according to Section 2.1 & 2.4:
 * Minimum 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.
 */
export function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push("Password must be at least 8 characters long.");
  if (!/[A-Z]/.test(password)) errors.push("Password must include at least one uppercase letter.");
  if (!/[a-z]/.test(password)) errors.push("Password must include at least one lowercase letter.");
  if (!/[0-9]/.test(password)) errors.push("Password must include at least one digit.");
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("Password must include at least one special character.");
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * Validate Ethiopian Phone Number (+2519... or 09... or 07...)
 */
export function validateEthiopianPhone(phone: string): { isValid: boolean; formatted: string } {
  const clean = phone.replace(/[\s\-()]/g, "");
  if (/^\+251[79]\d{8}$/.test(clean)) {
    return { isValid: true, formatted: clean };
  }
  if (/^0[79]\d{8}$/.test(clean)) {
    return { isValid: true, formatted: `+251${clean.slice(1)}` };
  }
  if (/^[79]\d{8}$/.test(clean)) {
    return { isValid: true, formatted: `+251${clean}` };
  }
  return { isValid: false, formatted: phone };
}

export interface EstablishAuthOptions {
  request?: Request;
  rememberMe?: boolean;
  deviceInfo?: Record<string, unknown>;
}

export async function establishAuth(
  user: { id: string; role: string },
  optionsOrRequest?: Request | EstablishAuthOptions
) {
  const options: EstablishAuthOptions =
    optionsOrRequest instanceof Request ? { request: optionsOrRequest } : optionsOrRequest || {};

  const rememberMe = options.rememberMe ?? false;
  const refreshToken = crypto.randomBytes(48).toString("base64url");
  const ttlDays = rememberMe ? REFRESH_TTL_DAYS_REMEMBER : REFRESH_TTL_DAYS_STANDARD;
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

  // Resolve user permissions
  const permissions = await getUserPermissions(user.id, user.role);

  const forwarded = options.request?.headers;
  const ipAddress = forwarded?.get("x-real-ip")?.trim() || forwarded?.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const userAgent = options.request?.headers.get("user-agent") || "Browser Client";

  const [session] = await insertReturning(db, authSessions, {
      userId: user.id,
      refreshTokenHash: crypto.createHash("sha256").update(refreshToken).digest("hex"),
      ipAddress,
      userAgent,
      deviceInfo: options.deviceInfo || {},
      expiresAt,
      isActive: true,
    }, { fields: { id: authSessions.id } });

  const accessToken = createAccessToken(user.id, user.role, permissions);

  // Update session with access token
  if (session?.id) {
    await db.update(authSessions).set({ accessToken }).where(eq(authSessions.id, session.id));
  }

  const jar = await cookies();
  jar.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ACCESS_TTL_SECONDS,
    path: "/",
  });

  jar.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ttlDays * 24 * 60 * 60,
    path: "/",
  });

  return { accessToken, refreshToken, sessionId: session?.id, expiresAt };
}

export async function getUserPermissions(userId: string, roleName: string): Promise<string[]> {
  try {
    const [roleRecord] = await db
      .select({ permissions: roles.permissions })
      .from(roles)
      .where(eq(roles.name, roleName))
      .limit(1);

    if (roleRecord?.permissions && Array.isArray(roleRecord.permissions)) {
      return roleRecord.permissions;
    }
  } catch (error) {
    console.warn("Falling back to default permissions matrix for role:", roleName);
  }

  return DEFAULT_ROLE_PERMISSIONS[roleName as RoleName] || DEFAULT_ROLE_PERMISSIONS.user;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  roleId: string | null;
  phone: string | null;
  preferredLanguage: string;
  gender: string | null;
  region: string | null;
  city: string | null;
  isVerified: boolean;
  isActive: boolean;
  permissions: string[];
  isImpersonating?: boolean;
  originalUser?: { id: string; email: string; role: string };
}

export async function getAuthenticatedUser(options: { refreshAccessCookie?: boolean } = {}): Promise<AuthenticatedUser | null> {
  try {
    const jar = await cookies();
    let access = jar.get(ACCESS_COOKIE)?.value;
    let claims = access ? verifyAccessToken(access) : null;

    // Automatic silent refresh if access token expired but refresh token exists
    if (!claims) {
      const refresh = jar.get(REFRESH_COOKIE)?.value;
      if (refresh) {
        const refreshHash = crypto.createHash("sha256").update(refresh).digest("hex");
        const [activeSession] = await db
          .select()
          .from(authSessions)
          .where(
            and(
              eq(authSessions.refreshTokenHash, refreshHash),
              eq(authSessions.isActive, true),
              gt(authSessions.expiresAt, new Date())
            )
          )
          .limit(1);

        if (activeSession && !activeSession.revokedAt) {
          const [userRecord] = await db
            .select()
            .from(users)
            .where(and(eq(users.id, activeSession.userId), eq(users.isActive, true)))
            .limit(1);

          if (userRecord && !userRecord.isSuspended) {
            const userPermissions = await getUserPermissions(userRecord.id, userRecord.role);
            const newAccess = createAccessToken(userRecord.id, userRecord.role, userPermissions);
            if (options.refreshAccessCookie) {
              jar.set(ACCESS_COOKIE, newAccess, {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                maxAge: ACCESS_TTL_SECONDS,
                path: "/",
              });
            }
            claims = verifyAccessToken(newAccess);
          }
        }
      }
    }

    if (!claims) return null;

    // Fetch primary user
    const [user] = await db
      .select({
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
        isVerified: users.isVerified,
        isActive: users.isActive,
        isSuspended: users.isSuspended,
      })
      .from(users)
      .where(and(eq(users.id, claims.sub), eq(users.isActive, true)))
      .limit(1);

    if (!user || user.isSuspended) return null;

    const userPermissions = await getUserPermissions(user.id, user.role);

    // Impersonation support for super_admin
    const impersonateUserId = jar.get(IMPERSONATE_COOKIE)?.value;
    if (impersonateUserId && user.role === "super_admin") {
      const [impersonated] = await db
        .select({
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
          isVerified: users.isVerified,
          isActive: users.isActive,
        })
        .from(users)
        .where(eq(users.id, impersonateUserId))
        .limit(1);

      if (impersonated) {
        const impersonatedPerms = await getUserPermissions(impersonated.id, impersonated.role);
        return {
          ...impersonated,
          permissions: impersonatedPerms,
          isImpersonating: true,
          originalUser: { id: user.id, email: user.email, role: user.role },
        };
      }
    }

    return {
      ...user,
      permissions: userPermissions,
    };
  } catch (error) {
    console.error("Error retrieving authenticated user:", error);
    return null;
  }
}

export async function requireAuthenticatedUser(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("AUTH_REQUIRED");
  return user;
}

export async function requirePermission(permission: string): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();
  if (!roleHasPermission(user.permissions, permission)) {
    throw new Error(`PERMISSION_DENIED: Required permission '${permission}'`);
  }
  return user;
}

export async function requireAnyRole(roles: string[]): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();
  if (!roles.includes(user.role)) {
    throw new Error(`ROLE_DENIED: User does not have any of required roles: ${roles.join(", ")}`);
  }
  return user;
}

export async function clearAuth() {
  const jar = await cookies();
  const refresh = jar.get(REFRESH_COOKIE)?.value;
  if (refresh) {
    const refreshHash = crypto.createHash("sha256").update(refresh).digest("hex");
    await db
      .update(authSessions)
      .set({ revokedAt: new Date(), isActive: false })
      .where(eq(authSessions.refreshTokenHash, refreshHash));
  }
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
  jar.delete(IMPERSONATE_COOKIE);
}

export async function impersonateUser(targetUserId: string) {
  const currentUser = await requireAnyRole(["super_admin"]);
  const jar = await cookies();
  jar.set(IMPERSONATE_COOKIE, targetUserId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 2 * 60 * 60, // 2 hours
    path: "/",
  });
  return { success: true, originalUserId: currentUser.id, targetUserId };
}

export async function stopImpersonation() {
  const jar = await cookies();
  jar.delete(IMPERSONATE_COOKIE);
  return { success: true };
}

export async function getUserSessions(userId: string) {
  return await db
    .select({
      id: authSessions.id,
      ipAddress: authSessions.ipAddress,
      userAgent: authSessions.userAgent,
      deviceInfo: authSessions.deviceInfo,
      createdAt: authSessions.createdAt,
      expiresAt: authSessions.expiresAt,
      isActive: authSessions.isActive,
      revokedAt: authSessions.revokedAt,
    })
    .from(authSessions)
    .where(and(eq(authSessions.userId, userId), isNull(authSessions.revokedAt)))
    .orderBy(desc(authSessions.createdAt));
}

export async function revokeSession(sessionId: string, userId: string) {
  return await db
    .update(authSessions)
    .set({ revokedAt: new Date(), isActive: false })
    .where(and(eq(authSessions.id, sessionId), eq(authSessions.userId, userId)));
}

export async function revokeAllSessions(userId: string, exceptSessionId?: string) {
  if (exceptSessionId) {
    return await db
      .update(authSessions)
      .set({ revokedAt: new Date(), isActive: false })
      .where(and(eq(authSessions.userId, userId), and(isNull(authSessions.revokedAt))));
  }
  return await db
    .update(authSessions)
    .set({ revokedAt: new Date(), isActive: false })
    .where(eq(authSessions.userId, userId));
}

export { ACCESS_COOKIE, REFRESH_COOKIE, IMPERSONATE_COOKIE };
