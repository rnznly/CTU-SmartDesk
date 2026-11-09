/**
 * @file service-worker.js
 * @description Progressive Web App Service Worker.
 * Implements Cache-First caching strategy for instant offline reloads (Part III),
 * cache version management, and network fallback.
 */

const CACHE_NAME = 'ctu-smartdesk-v13';

// Pre-cached core assets for 100% offline functionality
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './css/components.css',
  './js/app.js',
  './js/config/constants.js',
  './js/contracts/apiContracts.js',
  './js/data/mockApi.js',
  './js/data/storageService.js',
  './js/services/requestService.js',
  './js/services/notificationService.js',
  './js/services/soundService.js',
  './js/ui/formView.js',
  './js/ui/listView.js',
  './js/ui/interactiveHalftone.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/sounds/typewriter.mp3',
  './assets/sounds/minecraft_click.mp3',
  './assets/sounds/click_pen.mp3',
  './assets/sounds/scribblenauts.mp3',
  './assets/sounds/switch_notification.mp3',
  './assets/sounds/nintendo_switch.mp3'
];

/**
 * 1. Install Event: Pre-cache all static shell assets
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event: Pre-caching static assets...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] All core assets cached successfully.');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.warn('[Service Worker] Pre-cache failed for some assets:', err);
      })
  );
});

/**
 * 2. Activate Event: Clean up legacy or deprecated caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event: Purging old caches...');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              console.log('[Service Worker] Removing deprecated cache:', name);
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

/**
 * 3. Fetch Event: Cache-First strategy with network fallback
 * Satisfies Part III: Works seamlessly even when offline.
 */
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignore chrome-extension or external analytics if any
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset immediately (Cache-First)
        // Optionally revalidate in background (Stale-While-Revalidate for non-static)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
          })
          .catch(() => {
            // Background revalidation silently ignored when offline
          });

        return cachedResponse;
      }

      // If not in cache, fetch from network and store in cache
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // If offline and request is HTML, return cached index.html fallback
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
        });
    })
  );
});
