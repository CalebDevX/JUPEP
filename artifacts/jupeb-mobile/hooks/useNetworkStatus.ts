import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { getApiBase } from '@/lib/query-client';

export interface NetworkStatus {
  isOnline: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  recheck: () => Promise<void>;
}

const PING_TIMEOUT_MS = 4000;
const RECHECK_INTERVAL_MS = 30_000; // re-ping every 30s while app is active

async function pingServer(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
    const url = Platform.OS === 'web'
      ? `${window.location.origin}/api/auth/google/config`
      : `${getApiBase()}/auth/google/config`;
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timer);
    return res.status < 500;
  } catch {
    return false;
  }
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline]       = useState(true);
  const [isChecking, setIsChecking]   = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recheck = useCallback(async () => {
    setIsChecking(true);
    const online = await pingServer();
    setIsOnline(online);
    setLastChecked(new Date());
    setIsChecking(false);
  }, []);

  useEffect(() => {
    // Initial check
    recheck();

    // Poll every 30s
    intervalRef.current = setInterval(recheck, RECHECK_INTERVAL_MS);

    // Re-check when app comes to foreground
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') recheck();
    });

    // Web: listen to browser online/offline events
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const onOnline  = () => { setIsOnline(true);  setLastChecked(new Date()); };
      const onOffline = () => { setIsOnline(false); setLastChecked(new Date()); };
      window.addEventListener('online',  onOnline);
      window.addEventListener('offline', onOffline);
      return () => {
        clearInterval(intervalRef.current!);
        sub.remove();
        window.removeEventListener('online',  onOnline);
        window.removeEventListener('offline', onOffline);
      };
    }

    return () => {
      clearInterval(intervalRef.current!);
      sub.remove();
    };
  }, [recheck]);

  return { isOnline, isChecking, lastChecked, recheck };
}
