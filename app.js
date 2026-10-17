/**
 * Production entry point for hosts that start a Node.js application from one file
 * (Plesk → Node.js → "Application Startup File", Phusion Passenger, cPanel, plain `node app.js`).
 *
 * It serves the build made by `npm run build`. Settings come from the host's environment
 * variables or from a .env file beside this file (Next.js loads it). The listening port is taken
 * from PORT; under Passenger the value does not matter because Passenger supplies the socket.
 */
const { createServer } = require("node:http");
const path = require("node:path");

process.env.NODE_ENV = "production";
// Passenger starts the app from a directory of its choosing; uploads and .env are relative to here.
process.chdir(__dirname);

// Read .env now, so PORT and friends are known before the server is created (Next.js would
// otherwise load it only while preparing). Variables set by the host always win over the file.
require("@next/env").loadEnvConfig(__dirname, false, { info() {}, error: console.error });

const next = require("next");

const port = Number(process.env.PORT) || 3000;
const app = next({ dev: false, dir: __dirname, hostname: process.env.HOSTNAME || "0.0.0.0", port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer((req, res) => {
      handle(req, res).catch((error) => {
        console.error(JSON.stringify({ level: "error", time: new Date().toISOString(), message: error && error.message, path: (req.url || "").split("?")[0] }));
        if (!res.headersSent) res.statusCode = 500;
        res.end();
      });
    });
    // Live updates use long-lived event streams; do not let Node close them as idle.
    server.keepAliveTimeout = 65_000;
    server.requestTimeout = 0;
    server.listen(port, () => console.log(`[server] ready on port ${port} (${path.basename(__dirname)})`));

    const stop = (signal) => {
      console.log(`[server] ${signal} received, closing`);
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 10_000).unref();
    };
    process.on("SIGTERM", () => stop("SIGTERM"));
    process.on("SIGINT", () => stop("SIGINT"));
  })
  .catch((error) => {
    console.error("[server] failed to start:", error && error.message ? error.message : error);
    process.exit(1);
  });
