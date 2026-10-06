/**
 * Assembles an upload-ready release in ./plesk-release from the current production build.
 *
 *   npm run deploy:plesk          build, then assemble (and zip when a zip tool is available)
 *   node scripts/prepare-plesk.mjs [--no-zip]
 *
 * The release holds only what the server runs: the compiled app, static files, the start-up file,
 * the database migrations, and the set-up scripts compiled to plain JavaScript. Nothing has to be
 * built on the server: upload, `npm ci --omit=dev`, `npm run db:setup`, start. See docs/DEPLOYMENT.md.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "plesk-release");
const buildDir = path.join(root, process.env.NEXT_DIST_DIR || ".next");
const rel = (p) => path.relative(root, p).replaceAll("\\", "/");

if (!fs.existsSync(path.join(buildDir, "BUILD_ID"))) {
  console.error(`No production build in ${rel(buildDir)}. Run "npm run build" first (or "npm run deploy:plesk").`);
  process.exit(1);
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, "scripts"), { recursive: true });

// 1. The compiled application (without build caches and traces) and static files.
const skipInBuild = new Set(["cache", "trace", "types", "diagnostics"]);
fs.cpSync(buildDir, path.join(out, ".next"), { recursive: true, filter: (source) => !(path.dirname(source) === buildDir && skipInBuild.has(path.basename(source))) });
fs.cpSync(path.join(root, "public"), path.join(out, "public"), { recursive: true });

// 2. Start-up file, lockfile, environment template, guide.
for (const file of ["app.js", "package-lock.json", ".env.example"]) fs.copyFileSync(path.join(root, file), path.join(out, file));
if (fs.existsSync(path.join(root, "docs", "DEPLOYMENT.md"))) fs.copyFileSync(path.join(root, "docs", "DEPLOYMENT.md"), path.join(out, "DEPLOYMENT.md"));

// 3. next.config as plain JavaScript, so the server needs no TypeScript.
const ts = (await import("typescript")).default;
const config = ts.transpileModule(fs.readFileSync(path.join(root, "next.config.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
fs.writeFileSync(path.join(out, "next.config.mjs"), config.outputText);

// 4. Database: migrations and the runner (plain Node, production dependencies only).
fs.cpSync(path.join(root, "drizzle-mysql"), path.join(out, "drizzle-mysql"), { recursive: true, filter: (source) => path.basename(source) !== "meta" });
fs.copyFileSync(path.join(root, "scripts", "migrate.mjs"), path.join(out, "scripts", "migrate.mjs"));

// 5. Set-up scripts, compiled from TypeScript with their application imports bundled in.
const esbuild = await import("esbuild");
await esbuild.build({
  entryPoints: { "setup-reference": path.join(root, "src/lib/db/setupReference.ts"), "create-admin": path.join(root, "src/lib/db/createAdmin.ts") },
  outdir: path.join(out, "scripts"),
  outExtension: { ".js": ".cjs" },
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node20",
  packages: "external",
  tsconfig: path.join(root, "tsconfig.json"),
  // A release only ever runs against production: never fall back to a development database.
  banner: { js: 'process.env.NODE_ENV = process.env.NODE_ENV || "production";' },
  logLevel: "warning",
  // seed.ts checks import.meta.url to see whether it was run directly; in a bundle it never is.
  logOverride: { "empty-import-meta": "silent" },
});

// 6. package.json: same dependencies and lockfile, production scripts only.
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
pkg.scripts = {
  start: "node app.js",
  "db:migrate": "node scripts/migrate.mjs --production",
  "db:status": "node scripts/migrate.mjs --production --status",
  "db:reference": "node scripts/setup-reference.cjs",
  "db:setup": "node scripts/migrate.mjs --production && node scripts/setup-reference.cjs",
  "admin:create": "node scripts/create-admin.cjs",
};
pkg.engines = { node: ">=20.9.0" };
fs.writeFileSync(path.join(out, "package.json"), `${JSON.stringify(pkg, null, 2)}\n`);

// 7. What this release is.
let commit = "unknown";
try {
  commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  if (execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }).trim()) commit += "+uncommitted";
} catch {}
fs.writeFileSync(path.join(out, "RELEASE.json"), `${JSON.stringify({ name: pkg.name, version: pkg.version, commit, buildId: fs.readFileSync(path.join(buildDir, "BUILD_ID"), "utf8").trim(), builtAt: new Date().toISOString() }, null, 2)}\n`);

function folderSize(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    total += entry.isDirectory() ? folderSize(full) : fs.statSync(full).size;
  }
  return total;
}
console.log(`Release ${commit} assembled in ${rel(out)} (${(folderSize(out) / 1024 / 1024).toFixed(0)} MB).`);

// 8. One file to upload, when a zip tool is at hand.
if (!process.argv.includes("--no-zip")) {
  const zip = path.join(root, "plesk-release.zip");
  fs.rmSync(zip, { force: true });
  try {
    // Windows ships bsdtar, which writes zip archives; elsewhere use zip.
    if (process.platform === "win32") execFileSync(path.join(process.env.SystemRoot || "C:\\Windows", "System32", "tar.exe"), ["-a", "-c", "-f", zip, "-C", out, "."], { stdio: "ignore" });
    else execFileSync("zip", ["-q", "-r", zip, "."], { cwd: out, stdio: "ignore" });
    console.log(`Zipped to ${rel(zip)} (${(fs.statSync(zip).size / 1024 / 1024).toFixed(0)} MB): upload it in Plesk → Files and choose "Extract files".`);
  } catch {
    fs.rmSync(zip, { force: true });
    console.log("No zip tool found; upload the folder's contents instead (FTP or Plesk → Files).");
  }
}
console.log("Next: follow docs/DEPLOYMENT.md.");
