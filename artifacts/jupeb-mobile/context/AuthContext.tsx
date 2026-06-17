import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, Profile } from '@/src/utils/api';

const PROFILE_KEY = 'jupeb_profile_v1';
const DEVICE_KEY = 'jupeb_device_id_v1';

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
  login: (phone: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(PROFILE_KEY);
        if (stored) {
          setProfile(JSON.parse(stored));
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (phone: string) => {
    const deviceId = await getOrCreateDeviceId();
    const data = await apiLogin(phone, deviceId);
    await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(data));
    setProfile(data);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(PROFILE_KEY);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{ profile, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
