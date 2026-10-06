/**
 * Single entry point for API route handlers: access control, input validation,
 * audit logging and a consistent `{ success, data | error }` envelope.
 *
 *   export const POST = defineRoute({
 *     access: { roles: ["admin", "super_admin"] },
 *     body: z.object({ name: z.string().min(1) }),
 *     handler: async ({ body, user }) => createRole(body, user),
 *     audit: { action: "role_created", resourceType: "role", resourceId: (_ctx, role) => role.id },
 *   });
 *
 * Declare `handler` before `audit` so the audit callback sees the handler's result type.
 * Validate dynamic segments with `params: z.object({ id: z.string() })`. A handler may return a
 * `Response` (files, streams) to bypass the JSON envelope.
 */
import { NextRequest, NextResponse } from "next/server";
import { ZodError, type ZodType, type ZodTypeDef } from "zod";
import { getAuthenticatedUser, type AuthenticatedUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { roleHasPermission } from "@/lib/db/schema/rbac";
import { clientIp } from "./rateLimit";
import { consumeSharedRateLimit } from "./sharedRateLimit";
import type { PlatformRole } from "./authGuard";

export type RouteAccess =
  | "public"
  | "user"
  | { roles: readonly PlatformRole[] }
  | { permission: string };

type Schema<T> = ZodType<T, ZodTypeDef, unknown>;
type Params = Record<string, string | string[] | undefined>;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string, details?: Record<string, unknown>) { return new ApiError(400, message, details); }
  static unauthorized(message = "Authentication required.") { return new ApiError(401, message); }
  static forbidden(message = "Insufficient permissions.") { return new ApiError(403, message); }
  static notFound(resource = "Resource") { return new ApiError(404, `${resource} not found.`); }
  static conflict(message: string) { return new ApiError(409, message); }
}

type UserFor<A extends RouteAccess> = A extends "public" ? AuthenticatedUser | null : AuthenticatedUser;

export interface RouteContext<A extends RouteAccess, B, Q, P extends Params> {
  req: NextRequest;
  params: P;
  body: B;
  query: Q;
  user: UserFor<A>;
}

export interface RouteDefinition<A extends RouteAccess, B, Q, P extends Params, R> {
  access: A;
  /** Validates dynamic route segments, e.g. `z.object({ id: z.string().uuid() })`. */
  params?: Schema<P>;
  body?: Schema<B>;
  query?: Schema<Q>;
  /** Written after a successful handler run. `resourceId` may be derived from the result. */
  audit?: {
    action: string | ((ctx: RouteContext<A, B, Q, P>, result: NoInfer<R>) => string);
    resourceType: string;
    resourceId?: (ctx: RouteContext<A, B, Q, P>, result: NoInfer<R>) => string | undefined;
    details?: (ctx: RouteContext<A, B, Q, P>, result: NoInfer<R>) => Record<string, unknown>;
  };
  /** Per-client-IP request budget for this route (e.g. login, code verification). */
  rateLimit?: { limit: number; windowMs: number };
  status?: number;
  handler: (ctx: RouteContext<A, B, Q, P>) => Promise<R> | R;
}

/** Pure access decision; throws ApiError when the user may not proceed. */
export function checkAccess(access: RouteAccess, user: AuthenticatedUser | null): AuthenticatedUser | null {
  if (access === "public") return user;
  if (!user) throw ApiError.unauthorized();
  if (access === "user") return user;
  if ("roles" in access) {
    if (!access.roles.includes(user.role as PlatformRole)) throw ApiError.forbidden();
    return user;
  }
  if (!roleHasPermission(user.permissions, access.permission)) throw ApiError.forbidden();
  return user;
}

async function readBody<B>(req: NextRequest, schema: Schema<B>): Promise<B> {
  let raw: unknown;
  const type = req.headers.get("content-type") || "";
  if (type.includes("multipart/form-data") || type.includes("application/x-www-form-urlencoded")) {
    raw = Object.fromEntries((await req.formData()).entries());
  } else {
    const text = await req.text();
    try {
      raw = text ? JSON.parse(text) : {};
    } catch {
      throw ApiError.badRequest("Request body must contain valid JSON.");
    }
  }
  return schema.parse(raw);
}

function readQuery<Q>(req: NextRequest, schema: Schema<Q>): Q {
  const entries: Record<string, string | string[]> = {};
  for (const key of new Set(req.nextUrl.searchParams.keys())) {
    const values = req.nextUrl.searchParams.getAll(key);
    entries[key] = values.length > 1 ? values : values[0];
  }
  return schema.parse(entries);
}

// Structural check: `instanceof` fails when ESM and CJS copies of zod are both loaded.
function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError || (error instanceof Error && error.name === "ZodError" && Array.isArray((error as ZodError).issues));
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: error.message, ...(error.details ? { details: error.details } : {}) },
      { status: error.status },
    );
  }
  if (isZodError(error)) {
    const fields = error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
    return NextResponse.json(
      { success: false, error: fields[0] ? `${fields[0].path || "input"}: ${fields[0].message}` : "Invalid input.", fields },
      { status: 400 },
    );
  }
  console.error("[api] unhandled error:", error);
  return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
}

export function defineRoute<A extends RouteAccess, B = undefined, Q = undefined, P extends Params = Params, R = unknown>(
  def: RouteDefinition<A, B, Q, P, R>,
) {
  return async (req: NextRequest, segment: { params: Promise<Params> }): Promise<Response> => {
    try {
      if (def.rateLimit) {
        const key = `${req.method} ${req.nextUrl.pathname} ${clientIp(req.headers)}`;
        const verdict = await consumeSharedRateLimit(key, def.rateLimit.limit, def.rateLimit.windowMs);
        if (!verdict.allowed) {
          return NextResponse.json(
            { success: false, error: "Too many requests. Please wait and try again." },
            { status: 429, headers: { "Retry-After": String(verdict.retryAfterSeconds) } },
          );
        }
      }
      const user = checkAccess(def.access, await getAuthenticatedUser({ refreshAccessCookie: true }));
      const rawParams = (await segment?.params) ?? {};
      const params = (def.params ? def.params.parse(rawParams) : rawParams) as P;
      const body = (def.body ? await readBody(req, def.body) : undefined) as B;
      const query = (def.query ? readQuery(req, def.query) : undefined) as Q;
      const ctx = { req, params, body, query, user: user as UserFor<A> };

      const result = await def.handler(ctx);

      if (def.audit) {
        const { action, resourceType, resourceId, details } = def.audit;
        await logAuditEvent({
          userId: user?.originalUser?.id ?? user?.id ?? null,
          action: typeof action === "function" ? action(ctx, result) : action,
          resourceType,
          resourceId: resourceId?.(ctx, result),
          details: {
            ...details?.(ctx, result),
            ...(user?.isImpersonating ? { impersonatedUserId: user.id } : {}),
          },
          ipAddress: clientIp(req.headers),
          userAgent: req.headers.get("user-agent"),
        });
      }

      if (result instanceof Response) return result;
      return NextResponse.json({ success: true, data: result ?? null }, { status: def.status ?? 200 });
    } catch (error) {
      return errorResponse(error);
    }
  };
}
