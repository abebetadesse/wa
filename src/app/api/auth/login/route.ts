import { defineRoute } from "@/lib/api/route";
import { clientIp } from "@/lib/api/rateLimit";
import { login } from "@/server/auth/accounts";
import { loginBody, MINUTE } from "@/server/auth/schemas";

export const POST = defineRoute({
  access: "public",
  rateLimit: { limit: 20, windowMs: 15 * MINUTE },
  body: loginBody,
  handler: ({ req, body }) => login(body, { request: req, ip: clientIp(req.headers), userAgent: req.headers.get("user-agent") || "Browser Client" }),
});
