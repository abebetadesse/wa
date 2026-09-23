import { defineRoute } from "@/lib/api/route";
import { resetPassword } from "@/server/auth/accounts";
import { MINUTE, resetBody } from "@/server/auth/schemas";

export const POST = defineRoute({
  access: "public",
  rateLimit: { limit: 10, windowMs: 15 * MINUTE },
  body: resetBody,
  handler: ({ body }) => resetPassword(body.token, body.password),
});
