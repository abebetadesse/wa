import { defineRoute } from "@/lib/api/route";
import { toolkitInsights } from "@/server/toolkit";

export const GET = defineRoute({ access: { roles: ["admin", "super_admin"] } as const, handler: () => toolkitInsights() });
