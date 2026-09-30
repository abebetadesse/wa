import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { archiveKnowledgeSet } from "@/server/toolkit";

export const POST = defineRoute({
  access: { roles: ["admin", "super_admin"] } as const,
  params: z.object({ id: z.string().uuid() }),
  handler: ({ params }) => archiveKnowledgeSet(params.id),
  audit: { action: "knowledge_set_archived", resourceType: "knowledge_set", resourceId: ({ params }) => params.id },
});
