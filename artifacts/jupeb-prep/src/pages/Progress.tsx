import { useGetProgress } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, TrendingUp, Target, Zap, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e1e28] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
        <p className="text-white/50 mb-1">{label}</p>
        <p className="text-white font-bold">{payload[0].value.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

function getStudentProfile() {
  try { return JSON.parse(localStorage.getItem("jupeb_profile") || "null"); } catch { return null; }
}
function getProfilePic(): string | null {
  try { return localStorage.getItem("jupeb_profile_picture"); } catch { return null; }
}
const GRADE_LABEL: Record<string, string> = {
  aaa1: "AAA+1 — 16 pts", aab1: "AAB+1 — 15 pts",
  bbb1: "BBB+1 — 12 pts", ccc1: "CCC+1 — 9 pts",
};

export default function ProgressPage() {
  const { data: progress, isLoading } = useGetProgress();
  const profile = getStudentProfile();
  const pic = getProfilePic();
  const initials = profile?.fullName
    ? profile.fullName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "S";

  return (
    <Shell>
      <div className="p-3 md:p-6 max-w-5xl mx-auto w-full space-y-5 md:space-y-6">

        {/* Student profile card */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 flex items-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-white/10">
              {pic ? (
                <img src={pic} alt={profile.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold font-serif text-white truncate">{profile.fullName}</h2>
              {profile.targetGrade && (
                <p className="text-xs text-violet-300 mt-0.5">🎯 Target: {GRADE_LABEL[profile.targetGrade] || profile.targetGrade}</p>
              )}
              {profile.subjects?.length > 0 && (
                <p className="text-xs text-white/40 mt-0.5 truncate">
                  {(profile.subjects as string[]).join(" · ")}
                </p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-cyan-400 ml-auto" />
              <p className="text-[10px] text-white/30 mt-1">Progress</p>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl md:text-2xl font-bold font-serif text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
            </div>
            Your Progress
          </h1>
          <p className="text-white/40 text-sm mt-1 ml-[52px]">Track performance and identify where to improve.</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              {[1,2,3].map(i => <Skeleton key={i} className="h-28 bg-white/5 rounded-2xl" />)}
            </div>
            <Skeleton className="h-64 bg-white/5 rounded-2xl" />
          </div>
        ) : progress ? (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              {[
                {
                  icon: Target,
                  label: "Total Quizzes",
                  value: progress.totalQuizzes,
                  unit: "sessions",
                  color: "bg-violet-500/15 text-violet-400",
                  border: "border-violet-500/20",
                },
                {
                  icon: Trophy,
                  label: "Average Score",
                  value: `${(progress.averageScore ?? 0).toFixed(1)}%`,
                  unit: (progress.averageScore ?? 0) >= 70 ? "Great job!" : (progress.averageScore ?? 0) >= 50 ? "Keep pushing" : "Needs work",
                  color: (progress.averageScore ?? 0) >= 70 ? "bg-emerald-500/15 text-emerald-400" : (progress.averageScore ?? 0) >= 50 ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400",
                  border: (progress.averageScore ?? 0) >= 70 ? "border-emerald-500/20" : (progress.averageScore ?? 0) >= 50 ? "border-amber-500/20" : "border-red-500/20",
                },
                {
                  icon: Zap,
                  label: "Study Streak",
                  value: `${progress.streakDays || 0}`,
                  unit: "days",
                  color: "bg-orange-500/15 text-orange-400",
                  border: "border-orange-500/20",
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn("glass-card p-5 border", stat.border)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color)}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white font-serif">{stat.value}</p>
                  <p className="text-xs text-white/40 mt-1">{stat.label}</p>
                  <p className="text-xs text-white/25 mt-0.5">{stat.unit}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-4 md:p-5"
              >
                <h2 className="text-sm font-semibold text-white/70 mb-1">Performance by Subject</h2>
                <p className="text-xs text-white/30 mb-4">Average score across all papers</p>
                <div className="h-[200px] md:h-[240px]">
                  {(progress.subjectProgress ?? []).length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={progress.subjectProgress ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="subjectName"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                          tickFormatter={v => v.length > 6 ? v.slice(0, 6) + "…" : v}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                          domain={[0, 100]}
                          tickFormatter={v => `${v}%`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                        <Bar
                          dataKey="averageScore"
                          fill="url(#barGradient)"
                          radius={[6, 6, 0, 0]}
                          barSize={28}
                          name="Avg Score"
                        />
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                            <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.8} />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <BookOpen className="h-8 w-8 text-white/20 mb-2" />
                      <p className="text-sm text-white/30">Take some quizzes to see your stats!</p>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-4 md:p-5"
              >
                <h2 className="text-sm font-semibold text-white/70 mb-1">Performance by Paper</h2>
                <p className="text-xs text-white/30 mb-4">How you perform across different exam formats</p>
                <div className="h-[200px] md:h-[240px]">
                  {(progress.paperProgress ?? []).length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={progress.paperProgress ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="paperLabel"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                          tickFormatter={v => v.length > 8 ? v.slice(0, 8) + "…" : v}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                          domain={[0, 100]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="averageScore"
                          stroke="#06b6d4"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#areaGradient)"
                          name="Avg Score"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <TrendingUp className="h-8 w-8 text-white/20 mb-2" />
                      <p className="text-sm text-white/30">Complete quizzes to track paper progress!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Subject breakdown */}
            {(progress.subjectProgress ?? []).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-4 md:p-5"
              >
                <h2 className="text-sm font-semibold text-white/70 mb-4">Subject Breakdown</h2>
                <div className="space-y-3">
                  {(progress.subjectProgress ?? []).map((sub, i) => {
                    const scoreColor = sub.averageScore >= 70 ? "text-emerald-400" : sub.averageScore >= 50 ? "text-amber-400" : "text-red-400";
                    const barColor = sub.averageScore >= 70 ? "bg-emerald-500" : sub.averageScore >= 50 ? "bg-amber-500" : "bg-red-500";
                    return (
                      <div key={i} className="flex items-center gap-2 md:gap-4">
                        <div className="w-20 sm:w-28 md:w-36 text-xs text-white/60 truncate flex-shrink-0">{sub.subjectName}</div>
                        <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${sub.averageScore}%` }}
                            transition={{ delay: 0.6 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                            className={cn("h-full rounded-full", barColor)}
                          />
                        </div>
                        <div className={cn("w-12 md:w-14 text-right text-sm font-bold flex-shrink-0", scoreColor)}>
                          {sub.averageScore.toFixed(0)}%
                        </div>
                        <div className="hidden sm:block w-16 md:w-20 text-right text-xs text-white/30 flex-shrink-0">
                          {sub.quizzesTaken} quiz{sub.quizzesTaken !== 1 ? "zes" : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </>
        ) : null}
      </div>
    </Shell>
  );
}
