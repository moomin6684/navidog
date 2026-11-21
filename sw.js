// 내비독 서비스워커 — 이미지·지도·글꼴은 한 번 받으면 저장해 두고(오프라인에서도 열림),
// 화면 코드(html·js)는 늘 새 버전을 먼저 받아 수정한 내용이 바로 보이게 한다.
const VERSION = 'navidog-2026-11-21d';
const SHELL = ['./', 'index.html', 'player.js?v=15', 'data.js?v=12', 'lqip.js?v=8', 'map/maps.js?v=8', 'map/preview.webp', 'fonts/MaplestoryBold.woff', 'icons/icon-192.png'];
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).catch(() => {})); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const asset = /\/(img|map|fonts|icons)\//.test(url.pathname) || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (asset) {
    e.respondWith(caches.open(VERSION).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }))));
  } else if (url.origin === location.origin) {
    e.respondWith(fetch(req).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(VERSION).then((c) => c.put(req, cp)); } return res; }).catch(() => caches.match(req)));
  }
});
