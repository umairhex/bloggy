'use client';

import { ReactNode, useState, useEffect } from 'react';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api-error';

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.state.data !== undefined) {
              toast.error(
                error instanceof Error ? error.message : 'Could not refresh data in the background.'
              );
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 0,
            gcTime: 5 * 60 * 1000,
            retry: (failureCount, error) => {
              if (error instanceof ApiError && error.status === 401) {
                return false;
              }

              return failureCount < 3;
            },
          },
        },
      })
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const CONFIG_KEY = 'bloggy_db_config';
      try {
        const stored = localStorage.getItem(CONFIG_KEY);
        if (stored && !document.cookie.includes(CONFIG_KEY)) {
          const expires = new Date(Date.now() + 365 * 864e5).toUTCString();
          document.cookie = `${CONFIG_KEY}=${encodeURIComponent(stored)}; expires=${expires}; path=/; SameSite=Lax; Secure`;
        }
      } catch (e) {
        console.error('Failed to migrate database configuration to cookies:', e);
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
