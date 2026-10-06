/**
 * For operator scripts (set-up, admin creation). Import this FIRST, before anything that opens the
 * database: it reads .env from the working directory (the application folder) and refuses to guess
 * a database in production. Variables already set in the environment win over the file.
 */
import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), ".env");
if (fs.existsSync(file)) {
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2");
  }
}

if (!process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === "production") {
    console.error("DATABASE_URL is not set. Put it in .env in the application folder, or in the host's environment variables.");
    process.exit(1);
  }
  console.warn("DATABASE_URL is not set: using the local development database.");
}
