const CACHE_NAME = 'sovereign-core-v21';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/crypto-engine.js',
    './js/tools.js'
    // Eğer PDF-lib veya Tesseract.js gibi kütüphaneleri indirip yerelde barındırırsanız, 
    // yollarını buraya eklemelisiniz (Örn: './libs/pdf-lib.min.js').
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => 
            Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
        )
    );
    self.clients.claim();
});

// Çevrimdışı (Offline) çalışma mantığı: Önce Cache, yoksa Network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        }).catch(() => {
            // Tamamen internetsiz ortamda ana sayfaya yönlendir
            if (event.request.destination === 'document') return caches.match('./index.html');
        })
    );
});
