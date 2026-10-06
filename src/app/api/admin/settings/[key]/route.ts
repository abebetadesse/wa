import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { getSettings, updateSettings } from "@/server/settings";
import { paymentStatusForAdmin } from "@/server/payments";
import { telegramStatus } from "@/server/auth/telegram";
import { whatsappStatus } from "@/server/messaging/whatsapp";

const params = z.object({ key: z.enum(["payments", "registration", "marketplace"]) });
const admins = { roles: ["admin", "super_admin"] } as const;

/** Whether each chat app can send updates and receive replies. Reports set / not set only, never values. */
function chatStatus() {
  const whatsapp = whatsappStatus();
  return {
    telegramReplies: Boolean(process.env.TELEGRAM_WEBHOOK_SECRET?.trim()),
    whatsapp: { sending: whatsapp.configured, receiving: whatsapp.inbound && Boolean(whatsapp.number), template: Boolean(whatsapp.template) },
  };
}

async function withStatus(key: "payments" | "registration" | "marketplace") {
  const value = await getSettings(key);
  return { value, status: key === "payments" ? await paymentStatusForAdmin() : key === "registration" ? { ...telegramStatus(), chat: chatStatus() } : null };
}

export const GET = defineRoute({ access: admins, params, handler: ({ params }) => withStatus(params.key) });

export const PUT = defineRoute({
  access: admins,
  params,
  body: z.object({ value: z.unknown() }),
  handler: async ({ user, params, body }) => {
    await updateSettings(params.key, body.value, user.id);
    return withStatus(params.key);
  },
  audit: {
    action: ({ params }) => `settings_${params.key}_updated`,
    resourceType: "platform_settings",
    resourceId: ({ params }) => params.key,
    details: (_ctx, result) => ({ value: result.value }),
  },
});
