import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import {
  archiveStrand,
  KNOWLEDGE_ADMINS,
  strandInput,
  updateStrand,
} from "@/server/knowledge/admin";

const params = z.object({ strandId: z.string().min(1) });

export const PUT = defineRoute({
  access: { roles: KNOWLEDGE_ADMINS },
  params,
  body: strandInput,
  handler: ({ user, params, body }) => updateStrand(user, params.strandId, body),
  audit: { action: "knowledge_strand_updated", resourceType: "knowledge_strand", resourceId: ({ params }) => params.strandId },
});

export const DELETE = defineRoute({
  access: { roles: KNOWLEDGE_ADMINS },
  params,
  handler: ({ user, params }) => archiveStrand(user, params.strandId),
  audit: { action: "knowledge_strand_archived", resourceType: "knowledge_strand", resourceId: ({ params }) => params.strandId },
});
