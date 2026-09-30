import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { MINUTE } from "@/server/auth/schemas";
import { linkTelegram, setTelegramNotify, telegramAuthData, telegramSummary, unlinkTelegram } from "@/server/auth/telegram";

export const GET = defineRoute({ access: "user", handler: ({ user }) => telegramSummary(user.id) });

export const POST = defineRoute({
  access: "user",
  rateLimit: { limit: 10, windowMs: 15 * MINUTE },
  body: telegramAuthData,
  handler: ({ user, body }) => linkTelegram(user, body),
  audit: { action: "telegram_connected", resourceType: "user", resourceId: ({ user }) => user.id },
});

export const PATCH = defineRoute({
  access: "user",
  body: z.object({ notify: z.boolean() }),
  handler: ({ user, body }) => setTelegramNotify(user, body.notify),
});

export const DELETE = defineRoute({
  access: "user",
  handler: ({ user }) => unlinkTelegram(user),
  audit: { action: "telegram_disconnected", resourceType: "user", resourceId: ({ user }) => user.id },
});
