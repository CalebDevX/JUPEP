import { useMemo } from "react";
import { Shell } from "@/components/layout/Shell";
import { motion } from "framer-motion";
import { Trophy, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

function getProfile() {
  try { return JSON.parse(localStorage.getItem("jupeb_profile") || "{}"); } catch { return {}; }
}
function getQuizHistory() {
  try { return JSON.parse(localStorage.getItem("jupeb_quiz_history") || "[]"); } catch { return []; }
}
function getAppStats() {
  try { return JSON.parse(localStorage.getItem("jupeb_app_stats") || "{}"); } catch { return {}; }
}

type Badge = {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  color: string;
  earned: boolean;
  progress?: { value: number; max: number };
};

export default function Achievements() {
  const profile = getProfile();
  const quizHistory: any[] = getQuizHistory();
  const stats = getAppStats();

  const totalQuizzes = quizHistory.length;
  const perfectScores = quizHistory.filter((q: any) => q.score === 100 || (q.correct && q.total && q.correct === q.total)).length;
  const streak = profile.streak ?? 0;
  const xp = profile.xp ?? 0;

  const badges: Badge[] = useMemo(() => [
    {
      id: "first_quiz",
      emoji: "🎯",
      title: "First Step",
      desc: "Complete your first quiz",
      color: "from-violet-500/20 to-violet-600/10 border-violet-500/30",
      earned: totalQuizzes >= 1,
      progress: { value: Math.min(totalQuizzes, 1), max: 1 },
    },
    {
      id: "quiz_10",
      emoji: "🔥",
      title: "Quiz Warrior",
      desc: "Complete 10 quizzes",
      color: "from-orange-500/20 to-orange-600/10 border-orange-500/30",
      earned: totalQuizzes >= 10,
      progress: { value: Math.min(totalQuizzes, 10), max: 10 },
    },
    {
      id: "quiz_50",
      emoji: "⚡",
      title: "Quiz Champion",
      desc: "Complete 50 quizzes",
      color: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30",
      earned: totalQuizzes >= 50,
      progress: { value: Math.min(totalQuizzes, 50), max: 50 },
    },
    {
      id: "perfect_score",
      emoji: "💯",
      title: "Perfection",
      desc: "Score 100% on a quiz",
      color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
      earned: perfectScores >= 1,
      progress: { value: Math.min(perfectScores, 1), max: 1 },
    },
    {
      id: "perfect_3",
      emoji: "🌟",
      title: "Triple Perfect",
      desc: "Score 100% on 3 quizzes",
      color: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
      earned: perfectScores >= 3,
      progress: { value: Math.min(perfectScores, 3), max: 3 },
    },
    {
      id: "streak_3",
      emoji: "📅",
      title: "3-Day Streak",
      desc: "Study 3 days in a row",
      color: "from-sky-500/20 to-sky-600/10 border-sky-500/30",
      earned: streak >= 3,
      progress: { value: Math.min(streak, 3), max: 3 },
    },
    {
      id: "streak_7",
      emoji: "🗓️",
      title: "Week Warrior",
      desc: "Study 7 days in a row",
      color: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
      earned: streak >= 7,
      progress: { value: Math.min(streak, 7), max: 7 },
    },
    {
      id: "streak_30",
      emoji: "🏆",
      title: "Month Master",
      desc: "Study 30 days in a row",
      color: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30",
      earned: streak >= 30,
      progress: { value: Math.min(streak, 30), max: 30 },
    },
    {
      id: "xp_500",
      emoji: "✨",
      title: "Rising Star",
      desc: "Earn 500 XP",
      color: "from-pink-500/20 to-pink-600/10 border-pink-500/30",
      earned: xp >= 500,
      progress: { value: Math.min(xp, 500), max: 500 },
    },
    {
      id: "xp_2000",
      emoji: "👑",
      title: "JUPEB Elite",
      desc: "Earn 2000 XP",
      color: "from-rose-500/20 to-rose-600/10 border-rose-500/30",
      earned: xp >= 2000,
      progress: { value: Math.min(xp, 2000), max: 2000 },
    },
    {
      id: "multisubject",
      emoji: "📚",
      title: "All-Rounder",
      desc: "Study 3+ different subjects",
      color: "from-teal-500/20 to-teal-600/10 border-teal-500/30",
      earned: (profile.subjects?.length ?? 0) >= 3,
      progress: { value: Math.min(profile.subjects?.length ?? 0, 3), max: 3 },
    },
    {
      id: "community",
      emoji: "🤝",
      title: "Community Member",
      desc: "Join a study community",
      color: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30",
      earned: !!(stats.joinedCommunity || localStorage.getItem("jupeb_community_joined")),
    },
  ], [totalQuizzes, perfectScores, streak, xp]);

  const earned = badges.filter(b => b.earned);
  const locked = badges.filter(b => !b.earned);

  return (
    <Shell>
      <div className="p-4 sm:p-6 max-w-3xl mx-auto w-full space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-amber-400" />
            </div>
            Achievements
          </h1>
          <p className="text-white/40 text-sm mt-1">Earn badges as you study and improve.</p>
        </motion.div>

        {/* Stats bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Badges Earned", value: earned.length, color: "text-amber-400" },
            { label: "Total Quizzes", value: totalQuizzes, color: "text-violet-400" },
            { label: "Day Streak", value: streak, color: "text-orange-400" },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 text-center">
              <p className={cn("text-2xl font-black", s.color)}>{s.value}</p>
              <p className="text-[11px] text-white/35 mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Earned badges */}
        {earned.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-xs font-bold text-white/40 tracking-widest uppercase mb-3">
              Earned ({earned.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {earned.map((badge, i) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "bg-gradient-to-br border rounded-2xl p-4 text-center",
                    badge.color
                  )}
                >
                  <div className="text-3xl mb-2">{badge.emoji}</div>
                  <p className="text-sm font-bold text-white">{badge.title}</p>
                  <p className="text-[11px] text-white/50 mt-0.5">{badge.desc}</p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-white/60 font-semibold">
                    ✓ Earned
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Locked badges */}
        {locked.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 className="text-xs font-bold text-white/40 tracking-widest uppercase mb-3">
              Locked ({locked.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {locked.map(badge => (
                <div key={badge.id}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center relative overflow-hidden"
                >
                  <div className="text-3xl mb-2 grayscale opacity-30">{badge.emoji}</div>
                  <p className="text-sm font-bold text-white/30">{badge.title}</p>
                  <p className="text-[11px] text-white/20 mt-0.5">{badge.desc}</p>
                  {badge.progress && badge.progress.max > 1 && (
                    <div className="mt-2">
                      <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white/20 rounded-full transition-all"
                          style={{ width: `${(badge.progress.value / badge.progress.max) * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-white/20 mt-1">
                        {badge.progress.value}/{badge.progress.max}
                      </p>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Lock className="h-3 w-3 text-white/15" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {earned.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-center py-12 text-white/25"
          >
            <div className="text-5xl mb-3">🏅</div>
            <p className="text-sm font-medium">No badges yet — start a quiz to earn your first one!</p>
          </motion.div>
        )}
      </div>
    </Shell>
  );
}
