import { useGetDashboardSummary, useGetRecentActivity } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Shell } from "@/components/layout/Shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  BookOpen,
  Trophy,
  PenTool,
  GraduationCap,
  TrendingUp,
  MessageCircle,
  Sparkles,
  Target,
  Zap,
  Clock,
  ChevronRight,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const subjectColors: Record<string, { bg: string; text: string; dot: string }> = {
  "Literature-in-English": { bg: "bg-violet-500/10", text: "text-violet-400", dot: "bg-violet-500" },
  "Government": { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-500" },
  "CRS": { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-500" },
};

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400 }}
      className="glass-card p-5 flex flex-col gap-3"
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white font-serif">{value}</p>
        <p className="text-xs text-white/50 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: recentActivity, isLoading: isLoadingActivity } = useGetRecentActivity();

  const gradeColor = (score: number) => {
    if (score >= 70) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <Shell>
      <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
        {/* Hero greeting */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-white">
              Good {getTimeOfDay()}, Scholar 👋
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Keep pushing — 16 points and your dream course awaits.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20">
              <Target className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-amber-400">Goal: 16 Points</span>
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        {isLoadingSummary ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 bg-white/5 rounded-2xl" />)}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Trophy}
              label="Average Score"
              value={`${(summary.averageScore ?? 0).toFixed(1)}%`}
              color="bg-amber-500/15 text-amber-400"
            />
            <StatCard
              icon={PenTool}
              label="Quizzes Taken"
              value={summary.totalQuizzes}
              color="bg-violet-500/15 text-violet-400"
            />
            <StatCard
              icon={BookOpen}
              label="Question Bank"
              value={summary.totalQuestions}
              color="bg-blue-500/15 text-blue-400"
            />
            <StatCard
              icon={GraduationCap}
              label="Study Notes"
              value={summary.totalNotes}
              color="bg-emerald-500/15 text-emerald-400"
            />
          </div>
        ) : null}

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Subject breakdown + CTA */}
          <div className="lg:col-span-2 space-y-5">
            {/* Subject breakdown */}
            <div className="glass-card p-6">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Subject Breakdown
              </h2>
              {isLoadingSummary ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-12 bg-white/5 rounded-xl" />)}
                </div>
              ) : (summary?.subjectBreakdown ?? []).map((sub, i) => {
                const colors = subjectColors[sub.subjectName] || { bg: "bg-violet-500/10", text: "text-violet-400", dot: "bg-violet-500" };
                const pct = Math.min(100, (sub.questionCount / (summary.totalQuestions || 1)) * 100);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="mb-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", colors.dot)} />
                        <span className="text-sm text-white font-medium">{sub.subjectName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/50">
                        <span>{sub.questionCount} questions</span>
                        <span>{sub.noteCount} notes</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: i * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
                        className={cn("h-full rounded-full", colors.dot)}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Action cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-violet-600 to-indigo-700 border border-violet-500/30"
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -mr-10 -mt-10" />
                <Zap className="h-6 w-6 text-white/80 mb-3" />
                <h3 className="font-bold text-white text-lg font-serif leading-tight mb-1">Start a Quiz</h3>
                <p className="text-white/70 text-xs mb-4">Test yourself with real JUPEB past questions.</p>
                <Link href="/quiz">
                  <Button size="sm" className="bg-white text-violet-700 hover:bg-white/90 font-semibold text-xs h-8">
                    Launch Quiz <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-amber-500 to-orange-600 border border-amber-400/30"
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -mr-10 -mt-10" />
                <MessageCircle className="h-6 w-6 text-white/80 mb-3" />
                <h3 className="font-bold text-white text-lg font-serif leading-tight mb-1">Ask LexBot</h3>
                <p className="text-white/70 text-xs mb-4">Your AI tutor is ready — ask anything about JUPEB.</p>
                <Link href="/chat">
                  <Button size="sm" className="bg-white text-orange-700 hover:bg-white/90 font-semibold text-xs h-8">
                    Chat Now <Sparkles className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Paper breakdown */}
            {summary?.paperBreakdown && summary.paperBreakdown.length > 0 && (
              <div className="glass-card p-5">
                <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Papers Available</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {summary.paperBreakdown.map((p, i) => (
                    <div key={i} className="text-center p-3 rounded-xl bg-white/4 border border-white/6">
                      <p className="text-lg font-bold text-white font-serif">{p.questionCount}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">{p.paperLabel}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Recent activity + quick links */}
          <div className="space-y-5">
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Activity
              </h2>
              {isLoadingActivity ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-14 bg-white/5 rounded-xl" />)}
                </div>
              ) : !Array.isArray(recentActivity) || !recentActivity?.length ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-5 w-5 text-white/30" />
                  </div>
                  <p className="text-sm text-white/40">No activity yet</p>
                  <p className="text-xs text-white/25 mt-1">Take a quiz to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(Array.isArray(recentActivity) ? recentActivity : []).slice(0, 6).map((act, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5"
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                        act.type === "quiz_completed" ? "bg-violet-500/20" : "bg-emerald-500/20"
                      )}>
                        {act.type === "quiz_completed"
                          ? <PenTool className="h-3 w-3 text-violet-400" />
                          : <BookOpen className="h-3 w-3 text-emerald-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/80 leading-snug truncate">{act.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-white/30">
                            {format(new Date(act.createdAt), "MMM d, h:mm a")}
                          </span>
                          {act.score !== null && act.score !== undefined && (
                            <span className={cn("text-[10px] font-bold", gradeColor(act.score))}>
                              {act.score.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">Quick Access</h2>
              <div className="space-y-1">
                {[
                  { href: "/questions", label: "View all questions", icon: BookOpen },
                  { href: "/notes", label: "Browse study notes", icon: GraduationCap },
                  { href: "/progress", label: "Check your progress", icon: TrendingUp },
                ].map(link => (
                  <Link key={link.href} href={link.href}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white/90 transition-all cursor-pointer group">
                      <link.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{link.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
