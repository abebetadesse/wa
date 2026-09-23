import { defineRoute } from "@/lib/api/route";
import { clientIp } from "@/lib/api/rateLimit";
import { register } from "@/server/auth/accounts";
import { MINUTE, registerBody } from "@/server/auth/schemas";

export const POST = defineRoute({
  access: "public",
  status: 201,
  rateLimit: { limit: 10, windowMs: 60 * MINUTE },
  body: registerBody,
  handler: ({ req, body }) => register(body, { request: req, ip: clientIp(req.headers), userAgent: req.headers.get("user-agent") || "Browser Client" }),
});
