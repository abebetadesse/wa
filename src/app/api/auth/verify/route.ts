import { defineRoute } from "@/lib/api/route";
import { verifyEmail } from "@/server/auth/accounts";
import { MINUTE, verifyBody } from "@/server/auth/schemas";

export const POST = defineRoute({
  access: "public",
  rateLimit: { limit: 10, windowMs: 15 * MINUTE },
  body: verifyBody,
  handler: ({ body, user }) => verifyEmail(body, user),
  audit: { action: "email_verified", resourceType: "user", resourceId: (_ctx, result) => result.userId },
});
