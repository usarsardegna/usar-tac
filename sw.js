/* USAR-TAC · uso senza rete (service worker)
   Ideata e realizzata da Alessio Corvino */
const VER = 'usartac-v3.2';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-apple.png'];
const LIBS = [
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js',
  'https://unpkg.com/lucide@0.453.0/dist/umd/lucide.min.js'
];
const CACHE_HOSTS = ['cdnjs.cloudflare.com', 'unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => Promise.allSettled([...CORE, ...LIBS].map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== VER).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // pagina e file dell'app: prima la rete (per avere sempre l'ultima versione), senza rete la copia salvata
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(VER).then(c => c.put(req, cp)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
    return;
  }
  // librerie e caratteri: prima la copia salvata
  if (CACHE_HOSTS.includes(url.hostname)) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(n => { const cp = n.clone(); caches.open(VER).then(c => c.put(req, cp)); return n; })));
  }
  // tutto il resto (mappe, meteo, OpenStreetMap, foglio): sempre dalla rete
});
