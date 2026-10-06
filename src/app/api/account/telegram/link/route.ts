import { defineRoute } from "@/lib/api/route";
import { MINUTE } from "@/server/auth/schemas";
import { createChatLink } from "@/server/messaging/accounts";

/** A one-time link that opens the bot and connects this account when the person presses Start. */
export const POST = defineRoute({
  access: "user",
  rateLimit: { limit: 10, windowMs: 15 * MINUTE },
  handler: ({ user }) => createChatLink(user, "telegram"),
});
