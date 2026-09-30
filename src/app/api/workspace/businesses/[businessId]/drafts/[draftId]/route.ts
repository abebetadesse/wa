import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { dismissDraft, draftInput, sendDraft, updateDraft } from "@/server/intake/responses";

const params = z.object({ businessId: z.string().uuid(), draftId: z.string().uuid() });

export const PATCH = defineRoute({
  access: "user",
  params,
  body: draftInput,
  handler: ({ user, params, body }) => updateDraft(user, params.businessId, params.draftId, body),
});

/** One-click approval: send, or dismiss. */
export const POST = defineRoute({
  access: "user",
  params,
  body: z.object({ action: z.enum(["send", "dismiss"]) }),
  handler: ({ user, params, body }) => (body.action === "send" ? sendDraft(user, params.businessId, params.draftId) : dismissDraft(user, params.businessId, params.draftId)),
  audit: { action: ({ body }) => `response_draft_${body.action === "send" ? "sent" : "dismissed"}`, resourceType: "response_draft", resourceId: ({ params }) => params.draftId },
});
