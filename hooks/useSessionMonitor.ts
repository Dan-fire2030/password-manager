'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isSessionValid, getSession, clearSession } from '@/lib/auth-utils';

interface UseSessionMonitorOptions {
  checkInterval?: number;
  enabled?: boolean;
  onSessionExpired?: () => void;
}

export function useSessionMonitor({
  checkInterval = 30000,
  enabled = true,
  onSessionExpired
}: UseSessionMonitorOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const handleSessionExpired = useCallback(() => {
    console.log('Session expired - redirecting to login');
    clearSession();
    
    if (onSessionExpired) {
      onSessionExpired();
    }

    if (!pathname?.startsWith('/auth') && !pathname?.startsWith('/logout')) {
      router.push('/auth?session_expired=true');
    }
  }, [pathname, router, onSessionExpired]);

  const checkSessionStatus = useCallback(() => {
    const session = getSession();
    
    if (!session) {
      handleSessionExpired();
      return false;
    }

    if (!isSessionValid()) {
      handleSessionExpired();
      return false;
    }

    const sessionData = JSON.parse(session);
    const sessionTimestamp = sessionData.timestamp;
    const now = Date.now();
    const timeSinceSession = now - sessionTimestamp;
    const timeUntilExpiry = 3600000 - timeSinceSession;

    if (timeUntilExpiry <= 0) {
      handleSessionExpired();
      return false;
    }

    if (timeUntilExpiry <= 300000) {
      console.log(`Session expiring in ${Math.floor(timeUntilExpiry / 60000)} minutes`);
    }

    return true;
  }, [handleSessionExpired]);

  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleActivity = () => {
      updateActivity();
      checkSessionStatus();
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      checkSessionStatus();
    }, checkInterval);

    checkSessionStatus();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, checkInterval, checkSessionStatus, updateActivity]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_session' && !e.newValue) {
        handleSessionExpired();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleSessionExpired]);

  return {
    checkSessionStatus,
    updateActivity
  };
}