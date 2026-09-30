import { defineRoute } from "@/lib/api/route";
import { clientIp } from "@/lib/api/rateLimit";
import { MINUTE } from "@/server/auth/schemas";
import { loginWithTelegram, telegramAuthData } from "@/server/auth/telegram";

/** Sign in with a Telegram account that was connected from the account page. */
export const POST = defineRoute({
  access: "public",
  rateLimit: { limit: 10, windowMs: 15 * MINUTE },
  body: telegramAuthData,
  handler: ({ req, body }) => loginWithTelegram(body, { request: req, ip: clientIp(req.headers), userAgent: req.headers.get("user-agent") || "Browser Client" }),
});
