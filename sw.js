// ============================================================
//  LinkVault - Service Worker
// ============================================================

const CACHE_NAME = "linkvault-v1";

// File yang di-cache untuk offline
const ASSETS = [
  "/",
  "/index.html",
  "/login.html",
  "/app.js",
  "/auth.js",
  "/config.js",
  "/logo-copas.png",
  "/manifest.json",
];

// Install — cache semua aset utama
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — hapus cache lama
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — cache first untuk aset lokal, network first untuk API Supabase
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Biarkan request ke Supabase lewat langsung (network only)
  if (url.hostname.includes("supabase.co")) {
    return;
  }

  // Cache first untuk aset lokal
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((response) => {
        // Cache response baru yang valid
        if (response && response.status === 200 && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      });
    })
  );
});
