import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { knowledgeSetInput, updateKnowledgeSet } from "@/server/toolkit";

export const PUT = defineRoute({
  access: { roles: ["admin", "super_admin"] } as const,
  params: z.object({ id: z.string().uuid() }),
  body: knowledgeSetInput,
  handler: ({ user, params, body }) => updateKnowledgeSet(user, params.id, body),
  audit: { action: "knowledge_set_updated", resourceType: "knowledge_set", resourceId: ({ params }) => params.id },
});
