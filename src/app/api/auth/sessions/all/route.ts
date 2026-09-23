import { defineRoute } from "@/lib/api/route";
import { clearAuth, revokeAllSessions } from "@/lib/auth";
import { logUserActivity } from "@/lib/audit";

export const DELETE = defineRoute({
  access: "user",
  handler: async ({ user }) => {
    await revokeAllSessions(user.id);
    await clearAuth();
    await logUserActivity({ userId: user.id, activityType: "security", description: "Revoked all active sessions" });
    return { revokedAll: true };
  },
  audit: { action: "all_sessions_revoked", resourceType: "session", resourceId: ({ user }) => user.id },
});
