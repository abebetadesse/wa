import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import {
  ITEM_STATUSES,
  KNOWLEDGE_READERS,
  transitionItem,
} from "@/server/knowledge/admin";

export const POST = defineRoute({
  access: { roles: KNOWLEDGE_READERS },
  params: z.object({ itemId: z.string().min(1) }),
  body: z.object({ status: z.enum(ITEM_STATUSES) }),
  handler: ({ user, params, body }) => transitionItem(user, params.itemId, body.status),
  audit: {
    action: ({ body }) => `knowledge_item_${body.status}`,
    resourceType: "knowledge_item",
    resourceId: ({ params }) => params.itemId,
    details: ({ body }) => ({ status: body.status }),
  },
});
