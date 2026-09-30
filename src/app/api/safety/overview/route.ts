import { defineRoute } from "@/lib/api/route";
import { overview } from "@/server/safety";

export const GET = defineRoute({ access: "public", handler: () => overview() });
