import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { intakeSettingsInput, saveIntakeSettings } from "@/server/intake/settings";

export const PUT = defineRoute({
  access: "user",
  params: z.object({ businessId: z.string().uuid(), serviceId: z.string().uuid() }),
  body: intakeSettingsInput,
  handler: ({ user, params, body }) => saveIntakeSettings(user, params.businessId, params.serviceId, body),
  audit: { action: "service_intake_updated", resourceType: "service", resourceId: ({ params }) => params.serviceId },
});
