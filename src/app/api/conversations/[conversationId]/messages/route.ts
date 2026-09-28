import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { listMessages, messageInput, sendMessage } from "@/server/marketplace/engagement";

const params = z.object({ conversationId: z.string().uuid() });

export const GET = defineRoute({ access: "user", params, handler: ({ user, params }) => listMessages(user, params.conversationId) });

export const POST = defineRoute({
  access: "user",
  status: 201,
  rateLimit: { limit: 60, windowMs: 60_000 },
  params,
  body: messageInput,
  handler: ({ user, params, body }) => sendMessage(user, params.conversationId, body.body),
});
