// SB Suite OS - Service Worker Reset & Cache Invalidator
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

// Bypass and fetch fresh from network
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
