import { defineRoute } from "@/lib/api/route";
import { followUpService } from "@/server/followUps";

/** The signed-in person's open outcome check-ins (sent, not answered yet). */
export const GET = defineRoute({
  access: "user",
  handler: async ({ user }) => {
    const rows = await followUpService.open(user.id);
    return rows.map((row) => ({ id: row.id, caseId: row.caseId, bookingId: row.bookingId, label: row.label, dayOffset: row.dayOffset, sentAt: row.sentAt }));
  },
});
