import { Platform } from 'react-native';

function resolveBase(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
}

export const API_BASE_URL = resolveBase();

export interface Profile {
  fullName: string;
  firstName: string;
  phone: string;
  email: string | null;
  subjects: any;
  targetUniversity: string | null;
  targetGrade: string;
  accessCode: string | null;
  sessionToken: string;
  sessionActive?: boolean;
  paymentStatus?: string;
  expiresAt?: string | null;
  hasPin?: boolean;
}

export interface LoginResult {
  profile?: Profile;
  requiresPin?: boolean;
}

export async function loginStep1(phone: string, deviceId?: string): Promise<LoginResult> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, deviceId }),
  });
  const data = await response.json();
  if (data.requiresPin) return { requiresPin: true };
  if (!response.ok) throw new Error(data.error || 'Login failed');
  return { profile: data.profile as Profile };
}

export async function loginWithPin(phone: string, pin: string, deviceId?: string): Promise<Profile> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, pin, deviceId }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed');
  }
  const data = await response.json();
  return data.profile as Profile;
}

export async function login(phone: string, deviceId?: string): Promise<Profile> {
  const result = await loginStep1(phone, deviceId);
  if (result.profile) return result.profile;
  throw new Error('PIN required');
}

export async function setPin(phone: string, token: string, pin: string, currentPin?: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/set-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, token, pin, currentPin }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to set PIN');
  }
}

export async function removePin(phone: string, token: string, currentPin: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/remove-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, token, currentPin }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to remove PIN');
  }
}

export async function verifySession(phone: string, token: string): Promise<boolean> {
  const response = await fetch(
    `${API_BASE_URL}/auth/verify-session?phone=${encodeURIComponent(phone)}`,
    { method: 'GET', headers: { 'x-session-token': token } }
  );
  if (!response.ok) return false;
  const { valid } = await response.json();
  return Boolean(valid);
}
