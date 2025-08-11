'use client';

import { useEffect, createContext, useContext, ReactNode, useState } from 'react';
import { 
  registerSW, 
  setupOfflineDetection, 
  setupPWAInstallPrompt, 
  isPWAInstalled 
} from '@/lib/sw-utils';

// PWA Context の型定義
interface PWAContextType {
  isOnline: boolean;
  canInstall: boolean;
  isInstalled: boolean;
  swRegistration: ServiceWorkerRegistration | null;
}

const PWAContext = createContext<PWAContextType>({
  isOnline: true,
  canInstall: false,
  isInstalled: false,
  swRegistration: null,
});

// PWA Context を使用するための Hook
export function usePWA() {
  return useContext(PWAContext);
}

// Service Worker Provider Component
interface ServiceWorkerProviderProps {
  children: ReactNode;
}

export function ServiceWorkerProvider({ children }: ServiceWorkerProviderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Service Worker の登録
    const initServiceWorker = async () => {
      const registration = await registerSW();
      setSwRegistration(registration);
    };

    // オフライン検知の設定
    const cleanupOfflineDetection = setupOfflineDetection((online) => {
      setIsOnline(online);
    });

    // PWA インストールプロンプトの設定
    const cleanupInstallPrompt = setupPWAInstallPrompt((canInstall) => {
      setCanInstall(canInstall);
    });

    // PWA インストール状態の確認
    setIsInstalled(isPWAInstalled());

    // 初期化
    initServiceWorker();

    // クリーンアップ
    return () => {
      cleanupOfflineDetection?.();
      cleanupInstallPrompt?.();
    };
  }, []);

  // Context値
  const contextValue: PWAContextType = {
    isOnline,
    canInstall,
    isInstalled,
    swRegistration,
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  );
}

// オフライン状態を表示するコンポーネント
export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium">
      <div className="flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        オフラインモードです - 一部の機能が制限されます
      </div>
    </div>
  );
}

// PWA インストールプロンプトコンポーネント
export function PWAInstallPrompt() {
  const { canInstall, isInstalled } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // インストール可能で、まだインストールされていない場合のみ表示
    if (canInstall && !isInstalled) {
      const hasShownPrompt = localStorage.getItem('pwa-install-prompt-shown');
      if (!hasShownPrompt) {
        // 5秒後にプロンプトを表示
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [canInstall, isInstalled]);

  const handleInstall = async () => {
    const { installPWA } = await import('@/lib/sw-utils');
    const installed = await installPWA();
    
    if (installed) {
      setShowPrompt(false);
      localStorage.setItem('pwa-install-prompt-shown', 'true');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-prompt-shown', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-blue-600 text-white rounded-lg shadow-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-sm">アプリをインストール</h3>
          <p className="text-xs text-blue-100 mt-1">
            パスマネをホーム画面に追加して、より快適にご利用いただけます。
          </p>
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              インストール
            </button>
            <button
              onClick={handleDismiss}
              className="text-blue-100 px-3 py-1 rounded text-sm hover:text-white transition-colors"
            >
              後で
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}