import { defineRoute } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";

export const GET = defineRoute({
  access: "user",
  handler: ({ user }) => caseService.queue(user),
});
