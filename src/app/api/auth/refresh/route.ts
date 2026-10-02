import { ApiError, defineRoute } from "@/lib/api/route";
import { getAuthenticatedUser } from "@/lib/auth";

/** Request-handler auth may re-issue the access cookie from a valid refresh session. */
export const POST = defineRoute({
  access: "public",
  handler: async () => {
    const user = await getAuthenticatedUser({ refreshAccessCookie: true });
    if (!user) throw ApiError.unauthorized("Session expired or revoked.");
    return { id: user.id, email: user.email, name: user.name, role: user.role, permissions: user.permissions };
  },
});
