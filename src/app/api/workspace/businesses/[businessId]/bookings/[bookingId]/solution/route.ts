import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { deliverManuscriptSolution, solutionInput } from "@/server/intake/review";

/** Deliver the client's chosen manuscript chapter as a solution: prepare a draft to refine, or send now. */
export const POST = defineRoute({
  access: "user",
  status: 201,
  params: z.object({ businessId: z.string().uuid(), bookingId: z.string().uuid() }),
  body: solutionInput,
  handler: ({ user, params, body }) => deliverManuscriptSolution(user, params.businessId, params.bookingId, body),
  audit: { action: ({ body }) => (body.mode === "send" ? "manuscript_solution_sent" : "manuscript_solution_drafted"), resourceType: "booking", resourceId: ({ params }) => params.bookingId },
});
