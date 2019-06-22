// ajoute nos fichiers dans le cache
const cacheName = `nomApplication`;
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll([
                `/`,
                `/index.html`,
                `/main.js`,
            ])
                .then(() => self.skipWaiting());
        })
    );
});


self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

// récupère les fichiers du cache
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open(cacheName)
            .then(cache => cache.match(event.request, {ignoreSearch: true}))
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
