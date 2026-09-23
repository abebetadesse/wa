import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { revokeSession } from "@/lib/auth";
import { logUserActivity } from "@/lib/audit";

export const DELETE = defineRoute({
  access: "user",
  params: z.object({ id: z.string().min(1) }),
  handler: async ({ user, params }) => {
    await revokeSession(params.id, user.id);
    await logUserActivity({ userId: user.id, activityType: "security", description: "Revoked active session", metadata: { sessionId: params.id } });
    return { revoked: params.id };
  },
  audit: { action: "session_revoked", resourceType: "session", resourceId: ({ params }) => params.id },
});
