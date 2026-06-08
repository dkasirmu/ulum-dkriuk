const CACHE_NAME = 'dkasirmu-v1.5';

const FILES_TO_CACHE = [
  './',
  './config.js',
  './index.html',
  './main.js',
  './manifest.json',
  './produk.html',
  './riwayat.html',
  './style.css',
  './tentang.html',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './js/db.js',
  './js/export.js',
  './js/format.js',
  './js/kasir.js',
  './js/produk.js',
  './js/riwayat.js',
  'https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    // Biarkan request ke Google lewat langsung tanpa cache
    if (url.includes('google-analytics.com') || 
        url.includes('googletagmanager.com') ||
        url.includes('google.com/g/collect')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});