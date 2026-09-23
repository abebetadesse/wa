import { z } from "zod";
import { NextResponse } from "next/server";
import { defineRoute } from "@/lib/api/route";
import { ADMIN_ROLES } from "@/server/admin/userPolicy";
import { exportUsers, usersToCsv } from "@/server/admin/users";

export const GET = defineRoute({
  access: { roles: ADMIN_ROLES },
  query: z.object({ format: z.enum(["json", "csv"]).catch("json") }),
  handler: async ({ query }) => {
    const rows = await exportUsers();
    if (query.format === "json") return { users: rows, total: rows.length };
    return new NextResponse(usersToCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ethio_wellness_users_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  },
  audit: { action: "users_exported", resourceType: "user", details: ({ query }) => ({ format: query.format }) },
});
