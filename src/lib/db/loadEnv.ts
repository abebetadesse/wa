/**
 * For operator scripts (set-up, admin creation). Import this FIRST, before anything that opens the
 * database: it reads .env from the working directory (the application folder) and refuses to guess
 * a database in production. Variables already set in the environment win over the file.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../../..");
const searchedDirs = [root, process.cwd(), path.resolve(root, ".."), path.resolve(process.cwd(), "..")];
const fileNames = [".env", ".env.production", ".env.local"];

for (const dir of new Set(searchedDirs)) {
  for (const name of fileNames) {
    const file = path.join(dir, name);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match) {
        const key = match[1];
        const val = match[2].replace(/^(["'])(.*)\1$/, "$2").trim();
        if ((process.env[key] === undefined || process.env[key].trim() === "") && val) {
          process.env[key] = val;
        }
      }
    }
  }
}

if (!process.env.DATABASE_URL?.trim()) {
  if (process.env.NODE_ENV === "production") {
    console.error("DATABASE_URL is not set. Put it in .env in the application folder, or pass it via the environment:");
    console.error('  DATABASE_URL="mysql://USER:PASSWORD@127.0.0.1:3306/DATABASE" npm run db:setup');
    process.exit(1);
  }
  console.warn("DATABASE_URL is not set: using the local development database.");
}
