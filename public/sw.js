const CACHE_NAME = 'passumane-v1';
const STATIC_CACHE = 'passumane-static-v1';
const API_CACHE = 'passumane-api-v1';

// キャッシュするスタティックファイル
const STATIC_FILES = [
  '/',
  '/dashboard',
  '/auth',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// API エンドポイント パターン
const API_PATTERNS = [
  /\/api\//,
  /supabase\.co/,
];

// Service Worker インストール時
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static files');
      return cache.addAll(STATIC_FILES);
    })
  );
  
  // 即座に新しいSWをアクティブにする
  self.skipWaiting();
});

// Service Worker アクティベート時
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 古いキャッシュを削除
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE && cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // すべてのタブで新しいSWを制御下に置く
  self.clients.claim();
});

// ネットワークリクエストをインターセプト
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // GETリクエストのみキャッシュ対象
  if (request.method !== 'GET') {
    return;
  }
  
  // APIリクエストかどうか判定
  const isApiRequest = API_PATTERNS.some(pattern => pattern.test(url.href));
  
  if (isApiRequest) {
    // API リクエストの場合: Network First 戦略
    event.respondWith(handleApiRequest(request));
  } else {
    // 静的ファイルの場合: Cache First 戦略
    event.respondWith(handleStaticRequest(request));
  }
});

// API リクエスト処理: Network First
async function handleApiRequest(request) {
  const cacheName = API_CACHE;
  
  try {
    // まずネットワークから取得を試行
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 成功時はレスポンスをキャッシュに保存
      const responseClone = networkResponse.clone();
      const cache = await caches.open(cacheName);
      await cache.put(request, responseClone);
      
      console.log('[SW] API response cached:', request.url);
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
    
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
    
    // ネットワーク失敗時はキャッシュから取得
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('[SW] API response served from cache:', request.url);
      
      // オフライン表示のためのヘッダーを追加
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-Offline-Response', 'true');
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: headers
      });
    }
    
    // キャッシュもない場合はオフラインページを返す
    return new Response(
      JSON.stringify({ 
        error: 'オフラインのため、データを取得できません',
        offline: true 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// 静的ファイル処理: Cache First
async function handleStaticRequest(request) {
  const cacheName = STATIC_CACHE;
  
  try {
    // まずキャッシュから確認
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Static file served from cache:', request.url);
      return cachedResponse;
    }
    
    // キャッシュにない場合はネットワークから取得
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 成功時はキャッシュに保存
      const responseClone = networkResponse.clone();
      const cache = await caches.open(cacheName);
      await cache.put(request, responseClone);
      
      console.log('[SW] Static file cached:', request.url);
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
    
  } catch (error) {
    console.log('[SW] Static file request failed:', error);
    
    // HTMLファイルの場合はオフラインページにフォールバック
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/dashboard');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    throw error;
  }
}

// プッシュ通知受信（将来実装用）
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: 'passumane-notification',
      renotify: true,
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: 'アプリを開く',
          icon: '/icons/icon-192x192.png'
        },
        {
          action: 'close',
          title: '閉じる'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification('パスマネ', options)
    );
  }
});

// 通知クリック処理（将来実装用）
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// バックグラウンド同期（将来実装用）
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'password-sync') {
    event.waitUntil(syncPasswords());
  }
});

// パスワード同期処理（将来実装用）
async function syncPasswords() {
  console.log('[SW] Syncing passwords...');
  // TODO: 実装予定
}

// メッセージハンドラー（クライアントとの通信用）
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});