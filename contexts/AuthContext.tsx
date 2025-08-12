'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSessionValid, clearSession, updateSessionTimestamp } from '@/lib/auth-utils';
import { clearSessionRecoveryData } from '@/lib/session-recovery';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  checkSession: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  const handleSessionExpired = useCallback(() => {
    console.log('Session expired, redirecting to login...');
    clearSession();
    clearSessionRecoveryData();
    setUser(null);
    
    // PWA環境での特別な処理
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  window.navigator.standalone === true;
    
    if (isPWA) {
      console.log('[PWA] Session expired in PWA environment');
      // PWA環境でのセッション関連データをクリア
      localStorage.removeItem('backup-encryption-key');
      localStorage.removeItem('backup-user-salt');
      
      // Service Workerに通知
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SESSION_EXPIRED'
        });
      }
    }
    
    if (!pathname?.startsWith('/auth') && !pathname?.startsWith('/logout')) {
      // PWA環境ではlocation.hrefを使用して確実にリダイレクト
      if (isPWA) {
        window.location.href = '/auth?session_expired=true';
      } else {
        router.push('/auth?session_expired=true');
      }
    }
  }, [pathname, router]);

  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking session:', error);
        handleSessionExpired();
        return false;
      }

      if (!session) {
        handleSessionExpired();
        return false;
      }

      const clientSessionValid = isSessionValid();
      if (!clientSessionValid) {
        await supabase.auth.signOut();
        handleSessionExpired();
        return false;
      }

      setUser(session.user);
      updateSessionTimestamp();
      return true;
    } catch (error) {
      console.error('Session check failed:', error);
      handleSessionExpired();
      return false;
    }
  }, [supabase, handleSessionExpired]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      clearSession();
      setUser(null);
      router.push('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      clearSession();
      setUser(null);
      router.push('/auth');
    }
  }, [supabase, router]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (!mounted) return;
      
      const sessionValid = await checkSession();
      if (mounted) {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        if (event === 'SIGNED_OUT') {
          handleSessionExpired();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setUser(session.user);
          updateSessionTimestamp();
        }
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        updateSessionTimestamp();
      }
    });

    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }
    checkIntervalRef.current = setInterval(() => {
      if (mounted) {
        checkSession();
      }
    }, 60000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [checkSession, handleSessionExpired, supabase.auth]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    };

    const handleFocus = () => {
      checkSession();
    };

    // Service Workerからのメッセージを受信
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SESSION_EXPIRED') {
        console.log('[AuthContext] Received session expired message from Service Worker');
        handleSessionExpired();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Service Workerのメッセージリスナー
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, [checkSession, handleSessionExpired]);

  return (
    <AuthContext.Provider value={{ user, loading, checkSession, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}