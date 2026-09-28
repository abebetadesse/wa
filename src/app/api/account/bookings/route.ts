import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { listClientBookings } from "@/server/marketplace/bookings";

export const GET = defineRoute({
  access: "user",
  query: z.object({ scope: z.enum(["upcoming", "past"]).default("upcoming") }),
  handler: ({ user, query }) => listClientBookings(user, query.scope),
});
