import { QueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';

function resolveApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  // Web (browser): proxy /api on the same origin
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      return window.location.origin + '/api';
    }
    return '/api';
  }
  // Android emulator
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api';
  return 'http://localhost:3000/api';
}

export function getApiUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin + '/api';
  }
  return resolveApiUrl();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});
