import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import {
  categoryInput,
  createCategory,
  KNOWLEDGE_ADMINS,
  KNOWLEDGE_READERS,
  listCategories,
} from "@/server/knowledge/admin";

const params = z.object({ strandId: z.string().min(1) });

export const GET = defineRoute({
  access: { roles: KNOWLEDGE_READERS },
  params,
  handler: ({ params }) => listCategories(params.strandId),
});

export const POST = defineRoute({
  access: { roles: KNOWLEDGE_ADMINS },
  status: 201,
  params,
  body: categoryInput,
  handler: ({ params, body }) => createCategory(params.strandId, body),
  audit: { action: "knowledge_category_created", resourceType: "knowledge_category", resourceId: (_ctx, category) => category?.id },
});
