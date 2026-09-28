import { defineRoute } from "@/lib/api/route";
import { listCategories, listServiceKinds } from "@/server/marketplace/catalogue";

export const GET = defineRoute({
  access: "public",
  handler: async () => {
    const [categories, serviceKinds] = await Promise.all([listCategories(), listServiceKinds()]);
    return { categories, serviceKinds };
  },
});
