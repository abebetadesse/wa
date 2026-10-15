import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { MINUTE } from "@/server/auth/schemas";
import { caseService } from "@/server/cases/service";

/** The case owner confirms foods or plants for their reviewer. Only catalogue names are kept. */
export const POST = defineRoute({
  access: "user",
  rateLimit: { limit: 30, windowMs: 10 * MINUTE },
  params: z.object({ caseId: z.string().uuid() }),
  body: z.object({
    kind: z.enum(["meal", "herb"]),
    itemIds: z.array(z.string().min(1).max(80)).min(1, "Choose at least one food or plant.").max(8),
    source: z.enum(["photo", "typed"]),
    note: z.string().trim().max(300).optional(),
  }),
  handler: ({ user, params, body }) => caseService.addFoodHerb(user, params.caseId, body),
  audit: { action: "case_food_herb_added", resourceType: "workflow_case", resourceId: ({ params }) => params.caseId },
});
