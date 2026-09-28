import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { getPublicBusiness } from "@/server/marketplace/businesses";
import { listPublicReviews } from "@/server/marketplace/engagement";

export const GET = defineRoute({
  access: "public",
  params: z.object({ slug: z.string().min(1).max(120) }),
  handler: async ({ params, user }) => {
    const business = await getPublicBusiness(params.slug, user);
    return { ...business, reviews: await listPublicReviews(business.id) };
  },
});
