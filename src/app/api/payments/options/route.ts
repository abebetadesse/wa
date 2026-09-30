import { defineRoute } from "@/lib/api/route";
import { paymentOptions } from "@/server/payments";

/** Payment methods the platform currently accepts (no secrets: account numbers are meant to be shared). */
export const GET = defineRoute({ access: "user", handler: () => paymentOptions() });
