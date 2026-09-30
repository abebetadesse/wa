import { defineRoute } from "@/lib/api/route";
import { listSubstances } from "@/server/safety";

/** Every published medicine and remedy, for search and browsing. */
export const GET = defineRoute({ access: "public", handler: () => listSubstances() });
