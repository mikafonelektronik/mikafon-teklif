// Mikafon Teklif: uygulama kabuğunu önbelleğe alır, internet yoksa son kaydedilmiş sürümle çalışır.
const CACHE = 'mikafon-teklif-v2';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    try {
      const net = await fetch(req);
      if (net && net.ok) c.put(req, net.clone());
      return net;
    } catch (err) {
      const hit = await c.match(req);
      if (hit) return hit;
      throw err;
    }
  }));
});
