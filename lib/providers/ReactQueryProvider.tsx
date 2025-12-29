'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

/**
 * React Query Provider with optimized defaults
 *
 * Features:
 * - Smart caching with 5min stale time
 * - 10min garbage collection
 * - Auto retry on failure (3 attempts)
 * - Background refetching on window focus
 * - Dev tools in development only
 */
export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache data for 5 minutes before considering it stale
            staleTime: 5 * 60 * 1000, // 5 minutes

            // Keep unused data in cache for 10 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime in v5)

            // Retry failed requests 3 times with exponential backoff
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Refetch on window focus (good for keeping data fresh)
            refetchOnWindowFocus: true,

            // Refetch on mount if data is stale
            refetchOnMount: true,

            // Don't refetch on reconnect (avoid spam)
            refetchOnReconnect: false,
          },
          mutations: {
            // Retry mutations once
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show dev tools in development only */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
