import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import {
  itemInput,
  KNOWLEDGE_ADMINS,
  KNOWLEDGE_EDITORS,
  transitionItem,
  updateItem,
} from "@/server/knowledge/admin";

const params = z.object({ itemId: z.string().min(1) });

export const PUT = defineRoute({
  access: { roles: KNOWLEDGE_EDITORS },
  params,
  body: itemInput,
  handler: ({ user, params, body }) => updateItem(user, params.itemId, body),
  audit: { action: "knowledge_item_updated", resourceType: "knowledge_item", resourceId: ({ params }) => params.itemId },
});

export const DELETE = defineRoute({
  access: { roles: KNOWLEDGE_ADMINS },
  params,
  handler: ({ user, params }) => transitionItem(user, params.itemId, "archived"),
  audit: { action: "knowledge_item_archived", resourceType: "knowledge_item", resourceId: ({ params }) => params.itemId },
});
