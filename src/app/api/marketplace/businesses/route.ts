import { defineRoute } from "@/lib/api/route";
import { directoryQuery, searchDirectory } from "@/server/marketplace/businesses";

export const GET = defineRoute({ access: "public", query: directoryQuery, handler: ({ query }) => searchDirectory(query) });
