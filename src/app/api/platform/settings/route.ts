import { defineRoute } from "@/lib/api/route";
import { getSettings } from "@/server/settings";
import { telegramStatus } from "@/server/auth/telegram";

/** Public, non-secret settings the sign-up and payment screens adapt to. */
export const GET = defineRoute({
  access: "public",
  handler: async () => {
    const [registration, payments] = await Promise.all([getSettings("registration"), getSettings("payments")]);
    const telegram = telegramStatus();
    return {
      registration: { open: registration.open, telegram: telegram.configured ? registration.telegram : "off", telegramBot: telegram.configured ? telegram.botUsername : null },
      payments: { freeMode: payments.freeMode },
    };
  },
});
