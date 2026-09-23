import { requireAnyRole, requireAuthenticatedUser, type AuthenticatedUser } from "@/lib/auth";

import type { RoleName } from "@/lib/db/schema/rbac";

/** Every role an account can hold. "expert" is used by the expert desk but has no RBAC row yet. */
export type PlatformRole = RoleName | "expert";

export async function requireUser() {
  try {
    return { user: await requireAuthenticatedUser(), error: null };
  } catch {
    return { user: null, error: "unauthorized" as const };
  }
}

export async function requireRole(roles: PlatformRole[]): Promise<{
  user: AuthenticatedUser | null;
  error: "unauthorized" | "forbidden" | null;
}> {
  try {
    const user = await requireAnyRole(roles);
    return { user, error: null };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error && error.message.startsWith("ROLE_DENIED") ? "forbidden" : "unauthorized",
    };
  }
}
