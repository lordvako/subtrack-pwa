self.addEventListener('install', e => e.skipWaiting());
self.addEventListener('fetch', e => e.respondWith(fetch(e.request)));