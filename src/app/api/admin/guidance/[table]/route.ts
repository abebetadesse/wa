import { z } from "zod";
import { ApiError, defineRoute } from "@/lib/api/route";
import { GUIDANCE_TABLES, GuidanceRowError, TABLES, deleteRow, ensureGuidanceDefaults, listRows, saveRow, type GuidanceTable } from "@/server/guidance/tables";

const admins = { roles: ["admin", "super_admin"] } as const;
const params = z.object({ table: z.enum(GUIDANCE_TABLES as [GuidanceTable, ...GuidanceTable[]]) });

function describe(table: GuidanceTable) {
  const { label, description, key, columns, json } = TABLES[table];
  return { name: table, label, description, key, columns, json };
}

async function badRowsAsRequests<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof GuidanceRowError) throw ApiError.badRequest(error.message, { issues: error.issues });
    throw error;
  }
}

export const GET = defineRoute({
  access: admins,
  params,
  handler: async ({ params }) => {
    await ensureGuidanceDefaults();
    return { table: describe(params.table), tables: GUIDANCE_TABLES.map(describe), rows: await listRows(params.table) };
  },
});

export const PUT = defineRoute({
  access: admins,
  params,
  body: z.object({ row: z.record(z.unknown()) }),
  handler: ({ params, body, user }) => badRowsAsRequests(() => saveRow(params.table, body.row, user.id)),
  audit: {
    action: ({ params }) => `guidance_${params.table}_saved`,
    resourceType: "guidance_table",
    resourceId: ({ params }) => params.table,
    details: ({ params }, row) => ({ key: Object.fromEntries(TABLES[params.table].key.map((k) => [k, row[k]])) }),
  },
});

export const DELETE = defineRoute({
  access: admins,
  params,
  body: z.object({ key: z.record(z.unknown()) }),
  handler: async ({ params, body }) => {
    const deleted = await badRowsAsRequests(() => deleteRow(params.table, body.key));
    if (!deleted) throw ApiError.notFound("Row");
    return { deleted };
  },
  audit: {
    action: ({ params }) => `guidance_${params.table}_deleted`,
    resourceType: "guidance_table",
    resourceId: ({ params }) => params.table,
    details: ({ body }) => ({ key: body.key }),
  },
});
