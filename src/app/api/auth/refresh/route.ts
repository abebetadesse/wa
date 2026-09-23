import { ApiError, defineRoute } from "@/lib/api/route";
import { getAuthenticatedUser } from "@/lib/auth";

/** getAuthenticatedUser() re-issues the access cookie from a valid refresh session when needed. */
export const POST = defineRoute({
  access: "public",
  handler: async () => {
    const user = await getAuthenticatedUser();
    if (!user) throw ApiError.unauthorized("Session expired or revoked.");
    return { id: user.id, email: user.email, name: user.name, role: user.role, permissions: user.permissions };
  },
});
