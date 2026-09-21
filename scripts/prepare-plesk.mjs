import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const output = join(root, "plesk-release");
await mkdir(output, { recursive: true });

const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const releasePackage = {
  name: packageJson.name,
  private: true,
  scripts: { start: "next start -p ${PORT:-3000}" },
  engines: packageJson.engines ?? { node: ">=20.0.0" },
};

await writeFile(join(output, "package.json"), `${JSON.stringify(releasePackage, null, 2)}\n`);
await writeFile(
  join(output, ".env.example"),
  "NODE_ENV=production\nPORT=3000\nDATABASE_URL=mysql://user:password@localhost:3306/ethio_wellness\nAUTH_SECRET=replace-with-a-long-random-secret\n",
);
await writeFile(
  join(output, "README.txt"),
  "Plesk deployment: upload .next, public, package.json, package-lock.json, and this folder's environment values. Set the Node.js application startup file to the Next.js start command and run npm ci --omit=dev.\n",
);
console.log(`Prepared ${output}`);