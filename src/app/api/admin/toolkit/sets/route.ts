import { defineRoute } from "@/lib/api/route";
import { createKnowledgeSet, knowledgeSetInput, listKnowledgeSets } from "@/server/toolkit";

const admins = { roles: ["admin", "super_admin"] } as const;

export const GET = defineRoute({ access: admins, handler: () => listKnowledgeSets() });

export const POST = defineRoute({
  access: admins,
  status: 201,
  body: knowledgeSetInput,
  handler: ({ user, body }) => createKnowledgeSet(user, body),
  audit: { action: "knowledge_set_created", resourceType: "knowledge_set", resourceId: (_ctx, row) => row.id },
});
