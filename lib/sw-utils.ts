'use client';

// Service Worker の状態
export type SWStatus = 'installing' | 'waiting' | 'active' | 'redundant' | 'error' | 'none';

// Service Worker のイベントタイプ
export interface SWUpdate {
  isUpdateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

// Service Worker を登録する
export async function registerSW(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[SW] Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[SW] Service Worker registered:', registration);

    // アップデートチェック
    registration.addEventListener('updatefound', () => {
      console.log('[SW] New Service Worker found');
      handleSWUpdate(registration);
    });

    // 既にアクティブなSWがあるかチェック
    if (registration.active) {
      console.log('[SW] Service Worker is active');
    }

    return registration;
  } catch (error) {
    console.error('[SW] Service Worker registration failed:', error);
    return null;
  }
}

// Service Worker のアップデート処理
function handleSWUpdate(registration: ServiceWorkerRegistration) {
  const newSW = registration.installing;
  
  if (!newSW) return;

  newSW.addEventListener('statechange', () => {
    console.log('[SW] New Service Worker state:', newSW.state);
    
    if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
      // 新しいSWがインストール完了し、既存のSWが動作中の場合
      console.log('[SW] New Service Worker is ready');
      
      // ユーザーにアップデートを通知
      if (confirm('アプリの新しいバージョンが利用可能です。更新しますか？')) {
        newSW.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  });
}

// オフライン状態を監視する
export function setupOfflineDetection(callback: (isOnline: boolean) => void) {
  if (typeof window === 'undefined') return;

  const handleOnline = () => {
    console.log('[SW] Network: online');
    callback(true);
  };

  const handleOffline = () => {
    console.log('[SW] Network: offline');
    callback(false);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // 初期状態を設定
  callback(navigator.onLine);

  // クリーンアップ関数を返す
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// キャッシュをクリアする
export async function clearCache(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('[SW] All caches cleared');
  } catch (error) {
    console.error('[SW] Failed to clear caches:', error);
  }
}

// オフライン用データをキャッシュに保存
export async function cacheOfflineData(key: string, data: any): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return;
  }

  try {
    const cache = await caches.open('passumane-offline-data');
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put(key, response);
    console.log('[SW] Offline data cached:', key);
  } catch (error) {
    console.error('[SW] Failed to cache offline data:', error);
  }
}

// オフライン用データをキャッシュから取得
export async function getOfflineData(key: string): Promise<any | null> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return null;
  }

  try {
    const cache = await caches.open('passumane-offline-data');
    const response = await cache.match(key);
    
    if (response) {
      const data = await response.json();
      console.log('[SW] Offline data retrieved:', key);
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('[SW] Failed to get offline data:', error);
    return null;
  }
}

// Service Worker の状態を取得
export async function getSWStatus(): Promise<SWStatus> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return 'none';
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    if (registration.installing) return 'installing';
    if (registration.waiting) return 'waiting';
    if (registration.active) return 'active';
    
    return 'none';
  } catch (error) {
    console.error('[SW] Failed to get SW status:', error);
    return 'error';
  }
}

// PWAインストールプロンプトの管理
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

// PWAインストールプロンプトを設定
export function setupPWAInstallPrompt(
  onPromptReady: (canInstall: boolean) => void
) {
  if (typeof window === 'undefined') return;

  const handleBeforeInstallPrompt = (e: Event) => {
    console.log('[PWA] Install prompt ready');
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    onPromptReady(true);
  };

  const handleAppInstalled = () => {
    console.log('[PWA] App installed');
    deferredPrompt = null;
    onPromptReady(false);
  };

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);

  return () => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.removeEventListener('appinstalled', handleAppInstalled);
  };
}

// PWAインストールを実行
export async function installPWA(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('[PWA] No install prompt available');
    return false;
  }

  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log('[PWA] Install prompt result:', outcome);
    
    deferredPrompt = null;
    return outcome === 'accepted';
  } catch (error) {
    console.error('[PWA] Install failed:', error);
    return false;
  }
}

// PWAがインストールされているかチェック
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  
  // iOS Safari
  if ('standalone' in window.navigator && window.navigator.standalone) {
    return true;
  }
  
  // Android Chrome
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  return false;
}