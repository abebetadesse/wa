import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { MINUTE } from "@/server/auth/schemas";
import { createChatLink, setWhatsAppNotify, unlinkWhatsApp, whatsappSummary } from "@/server/messaging/accounts";

export const GET = defineRoute({ access: "user", handler: ({ user }) => whatsappSummary(user.id) });

/** A one-time link that opens WhatsApp with the connect code typed in. */
export const POST = defineRoute({
  access: "user",
  rateLimit: { limit: 10, windowMs: 15 * MINUTE },
  handler: ({ user }) => createChatLink(user, "whatsapp"),
});

export const PATCH = defineRoute({
  access: "user",
  body: z.object({ notify: z.boolean() }),
  handler: ({ user, body }) => setWhatsAppNotify(user, body.notify),
});

export const DELETE = defineRoute({
  access: "user",
  handler: ({ user }) => unlinkWhatsApp(user),
  audit: { action: "whatsapp_disconnected", resourceType: "user", resourceId: ({ user }) => user.id },
});
