const CACHE_NAME = 'savedreels-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first with cache fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Weekly nudge: triggered by the app via postMessage
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_WEEKLY_NUDGE') {
    const { videoCount } = event.data;
    // Schedule nudge 7 days from now
    const delay = 7 * 24 * 60 * 60 * 1000;
    setTimeout(() => {
      self.registration.showNotification('SavedReels', {
        body: `You have ${videoCount} saved videos waiting. Rediscover something today!`,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'weekly-nudge',
        renotify: true,
        data: { url: '/' },
      });
    }, delay);
  }
});

// Open app when notification is tapped
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('/');
    })
  );
});
