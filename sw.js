// Cache do app para funcionar offline (o mapa precisa de internet).
const V = 'taf-v1';
const ARQ = ['./', 'index.html', 'styles.css', 'manifest.webmanifest', 'app.js', 'store.js', 'program.js', 'devices.js', 'icon-192.png', 'icon-512.png', 'privacidade.html'];
const CDN = ['https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js', 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css', 'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.js'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then(async (c) => { await c.addAll(ARQ); await Promise.all(CDN.map((u) => c.add(new Request(u, { mode: 'cors' })).catch(() => {}))); }).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (CDN.includes(u.href)) { e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((res) => { const c = res.clone(); caches.open(V).then((ca) => ca.put(e.request, c)); return res; }))); return; }
  if (u.origin !== location.origin) return; // mapa e Google Agenda vão direto para a rede
  e.respondWith(fetch(e.request).then((r) => { const c = r.clone(); caches.open(V).then((ca) => ca.put(e.request, c)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))));
});
