import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { respondToReview } from "@/server/marketplace/engagement";

export const POST = defineRoute({
  access: "user",
  params: z.object({ businessId: z.string().uuid(), reviewId: z.string().uuid() }),
  body: z.object({ response: z.string().trim().min(2).max(2000) }),
  handler: ({ user, params, body }) => respondToReview(user, params.businessId, params.reviewId, body.response),
  audit: { action: "review_responded", resourceType: "review", resourceId: ({ params }) => params.reviewId },
});
