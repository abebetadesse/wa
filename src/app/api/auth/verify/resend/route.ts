import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { resendVerification } from "@/server/auth/accounts";
import { MINUTE } from "@/server/auth/schemas";

export const POST = defineRoute({
  access: "public",
  rateLimit: { limit: 5, windowMs: 15 * MINUTE },
  body: z.object({ email: z.string().trim().toLowerCase().email().optional().catch(undefined) }),
  handler: ({ body, user }) => resendVerification(body.email, user),
});
