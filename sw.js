// キャッシュの名前を定義
// 画像ファイルを更新した際はここのバージョンをあげる
const CACHE_NAME = 'tile-cache-v1';

// タイルキャッシュの最大数
const MAX_CACHE_SIZE = 100000;

// キャッシュするファイルのリスト
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './main.js',
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

// fetch イベント
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // GitHub Pages のリポジトリ名
  const REPO_NAME = '/yosenabe_sakishima_keizai_maps';

  // リクエストがタイル画像の場合
  if (url.pathname.startsWith(REPO_NAME + '/tiles/') && url.pathname.endsWith('.webp')) {

    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {

          // キャッシュに存在する場合
          if (cachedResponse) {
            // キャッシュの中身を返す
            return cachedResponse;
          }

          // キャッシュに存在しない場合
          return fetch(event.request).then((networkResponse) => {

            // ネットワークから取得したレスポンスをキャッシュに保存する
            return cache.put(event.request, networkResponse.clone()).then(() => {
              // タイルをキャッシュした後、現在のキャッシュ数をチェック
              return cache.keys().then((keys) => {
                if (keys.length > MAX_CACHE_SIZE) {
                  // 上限を超えていたら一番古いキーを削除する
                  // console.log(`Cache limit exceeded. Deleting: ${keys[0].url}`);
                  return cache.delete(keys[0]).then(() => {
                    return networkResponse; // 削除後、レスポンスを返す
                  });
                } else {
                  return networkResponse; // 上限内で、レスポンスを返す
                }
              });
            });
          })
          .catch((error) => {
            console.error('Fetch failed:', error);
          });
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
