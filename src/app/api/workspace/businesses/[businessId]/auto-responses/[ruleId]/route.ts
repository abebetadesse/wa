import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { deleteRule, ruleInput, updateRule } from "@/server/intake/responses";

const params = z.object({ businessId: z.string().uuid(), ruleId: z.string().uuid() });

export const PUT = defineRoute({
  access: "user",
  params,
  body: ruleInput,
  handler: ({ user, params, body }) => updateRule(user, params.businessId, params.ruleId, body),
  audit: { action: "auto_response_rule_updated", resourceType: "auto_response_rule", resourceId: ({ params }) => params.ruleId },
});

export const DELETE = defineRoute({
  access: "user",
  params,
  handler: ({ user, params }) => deleteRule(user, params.businessId, params.ruleId),
  audit: { action: "auto_response_rule_deleted", resourceType: "auto_response_rule", resourceId: ({ params }) => params.ruleId },
});
