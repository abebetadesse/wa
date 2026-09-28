import { defineRoute } from "@/lib/api/route";
import { listConversations } from "@/server/marketplace/engagement";

export const GET = defineRoute({ access: "user", handler: ({ user }) => listConversations(user) });
