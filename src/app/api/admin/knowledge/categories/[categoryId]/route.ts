import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import {
  archiveCategory,
  categoryInput,
  getCategory,
  KNOWLEDGE_ADMINS,
  KNOWLEDGE_READERS,
  updateCategory,
} from "@/server/knowledge/admin";

const params = z.object({ categoryId: z.string().min(1) });

export const GET = defineRoute({
  access: { roles: KNOWLEDGE_READERS },
  params,
  handler: ({ params }) => getCategory(params.categoryId),
});

export const PUT = defineRoute({
  access: { roles: KNOWLEDGE_ADMINS },
  params,
  body: categoryInput,
  handler: ({ params, body }) => updateCategory(params.categoryId, body),
  audit: { action: "knowledge_category_updated", resourceType: "knowledge_category", resourceId: ({ params }) => params.categoryId },
});

export const DELETE = defineRoute({
  access: { roles: KNOWLEDGE_ADMINS },
  params,
  handler: ({ params }) => archiveCategory(params.categoryId),
  audit: { action: "knowledge_category_archived", resourceType: "knowledge_category", resourceId: ({ params }) => params.categoryId },
});
