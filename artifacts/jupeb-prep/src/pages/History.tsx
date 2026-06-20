import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  HistoryIcon, PenTool, GraduationCap, Clock, Trophy,
  ChevronRight, RotateCcw, BookOpen, Flame, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow, format } from "date-fns";

const BASE = import.meta.env.VITE_API_URL || "";

const PAPER_LABELS: Record<string, string> = {
  "001": "1st In-Course",
  "002": "1st Semester",
  "003": "2nd In-Course",
  "004": "Mock Exam",
  "mock": "Mock Exam",
  "jupeb": "JUPEB Final",
};

const GRADE_COLOR: Record<string, string> = {
  A: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  B: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  C: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  D: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  E: "bg-red-500/15 text-red-400 border-red-500/30",
  F: "bg-red-600/20 text-red-300 border-red-600/30",
};

const GRADE_RING: Record<string, string> = {
  A: "text-emerald-400",
  B: "text-blue-400",
  C: "text-amber-400",
  D: "text-orange-400",
  E: "text-red-400",
  F: "text-red-300",
};

function gradeFromPct(pct: number) {
  if (pct >= 70) return "A";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 45) return "D";
  if (pct >= 40) return "E";
  return "F";
}

interface QuizSession {
  id: number;
  subjectName: string | null;
  paper: string;
  questionType: string;
  status: string;
  score: number | null;
  totalMarks: number | null;
  timedMinutes: number | null;
  createdAt: string;
  completedAt: string | null;
  questionIds: number[];
}

export interface LectureRecord {
  id: string;
  subjectName: string;
  paper: string;
  topic: string;
  wordCount: number;
  savedAt: string;
}

function getLectureHistory(): LectureRecord[] {
  try {
    return JSON.parse(localStorage.getItem("jupeb_lecture_history") || "[]");
  } catch {
    return [];
  }
}

// ── Mini ring progress ─────────────────────────────────────────────────────
function ScoreRing({ pct, grade }: { pct: number; grade: string }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <circle
          cx="22" cy="22" r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          className={GRADE_RING[grade]}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-sm font-bold", GRADE_RING[grade])}>{grade}</span>
      </div>
    </div>
  );
}

// ── Quiz session card ──────────────────────────────────────────────────────
function QuizCard({ session, index }: { session: QuizSession; index: number }) {
  const isCompleted = session.status === "completed";
  const pct = (session.score != null && session.totalMarks)
    ? Math.round((session.score / session.totalMarks) * 100)
    : 0;
  const grade = isCompleted ? gradeFromPct(pct) : "—";
  const qCount = session.questionIds?.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link href={isCompleted ? `/quiz/result/${session.id}` : `/quiz/session/${session.id}`}>
        <div className="glass-card p-4 flex items-center gap-4 hover:bg-white/3 transition-colors cursor-pointer group">

          {isCompleted
            ? <ScoreRing pct={pct} grade={grade} />
            : (
              <div className="w-14 h-14 flex-shrink-0 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
            )
          }

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm font-semibold text-white truncate">
                {session.subjectName ?? "Unknown Subject"}
              </span>
              {isCompleted && (
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", GRADE_COLOR[grade])}>
                  {grade} · {pct}%
                </span>
              )}
              {!isCompleted && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  In Progress
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap text-[11px] text-white/35">
              <span>{PAPER_LABELS[session.paper] ?? session.paper}</span>
              <span>·</span>
              <span className="capitalize">{session.questionType}</span>
              <span>·</span>
              <span>{qCount} question{qCount !== 1 ? "s" : ""}</span>
              {isCompleted && session.score != null && (
                <>
                  <span>·</span>
                  <span>{session.score}/{session.totalMarks} marks</span>
                </>
              )}
              {session.timedMinutes && (
                <>
                  <span>·</span>
                  <span>{session.timedMinutes} min</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-white/20 mt-1">
              {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
              {session.completedAt && (
                <> · {format(new Date(session.createdAt), "d MMM, h:mm a")}</>
              )}
            </p>
          </div>

          <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
        </div>
      </Link>
    </motion.div>
  );
}

// ── Lecture history card ───────────────────────────────────────────────────
function LectureCard({ rec, index }: { rec: LectureRecord; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link href="/class">
        <div className="glass-card p-4 flex items-center gap-4 hover:bg-white/3 transition-colors cursor-pointer group">
          <div className="w-14 h-14 flex-shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{rec.topic}</p>
            <div className="flex items-center gap-2 flex-wrap text-[11px] text-white/35 mt-0.5">
              <span>{rec.subjectName}</span>
              <span>·</span>
              <span>{PAPER_LABELS[rec.paper] ?? rec.paper}</span>
              {rec.wordCount > 0 && (
                <>
                  <span>·</span>
                  <span>~{Math.ceil(rec.wordCount / 180)} min read</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-white/20 mt-1">
              {formatDistanceToNow(new Date(rec.savedAt), { addSuffix: true })}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
        </div>
      </Link>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [sessions, setSessions]       = useState<QuizSession[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);
  const [activeTab, setActiveTab]     = useState<"quiz" | "lectures">("quiz");
  const lectures = getLectureHistory();

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${BASE}/api/quiz/sessions`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const completedSessions = sessions.filter(s => s.status === "completed");
  const inProgressSessions = sessions.filter(s => s.status === "in_progress");

  // Quick stats
  const avgPct = completedSessions.length
    ? Math.round(
        completedSessions
          .filter(s => s.score != null && s.totalMarks)
          .reduce((sum, s) => sum + (s.score! / s.totalMarks!) * 100, 0)
          / completedSessions.filter(s => s.score != null && s.totalMarks).length
      )
    : 0;

  const aCount = completedSessions.filter(s => {
    const pct = s.score != null && s.totalMarks ? (s.score / s.totalMarks) * 100 : 0;
    return pct >= 70;
  }).length;

  return (
    <Shell>
      <div className="p-4 md:p-6 max-w-4xl mx-auto w-full space-y-5">

        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <HistoryIcon className="h-5 w-5 text-indigo-400" />
              </div>
              History
            </h1>
            <p className="text-white/40 text-sm mt-1 ml-[52px]">Your past quizzes and lectures</p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-white/10 hover:text-white/80 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        {/* Quick stats row */}
        {!loading && completedSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            {[
              {
                icon: PenTool,
                color: "text-violet-400",
                bg: "bg-violet-500/10",
                value: sessions.length,
                label: "Total Sessions",
              },
              {
                icon: Trophy,
                color: "text-amber-400",
                bg: "bg-amber-500/10",
                value: `${avgPct}%`,
                label: "Average Score",
              },
              {
                icon: Flame,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                value: aCount,
                label: "A Grades",
              },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-4 flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-white leading-none">{stat.value}</p>
                  <p className="text-[10px] text-white/35 mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/3 border border-white/8 w-fit">
          {([
            { id: "quiz" as const,     label: "Quizzes",  icon: PenTool,     count: sessions.length },
            { id: "lectures" as const, label: "Lectures", icon: BookOpen,    count: lectures.length },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-white/10 text-white shadow"
                  : "text-white/40 hover:text-white/70"
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  activeTab === tab.id ? "bg-white/15 text-white" : "bg-white/8 text-white/40"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Quiz Sessions Tab ── */}
        {activeTab === "quiz" && (
          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-2xl bg-white/5" />
              ))
            ) : error ? (
              <div className="glass-card p-10 flex flex-col items-center gap-3 text-center">
                <AlertCircle className="h-8 w-8 text-red-400/50" />
                <p className="text-white/50 text-sm">Couldn't load history. Check your connection.</p>
                <button
                  onClick={load}
                  className="px-4 py-2 rounded-xl bg-white/8 text-white/60 text-sm hover:bg-white/12 transition"
                >
                  Try Again
                </button>
              </div>
            ) : sessions.length === 0 ? (
              <div className="glass-card p-12 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                  <PenTool className="h-7 w-7 text-white/20" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white mb-1">No quizzes yet</h3>
                  <p className="text-white/40 text-sm">Your past quiz sessions will appear here. Start a quiz to see your history!</p>
                </div>
                <Link href="/quiz">
                  <button className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-colors">
                    Take a Quiz →
                  </button>
                </Link>
              </div>
            ) : (
              <>
                {/* In-progress sessions */}
                {inProgressSessions.length > 0 && (
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold px-1 mb-2">Continue where you left off</p>
                    {inProgressSessions.map((s, i) => <QuizCard key={s.id} session={s} index={i} />)}
                  </div>
                )}

                {/* Completed sessions */}
                {completedSessions.length > 0 && (
                  <div>
                    {inProgressSessions.length > 0 && (
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold px-1 mb-2 mt-4">Completed</p>
                    )}
                    {completedSessions.map((s, i) => <QuizCard key={s.id} session={s} index={i} />)}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Lectures Tab ── */}
        {activeTab === "lectures" && (
          <div className="space-y-2">
            {lectures.length === 0 ? (
              <div className="glass-card p-12 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                  <GraduationCap className="h-7 w-7 text-white/20" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white mb-1">No lectures yet</h3>
                  <p className="text-white/40 text-sm">Lectures you complete will appear here so you can review topics later.</p>
                </div>
                <Link href="/class">
                  <button className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors">
                    Attend a Class →
                  </button>
                </Link>
              </div>
            ) : (
              lectures.map((rec, i) => <LectureCard key={rec.id} rec={rec} index={i} />)
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
