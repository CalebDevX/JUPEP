/**
 * Client for the JUPEB Prep API server.
 */

const API_BASE = process.env.API_URL ?? "http://localhost:3000";
const BOT_SECRET = process.env.BOT_SECRET ?? "jupeb-bot-secret";

async function req<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-bot-secret": BOT_SECRET,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json() as T;
  if (!res.ok) throw new Error((data as any).error ?? "API error");
  return data;
}

export interface StudentProfile {
  fullName: string;
  firstName: string;
  phone: string;
  email: string | null;
  subjects: string[];
  targetUniversity: string | null;
  targetGrade: string;
  accessCode: string | null;
}

export interface LoginResult {
  success: boolean;
  profile: StudentProfile;
}

export interface RegisterResult {
  success: boolean;
  profile: StudentProfile;
  freeTrial: boolean;
}

export interface CommunityInfo {
  id: number;
  name: string;
  slug: string;
  description: string;
  whatsappNumber: string | null;
  memberCount: number;
}

export async function loginStudent(phone: string): Promise<LoginResult> {
  return req<LoginResult>("/auth/login", "POST", { phone });
}

export async function registerStudent(data: {
  fullName: string;
  phone: string;
  email?: string;
  subjects: string[];
  targetUniversity?: string;
  targetGrade?: string;
}): Promise<RegisterResult> {
  return req<RegisterResult>("/auth/register", "POST", {
    ...data,
    accessCode: "",
  });
}

export async function listCommunities(): Promise<CommunityInfo[]> {
  return req<CommunityInfo[]>("/community");
}

export async function joinCommunity(phone: string, communityId: number): Promise<void> {
  await req("/community/bot-join", "POST", { phone, communityId });
}
