/**
 * useAuthHeaders Hook
 *
 * Centralized hook to get authentication headers for API requests.
 * Reduces duplicate code and improves performance by caching session data.
 *
 * Usage:
 * ```tsx
 * const headers = useAuthHeaders();
 * const response = await fetch('/api/reviews', { headers });
 * ```
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/db/supabase';

// ✅ Use Record type for TypeScript compatibility with HeadersInit
export type AuthHeaders = Record<string, string>;

let cachedHeaders: AuthHeaders | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get authentication headers for API requests
 * Caches headers for 5 minutes to reduce getSession() calls
 */
export function useAuthHeaders(): AuthHeaders {
  const [headers, setHeaders] = useState<AuthHeaders>(() => {
    // Return cached headers if available and fresh
    if (cachedHeaders && Date.now() - cacheTimestamp < CACHE_TTL) {
      return cachedHeaders;
    }

    return { 'Content-Type': 'application/json' };
  });

  useEffect(() => {
    let mounted = true;
    let refreshTimer: NodeJS.Timeout;

    const fetchHeaders = async () => {
      try {
        // Check cache first
        if (cachedHeaders && Date.now() - cacheTimestamp < CACHE_TTL) {
          if (mounted) setHeaders(cachedHeaders);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ useAuthHeaders: Error getting session:', error);
          return;
        }

        const authHeaders: AuthHeaders = {
          'Content-Type': 'application/json',
        };

        if (session?.user) {
          authHeaders['x-user-id'] = session.user.id;
          authHeaders['x-user-email'] = session.user.email || '';

          // Get role from user_metadata or default to 'user'
          const userRole = session.user.user_metadata?.role ||
                          session.user.app_metadata?.role ||
                          'user';
          authHeaders['x-user-role'] = userRole;
        }

        // Update cache
        cachedHeaders = authHeaders;
        cacheTimestamp = Date.now();

        if (mounted) {
          setHeaders(authHeaders);
        }
      } catch (error) {
        console.error('❌ useAuthHeaders: Unexpected error:', error);
      }
    };

    // Initial fetch
    fetchHeaders();

    // Refresh headers periodically
    refreshTimer = setInterval(fetchHeaders, CACHE_TTL);

    // Refresh when auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      // Invalidate cache
      cachedHeaders = null;
      cacheTimestamp = 0;
      fetchHeaders();
    });

    return () => {
      mounted = false;
      clearInterval(refreshTimer);
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return headers;
}

/**
 * Get authentication headers synchronously (from cache)
 * Only use this if you're sure headers are already loaded
 */
export function getAuthHeadersSync(): AuthHeaders {
  if (cachedHeaders && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedHeaders;
  }

  return { 'Content-Type': 'application/json' };
}

/**
 * Clear auth headers cache
 * Useful when user logs out or changes
 */
export function clearAuthHeadersCache(): void {
  cachedHeaders = null;
  cacheTimestamp = 0;
}
