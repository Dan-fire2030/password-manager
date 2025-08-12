'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading, user } = useAuth();
  const router = useRouter();
  
  useSessionMonitor({
    enabled: true,
    checkInterval: 30000,
    onSessionExpired: () => {
      console.log('Session expired in dashboard');
    }
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth?session_expired=true');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}