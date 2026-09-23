import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";

const params = z.object({ caseId: z.string().uuid() });

export const GET = defineRoute({
  access: "user",
  params,
  handler: ({ user, params }) => caseService.get(user, params.caseId),
});

export const PATCH = defineRoute({
  access: "user",
  params,
  body: z.object({ answers: z.record(z.unknown()) }),
  handler: ({ user, params, body }) => caseService.answer(user, params.caseId, body.answers),
});
