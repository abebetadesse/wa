import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { listRemedies, remedyInput, saveRemedy } from "@/server/marketplace/engagement";

const params = z.object({ businessId: z.string().uuid() });

export const GET = defineRoute({ access: "user", params, handler: ({ user, params }) => listRemedies(user, params.businessId) });

export const POST = defineRoute({
  access: "user",
  status: 201,
  params,
  body: remedyInput,
  handler: ({ user, params, body }) => saveRemedy(user, params.businessId, null, body),
  audit: { action: "remedy_created", resourceType: "remedy", resourceId: (_ctx, remedy) => remedy.id },
});
