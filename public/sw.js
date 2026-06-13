// Service Worker for Govigi PWA

const CACHE_NAME = 'govigi-v3';
const STATIC_CACHE = 'govigi-static-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192-maskable.png',
  '/icon-512-maskable.png',
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[Service Worker] Caching assets');
        return cache.addAll(urlsToCache).catch((err) => {
          console.warn('[Service Worker] Cache addAll error:', err);
        });
      }),
      caches.open(CACHE_NAME)
    ])
  );
  self.skipWaiting();
  console.log('[Service Worker] Skip waiting triggered - will control page immediately');
});

// Activate Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming all clients');
      return self.clients.claim();
    })
  );
});

// Fetch Event - Network first for API, Cache first for static assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests and same-origin API calls that should always be fresh
  if (url.origin !== self.location.origin) {
    return;
  }

  // Only use Cache-First for static hashed assets and media.
  // HTML pages, API calls, and sw.js itself must use Network-First to prevent stale UI caching.
  const isStaticHashedAsset = (url.pathname.includes('_next/static/') || 
                               /\.(png|jpe?g|gif|svg|ico|webp|woff2?|ttf|otf|css|js)$/i.test(url.pathname)) && 
                              !url.pathname.includes('sw.js');

  if (!isStaticHashedAsset || url.pathname.includes('/api/') || url.pathname.includes('/get')) {
    // Pages, Documents, Manifests & APIs - Network First, falling back to cache
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).catch(() => {
            return caches.match('/') || new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
        })
    );
  } else {
    // Static assets - Cache First, falling back to network
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(response => {
          if (!response || response.status !== 200) {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(STATIC_CACHE).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        }).catch(() => {
          return caches.match('/') || new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
    );
  }
});
