import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";

export const POST = defineRoute({
  access: "user",
  params: z.object({ caseId: z.string().uuid() }),
  body: z.object({
    format: z.enum(["video", "voice", "chat", "in_person"]),
    preferredTimes: z.array(z.string().trim().min(1).max(120)).min(1, "Suggest at least one time that suits you.").max(5),
    note: z.string().trim().max(1000).optional(),
  }),
  handler: ({ user, params, body }) => caseService.requestConsultation(user, params.caseId, body),
  audit: { action: "case_consultation_requested", resourceType: "workflow_case", resourceId: ({ params }) => params.caseId },
});
