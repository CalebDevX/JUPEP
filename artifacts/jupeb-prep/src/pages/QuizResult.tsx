import { useEffect, useState } from "react";
import { useGetQuizSession } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, ChevronRight, BarChart3, AlertCircle,
  RotateCcw, BookOpen, Trophy, Target, Zap, Star, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Confetti, StarBurst } from "@/components/Confetti";
import { recordQuizComplete, getGamificationState } from "@/lib/gamification";
import { isActivated, recordTrialQuestionsUsed } from "@/lib/access";

const BASE = import.meta.env.VITE_API_URL || "";

async function syncProgressToServer(opts: {
  phone: string; xp: number; streak: number;
  quizScore: number; subjectName: string; paperCode: string;
  questionCount: number; timeSpentSeconds?: number;
}) {
  try {
    await fetch(`${BASE}/api/student/sync-progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
    });
  } catch {}
}

export default function QuizResult() {
  const [, params] = useRoute("/quiz/result/:id");
  const id = Number(params?.id);
  const [xpGained, setXpGained] = useState(0);
  const [showXPBanner, setShowXPBanner] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  const { data: session, isLoading } = useGetQuizSession(id, { query: { enabled: !!id } as any });

  useEffect(() => {
    if (!session || session.status !== "completed") return;
    const score = session.score || 0;
    const total = session.totalMarks || session.questions.length;
    const pct = Math.round((score / total) * 100);
    const alreadyRecorded = sessionStorage.getItem(`quiz_result_${id}`);
    if (!alreadyRecorded) {
      sessionStorage.setItem(`quiz_result_${id}`, "1");
      if (!isActivated()) recordTrialQuestionsUsed(session.questions.length);
      const { xpGained: gained } = recordQuizComplete(score, total);
      setXpGained(gained);
      setTimeout(() => setShowXPBanner(true), 600);
      setTimeout(() => setShowXPBanner(false), 4000);
      if (pct >= 70) {
        setTimeout(() => setConfettiActive(true), 300);
        setTimeout(() => setConfettiActive(false), 6000);
      }
      const gState = getGamificationState();
      const profile = (() => { try { return JSON.parse(localStorage.getItem("jupeb_profile") || "null"); } catch { return null; } })();
      if (profile?.phone) {
        const timeKey = `quiz_time_${id}`;
        const timeSpent = parseInt(sessionStorage.getItem(timeKey) || "0") || undefined;
        syncProgressToServer({
          phone: profile.phone,
          xp: gState.xp,
          streak: gState.streak,
          quizScore: score,
          subjectName: session.subjectName || "",
          paperCode: session.paper || "",
          questionCount: session.questions.length,
          timeSpentSeconds: timeSpent,
        });
      }
    }
  }, [session, id]);

  if (isLoading) return (
    <Shell>
      <div className="p-6 max-w-3xl mx-auto w-full space-y-5">
        <Skeleton className="h-10 w-48 bg-white/5 rounded-2xl" />
        <Skeleton className="h-44 w-full bg-white/5 rounded-2xl" />
        <Skeleton className="h-64 w-full bg-white/5 rounded-2xl" />
      </div>
    </Shell>
  );

  if (!session || session.status !== "completed") return (
    <Shell>
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/15 flex items-center justify-center">
          <AlertCircle className="h-7 w-7 text-red-400" />
        </div>
        <h2 className="text-xl font-bold font-serif text-white">Result Not Available</h2>
        <p className="text-white/40 text-sm">This quiz session hasn't been completed yet.</p>
        <Link href="/quiz"><Button className="bg-violet-600 hover:bg-violet-500">Back to Quiz</Button></Link>
      </div>
    </Shell>
  );

  const score = session.score || 0;
  const total = session.totalMarks || session.questions.length;
  const pct = Math.round((score / total) * 100);

  const { grade, gradeColor, gradeBg, message, gradeEmoji } = (() => {
    if (pct >= 70) return { grade: "A", gradeColor: "text-emerald-400", gradeBg: "bg-emerald-500/15 border-emerald-500/30", message: "Excellent! You're very well prepared.", gradeEmoji: "🏆" };
    if (pct >= 60) return { grade: "B", gradeColor: "text-sky-400", gradeBg: "bg-sky-500/15 border-sky-500/30", message: "Good work. Keep pushing to clear A.", gradeEmoji: "⚡" };
    if (pct >= 50) return { grade: "C", gradeColor: "text-amber-400", gradeBg: "bg-amber-500/15 border-amber-500/30", message: "Fair attempt. Review weak areas and try again.", gradeEmoji: "📚" };
    if (pct >= 45) return { grade: "D", gradeColor: "text-orange-400", gradeBg: "bg-orange-500/15 border-orange-500/30", message: "You need more practice. Don't give up!", gradeEmoji: "💪" };
    return { grade: "F", gradeColor: "text-red-400", gradeBg: "bg-red-500/15 border-red-500/30", message: "Review your notes thoroughly and try again.", gradeEmoji: "📖" };
  })();

  const PAPER_LABELS: Record<string, string> = {
    "001": "1st Incourse", "002": "1st Semester Exam", "003": "2nd Incourse", "004": "2nd Semester", "mock": "Full Mock",
  };

  return (
    <Shell>
      <Confetti active={confettiActive} />
      <div className="p-4 md:p-8 max-w-3xl mx-auto w-full space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-white/35">
          <Link href="/"><span className="hover:text-white/70 cursor-pointer transition-colors">Dashboard</span></Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/quiz"><span className="hover:text-white/70 cursor-pointer transition-colors">Quiz</span></Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white/60">Result</span>
        </div>

        {/* XP banner */}
        <AnimatePresence>
          {showXPBanner && xpGained > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/40 relative overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.15)]"
            >
              {/* Sparkles background effect */}
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <StarBurst count={6} />
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 relative z-10">
                <Zap className="h-4 w-4 text-amber-400 animate-bounce" />
              </div>
              <div className="relative z-10">
                <p className="text-sm font-bold text-amber-300">+{xpGained} XP earned!</p>
                <p className="text-xs text-amber-400/60">Keep studying to level up</p>
              </div>
              <motion.div 
                className="ml-auto relative z-10"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Star className="h-5 w-5 text-amber-400" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "glass-card-premium overflow-hidden transition-all duration-500",
            pct >= 70 ? "border-emerald-500/25" : pct >= 60 ? "border-sky-500/25" : pct >= 50 ? "border-amber-500/25" : "border-rose-500/25"
          )}
        >
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Grade */}
            <div className={cn(
              "flex flex-col items-center justify-center text-center p-6 rounded-2xl border relative overflow-hidden transition-all duration-500",
              gradeBg,
              pct >= 70 ? "glow-emerald" : pct >= 60 ? "glow-blue" : pct >= 50 ? "glow-orange" : "glow-rose"
            )}>
              {pct >= 70 && <StarBurst count={12} />}
              <p className="text-xs font-bold text-white/45 uppercase tracking-widest mb-2 relative z-10">Final Grade</p>
              <motion.div
                initial={{ scale: 0.2, rotate: -35, filter: "blur(8px)", opacity: 0 }}
                animate={{ scale: 1, rotate: 0, filter: "blur(0px)", opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
                className={cn("text-8.5xl font-black font-serif leading-none mb-2 relative z-10 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]", gradeColor)}
              >
                {grade}
              </motion.div>
              <div className="text-2xl font-bold text-white relative z-10">{pct}%</div>
              <div className="text-xs text-white/40 mt-1 relative z-10">{score} / {total} marks</div>
              <div className="text-2xl mt-2 relative z-10">{gradeEmoji}</div>
            </div>

            {/* Details */}
            <div className="md:col-span-2 flex flex-col justify-center gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-white">{session.subjectName}</h2>
                <p className="text-sm text-white/40 mt-0.5 capitalize">
                  {PAPER_LABELS[session.paper] || `Paper ${session.paper}`} · {session.questionType} mode
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-white/50">
                  <span>Performance</span><span className={gradeColor}>{pct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/8 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                    className={cn(
                      "h-full rounded-full progress-glow",
                      pct >= 70 ? "bg-emerald-500" : pct >= 60 ? "bg-sky-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"
                    )}
                  />
                </div>
                <p className="text-xs text-white/40">{message}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: Trophy, label: "Score", value: `${score}/${total}`, color: "text-amber-400" },
                  { icon: Target, label: "Questions", value: session.questions.length, color: "text-violet-400" },
                  { icon: BarChart3, label: "Mode", value: session.questionType === "objective" ? "MCQ" : "Theory", color: "text-sky-400" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="p-3 rounded-xl bg-white/4 border border-white/6">
                    <Icon className={cn("h-4 w-4 mx-auto mb-1.5", color)} />
                    <p className="text-sm font-bold text-white">{value}</p>
                    <p className="text-[10px] text-white/35">{label}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-1">
                <Link href="/quiz">
                  <Button variant="outline" size="sm" className="border-white/15 text-white/70 hover:bg-white/8 hover:text-white bg-transparent gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5" />Take Again
                  </Button>
                </Link>
                <Link href={`/notes?subjectId=${session.subjectId}`}>
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />Review Notes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Question review */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-white/40" />
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Question Review</h3>
          </div>

          <div className="space-y-3">
            {session.questions.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "glass-card overflow-hidden transition-all duration-300",
                  i % 2 === 0 ? "bg-white/[0.03]" : "bg-white/[0.01]"
                )}
              >
                <div className="px-5 py-3 border-b border-white/6 flex items-center gap-2">
                  <span className="text-xs font-bold text-white/40">Q{i + 1}</span>
                  {q.questionType === "objective" && q.correctOption && (
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                      Answer: {q.correctOption}
                    </span>
                  )}
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-sm text-white/80 leading-relaxed font-medium">{q.questionText}</p>

                  {q.questionType === "objective" && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, idx) => {
                        const label = ["A", "B", "C", "D"][idx];
                        const isCorrect = q.correctOption === label;
                        return (
                          <motion.div
                            key={idx}
                            animate={isCorrect ? { scale: [1, 1.015, 1], boxShadow: "0 0 12px rgba(16, 185, 129, 0.2)" } : {}}
                            transition={{ duration: 1.5, repeat: isCorrect ? Infinity : 0, repeatDelay: 3 }}
                            className={cn(
                              "p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all duration-300",
                              isCorrect
                                ? "bg-emerald-500/12 border-emerald-500/35 text-emerald-300 font-medium"
                                : "bg-white/3 border-white/6 text-white/45 opacity-70"
                            )}
                          >
                            <span className={cn("font-bold flex-shrink-0", isCorrect ? "text-emerald-400" : "text-white/30")}>
                              {label}.
                            </span>
                            <span>{opt}</span>
                            {isCorrect && <CheckCircle2 className="h-3.5 w-3.5 ml-auto flex-shrink-0 text-emerald-400" />}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {q.explanation && isActivated() && (
                    <div className="p-4 rounded-xl bg-amber-500/8 border border-amber-500/20 text-xs leading-relaxed text-white/65 border-l-2 border-l-amber-400">
                      <p className="font-semibold text-amber-400 mb-1">Explanation</p>
                      <p className="whitespace-pre-wrap">{q.explanation}</p>
                    </div>
                  )}
                  {q.explanation && !isActivated() && (
                    <Link href="/activate">
                      <div className="p-3 rounded-xl bg-white/4 border border-white/8 text-xs flex items-center gap-2 cursor-pointer hover:bg-white/6 transition-colors">
                        <Lock className="h-3.5 w-3.5 text-white/30 flex-shrink-0" />
                        <span className="text-white/35">Explanation locked — </span>
                        <span className="text-violet-400 font-semibold">Activate to unlock</span>
                      </div>
                    </Link>
                  )}

                  {q.questionType === "theory" && q.markingGuide && (
                    <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-xs leading-relaxed text-white/65 border-l-2 border-l-emerald-400">
                      <p className="font-semibold text-emerald-400 mb-1">Marking Guide ({q.marks} marks)</p>
                      <p className="whitespace-pre-wrap">{q.markingGuide}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
