/* PhysioTimer offline support. Increment CACHE_NAME when changing app assets. */
'use strict';
const CACHE_NAME = 'physiotimer-v6';
const APP_SHELL = [
  './', './index.html', './css/style.css?v=6', './js/i18n.js?v=3',
  './js/core.js?v=2', './js/share.js?v=1', './js/qr.js?v=1', './js/app.js?v=6', './manifest.webmanifest',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('physiotimer-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const url = new URL(req.url);
  if (!url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(req).then(cached => cached || fetch(req)));
});
