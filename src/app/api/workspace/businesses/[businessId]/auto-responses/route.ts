import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { createRule, listRules, ruleInput } from "@/server/intake/responses";

const params = z.object({ businessId: z.string().uuid() });

export const GET = defineRoute({ access: "user", params, handler: ({ user, params }) => listRules(user, params.businessId) });

export const POST = defineRoute({
  access: "user",
  status: 201,
  params,
  body: ruleInput,
  handler: ({ user, params, body }) => createRule(user, params.businessId, body),
  audit: { action: "auto_response_rule_created", resourceType: "auto_response_rule", resourceId: (_ctx, row) => row.id },
});
