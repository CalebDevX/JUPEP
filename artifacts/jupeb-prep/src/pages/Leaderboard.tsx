import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { motion } from "framer-motion";
import {
  Trophy, Flame, Zap, RefreshCw, Medal, Crown,
  TrendingUp, Star, Users, GraduationCap, Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface LeaderboardEntry {
  rank: number;
  full_name: string;
  subjects: string[];
  target_grade: string;
  target_university: string | null;
  xp: number;
  streak: number;
  last_active: string | null;
}

function getProfile() {
  try { return JSON.parse(localStorage.getItem("jupeb_profile") || "null"); } catch { return null; }
}

const GRADE_COLORS: Record<string, string> = {
  aaa1: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  aab1: "text-blue-400 bg-blue-500/10 border-blue-500/25",
  bbb1: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  ccc1: "text-purple-400 bg-purple-500/10 border-purple-500/25",
};

const GRADE_LABELS: Record<string, string> = {
  aaa1: "AAA+1", aab1: "AAB+1", bbb1: "BBB+1", ccc1: "CCC+1",
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
      <Crown className="h-5 w-5 text-white" />
    </div>
  );
  if (rank === 2) return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg flex-shrink-0">
      <Medal className="h-5 w-5 text-white" />
    </div>
  );
  if (rank === 3) return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-lg flex-shrink-0">
      <Medal className="h-5 w-5 text-white" />
    </div>
  );
  return (
    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
      <span className="text-sm font-bold text-white/50">#{rank}</span>
    </div>
  );
}

function PodiumCard({ entry }: { entry: LeaderboardEntry }) {
  const configs: Record<number, { height: string; gradient: string; ring: string; trophy: string }> = {
    1: { height: "h-36", gradient: "from-amber-500/20 to-yellow-600/10", ring: "border-amber-500/40", trophy: "text-amber-400" },
    2: { height: "h-24", gradient: "from-slate-400/15 to-slate-500/10", ring: "border-slate-400/30", trophy: "text-slate-300" },
    3: { height: "h-20", gradient: "from-amber-700/15 to-orange-700/10", ring: "border-amber-700/30", trophy: "text-amber-600" },
  };
  const cfg = configs[entry.rank];
  if (!cfg) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: entry.rank * 0.1 }}
      className={cn(
        "flex flex-col items-center justify-end",
        entry.rank === 2 ? "order-first" : entry.rank === 3 ? "order-last" : ""
      )}
    >
      <div className="flex flex-col items-center mb-2 gap-1">
        <div className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold border-2 bg-white/5",
          entry.rank === 1 ? "border-amber-400/60 text-amber-200" :
          entry.rank === 2 ? "border-slate-400/60 text-slate-200" :
          "border-amber-700/60 text-orange-200"
        )}>
          {entry.full_name.charAt(0).toUpperCase()}
        </div>
        <p className="text-xs font-semibold text-white/80 text-center max-w-[80px] leading-tight truncate">{entry.full_name.split(" ")[0]}</p>
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-violet-400" />
          <span className="text-xs font-bold text-white/70">{(entry.xp ?? 0).toLocaleString()}</span>
        </div>
      </div>
      <div className={cn(
        "w-20 rounded-t-2xl border-t border-x flex items-center justify-center",
        cfg.height, cfg.ring, `bg-gradient-to-t ${cfg.gradient}`
      )}>
        <span className={cn("text-2xl font-black", cfg.trophy)}>#{entry.rank}</span>
      </div>
    </motion.div>
  );
}

function openWhatsApp(text: string) {
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, "_blank");
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const profile = getProfile();

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/leaderboard?limit=50`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
        setLastFetched(new Date());
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  const myEntry = profile ? entries.find(e =>
    e.full_name === profile.fullName
  ) : null;

  const shareMyRank = () => {
    if (!myEntry) return;
    const grade = GRADE_LABELS[myEntry.target_grade] || myEntry.target_grade;
    const streakLine = myEntry.streak > 0 ? `🔥 ${myEntry.streak}-day study streak\n` : "";
    const subjectLine = Array.isArray(myEntry.subjects) && myEntry.subjects.length
      ? `📚 Subjects: ${myEntry.subjects.join(", ")}\n`
      : "";
    const msg =
      `🏆 *JUPEB Prep Leaderboard*\n\n` +
      `I'm ranked *#${myEntry.rank}* with *${(myEntry.xp ?? 0).toLocaleString()} XP*!\n` +
      streakLine +
      subjectLine +
      `🎯 Target grade: *${grade}*\n\n` +
      `Think you can beat me? 😤 We're competing on JUPEB Prep — the ultimate JUPEB exam study app!\n\n` +
      `📲 Join us and level up your study game! 💪`;
    openWhatsApp(msg);
  };

  const shareTop3 = () => {
    const top3 = entries.filter(e => e.rank <= 3);
    if (!top3.length) return;
    const podium = top3.map(e =>
      `${e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : "🥉"} #${e.rank} ${e.full_name} — ${(e.xp ?? 0).toLocaleString()} XP`
    ).join("\n");
    const msg =
      `🏆 *JUPEB Prep — Top Students*\n\n` +
      `${podium}\n\n` +
      `These scholars are putting in the work! 💪\nJoin JUPEB Prep and compete for the top spot. Study smarter, score higher! 📚`;
    openWhatsApp(msg);
  };

  const top3 = entries.filter(e => e.rank <= 3);
  const rest = entries.filter(e => e.rank > 3);

  return (
    <Shell>
      <div className="p-5 md:p-8 max-w-3xl mx-auto w-full space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 flex-wrap"
        >
          <div>
            <p className="ed-label mb-1 flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              Live Rankings
            </p>
            <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
            <p className="text-sm text-white/40 mt-0.5">Top students by XP earned through quizzes & study</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {entries.length >= 3 && (
              <button
                onClick={shareTop3}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/15 text-green-400 hover:text-green-300 transition-all text-xs font-medium"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Share Top 3</span>
                <span className="sm:hidden">Share</span>
              </button>
            )}
            <button
              onClick={fetchLeaderboard}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-all text-xs font-medium disabled:opacity-40"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* My rank banner */}
        {myEntry && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 py-3 bg-violet-500/10 border border-violet-500/30 rounded-2xl flex items-center gap-3"
          >
            <Star className="h-4 w-4 text-violet-400 flex-shrink-0" />
            <p className="text-sm text-violet-200 flex-1">
              You are ranked <span className="font-bold">#{myEntry.rank}</span> with{" "}
              <span className="font-bold">{(myEntry.xp ?? 0).toLocaleString()} XP</span>
              {myEntry.streak > 0 && <span className="ml-1 text-orange-300">· {myEntry.streak}d streak 🔥</span>}
            </p>
            <button
              onClick={shareMyRank}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/25 hover:bg-[#25D366]/20 text-[#25D366] hover:text-green-300 transition-all text-xs font-bold flex-shrink-0 whitespace-nowrap"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share Rank
            </button>
          </motion.div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-white/3 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Users className="h-10 w-10 text-white/15 mx-auto" />
            <p className="text-white/40 text-sm">No rankings yet. Complete quizzes to earn XP and appear here!</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            {top3.length >= 3 && (
              <div className="flex items-end justify-center gap-2 pt-4">
                {[top3[1], top3[0], top3[2]].filter(Boolean).map(e => (
                  <PodiumCard key={e.rank} entry={e} />
                ))}
              </div>
            )}

            {/* List */}
            <div className="space-y-2">
              {entries.map((entry, i) => {
                const isMe = profile && entry.full_name === profile.fullName;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.5) }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all",
                      isMe
                        ? "bg-violet-500/10 border-violet-500/30"
                        : entry.rank <= 3
                        ? "bg-amber-500/5 border-amber-500/15"
                        : "bg-white/3 border-white/6 hover:bg-white/5"
                    )}
                  >
                    <RankBadge rank={entry.rank} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("text-sm font-semibold", isMe ? "text-violet-200" : "text-white/90")}>
                          {entry.full_name}
                          {isMe && <span className="ml-1 text-[10px] text-violet-400 font-normal">(you)</span>}
                        </span>
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-md border font-semibold",
                          GRADE_COLORS[entry.target_grade] || "text-white/30 bg-white/5 border-white/10"
                        )}>
                          {GRADE_LABELS[entry.target_grade] || entry.target_grade}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {Array.isArray(entry.subjects) && entry.subjects.slice(0, 3).map((s: string) => (
                          <span key={s} className="text-[10px] text-white/30">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {entry.streak > 0 && (
                        <div className="flex items-center gap-1">
                          <Flame className="h-3.5 w-3.5 text-orange-400" />
                          <span className="text-xs font-bold text-orange-300">{entry.streak}d</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5 text-violet-400" />
                        <span className="text-sm font-bold text-white/80">{(entry.xp ?? 0).toLocaleString()}</span>
                        <span className="text-[10px] text-white/30">XP</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {lastFetched && (
              <p className="text-center text-[11px] text-white/20">
                Updated {formatDistanceToNow(lastFetched, { addSuffix: true })}
              </p>
            )}
          </>
        )}
      </div>
    </Shell>
  );
}
