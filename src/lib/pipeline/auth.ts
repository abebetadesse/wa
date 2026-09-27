import { Role } from "./types";
import { verifyAccessToken } from "@/lib/auth";

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

export async function getPipelineSession(req: Request): Promise<PipelineSession | null> {
  const headers = req.headers;

  // 1. Direct header simulation for deterministic testing / curl / sub-agent requests
  const actorIdHeader = headers.get("x-actor-id") || headers.get("x-user-id");
  const actorRoleHeader = headers.get("x-actor-role") || headers.get("x-user-role");

  if (actorIdHeader && actorRoleHeader) {
    const role = parseHeaderRole(actorRoleHeader);
    if (role) {
      return {
        userId: actorIdHeader,
        role,
        name: headers.get("x-user-name") || `${role} ${actorIdHeader}`,
      };
    }
  }

  // 2. Bearer token
  const authHeader = headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    const claims = verifyAccessToken(token);
    if (claims && claims.sub) {
      const role = parseHeaderRole(claims.role) || "USER";
      return {
        userId: claims.sub,
        role,
      };
    }
  }

  // 3. Cookie extraction
  const cookieHeader = headers.get("cookie");
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, decodeURIComponent(v.join("="))];
      })
    );
    const token = cookies["ethio_access"];
    if (token) {
      const claims = verifyAccessToken(token);
      if (claims && claims.sub) {
        const role = parseHeaderRole(claims.role) || "USER";
        return {
          userId: claims.sub,
          role,
        };
      }
    }

    // Also support convenience development cookie
    if (cookies["pipeline_user_id"] && cookies["pipeline_user_role"]) {
      const role = parseHeaderRole(cookies["pipeline_user_role"]);
      if (role) {
        return {
          userId: cookies["pipeline_user_id"],
          role,
        };
      }
    }
  }

  return null;
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
