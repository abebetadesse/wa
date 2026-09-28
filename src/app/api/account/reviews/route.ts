import { defineRoute } from "@/lib/api/route";
import { createReview, reviewInput } from "@/server/marketplace/engagement";

export const POST = defineRoute({
  access: "user",
  status: 201,
  body: reviewInput,
  handler: ({ user, body }) => createReview(user, body),
  audit: { action: "review_created", resourceType: "review", resourceId: (_ctx, review) => review.id },
});
