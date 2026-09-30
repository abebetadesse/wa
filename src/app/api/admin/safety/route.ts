import { defineRoute } from "@/lib/api/route";
import { adminReference } from "@/server/safety";

export const GET = defineRoute({ access: { roles: ["editor", "admin", "super_admin"] } as const, handler: () => adminReference() });
