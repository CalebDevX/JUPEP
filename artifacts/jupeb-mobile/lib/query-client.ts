import { QueryClient } from '@tanstack/react-query';
import { getApiUrl as _getApiUrl } from '../src/utils/api-url';

export function getApiUrl(): string {
  return _getApiUrl();
}

/** Returns the API base URL (alias used by notes/textbook screens) */
export function getApiBase(): string {
  return _getApiUrl();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});
