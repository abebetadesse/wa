/**
 * Writes a plain SQL backup using mysqldump (or the MySQL 8 Docker image).
 *
 *   npm run db:backup                      -> backups/<database>-<date>.sql
 *   npm run db:backup -- --out /some/dir
 *
 * Keep copies off the server and test a restore with the MySQL client. Client uploads (UPLOAD_DIR)
 * are files and must be backed up separately.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = path.join(root, ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2");
  }
}

const url = process.env.DATABASE_URL;
if (!url || !/^mysql:\/\//.test(url)) {
  console.error("DATABASE_URL must be set to a MySQL connection string.");
  process.exit(1);
}
const outIndex = process.argv.indexOf("--out");
if (outIndex >= 0 && !process.argv[outIndex + 1]) {
  console.error("--out needs a directory path.");
  process.exit(1);
}
const outDir = path.resolve(outIndex >= 0 ? process.argv[outIndex + 1] : path.join(root, "backups"));
fs.mkdirSync(outDir, { recursive: true });
const parsed = new URL(url);
const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
if (!database || /[\\/]/.test(database)) {
  console.error("DATABASE_URL must name a single MySQL database.");
  process.exit(1);
}
const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
const file = path.join(outDir, `${database}-${stamp}.sql`);
const password = decodeURIComponent(parsed.password);
const args = [
  "--protocol=tcp",
  `--host=${parsed.hostname}`,
  `--port=${parsed.port || "3306"}`,
  `--user=${decodeURIComponent(parsed.username)}`,
  "--single-transaction",
  "--quick",
  "--hex-blob",
  "--no-tablespaces",
  "--databases",
  database,
];
const env = { ...process.env, MYSQL_PWD: password };

function dump(command, commandArgs, commandEnv = env) {
  const output = fs.openSync(file, "w");
  try {
    return spawnSync(command, commandArgs, { stdio: ["ignore", output, "pipe"], env: commandEnv });
  } finally {
    fs.closeSync(output);
  }
}

let result = dump("mysqldump", args);
if (result.error?.code === "ENOENT") {
  const localHost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  const dockerArgs = args.map((arg) => localHost && arg.startsWith("--host=") ? "--host=host.docker.internal" : arg);
  const containerArgs = ["run", "--rm", "-e", "MYSQL_PWD", "mysql:8.4", "mysqldump", ...dockerArgs];
  result = dump("docker", containerArgs, env);
  if (!result.error && result.status !== 0 && localHost) {
    fs.rmSync(file, { force: true });
    console.error("Backup failed in Docker. For a local database, ensure Docker can reach the MySQL host; otherwise install mysqldump.");
    process.exit(1);
  }
  if (result.error?.code === "ENOENT") {
    fs.rmSync(file, { force: true });
    console.error("Neither mysqldump nor Docker is available. Install the MySQL client tools or use your database provider's backup feature.");
    process.exit(1);
  }
}
if (result.status !== 0) {
  fs.rmSync(file, { force: true });
  console.error(`Backup failed: ${String(result.stderr ?? "").trim().split("\n").slice(-2).join(" ")}`);
  process.exit(1);
}
console.log(`Backup written: ${file} (${(fs.statSync(file).size / 1024 / 1024).toFixed(1)} MB)`);
