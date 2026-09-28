import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { moderateReview } from "@/server/marketplace/engagement";

export const POST = defineRoute({
  access: { roles: ["admin", "super_admin"] },
  params: z.object({ reviewId: z.string().uuid() }),
  body: z.object({ status: z.enum(["published", "hidden"]) }),
  handler: ({ params, body }) => moderateReview(params.reviewId, body.status),
  audit: { action: ({ body }) => `review_${body.status}`, resourceType: "review", resourceId: ({ params }) => params.reviewId },
});
