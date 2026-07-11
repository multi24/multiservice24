const CACHE_NAME = "multi24-v2026-07-11-iphone-01";

const CORE_ASSETS = [
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch(() => null)
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
            return null;
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== location.origin) return;

  const esArchivoPrincipal =
    url.pathname.endsWith("/") ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".webmanifest");

  if (esArchivoPrincipal) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});

async function networkFirst(request) {
  try {
    const fresh = await fetch(request, { cache: "no-store" });

    const cache = await caches.open(CACHE_NAME);
    cache.put(request, fresh.clone());

    return fresh;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || new Response("Sin conexión", { status: 503 });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) return cached;

  const fresh = await fetch(request);

  const cache = await caches.open(CACHE_NAME);
  cache.put(request, fresh.clone());

  return fresh;
}
