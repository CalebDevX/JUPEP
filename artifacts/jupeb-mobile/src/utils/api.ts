export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

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
}

export async function login(phone: string): Promise<Profile> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Login failed');
  }
  const data = await response.json();
  return data.profile as Profile;
}

export async function verifySession(phone: string, token: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/auth/verify-session?phone=${encodeURIComponent(phone)}`, {
    method: 'GET',
    headers: { 'x-session-token': token },
  });
  if (!response.ok) return false;
  const { valid } = await response.json();
  return Boolean(valid);
}
