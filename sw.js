const CACHE_NAME = 'bikharta-samrajya-cache-v10';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './book_cover.png',
  './icon-512.png',
  // CDN Parser
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
  // Google Fonts CSS
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Lora:ital,wght@0,400;0,500;1,400&family=Mukta:wght@300;400;500;700&family=Noto+Serif+Devanagari:wght@400;500;700&display=swap',
  // Book Scenes Configuration
  './chapters/Index.md',
  // Pre-cache all 44 Chapters for full offline support on first install!
  './chapters/Chapter 1.md',
  './chapters/Chapter 2.md',
  './chapters/Chapter 3.md',
  './chapters/Chapter 4.md',
  './chapters/Chapter 5.md',
  './chapters/Chapter 6.md',
  './chapters/Chapter 7.md',
  './chapters/Chapter 8.md',
  './chapters/Chapter 9.md',
  './chapters/Chapter 10.md',
  './chapters/Chapter 11.md',
  './chapters/Chapter 12.md',
  './chapters/Chapter 13.md',
  './chapters/Chapter 14.md',
  './chapters/Chapter 15.md',
  './chapters/Chapter 16.md',
  './chapters/Chapter 17.md',
  './chapters/Chapter 18.md',
  './chapters/Chapter 19.md',
  './chapters/Chapter 20.md',
  './chapters/Chapter 21.md',
  './chapters/Chapter 22.md',
  './chapters/Chapter 23.md',
  './chapters/Chapter 24.md',
  './chapters/Chapter 25.md',
  './chapters/Chapter 26.md',
  './chapters/Chapter 27.md',
  './chapters/Chapter 28.md',
  './chapters/Chapter 29.md',
  './chapters/Chapter 30.md',
  './chapters/Chapter 31.md',
  './chapters/Chapter 32.md',
  './chapters/Chapter 33.md',
  './chapters/Chapter 34.md',
  './chapters/Chapter 35.md',
  './chapters/Chapter 36.md',
  './chapters/Chapter 37.md',
  './chapters/Chapter 38.md',
  './chapters/Chapter 39.md',
  './chapters/Chapter 40*.md',
  './chapters/Chapter 41.md',
  './chapters/Chapter 42.md',
  './chapters/Chapter 43.md',
  './chapters/Chapter 44.md'
];

// --- Install Service Worker ---
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Use silent failure for individual non-essential Google Font resources if any,
      // but ensure main assets and chapters are cached successfully.
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => {
            console.warn(`Failed to pre-cache asset: ${url}`, err);
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// --- Activate Service Worker ---
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// --- Fetch Event (Cache First, Network Fallback) ---
self.addEventListener('fetch', event => {
  // Avoid intercepting browser extension requests or chrome-extension:// schemes
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('https://cdn.jsdelivr.net') && !event.request.url.startsWith('https://fonts.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        // Cache the newly fetched file dynamically
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(err => {
        // Fallback for offline if not found in cache
        console.error('Fetch failed, offline fallback triggered:', err);
      });
    })
  );
});
