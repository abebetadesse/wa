import { Client } from "pg";

async function ensureDatabase() {
  const rootUrl = process.env.DATABASE_ROOT_URL || "postgres://postgres:postgres@localhost:5432/postgres";
  const client = new Client({ connectionString: rootUrl });

  try {
    await client.connect();
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'ethio_wellness';");
    if (res.rowCount === 0) {
      console.log("Creating database ethio_wellness...");
      await client.query("CREATE DATABASE ethio_wellness;");
      console.log("Database ethio_wellness created successfully.");
    } else {
      console.log("Database ethio_wellness already exists.");
    }
  } catch (err: any) {
    console.error("Could not ensure database ethio_wellness:", err.message);
  } finally {
    await client.end();
  }
}

ensureDatabase();
