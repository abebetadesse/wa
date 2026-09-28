import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { businessBookingQuery, createStaffBooking, listBusinessBookings, staffBookingRequest } from "@/server/marketplace/bookings";

const params = z.object({ businessId: z.string().uuid() });

export const GET = defineRoute({ access: "user", params, query: businessBookingQuery, handler: ({ user, params, query }) => listBusinessBookings(user, params.businessId, query) });

export const POST = defineRoute({
  access: "user",
  status: 201,
  params,
  body: staffBookingRequest,
  handler: ({ user, params, body }) => createStaffBooking(user, params.businessId, body),
  audit: { action: "booking_created_by_staff", resourceType: "booking", resourceId: (_ctx, booking) => booking.id },
});
