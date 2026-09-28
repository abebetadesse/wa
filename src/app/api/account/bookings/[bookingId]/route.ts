import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { getBookingForClient } from "@/server/marketplace/bookings";

export const GET = defineRoute({
  access: "user",
  params: z.object({ bookingId: z.string().uuid() }),
  handler: ({ user, params }) => getBookingForClient(user, params.bookingId),
});
