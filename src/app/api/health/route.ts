import { NextRequest, NextResponse } from "next/server";
import { dbClient } from "@/lib/db";
import { tablePrefix } from "@/lib/db/mysqlSchema";
import { setupStatus } from "@/server/setup/autoSetup";

export const dynamic = "force-dynamic";

/**
 * Liveness and database check for uptime monitors and the host's health probe.
 * Checks connectivity and schema readiness (users and roles tables). While the tables are missing
 * it also reports how the application's own start-up set-up is going, so a failure can be read
 * here without access to the server log.
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

    // Tables appear one by one while the set-up runs, so the schema is ready only once it has finished.
    const setup = setupStatus();
    if (foundTables < 2 || setup.state === "running" || setup.state === "failed") {
      return NextResponse.json(
        {
          status: setup.state === "failed" ? "setup_failed" : "pending_migration",
          database: "connected",
          schemaReady: false,
          prefix: prefix || "none",
          setup,
          message:
            setup.state === "running"
              ? "The application is creating its database tables. Reload this page in a minute."
              : setup.state === "failed"
                ? "The application could not prepare its database; 'setup.detail' says why. Fix that, then restart the application."
                : "Database tables are missing. The application creates them by itself when it starts: restart the application and reload this page after a minute.",
          time: new Date().toISOString(),
        },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { status: "ok", database: "connected", schemaReady: true, ...(setupStatus().notice ? { notice: setupStatus().notice } : {}), time: new Date().toISOString() },
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

