export interface JupebProfile {
  fullName: string;
  firstName: string;
  phone: string;
  email: string | null;
  subjects: string[];
  targetUniversity: string | null;
  targetGrade: string;
  accessCode: string | null;
}

export function getProfile(): JupebProfile | null {
  try { return JSON.parse(localStorage.getItem("jupeb_profile") || "null"); } catch { return null; }
}

export const TRIAL_QUESTION_LIMIT = 5;
const TRIAL_COUNT_KEY = "jupeb_trial_q";

export function isActivated(): boolean {
  const profile = getProfile();
  if (!profile) return false;
  const code = profile.accessCode;
  return !!(code && code !== "FREE_TRIAL" && code !== "");
}

export function getTrialQuestionsUsed(): number {
  return parseInt(localStorage.getItem(TRIAL_COUNT_KEY) || "0");
}

export function recordTrialQuestionsUsed(count: number) {
  const current = getTrialQuestionsUsed();
  localStorage.setItem(TRIAL_COUNT_KEY, String(current + count));
}

export function isTrialExpired(): boolean {
  if (isActivated()) return false;
  return getTrialQuestionsUsed() >= TRIAL_QUESTION_LIMIT;
}

export function getTrialRemaining(): number {
  return Math.max(0, TRIAL_QUESTION_LIMIT - getTrialQuestionsUsed());
}

export type AccessLevel = "full" | "trial" | "expired";

export function getAccessLevel(): AccessLevel {
  if (isActivated()) return "full";
  if (isTrialExpired()) return "expired";
  return "trial";
}
