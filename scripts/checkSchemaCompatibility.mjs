import postgres from "postgres";

const sql = postgres(
  process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/ethio_wellness"
);

async function main() {
  const dbTables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type IN ('BASE TABLE', 'VIEW')
  `;
  const tableNames = new Set(dbTables.map((t) => t.table_name));

  console.log("Current tables in ethio_wellness DB:");
  console.log(Array.from(tableNames).sort());

  // Check aliases that might be needed
  const requiredAliases = [
    { view: "wellbeing_profiles", source: "health_profiles" },
    { view: "wellbeing_gap_reports", source: "health_gap_reports" },
  ];

  for (const { view, source } of requiredAliases) {
    if (tableNames.has(source) && !tableNames.has(view)) {
      console.log(`Creating view ${view} -> ${source}...`);
      await sql.unsafe(`CREATE OR REPLACE VIEW "${view}" AS SELECT * FROM "${source}"`);
      console.log(`Created view ${view}`);
    }
  }

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
