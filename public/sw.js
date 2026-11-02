const CACHE_NAME = "ethiopian-wellness-v6";
const KNOWLEDGE_CACHE = "ethio-knowledge-v3";

// Only public, non-personal pages enter the offline navigation cache.
const APP_SHELL = ["/", "/offline", "/constitution", "/atlas", "/emergency", "/foods", "/safety"];
const CACHEABLE_NAVIGATIONS = new Set(APP_SHELL);

// URL prefix the app is published under (e.g. "/wa"), taken from the scope it was registered with.
// Everything above and below is written without it; withBase() adds it where a URL is requested
// and routeOf() removes it before a pathname is compared.
const BASE = new URL(self.registration.scope).pathname.replace(/\/$/, "");
const withBase = (path) => (path === "/" ? BASE || "/" : `${BASE}${path}`);
const routeOf = (pathname) => (BASE && (pathname === BASE || pathname.startsWith(`${BASE}/`)) ? pathname.slice(BASE.length) || "/" : pathname);

// API routes to cache for offline knowledge base
const KNOWLEDGE_API_ROUTES = [
  "/api/foods",
  "/api/herbs",
  "/api/atlas",
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      precacheAppShell(),
      caches.open(KNOWLEDGE_CACHE).then((cache) =>
        Promise.allSettled(KNOWLEDGE_API_ROUTES.map((url) => cache.add(withBase(url))))
      ),
    ]).then(() => self.skipWaiting())
  );
});

async function precacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(APP_SHELL.map(withBase));
  const offlinePage = await cache.match(withBase("/offline"));
  if (!offlinePage) throw new Error("Offline page could not be cached.");
  const html = await offlinePage.text();
  const assets = new Set(
    [...html.matchAll(/(?:src|href)=["']([^"']*\/_next\/static\/[^"']+)["']/g)]
      .map((match) => new URL(match[1], self.location.origin).href)
  );
  await Promise.all([...assets].map((asset) => cache.add(asset)));
}

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== KNOWLEDGE_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Background Sync ──────────────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-knowledge") {
    event.waitUntil(refreshKnowledgeCache());
  }
});

async function refreshKnowledgeCache() {
  const cache = await caches.open(KNOWLEDGE_CACHE);
  await Promise.allSettled(
    KNOWLEDGE_API_ROUTES.map(async (url) => {
      try {
        const response = await fetch(withBase(url));
        if (response.ok) await cache.put(withBase(url), response);
      } catch {
        // Offline — keep existing cache
      }
    })
  );
}

// ─── Fetch Strategy ───────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  const route = routeOf(url.pathname);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Knowledge API routes: stale-while-revalidate
  if (KNOWLEDGE_API_ROUTES.some((prefix) => route.startsWith(prefix))) {
    event.respondWith(staleWhileRevalidate(request, KNOWLEDGE_CACHE));
    return;
  }

  // Place suggestions for the location field: public reference data, kept for offline use as
  // they are looked up (never precached: the full list is large).
  if (route === "/api/locations" && url.searchParams.get("fields") === "places") {
    event.respondWith(staleWhileRevalidate(request, KNOWLEDGE_CACHE));
    return;
  }

  // Skip dynamic API routes (intake, report, export etc)
  if (route.startsWith("/api/")) return;

  // Never intercept dev hot-reload, HMR, or chunk query versions in SW
  if (route.includes("_next/webpack-hmr") || route.includes(".hot-update.") || (route.startsWith("/_next/") && url.searchParams.has("v"))) {
    return;
  }

  // Never cache account, case, booking, or other personalized navigation responses.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && CACHEABLE_NAVIGATIONS.has(route) && !url.search) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = CACHEABLE_NAVIGATIONS.has(route) && !url.search
            ? await caches.match(request)
            : null;
          if (cached) return cached;
          if (route !== "/offline" && await caches.match(withBase("/offline"))) return offlineFallback();
          return Response.error();
        })
    );
    return;
  }

  // Cache only versioned build assets and bundled public knowledge images.
  if (!route.startsWith("/_next/static/") && !route.startsWith("/icons/") && !route.startsWith("/app-icons/") && !route.startsWith("/images/")) return;

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response && response.status === 200 && (response.type === "basic" || response.type === "cors")) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
    )
  );
});

function offlineFallback() {
  return new Response(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#073b2b"><title>Offline | Ethiopian Wisdom Atlas</title></head><body style="margin:0;background:#070c09;color:#f1f5f9;font:16px system-ui,sans-serif"><main style="box-sizing:border-box;max-width:40rem;margin:12vh auto;padding:2rem"><p style="color:#fbbf24;font-weight:700">OFFLINE MODE</p><h1 style="font-size:2rem">You are temporarily offline</h1><p style="color:#cbd5e1;line-height:1.7">Public reference pages saved on this device may still be available. Sign-in, account data, bookings, messages, and submissions need an internet connection.</p><a href="/offline" style="display:inline-block;margin-top:1rem;border-radius:999px;background:#059669;color:white;padding:.8rem 1.2rem;text-decoration:none;font-weight:700">Open offline guide</a></main></body></html>',
    { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
  );
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Revalidate in background
  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  return cached || await networkFetch || new Response("Offline and no saved copy is available.", { status: 503 });
}
