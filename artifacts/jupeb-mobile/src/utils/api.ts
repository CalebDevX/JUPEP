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
  hasPassword?: boolean;
  isActivated?: boolean;
}

export interface LoginResult {
  profile?: Profile;
  requiresPin?: boolean;
  requiresPassword?: boolean;
}

// ── New password-based login ──────────────────────────────────────────────────
export async function loginWithPassword(phone: string, password: string): Promise<Profile> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Login failed');
  if (data.requiresPin || data.requiresPassword) throw new Error('Unexpected auth state');
  return data.profile as Profile;
}

// ── New password-based registration ──────────────────────────────────────────
export async function registerWithPassword(
  fullName: string,
  phone: string,
  password: string,
  subjects: string[],
  accessCode?: string,
  email?: string,
): Promise<Profile> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName, phone, password, subjects,
      accessCode: accessCode || undefined,
      email: email || undefined,
      targetGrade: 'aaa1',
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Registration failed');
  return data.profile as Profile;
}

// ── Legacy PIN-based login (kept for backward compat) ─────────────────────────
export async function loginStep1(phone: string, deviceId?: string): Promise<LoginResult> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, deviceId }),
  });
  const data = await response.json();
  if (data.requiresPin) return { requiresPin: true };
  if (data.requiresPassword) return { requiresPassword: true };
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
  throw new Error('PIN or password required');
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
  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/verify-session?phone=${encodeURIComponent(phone)}`,
      { method: 'GET', headers: { 'x-session-token': token } }
    );
    if (!response.ok) return false;
    const { valid } = await response.json();
    return Boolean(valid);
  } catch {
    return true; // fail-open when offline
  }
}

// ── Activation via access code ─────────────────────────────────────────────────
export async function activateWithCode(phone: string, accessCode: string): Promise<Profile> {
  const response = await fetch(`${API_BASE_URL}/auth/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, accessCode }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Activation failed');
  return data.profile as Profile;
}

// ── Paystack payment ───────────────────────────────────────────────────────────
export async function initiatePayment(phone: string, email?: string): Promise<{ authorizationUrl: string; reference: string }> {
  const response = await fetch(`${API_BASE_URL}/payment/initialize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, email }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not start payment');
  return { authorizationUrl: data.authorizationUrl, reference: data.reference };
}

export async function verifyPayment(reference: string): Promise<{ success: boolean; expiresAt?: string }> {
  const response = await fetch(`${API_BASE_URL}/payment/verify/${encodeURIComponent(reference)}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Payment verification failed');
  return { success: true, expiresAt: data.expiresAt };
}

export async function getPaymentConfig(): Promise<{ price: number; currency: string; configured: boolean; sessionEnd: string }> {
  const response = await fetch(`${API_BASE_URL}/payment/config`);
  const data = await response.json();
  return data;
}

// ── Push notification token registration ──────────────────────────────────────
export async function registerPushToken(phone: string, sessionToken: string, pushToken: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/notifications/register-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, token: sessionToken, pushToken }),
    });
  } catch {
    // Non-critical — never crash the app over this
  }
}
