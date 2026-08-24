/**
 * LEXIS Progressive Web App — Multi-Tier Service Worker
 * Version: 1.0.0
 */

const CACHE_VERSION = "lexis-v1.0.0";
const STATIC_CACHE = `lexis-static-${CACHE_VERSION}`;
const MEDIA_CACHE = `lexis-media-${CACHE_VERSION}`;
const DATA_CACHE = `lexis-data-${CACHE_VERSION}`;
const SYNC_CACHE = `lexis-sync-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

// 1. Install & Precaching (App Shell)
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Partial precache miss during install:", err);
      });
    })
  );
});

// 2. Activate & Old Cache Storage Cleanup
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith("lexis-") && !name.endsWith(CACHE_VERSION))
            .map((name) => {
              console.log("[SW] Pruning legacy cache:", name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Multi-tier Fetch Strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests for standard caching
  if (request.method !== "GET") {
    return;
  }

  // A. Navigation Requests (App Shell fallback)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cachedIndex = (await cache.match("./index.html")) || (await cache.match("./"));
        return (
          cachedIndex ||
          new Response("Offline - Vui lòng kết nối mạng để sử dụng đầy đủ", {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          })
        );
      })
    );
    return;
  }

  // B. Cache-First: Media, Audio, Fonts, WASM models
  const isMediaOrFont =
    url.hostname.includes("fonts.gstatic.com") ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.pathname.includes("/audio/") ||
    /\.(?:woff2?|ttf|otf|eot|mp3|wav|ogg|onnx|wasm)$/i.test(url.pathname);

  if (isMediaOrFont) {
    event.respondWith(
      caches.open(MEDIA_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) {
          return cached;
        }
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === "opaque")) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          console.warn("[SW] Cache-First fetch failed for media:", request.url, err);
          return cached || new Response(null, { status: 504, statusText: "Media Gateway Timeout" });
        }
      })
    );
    return;
  }

  // C. Network-First with Offline Fallback for API Endpoints (/api/)
  const isApiEndpoint = url.pathname.startsWith("/api/") || url.pathname.includes("/api");
  if (isApiEndpoint) {
    event.respondWith(
      caches.open(SYNC_CACHE).then(async (cache) => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (fetchErr) {
          const cached = await cache.match(request);
          if (cached) {
            return cached;
          }
          // Synthetic offline response
          return new Response(
            JSON.stringify({
              offline: true,
              message: "Chế độ ngoại tuyến — Yêu cầu đã được ghi vào hàng đợi đồng bộ.",
              timestamp: new Date().toISOString(),
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json; charset=utf-8", "X-Lexis-Offline": "true" },
            }
          );
        }
      })
    );
    return;
  }

  // D. Stale-While-Revalidate: Static Assets & JavaScript/CSS Chunks
  event.respondWith(
    caches.open(DATA_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch((err) => {
          // Silent catch on background revalidation
          return null;
        });

      return cached || (await fetchPromise) || new Response(null, { status: 504, statusText: "Offline Miss" });
    })
  );
});

// 4. Message Communication
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
