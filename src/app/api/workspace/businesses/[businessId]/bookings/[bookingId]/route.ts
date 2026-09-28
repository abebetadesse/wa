import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { transitionRequest, updateBookingStatusAsBusiness } from "@/server/marketplace/bookings";

export const PATCH = defineRoute({
  access: "user",
  params: z.object({ businessId: z.string().uuid(), bookingId: z.string().uuid() }),
  body: transitionRequest,
  handler: ({ user, params, body }) => updateBookingStatusAsBusiness(user, params.businessId, params.bookingId, body),
  audit: {
    action: ({ body }) => `booking_${body.status}`,
    resourceType: "booking",
    resourceId: ({ params }) => params.bookingId,
    details: ({ body }) => ({ status: body.status, reason: body.reason ?? null }),
  },
});
