// Service Worker for Fun Games for Kids
const CACHE_NAME = 'kids-games-v1';
const urlsToCache = [
  '/games/',
  '/games/index.html',
  '/games/assets/css/common.css',
  '/games/games/drawing/',
  '/games/games/puzzle/',
  '/games/games/matching/',
  '/games/games/dress_up/',
  '/games/games/othello/',
  '/games/games/shogi/',
  '/games/games/spot_the_difference/',
  '/games/games/rhythm/',
  '/games/games/whack_a_mole/',
  '/games/games/learning_quiz/'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, show offline page
        if (event.request.destination === 'document') {
          return caches.match('/games/');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});