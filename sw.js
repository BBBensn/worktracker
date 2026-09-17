const CACHE = 'bensn-wt-v3';
const STATIC = [
  '/shared/bensn.css',
  '/shared/bensn.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // API calls + navigation: always network, never cache
  if (url.pathname.startsWith('/api/') || e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request));
    return;
  }

  // Shared static files: stale-while-revalidate — serve cached instantly,
  // but always refetch in the background so a later shared/bensn.css change
  // (edited from another app's repo) reaches this PWA without a version bump here
  if (url.pathname.startsWith('/shared/')) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          const fetchPromise = fetch(e.request).then(res => {
            if (res.ok) cache.put(e.request, res.clone());
            return res;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Everything else: network only
  e.respondWith(fetch(e.request));
});
