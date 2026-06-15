export interface GamificationState {
  xp: number;
  streak: number;
  lastActivityDate: string | null;
  lastLoginDate: string | null;
  dailyChallengeDate: string | null;
  dailyChallengeCompleted: boolean;
  totalQuizzes: number;
  totalCorrect: number;
}

export const XP_REWARDS = {
  perCorrectAnswer: 10,
  dailyLogin: 15,
  dailyChallenge: 30,
  streakBonus7: 75,
  streakBonus30: 200,
  quizPerfect: 50,
};

export const LEVELS = [
  { name: "Rookie", min: 0,    max: 199,  color: "text-slate-400",   bg: "bg-slate-500/20",   border: "border-slate-500/30",   emoji: "📚" },
  { name: "Scholar", min: 200,  max: 499,  color: "text-sky-400",     bg: "bg-sky-500/20",     border: "border-sky-500/30",     emoji: "🎓" },
  { name: "Ace",     min: 500,  max: 999,  color: "text-violet-400",  bg: "bg-violet-500/20",  border: "border-violet-500/30",  emoji: "⚡" },
  { name: "Legend",  min: 1000, max: 2499, color: "text-amber-400",   bg: "bg-amber-500/20",   border: "border-amber-500/30",   emoji: "🏆" },
  { name: "JUPEB Elite", min: 2500, max: Infinity, color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30", emoji: "👑" },
];

export function getLevel(xp: number) {
  return LEVELS.findLast(l => xp >= l.min) ?? LEVELS[0];
}

export function getXPToNextLevel(xp: number) {
  const current = getLevel(xp);
  const nextIdx = LEVELS.indexOf(current) + 1;
  if (nextIdx >= LEVELS.length) return { next: null, progress: 100, remaining: 0 };
  const next = LEVELS[nextIdx];
  const range = next.min - current.min;
  const progress = Math.min(100, Math.round(((xp - current.min) / range) * 100));
  const remaining = next.min - xp;
  return { next, progress, remaining };
}

const KEY = "jupeb_gamification";

export function loadGamification(): GamificationState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaultState(), ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultState();
}

function defaultState(): GamificationState {
  return {
    xp: 0, streak: 0,
    lastActivityDate: null, lastLoginDate: null,
    dailyChallengeDate: null, dailyChallengeCompleted: false,
    totalQuizzes: 0, totalCorrect: 0,
  };
}

function saveGamification(state: GamificationState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function recordDailyLogin(): { xpGained: number; streakUpdated: boolean; newStreak: number } {
  const state = loadGamification();
  const today = todayStr();
  let xpGained = 0;
  let streakUpdated = false;

  if (state.lastLoginDate !== today) {
    xpGained += XP_REWARDS.dailyLogin;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);

    if (state.lastActivityDate === yStr) {
      state.streak += 1;
      streakUpdated = true;
      if (state.streak === 7) xpGained += XP_REWARDS.streakBonus7;
      if (state.streak === 30) xpGained += XP_REWARDS.streakBonus30;
    } else if (state.lastActivityDate !== today) {
      if (state.streak > 0) streakUpdated = true;
      state.streak = 1;
    }

    state.lastLoginDate = today;
    state.lastActivityDate = today;
    state.xp += xpGained;
    saveGamification(state);
  }

  return { xpGained, streakUpdated, newStreak: state.streak };
}

export function recordQuizComplete(correct: number, total: number): { xpGained: number; isPerfect: boolean } {
  const state = loadGamification();
  const today = todayStr();
  let xpGained = correct * XP_REWARDS.perCorrectAnswer;
  const isPerfect = correct === total && total > 0;
  if (isPerfect) xpGained += XP_REWARDS.quizPerfect;

  state.xp += xpGained;
  state.totalQuizzes += 1;
  state.totalCorrect += correct;
  state.lastActivityDate = today;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);
  if (!state.lastLoginDate || (state.lastActivityDate !== today && state.lastLoginDate !== today)) {
    if (state.lastActivityDate === yStr) {
      state.streak += 1;
    } else if (!state.lastActivityDate || state.lastActivityDate < yStr) {
      state.streak = 1;
    }
  }

  saveGamification(state);
  return { xpGained, isPerfect };
}

export function recordDailyChallenge(): { xpGained: number; alreadyDone: boolean } {
  const state = loadGamification();
  const today = todayStr();
  if (state.dailyChallengeDate === today && state.dailyChallengeCompleted) {
    return { xpGained: 0, alreadyDone: true };
  }
  state.xp += XP_REWARDS.dailyChallenge;
  state.dailyChallengeDate = today;
  state.dailyChallengeCompleted = true;
  state.lastActivityDate = today;
  saveGamification(state);
  return { xpGained: XP_REWARDS.dailyChallenge, alreadyDone: false };
}

export function isDailyChallengeCompleted(): boolean {
  const state = loadGamification();
  return state.dailyChallengeDate === todayStr() && state.dailyChallengeCompleted;
}

export function getGamificationState(): GamificationState {
  return loadGamification();
}
