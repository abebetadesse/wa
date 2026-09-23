import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { requestPasswordReset } from "@/server/auth/accounts";
import { MINUTE } from "@/server/auth/schemas";

export const POST = defineRoute({
  access: "public",
  rateLimit: { limit: 5, windowMs: 15 * MINUTE },
  body: z.object({ email: z.string().trim().toLowerCase().min(1, "Please enter your registered email address.") }),
  handler: ({ body }) => requestPasswordReset(body.email),
});
