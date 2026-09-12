const CACHE_NAME = "ethiopian-wellness-v3";
const KNOWLEDGE_CACHE = "ethio-knowledge-v1";

// App shell pages
const APP_SHELL = ["/", "/wellness", "/constitution", "/inquiry", "/offline", "/atlas", "/emergency", "/foods", "/safety"];

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
      caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
      caches.open(KNOWLEDGE_CACHE).then((cache) =>
        Promise.allSettled(KNOWLEDGE_API_ROUTES.map((url) => cache.add(url)))
      ),
    ]).then(() => self.skipWaiting())
  );
});

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
        const response = await fetch(url);
        if (response.ok) await cache.put(url, response);
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

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Knowledge API routes: stale-while-revalidate
  if (KNOWLEDGE_API_ROUTES.some((route) => url.pathname.startsWith(route))) {
    event.respondWith(staleWhileRevalidate(request, KNOWLEDGE_CACHE));
    return;
  }

  // Skip dynamic API routes (intake, report, export etc)
  if (url.pathname.startsWith("/api/")) return;

  // Navigation: network-first, fallback to cache then offline page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/offline"))
        )
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
    )
  );
});

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

  return cached || networkFetch;
}
