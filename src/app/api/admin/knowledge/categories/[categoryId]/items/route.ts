import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import {
  createItem,
  itemInput,
  KNOWLEDGE_EDITORS,
  KNOWLEDGE_READERS,
  listItems,
} from "@/server/knowledge/admin";

const params = z.object({ categoryId: z.string().min(1) });

export const GET = defineRoute({
  access: { roles: KNOWLEDGE_READERS },
  params,
  handler: ({ params }) => listItems(params.categoryId),
});

export const POST = defineRoute({
  access: { roles: KNOWLEDGE_EDITORS },
  status: 201,
  params,
  body: itemInput,
  handler: ({ user, params, body }) => createItem(user, params.categoryId, body.data),
  audit: { action: "knowledge_item_created", resourceType: "knowledge_item", resourceId: (_ctx, item) => item?.id },
});
