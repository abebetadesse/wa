import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { setBusinessKnowledgeSet, setChoiceInput } from "@/server/toolkit";

export const POST = defineRoute({
  access: "user",
  params: z.object({ businessId: z.string().uuid(), setId: z.string().uuid() }),
  body: setChoiceInput,
  handler: ({ user, params, body }) => setBusinessKnowledgeSet(user, params.businessId, params.setId, body.action),
  audit: { action: ({ body }) => `knowledge_set_${body.action}`, resourceType: "knowledge_set", resourceId: ({ params }) => params.setId, details: ({ params }) => ({ businessId: params.businessId }) },
});
