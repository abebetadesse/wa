import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { analyseBooking, analysisInput } from "@/server/intake/review";

/** Remedy screening, live PubMed literature, place-based ecology and the biochemical breakdown. */
export const POST = defineRoute({
  access: "user",
  rateLimit: { limit: 30, windowMs: 15 * 60_000 },
  params: z.object({ businessId: z.string().uuid(), bookingId: z.string().uuid() }),
  body: analysisInput,
  handler: ({ user, params, body }) => analyseBooking(user, params.businessId, params.bookingId, body),
});
