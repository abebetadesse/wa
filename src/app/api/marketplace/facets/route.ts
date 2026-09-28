import { defineRoute } from "@/lib/api/route";
import { directoryFacets } from "@/server/marketplace/businesses";

export const GET = defineRoute({ access: "public", handler: () => directoryFacets() });
