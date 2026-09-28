import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { submitForVerification, verificationInput } from "@/server/marketplace/businesses";

export const POST = defineRoute({
  access: "user",
  params: z.object({ businessId: z.string().uuid() }),
  body: verificationInput,
  handler: ({ user, params, body }) => submitForVerification(user, params.businessId, body),
  audit: { action: "business_verification_requested", resourceType: "business", resourceId: ({ params }) => params.businessId },
});
