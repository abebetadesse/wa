import { Role } from "./types";
import { ACCESS_COOKIE, verifyAccessToken } from "@/lib/auth";

export interface PipelineSession {
  userId: string;
  role: Role;
  name?: string;
  email?: string;
}

export function parseHeaderRole(roleStr?: string | null): Role | null {
  if (!roleStr) return null;
  const normalized = roleStr.toUpperCase().trim();
  if (normalized === "USER" || normalized === "PATIENT") return "USER";
  if (normalized === "PROFESSIONAL" || normalized === "EXPERT" || normalized === "PRACTITIONER" || normalized === "DOCTOR") return "PROFESSIONAL";
  if (normalized === "ADMIN" || normalized === "SUPER_ADMIN") return "ADMIN";
  return null;
}

function readCookie(cookieHeader: string, name: string): string | null {
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key !== name) continue;
    try {
      return decodeURIComponent(rest.join("="));
    } catch {
      return null;
    }
  }
  return null;
}

function sessionFromToken(token: string | null | undefined): PipelineSession | null {
  if (!token) return null;
  const claims = verifyAccessToken(token);
  if (!claims?.sub) return null;
  return { userId: claims.sub, role: parseHeaderRole(claims.role) || "USER" };
}

/**
 * The caller's identity comes only from a signed access token: the Authorization bearer header or
 * the sign-in cookie. Identity or role headers and cookies set by the client are never trusted,
 * because anyone can set them.
 */
export async function getPipelineSession(req: Request): Promise<PipelineSession | null> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const session = sessionFromToken(authHeader.slice(7).trim());
    if (session) return session;
  }

  const cookieHeader = req.headers.get("cookie");
  return cookieHeader ? sessionFromToken(readCookie(cookieHeader, ACCESS_COOKIE)) : null;
}

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AuthError";
  }
}

export async function enforcePipelineAuth(
  req: Request,
  allowedRoles?: Role[]
): Promise<PipelineSession> {
  const session = await getPipelineSession(req);
  if (!session) {
    throw new AuthError("Authentication required. Please provide a valid session or token.", 401);
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new AuthError(
      `Forbidden. This operation requires one of [${allowedRoles.join(", ")}], but current role is ${session.role}.`,
      403
    );
  }

  return session;
}
