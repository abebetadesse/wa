import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { createDraft, draftInput, listDrafts, sendNow } from "@/server/intake/responses";

const params = z.object({ businessId: z.string().uuid(), bookingId: z.string().uuid() });

export const GET = defineRoute({ access: "user", params, handler: ({ user, params }) => listDrafts(user, params.businessId, params.bookingId) });

/** Insert into review (a draft), or send straight to the client with sendNow: true. */
export const POST = defineRoute({
  access: "user",
  status: 201,
  params,
  body: draftInput.extend({ sendNow: z.boolean().default(false) }),
  handler: ({ user, params, body }) =>
    body.sendNow ? sendNow(user, params.businessId, params.bookingId, { title: body.title, body: body.body }) : createDraft(user, params.businessId, params.bookingId, body),
  audit: { action: ({ body }) => (body.sendNow ? "response_sent_now" : "response_draft_created"), resourceType: "booking", resourceId: ({ params }) => params.bookingId },
});
