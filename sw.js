// キャッシュの名前を定義
// 画像ファイルを更新した際はここのバージョンをあげる
const CACHE_NAME = 'tile-cache-v1';

// キャッシュするファイルのリスト
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/main.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// App Shellをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// fetchイベント
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // リクエストがタイル画像の場合
  if (url.pathname.startsWith('/tiles/') && url.pathname.endsWith('.webp')) {

    // キャッシュを読み取る
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          // キャッシュに存在する場合
          if (cachedResponse) {
            // console.log('Cache hit:', event.request.url);
            // キャッシュから返す
            return cachedResponse;
          }

          // キャッシュに存在しない場合
          // console.log('Cache miss, fetching:', event.request.url);
          return fetch(event.request).then((networkResponse) => {

            // ネットワークから取得したレスポンスをキャッシュに保存する
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());

              // ネットワークから取得したレスポンスをブラウザに返す
              return networkResponse;
            });
          })
          .catch((error) => {
            // ネットワークエラー時
            console.error('Fetch failed:', error);
          });
        })
    );
  } else {
    // タイル以外のリクエスト
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  }
});
