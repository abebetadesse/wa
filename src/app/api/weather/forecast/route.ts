import { z } from "zod";
import { ApiError, defineRoute } from "@/lib/api/route";
import { getForecast } from "@/server/weather/openMeteo";

const query = z.object({
  lat: z.coerce.number().min(-66).max(66),
  lng: z.coerce.number().min(-180).max(180),
  offset: z.coerce.number().int().min(-12).max(14).default(3),
});

/** Public: the healing calendar works for visitors too. Only coordinates are forwarded. */
export const GET = defineRoute({
  access: "public",
  query,
  rateLimit: { limit: 30, windowMs: 60_000 },
  handler: async ({ query }) => {
    try {
      return await getForecast(query.lat, query.lng, query.offset);
    } catch (err) {
      throw new ApiError(502, "The weather forecast is not available right now.", { reason: err instanceof Error ? err.message : "unknown" });
    }
  },
});
