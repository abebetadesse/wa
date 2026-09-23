import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import {
  createStrand,
  KNOWLEDGE_ADMINS,
  KNOWLEDGE_READERS,
  listStrands,
  strandInput,
} from "@/server/knowledge/admin";

export const GET = defineRoute({
  access: { roles: KNOWLEDGE_READERS },
  handler: () => listStrands(),
});

export const POST = defineRoute({
  access: { roles: KNOWLEDGE_ADMINS },
  status: 201,
  body: strandInput,
  handler: ({ user, body }) => createStrand(user, body),
  audit: { action: "knowledge_strand_created", resourceType: "knowledge_strand", resourceId: (_ctx, strand) => strand?.id },
});
