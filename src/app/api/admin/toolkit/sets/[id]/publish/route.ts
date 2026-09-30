import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { publishKnowledgeSet } from "@/server/toolkit";

export const POST = defineRoute({
  access: { roles: ["admin", "super_admin"] } as const,
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ note: z.string().trim().max(500).optional() }),
  handler: ({ user, params, body }) => publishKnowledgeSet(user, params.id, body.note),
  audit: { action: "knowledge_set_published", resourceType: "knowledge_set", resourceId: ({ params }) => params.id, details: (_ctx, result) => ({ version: result.version, subscribers: result.subscribers }) },
});
