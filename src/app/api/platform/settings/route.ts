import { defineRoute } from "@/lib/api/route";
import { getSettings } from "@/server/settings";
import { telegramStatus } from "@/server/auth/telegram";
import { verifiedEmergencyContacts } from "@/lib/safety/emergencyContacts";

/** Public, non-secret settings the sign-up and payment screens adapt to. */
export const GET = defineRoute({
  access: "public",
  handler: async () => {
    const [registration, payments, emergency] = await Promise.all([getSettings("registration"), getSettings("payments"), getSettings("emergencyContacts")]);
    const telegram = telegramStatus();
    return {
      registration: { open: registration.open, telegram: telegram.configured ? registration.telegram : "off", telegramBot: telegram.configured ? telegram.botUsername : null },
      payments: { freeMode: payments.freeMode, profileGating: payments.profileGating },
      // Only numbers an administrator has verified; empty means screens show generic guidance.
      emergencyContacts: verifiedEmergencyContacts(emergency.contacts),
    };
  },
});
