import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { trackToolVisit } from "@/server/toolkit";

/** Behaviour signal: a team member opened a tool page. Ignored for people outside businesses. */
export const POST = defineRoute({
  access: "user",
  rateLimit: { limit: 120, windowMs: 15 * 60_000 },
  body: z.object({ path: z.string().max(300).regex(/^\//), businessId: z.string().uuid().optional() }),
  handler: ({ user, body }) => trackToolVisit(user, body.path, body.businessId),
});
