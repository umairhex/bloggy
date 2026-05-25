import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';
import { ApiError } from './api-error';

export const getQueryClient = cache(
  () =>
    new QueryClient({
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
