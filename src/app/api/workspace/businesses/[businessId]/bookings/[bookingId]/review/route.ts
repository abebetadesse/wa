import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { getBookingReview } from "@/server/intake/review";

export const GET = defineRoute({
  access: "user",
  params: z.object({ businessId: z.string().uuid(), bookingId: z.string().uuid() }),
  handler: ({ user, params }) => getBookingReview(user, params.businessId, params.bookingId),
});
