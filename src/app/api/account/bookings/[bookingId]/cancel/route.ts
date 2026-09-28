import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { cancelBookingAsClient } from "@/server/marketplace/bookings";

export const POST = defineRoute({
  access: "user",
  params: z.object({ bookingId: z.string().uuid() }),
  body: z.object({ reason: z.string().trim().max(1000).optional() }),
  handler: ({ user, params, body }) => cancelBookingAsClient(user, params.bookingId, body.reason),
  audit: { action: "booking_cancelled_by_client", resourceType: "booking", resourceId: ({ params }) => params.bookingId },
});
