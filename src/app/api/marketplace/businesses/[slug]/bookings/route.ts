import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { bookingRequest, requestBooking } from "@/server/marketplace/bookings";
import { resolvePublicBusinessId } from "@/server/marketplace/businesses";

export const POST = defineRoute({
  access: "user",
  status: 201,
  rateLimit: { limit: 20, windowMs: 60 * 60_000 },
  params: z.object({ slug: z.string().min(1).max(120) }),
  body: bookingRequest,
  handler: async ({ user, params, body }) => requestBooking(user, await resolvePublicBusinessId(params.slug), body),
  audit: { action: "booking_requested", resourceType: "booking", resourceId: (_ctx, booking) => booking.id },
});
