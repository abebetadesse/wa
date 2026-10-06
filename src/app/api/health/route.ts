import { NextRequest, NextResponse } from "next/server";
import { dbClient } from "@/lib/db";
import { tablePrefix } from "@/lib/db/mysqlSchema";

export const dynamic = "force-dynamic";

/**
 * Liveness and database check for uptime monitors and the host's health probe.
 * Checks connectivity and schema readiness (users and roles tables).
 */
export async function GET(req: NextRequest) {
  try {
    await dbClient`SELECT 1`;
  } catch (err) {
    return NextResponse.json(
      { status: "unavailable", error: "Database unreachable", time: new Date().toISOString() },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const prefix = tablePrefix();
    const usersTable = `${prefix}users`;
    const rolesTable = `${prefix}roles`;

    const tableCheck = await dbClient<Array<{ count: number }>>`
      SELECT COUNT(*) AS count FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name IN (${usersTable}, ${rolesTable})
    `;
    const foundTables = Number(tableCheck[0]?.count ?? 0);

    if (foundTables < 2) {
      return NextResponse.json(
        {
          status: "pending_migration",
          database: "connected",
          schemaReady: false,
          prefix: prefix || "none",
          message: "Database tables are missing. Please run 'npm run db:setup' in Plesk (Node.js -> Run script -> db:setup) to apply migrations and seed initial roles.",
          time: new Date().toISOString(),
        },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { status: "ok", database: "connected", schemaReady: true, time: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: "schema_check_failed",
        database: "connected",
        schemaReady: false,
        error: err instanceof Error ? err.message : String(err),
        time: new Date().toISOString(),
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

