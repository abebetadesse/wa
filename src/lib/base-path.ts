// The URL prefix the app is served under, e.g. "/wa" when it runs inside another site's domain.
// It is fixed at build time (Next.js inlines NEXT_PUBLIC_ variables), so rebuild after changing it.
export const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);

export function normalizeBasePath(value: string | undefined) {
  const trimmed = (value ?? "").trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  if (!/^\/[A-Za-z0-9._~\-/]*$/.test(trimmed)) {
    throw new Error("NEXT_PUBLIC_BASE_PATH must be a path such as /wa.");
  }
  return trimmed;
}

// Prefixes an app path for places Next.js does not handle itself: fetch calls, plain anchors,
// window.location, iframes and the socket.io path. <Link> and router.push add the prefix on their own.
export function withBasePath(path: string) {
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}

// For URLs that may be root-relative (public files, uploads) or external: only the root-relative
// ones get the prefix. Use it on plain <img>, <a>, <iframe>, <audio> and <video> attributes.
export function assetUrl<T extends string | null | undefined>(url: T): T {
  return (typeof url === "string" && url.startsWith("/") && !url.startsWith("//") ? withBasePath(url) : url) as T;
}
