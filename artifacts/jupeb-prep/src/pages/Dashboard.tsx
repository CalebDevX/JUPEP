import { useState, useEffect } from "react";
import { useGetDashboardSummary, useGetRecentActivity } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Shell } from "@/components/layout/Shell";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Trophy, PenTool, GraduationCap, TrendingUp, MessageCircle,
  Sparkles, Target, Zap, Clock, ChevronRight, Megaphone,
  Pin, ChevronLeft, X, CheckCircle2, Circle, Flame, Calendar, Layers,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  getGamificationState, getLevel, getXPToNextLevel,
  recordDailyLogin, isDailyChallengeCompleted, recordDailyChallenge,
} from "@/lib/gamification";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Announcement {
  id: number; title: string; content: string; type: string;
  emoji: string; authorName: string; isPinned: boolean; createdAt: string;
}

const ANN_STYLES: Record<string, { border: string; bg: string; badge: string }> = {
  info:    { border: "border-l-sky-400",     bg: "bg-sky-500/8",     badge: "bg-sky-500/15 text-sky-300 border-sky-500/20"     },
  warning: { border: "border-l-amber-400",   bg: "bg-amber-500/8",   badge: "bg-amber-500/15 text-amber-300 border-amber-500/20"},
  success: { border: "border-l-emerald-400", bg: "bg-emerald-500/8", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"},
  event:   { border: "border-l-violet-400",  bg: "bg-violet-500/8",  badge: "bg-violet-500/15 text-violet-300 border-violet-500/20"},
};

function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/announcements`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data) && data.length > 0) setAnnouncements(data); })
      .catch(() => {});
  }, []);

  if (!announcements.length || dismissed) return null;

  const ann = announcements[current];
  const s = ANN_STYLES[ann.type] || ANN_STYLES.info;

  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
      <div className={cn("relative rounded-2xl border border-l-4 p-4 flex items-start gap-3", s.bg, s.border, "border-white/8")}>
        <div className="text-xl flex-shrink-0 mt-0.5">{ann.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-sm font-semibold text-white">{ann.title}</span>
            {ann.isPinned && (
              <span className="flex items-center gap-1 text-[10px] bg-white/8 text-white/40 border border-white/10 px-1.5 py-0.5 rounded-md">
                <Pin className="h-2.5 w-2.5" /> Pinned
              </span>
            )}
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md border capitalize", s.badge)}>{ann.type}</span>
          </div>
          <p className="text-xs text-white/55 leading-relaxed">{ann.content}</p>
          <p className="text-[10px] text-white/25 mt-1">— {ann.authorName} · {format(new Date(ann.createdAt), "MMM d")}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {announcements.length > 1 && (
            <>
              <button onClick={() => setCurrent(p => Math.max(0, p - 1))} disabled={current === 0}
                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-25 transition-colors">
                <ChevronLeft className="h-3 w-3" />
              </button>
              <span className="text-[10px] text-white/30 tabular-nums">{current + 1}/{announcements.length}</span>
              <button onClick={() => setCurrent(p => Math.min(announcements.length - 1, p + 1))} disabled={current === announcements.length - 1}
                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-25 transition-colors">
                <ChevronRight className="h-3 w-3" />
              </button>
            </>
          )}
          <button onClick={() => setDismissed(true)}
            className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white/70 transition-colors ml-1">
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const PAPERS = [
  { code: "001", label: "1st Incourse",       short: "Incourse 1", color: "text-violet-400", bg: "bg-violet-500/10", dot: "bg-violet-500" },
  { code: "002", label: "1st Semester Exam",  short: "Semester 1", color: "text-blue-400",   bg: "bg-blue-500/10",   dot: "bg-blue-500"   },
  { code: "003", label: "2nd Incourse",        short: "Incourse 2", color: "text-teal-400",   bg: "bg-teal-500/10",   dot: "bg-teal-500"   },
  { code: "004", label: "Mock Exam",           short: "Mock",       color: "text-amber-400",  bg: "bg-amber-500/10",  dot: "bg-amber-500"  },
];

const SUBJECTS = [
  { name: "Literature-in-English", color: "text-violet-400", bg: "bg-violet-500/10", dot: "bg-violet-500" },
  { name: "Government",            color: "text-blue-400",   bg: "bg-blue-500/10",   dot: "bg-blue-500"   },
  { name: "CRS",                   color: "text-emerald-400",bg: "bg-emerald-500/10",dot: "bg-emerald-500" },
];

function gradeColor(score: number) {
  if (score >= 70) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-rose-400";
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: recentActivity, isLoading: loadingActivity } = useGetRecentActivity();

  const [gState, setGState] = useState(() => getGamificationState());
  const [dailyQ, setDailyQ] = useState<any>(null);
  const [dailyAnswer, setDailyAnswer] = useState<string | null>(null);
  const [dailyRevealed, setDailyRevealed] = useState(false);
  const [dailyDone, setDailyDone] = useState(() => isDailyChallengeCompleted());
  const [dailyXP, setDailyXP] = useState(0);

  const examDate = typeof window !== "undefined" ? localStorage.getItem("jupeb_exam_date") : null;
  const daysToExam = examDate
    ? Math.max(0, Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000))
    : null;

  useEffect(() => {
    recordDailyLogin();
    setGState(getGamificationState());
    fetch(`${BASE}/api/daily-challenge`)
      .then(r => r.ok ? r.json() : null)
      .then(q => { if (q?.id) setDailyQ(q); })
      .catch(() => {});
  }, []);

  const handleDailyAnswer = (opt: string) => {
    if (dailyRevealed) return;
    setDailyAnswer(opt);
    setDailyRevealed(true);
    if (!dailyDone && dailyQ?.correctOption === opt) {
      const { xpGained } = recordDailyChallenge();
      setDailyXP(xpGained);
      setDailyDone(true);
      setGState(getGamificationState());
    } else if (!dailyDone) {
      recordDailyChallenge();
      setDailyDone(true);
      setGState(getGamificationState());
    }
  };

  const level = getLevel(gState.xp);
  const xpNext = getXPToNextLevel(gState.xp);
  const displayName = localStorage.getItem("jupeb_display_name") || localStorage.getItem("user_display_name") || "Scholar";
  const firstName = displayName.split(" ")[0];

  const stats = [
    { icon: Trophy,       label: "Avg Score",     value: `${(summary?.averageScore ?? 0).toFixed(0)}%`,  color: "bg-amber-500/12 text-amber-400"   },
    { icon: PenTool,      label: "Quizzes Done",  value: summary?.totalQuizzes ?? 0,                     color: "bg-violet-500/12 text-violet-400" },
    { icon: BookOpen,     label: "Questions",     value: summary?.totalQuestions ?? 0,                   color: "bg-blue-500/12 text-blue-400"     },
    { icon: GraduationCap,label: "Study Notes",   value: summary?.totalNotes ?? 0,                       color: "bg-emerald-500/12 text-emerald-400"},
  ];

  return (
    <Shell>
      <div className="p-5 md:p-8 max-w-5xl mx-auto w-full space-y-6">

        {/* ── Editorial Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pb-6 border-b border-white/[0.07]"
        >
          <p className="ed-label mb-3 flex items-center gap-2">
            <span>{format(new Date(), "EEEE, MMMM d")}</span>
            <span className="opacity-40">·</span>
            <span>JUPEB Law Prep</span>
          </p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="ed-display text-[2.6rem] md:text-[3.5rem] text-white">
                Good {getTimeOfDay()},
                <br />
                <span className="italic text-amber-200/85">{firstName}.</span>
              </h1>
              <p className="text-white/35 text-sm font-light mt-3 leading-relaxed max-w-md">
                Every question you practise brings you closer to{" "}
                <span className="text-amber-400/75 font-normal">16 points</span> and UNILAG Law.
              </p>
            </div>
            <div className="hidden md:flex flex-col items-end gap-0.5 flex-shrink-0 pb-1">
              <span className="ed-label">Target</span>
              <span className="ed-stat text-3xl text-amber-400/60 mt-1.5">AAA+1</span>
              <span className="text-[10px] text-amber-400/35 mt-0.5 tracking-wide">16 Points</span>
            </div>
          </div>
        </motion.div>

        {/* ── XP / Streak bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {/* Streak */}
          <div className={cn(
            "flex items-center gap-2.5 px-4 py-3 rounded-2xl border",
            gState.streak >= 3 ? "bg-orange-500/10 border-orange-500/25" : "bg-white/4 border-white/8"
          )}>
            <Flame className={cn("h-5 w-5 flex-shrink-0", gState.streak >= 3 ? "text-orange-400" : "text-white/30")} />
            <div>
              <p className={cn("text-lg font-black leading-none", gState.streak >= 1 ? "text-orange-300" : "text-white/40")}>{gState.streak}</p>
              <p className="text-[10px] text-white/40">Day Streak</p>
            </div>
          </div>

          {/* XP + Level */}
          <div className={cn("flex items-center gap-2.5 px-4 py-3 rounded-2xl border col-span-1", level.bg, level.border)}>
            <span className="text-xl flex-shrink-0">{level.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={cn("text-xs font-bold leading-none", level.color)}>{level.name}</p>
                <p className="text-[10px] text-white/40">{gState.xp} XP</p>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-1.5">
                <motion.div
                  className={cn("h-full rounded-full", level.bg.replace("/20", ""))}
                  style={{ width: `${xpNext.progress}%`, backgroundColor: undefined }}
                  initial={{ width: 0 }}
                  animate={{ width: `${xpNext.progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Exam countdown */}
          {daysToExam !== null ? (
            <div className={cn(
              "flex items-center gap-2.5 px-4 py-3 rounded-2xl border",
              daysToExam <= 7 ? "bg-rose-500/10 border-rose-500/25" :
              daysToExam <= 30 ? "bg-amber-500/10 border-amber-500/25" :
              "bg-white/4 border-white/8"
            )}>
              <Calendar className={cn("h-5 w-5 flex-shrink-0",
                daysToExam <= 7 ? "text-rose-400" : daysToExam <= 30 ? "text-amber-400" : "text-white/40"
              )} />
              <div>
                <p className={cn("text-lg font-black leading-none",
                  daysToExam <= 7 ? "text-rose-300" : daysToExam <= 30 ? "text-amber-300" : "text-white/70"
                )}>{daysToExam}</p>
                <p className="text-[10px] text-white/40">Days to Exam</p>
              </div>
            </div>
          ) : (
            <Link href="/settings">
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border bg-white/4 border-white/8 cursor-pointer hover:bg-white/6 transition-colors">
                <Calendar className="h-5 w-5 text-white/30 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white/50">Set exam date</p>
                  <p className="text-[10px] text-white/25">Track countdown</p>
                </div>
              </div>
            </Link>
          )}

          {/* Flashcards shortcut */}
          <Link href="/flashcards">
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border bg-fuchsia-500/10 border-fuchsia-500/20 cursor-pointer hover:bg-fuchsia-500/15 transition-colors">
              <Layers className="h-5 w-5 text-fuchsia-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-fuchsia-300">Flashcards</p>
                <p className="text-[10px] text-white/30">Flip to recall</p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* ── Announcements ── */}
        <AnimatePresence>
          <AnnouncementBanner />
        </AnimatePresence>

        {/* ── Stats row ── */}
        {loadingSummary ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-[84px] bg-white/5 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-4 flex items-center gap-3"
              >
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", s.color)}>
                  <s.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="ed-stat text-[1.6rem] text-white">{s.value}</p>
                  <p className="ed-label mt-0.5 truncate">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Paper tracker ── */}
        <div className="glass-card p-4">
          <p className="ed-label mb-3">Exam Papers</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {PAPERS.map((paper, i) => {
              const paperData = summary?.paperBreakdown?.find(p => p.paper === paper.code);
              const count = paperData?.questionCount ?? 0;
              const hasQuestions = count > 0;
              return (
                <motion.div
                  key={paper.code}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "relative rounded-xl p-3 border transition-colors",
                    hasQuestions
                      ? "bg-white/[0.04] border-white/8 hover:border-white/14"
                      : "bg-white/[0.02] border-white/5"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md", paper.bg, paper.color)}>
                      {paper.code}
                    </span>
                    {hasQuestions
                      ? <CheckCircle2 className={cn("h-3.5 w-3.5", paper.color)} />
                      : <Circle className="h-3.5 w-3.5 text-white/15" />
                    }
                  </div>
                  <p className="text-[11px] text-white/60 leading-snug mb-1">{paper.short}</p>
                  <p className={cn("text-base font-bold", hasQuestions ? "text-white" : "text-white/25")}>
                    {hasQuestions ? count : "—"}
                  </p>
                  {hasQuestions && <p className="text-[9px] text-white/30">questions</p>}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Daily Challenge ── */}
        {dailyQ && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "glass-card overflow-hidden border",
              dailyDone ? "border-emerald-500/20" : "border-amber-500/20"
            )}
          >
            <div className={cn(
              "px-5 py-3 border-b flex items-center justify-between",
              dailyDone ? "border-emerald-500/15 bg-emerald-500/5" : "border-amber-500/15 bg-amber-500/5"
            )}>
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{dailyDone ? "✅" : "⚡"}</span>
                <div>
                  <p className="text-sm font-bold text-white">Daily Challenge</p>
                  <p className="text-[11px] text-white/40">
                    {dailyDone ? "Completed today! Come back tomorrow." : `Answer correctly for +30 XP · ${dailyQ.subjectName}`}
                  </p>
                </div>
              </div>
              {!dailyDone && (
                <span className="text-[10px] px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-300 font-bold">+30 XP</span>
              )}
              {dailyDone && dailyXP > 0 && (
                <span className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 font-bold">+{dailyXP} XP earned!</span>
              )}
            </div>
            <div className="p-5">
              <p className="text-sm text-white/85 font-medium leading-relaxed mb-4">{dailyQ.questionText}</p>
              {dailyQ.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {dailyQ.options.map((opt: string, idx: number) => {
                    const label = ["A","B","C","D"][idx];
                    const isCorrect = dailyQ.correctOption === label;
                    const isChosen = dailyAnswer === label;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleDailyAnswer(label)}
                        disabled={dailyRevealed}
                        className={cn(
                          "text-left px-4 py-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all",
                          dailyRevealed
                            ? isCorrect
                              ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-300"
                              : isChosen && !isCorrect
                              ? "bg-red-500/15 border-red-500/30 text-red-300/70"
                              : "bg-white/2 border-white/5 text-white/30"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/8 hover:border-white/20 cursor-pointer"
                        )}
                      >
                        <span className={cn("font-bold flex-shrink-0 text-[11px]",
                          dailyRevealed && isCorrect ? "text-emerald-400" :
                          dailyRevealed && isChosen ? "text-red-400" :
                          "text-white/40"
                        )}>
                          {label}.
                        </span>
                        <span className="leading-snug">{opt}</span>
                        {dailyRevealed && isCorrect && <CheckCircle2 className="h-3.5 w-3.5 ml-auto flex-shrink-0 text-emerald-400 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Quick actions + subject breakdown ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Quick actions */}
          <div className="md:col-span-1 space-y-2.5">
            <p className="ed-label">Quick Actions</p>

            <Link href="/quiz">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-violet-600/90 to-indigo-700/90 border border-violet-500/30 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-4.5 w-4.5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white leading-tight">Start a Quiz</p>
                  <p className="text-[11px] text-white/60 leading-tight">Practice past questions</p>
                </div>
                <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-white/70 transition-colors" />
              </motion.div>
            </Link>

            <Link href="/chat">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500/80 to-orange-600/80 border border-amber-500/30 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white leading-tight">Ask LexBot</p>
                  <p className="text-[11px] text-white/60 leading-tight">Your study assistant</p>
                </div>
                <Sparkles className="h-3.5 w-3.5 text-white/60 group-hover:text-white transition-colors" />
              </motion.div>
            </Link>

            <Link href="/questions">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/8 hover:border-white/14 cursor-pointer group transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/12 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white/80 leading-tight">Question Bank</p>
                  <p className="text-[11px] text-white/40 leading-tight">Browse all questions</p>
                </div>
                <ChevronRight className="h-4 w-4 text-white/25 group-hover:text-white/50 transition-colors" />
              </motion.div>
            </Link>

            <Link href="/notes">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/8 hover:border-white/14 cursor-pointer group transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/12 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white/80 leading-tight">Study Notes</p>
                  <p className="text-[11px] text-white/40 leading-tight">Read & review notes</p>
                </div>
                <ChevronRight className="h-4 w-4 text-white/25 group-hover:text-white/50 transition-colors" />
              </motion.div>
            </Link>
          </div>

          {/* Right col: subject breakdown + recent activity */}
          <div className="md:col-span-2 space-y-4">

            {/* Subject breakdown */}
            <div className="glass-card p-4">
              <p className="ed-label mb-3">Subjects</p>
              {loadingSummary ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-10 bg-white/5 rounded-xl" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {SUBJECTS.map((sub, i) => {
                    const data = summary?.subjectBreakdown?.find(s => s.subjectName === sub.name);
                    const qCount = data?.questionCount ?? 0;
                    const nCount = data?.noteCount ?? 0;
                    const total = summary?.totalQuestions || 1;
                    const pct = Math.min(100, Math.round((qCount / total) * 100));
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full flex-shrink-0", sub.dot)} />
                            <span className="text-sm text-white/80 font-medium leading-tight">{sub.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-white/40">
                            <span>{qCount} q's</span>
                            <span>{nCount} notes</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: i * 0.08 + 0.2, duration: 0.7, ease: "easeOut" }}
                            className={cn("h-full rounded-full", sub.dot)}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent activity */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="ed-label flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Recent Activity
                </p>
                {Array.isArray(recentActivity) && recentActivity.length > 0 && (
                  <Link href="/progress">
                    <span className="text-[11px] text-white/35 hover:text-white/60 transition-colors flex items-center gap-0.5 cursor-pointer">
                      See all <ChevronRight className="h-3 w-3" />
                    </span>
                  </Link>
                )}
              </div>

              {loadingActivity ? (
                <div className="space-y-2.5">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-12 bg-white/5 rounded-xl" />)}
                </div>
              ) : !Array.isArray(recentActivity) || !recentActivity.length ? (
                <div className="text-center py-7">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-2">
                    <Clock className="h-4 w-4 text-white/25" />
                  </div>
                  <p className="text-sm text-white/35">No activity yet</p>
                  <p className="text-xs text-white/20 mt-0.5">Take a quiz to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentActivity.slice(0, 5).map((act: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                        act.type === "quiz_completed" ? "bg-violet-500/15" : "bg-emerald-500/15"
                      )}>
                        {act.type === "quiz_completed"
                          ? <PenTool className="h-3.5 w-3.5 text-violet-400" />
                          : <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/75 leading-snug truncate">{act.description}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">
                          {format(new Date(act.createdAt), "MMM d, h:mm a")}
                        </p>
                      </div>
                      {act.score != null && (
                        <span className={cn("text-xs font-bold flex-shrink-0", gradeColor(act.score))}>
                          {act.score.toFixed(0)}%
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </Shell>
  );
}
