/**
 * Shared public-path configuration for client-side auth guards.
 *
 * NOTE: middleware.ts intentionally keeps its own copy of these paths because
 * Next.js Edge Runtime has strict module-import constraints.  Any changes here
 * must be mirrored in `src/middleware.ts` as well.
 */

export const PUBLIC_PATHS = [
  "/marketplace",
  "/b",
  "/heritage",
  "/auth",
  "/emergency",
  "/safety",
  "/discover",
  "/cultural",
  "/awde-negast",
  "/constitution",
  "/somatics",
  "/ecology",
  "/fasting",
  "/zoonotic",
  "/foods",
  "/atlas",
  "/case",
] as const;

/**
 * Returns true when `pathname` is publicly accessible (no auth required).
 * The root path "/" is always public.
 */
export function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}
