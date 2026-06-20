import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  loginWithPassword, registerWithPassword, loginStep1, loginWithPin,
  verifySession, activateWithCode, loginWithGoogleToken,
  type Profile, type LoginResult,
} from '@/src/utils/api';

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
  isActivated: boolean;
  /** Password-based login (new accounts) */
  loginWithPass: (phone: string, password: string) => Promise<void>;
  /** Google Sign-In via expo-auth-session access token */
  loginWithGoogle: (accessToken: string) => Promise<void>;
  /** Register with password (creates account + logs in) */
  register: (
    fullName: string,
    phone: string,
    password: string,
    subjects: string[],
    accessCode?: string,
    email?: string,
  ) => Promise<void>;
  /** Legacy: Step 1 — send phone. Returns true if PIN is required next. */
  loginPhone: (phone: string) => Promise<boolean>;
  /** Legacy: Step 2 — send PIN after loginPhone returned true. */
  loginPin: (phone: string, pin: string) => Promise<void>;
  /** Activate account with access code */
  activateCode: (code: string) => Promise<void>;
  /** Update profile in memory + SecureStore (e.g. after payment) */
  refreshProfile: (updated: Partial<Profile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile]     = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derive isActivated from the profile
  const isActivated = Boolean(
    profile &&
    (
      (profile.accessCode !== null && profile.accessCode !== undefined) ||
      (profile.paymentStatus === 'paid' && profile.sessionActive) ||
      profile.isActivated
    )
  );

  async function saveProfile(p: Profile) {
    await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(p));
    setProfile(p);
  }

  // On startup: load stored profile, then silently verify session with server
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(PROFILE_KEY);
        if (stored) {
          const p: Profile = JSON.parse(stored);
          setProfile(p);
          // Background verify — only logout if server explicitly says token invalid
          // (fail-open so offline users stay logged in)
          verifySession(p.phone, p.sessionToken).then((valid) => {
            if (!valid) {
              // Another device logged in — clear session
              SecureStore.deleteItemAsync(PROFILE_KEY).catch(() => {});
              setProfile(null);
            }
          }).catch(() => { /* offline — keep session */ });
        }
      } catch {
        // ignore parse errors
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const loginWithPass = useCallback(async (phone: string, password: string) => {
    const p = await loginWithPassword(phone, password);
    await saveProfile(p);
  }, []);

  const loginWithGoogle = useCallback(async (accessToken: string) => {
    const p = await loginWithGoogleToken(accessToken);
    await saveProfile(p);
  }, []);

  const register = useCallback(async (
    fullName: string,
    phone: string,
    password: string,
    subjects: string[],
    accessCode?: string,
    email?: string,
  ) => {
    const p = await registerWithPassword(fullName, phone, password, subjects, accessCode, email);
    await saveProfile(p);
  }, []);

  const loginPhone = useCallback(async (phone: string): Promise<boolean> => {
    const deviceId = await getOrCreateDeviceId();
    const result: LoginResult = await loginStep1(phone, deviceId);
    if (result.requiresPin) return true;
    if (result.requiresPassword) {
      // Server says password needed — inform caller
      throw Object.assign(new Error('PASSWORD_REQUIRED'), { requiresPassword: true });
    }
    if (result.profile) {
      await saveProfile(result.profile);
      return false;
    }
    throw new Error('Unexpected response from server');
  }, []);

  const loginPin = useCallback(async (phone: string, pin: string) => {
    const deviceId = await getOrCreateDeviceId();
    const p = await loginWithPin(phone, pin, deviceId);
    await saveProfile(p);
  }, []);

  const activateCode = useCallback(async (code: string) => {
    if (!profile) throw new Error('Not logged in');
    const updated = await activateWithCode(profile.phone, code);
    await saveProfile({ ...profile, ...updated, sessionToken: profile.sessionToken });
  }, [profile]);

  const refreshProfile = useCallback(async (updated: Partial<Profile>) => {
    if (!profile) return;
    const merged = { ...profile, ...updated };
    await saveProfile(merged);
  }, [profile]);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(PROFILE_KEY);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      profile, isLoading, isActivated,
      loginWithPass, loginWithGoogle, register,
      loginPhone, loginPin,
      activateCode, refreshProfile, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
