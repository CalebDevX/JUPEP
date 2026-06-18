import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginStep1, loginWithPin, Profile, LoginResult } from '@/src/utils/api';

const PROFILE_KEY = 'jupeb_profile_v1';
const DEVICE_KEY  = 'jupeb_device_id_v1';

function generateDeviceId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
}

async function getOrCreateDeviceId(): Promise<string> {
  let id = await SecureStore.getItemAsync(DEVICE_KEY);
  if (!id) {
    id = generateDeviceId();
    await SecureStore.setItemAsync(DEVICE_KEY, id);
  }
  return id;
}

interface AuthContextType {
  profile: Profile | null;
  isLoading: boolean;
  /** Step 1 — send phone. Returns true if PIN is required next. */
  loginPhone: (phone: string) => Promise<boolean>;
  /** Step 2 — send PIN after loginPhone returned true. */
  loginPin: (phone: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(PROFILE_KEY);
        if (stored) setProfile(JSON.parse(stored));
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const loginPhone = useCallback(async (phone: string): Promise<boolean> => {
    const deviceId = await getOrCreateDeviceId();
    const result: LoginResult = await loginStep1(phone, deviceId);
    if (result.requiresPin) return true;
    if (result.profile) {
      await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(result.profile));
      setProfile(result.profile);
      return false;
    }
    throw new Error('Unexpected response from server');
  }, []);

  const loginPin = useCallback(async (phone: string, pin: string): Promise<void> => {
    const deviceId = await getOrCreateDeviceId();
    const p = await loginWithPin(phone, pin, deviceId);
    await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(p));
    setProfile(p);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(PROFILE_KEY);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{ profile, isLoading, loginPhone, loginPin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
