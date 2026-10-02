import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const nextCli = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const child = spawn(
  process.execPath,
  [nextCli, "dev", "-p", process.env.PORT || "5500", ...process.argv.slice(2)],
  {
    env: {
      ...process.env,
      NEXT_DIST_DIR: process.env.NEXT_DIST_DIR || ".next-dev",
    },
    stdio: "inherit",
  }
);

child.on("error", (error) => {
  console.error("Unable to start the Next.js development server:", error);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
