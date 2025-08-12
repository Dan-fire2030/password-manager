'use client';

import { createBrowserClient } from '@supabase/ssr';
import { clearSession } from '@/lib/auth-utils';

export function createClientWithInterceptor() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const originalFrom = supabase.from.bind(supabase);
  
  supabase.from = new Proxy(originalFrom, {
    apply(target, thisArg, argumentsList) {
      const result = target(...argumentsList);
      
      const methods = ['select', 'insert', 'update', 'delete', 'upsert'];
      
      methods.forEach(method => {
        const original = result[method];
        if (original) {
          result[method] = new Proxy(original.bind(result), {
            apply(target, thisArg, args) {
              const query = target(...args);
              
              const originalThen = query.then;
              query.then = function(onFulfilled?: any, onRejected?: any) {
                return originalThen.call(
                  this,
                  (response: any) => {
                    if (response?.error) {
                      if (response.error.message?.includes('JWT') || 
                          response.error.message?.includes('token') ||
                          response.error.message?.includes('unauthorized') ||
                          response.error.code === 'PGRST301' ||
                          response.error.code === '401') {
                        console.log('Authentication error detected, redirecting to login...');
                        clearSession();
                        
                        if (typeof window !== 'undefined' && 
                            !window.location.pathname.startsWith('/auth') && 
                            !window.location.pathname.startsWith('/logout')) {
                          window.location.href = '/auth?session_expired=true';
                        }
                      }
                    }
                    return onFulfilled ? onFulfilled(response) : response;
                  },
                  onRejected
                );
              };
              
              return query;
            }
          });
        }
      });
      
      return result;
    }
  });

  const originalAuth = supabase.auth;
  const authMethods = ['getSession', 'getUser', 'refreshSession'];
  
  authMethods.forEach(method => {
    const original = originalAuth[method];
    if (original) {
      originalAuth[method] = async function(...args: any[]) {
        try {
          const result = await original.apply(this, args);
          
          if (result?.error) {
            if (result.error.message?.includes('refresh_token') ||
                result.error.message?.includes('session') ||
                result.error.status === 401) {
              console.log('Session refresh failed, redirecting to login...');
              clearSession();
              
              if (typeof window !== 'undefined' && 
                  !window.location.pathname.startsWith('/auth') && 
                  !window.location.pathname.startsWith('/logout')) {
                window.location.href = '/auth?session_expired=true';
              }
            }
          }
          
          return result;
        } catch (error) {
          console.error(`Error in ${method}:`, error);
          throw error;
        }
      };
    }
  });

  return supabase;
}