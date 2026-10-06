/**
 * Server start-up and error reporting hooks (Next.js instrumentation).
 *
 * register()        validates the environment before the first request is served, then lets the
 *                   application prepare its database in the background (src/server/setup/autoSetup.ts).
 * onRequestError()  one JSON line per unhandled server error, on stderr, where the host's log viewer
 *                   (Plesk → Logs) and any log shipper can pick it up. Request bodies, cookies and
 *                   query strings are never logged.
 */
export async function register() {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  // Written as a positive check so the edge build drops this block and never bundles database code.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { checkProductionEnvironment } = await import("@/lib/config/environment");
    checkProductionEnvironment();
    // Not awaited: creating a hundred tables on a remote server can outlast the host's start-up limit.
    void import("@/server/setup/autoSetup").then(({ prepareDatabase }) => prepareDatabase());
  }
}

export function onRequestError(
  error: unknown,
  request: { path: string; method: string },
  context: { routerKind: string; routePath: string; routeType: string },
) {
  const err = error as { message?: string; digest?: string; stack?: string };
  console.error(
    JSON.stringify({
      level: "error",
      time: new Date().toISOString(),
      message: err?.message ?? String(error),
      digest: err?.digest,
      method: request.method,
      path: request.path.split("?")[0],
      route: context.routePath,
      routeType: context.routeType,
      stack: err?.stack?.split("\n").slice(0, 6).join("\n"),
    }),
  );
}
