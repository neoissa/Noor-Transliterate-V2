const CACHE_NAME = 'noor-trans-v6';
const LOCAL_ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './app2.js',
    './manifest.json'
];
const API_ORIGIN = 'https://api.alquran.cloud';

// Install — cache local assets only
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(LOCAL_ASSETS))
    );
    self.skipWaiting();
});

// Activate — remove old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch — smart strategy
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Network-first for Quran API & audio
    if (url.origin === API_ORIGIN || url.hostname === 'cdn.islamic.network') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Network-first for Yamli API
    if (url.hostname === 'api.yamli.com') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Network-first for Google Fonts & CDNs
    if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com' || url.hostname === 'cdn.jsdelivr.net') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first for all local assets
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});
