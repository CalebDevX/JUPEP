import { useState, useEffect } from "react";
import { useListSubjects, useStartQuiz } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, PlayCircle, Timer, BookOpen, Target, Zap, Lock,
  AlertTriangle, Shuffle, CheckCircle2, XCircle, Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { isActivated, getTrialRemaining, TRIAL_QUESTION_LIMIT } from "@/lib/access";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function fmtMinutes(min: number) {
  if (min >= 60 && min % 60 === 0) return `${min / 60} Hour${min / 60 > 1 ? "s" : ""}`;
  if (min >= 60) return `${Math.floor(min / 60)}h ${min % 60}m`;
  return `${min} Min`;
}

const PAPER_OPTIONS = [
  { value: "001",   label: "1st In-Course Exam",   short: "Paper 001" },
  { value: "002",   label: "1st Semester Exam",     short: "Paper 002" },
  { value: "003",   label: "2nd In-Course Exam",    short: "Paper 003" },
  { value: "004",   label: "2nd Semester Exam",     short: "Paper 004" },
  { value: "mock",  label: "Full Mock Exam",        short: "Mock (All)"  },
  { value: "jupeb", label: "JUPEB Final Exam",      short: "JUPEB Final" },
];

const CUSTOM_TIMES = [10, 15, 20, 30, 45, 60, 90, 120];

interface AvailRow { subjectId: number; paper: string; questionType: string; count: number; }

export default function QuizLauncher() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: subjects, isLoading: isLoadingSubjects } = useListSubjects();
  const startQuiz = useStartQuiz();

  const activated = isActivated();
  const trialRemaining = getTrialRemaining();

  const [subjectId, setSubjectId]   = useState<string>("");
  const [paper, setPaper]           = useState<string>("001");
  const [type, setType]             = useState<string>("objective");
  const [count, setCount]           = useState<string>(activated ? "20" : String(Math.min(5, trialRemaining)));
  const [timerMode, setTimerMode]   = useState<"none" | "best" | "custom">("best");
  const [customMinutes, setCustomMinutes] = useState<number>(30);
  const [mockTimerMinutes, setMockTimerMinutes] = useState(120);
  const [shuffle, setShuffle]       = useState(true);
  const [avail, setAvail]           = useState<AvailRow[]>([]);

  // Load mock timer setting
  useEffect(() => {
    fetch(`${BASE}/api/settings`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setMockTimerMinutes(parseInt(data.mock_timer_minutes ?? "120") || 120); })
      .catch(() => {});
  }, []);

  // Load availability map
  useEffect(() => {
    fetch(`${BASE}/api/quiz/available`)
      .then(r => r.ok ? r.json() : [])
      .then(setAvail)
      .catch(() => {});
  }, []);

  // Auto-select first subject once subjects load
  useEffect(() => {
    if (!subjectId && Array.isArray(subjects) && subjects.length > 0) {
      setSubjectId(String(subjects[0].id));
    }
  }, [subjects, subjectId]);

  const isMock  = paper === "mock";
  const isJupeb = paper === "jupeb";
  const isMixed = isMock || isJupeb;

  // How many questions exist for current selection
  const availCount = (sid: string, p: string, qt: string): number => {
    const sid_ = Number(sid);
    if (p === "mock" || p === "jupeb") {
      // Mock/jupeb = sum across 001-004 for mixed types
      return avail.filter(r => r.subjectId === sid_).reduce((s, r) => s + r.count, 0);
    }
    if (qt === "objective" || qt === "theory") {
      return avail.find(r => r.subjectId === sid_ && r.paper === p && r.questionType === qt)?.count ?? 0;
    }
    return avail.filter(r => r.subjectId === sid_ && r.paper === p).reduce((s, r) => s + r.count, 0);
  };

  const currentCount = subjectId ? availCount(subjectId, paper, isMixed ? "mixed" : type) : 0;
  const hasQuestions = currentCount > 0;

  // Best time: 1.5 min/question for objective, 25 min/question for theory
  const getBestMinutes = () => {
    const q = Number(count);
    if (type === "theory") return Math.max(20, q * 25);
    return Math.max(10, Math.round((q * 1.5) / 5) * 5);
  };

  const resolveTimedMinutes = (): number | undefined => {
    if (isMixed) return mockTimerMinutes;
    if (timerMode === "none") return undefined;
    if (timerMode === "best") return getBestMinutes();
    return customMinutes;
  };

  const timedMinutes = resolveTimedMinutes();
  const timerLabel   = timedMinutes !== undefined ? fmtMinutes(timedMinutes) : "∞";

  const handleStart = () => {
    if (!subjectId || !hasQuestions) return;
    startQuiz.mutate({
      data: {
        subjectId: Number(subjectId),
        paper: paper as any,
        questionType: isMixed ? "mixed" : type as any,
        questionCount: Number(count),
        timedMinutes,
        shuffle,
      }
    }, {
      onSuccess: (session) => setLocation(`/quiz/session/${session.id}`),
      onError: (err: any) => {
        const msg = err?.message ?? "Could not start quiz. No questions found for this selection.";
        toast({
          title: "Cannot start quiz",
          description: msg.includes("No questions") ? "No questions are available for this subject + exam combination yet. Try a different paper or subject." : msg,
          variant: "destructive",
        });
      },
    });
  };

  // Helper: does a paper have any questions for current subject?
  const paperHasQuestions = (p: string) => {
    if (!subjectId) return false;
    const sid = Number(subjectId);
    if (p === "mock" || p === "jupeb") {
      return avail.some(r => r.subjectId === sid);
    }
    return avail.some(r => r.subjectId === sid && r.paper === p);
  };

  return (
    <Shell>
      <div className="p-4 md:p-6 max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 md:mb-8">
          <div className="relative w-16 h-16 rounded-2xl bg-orange-500/15 flex items-center justify-center mx-auto mb-4 border border-orange-500/20 pulse-ring-amber float">
            <Zap className="h-8 w-8 text-orange-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-white">Launch Quiz Session</h1>
          <p className="text-white/50 text-sm mt-2 max-w-sm mx-auto">
            Simulate actual JUPEB exam conditions. Configure your session below.
          </p>
        </motion.div>

        {/* Trial banner */}
        {!activated && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              <Lock className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-300">Free Trial — {trialRemaining} question{trialRemaining !== 1 ? "s" : ""} remaining</p>
              <p className="text-[11px] text-amber-400/50">No explanations · {TRIAL_QUESTION_LIMIT} total free questions</p>
            </div>
            <Link href="/activate">
              <span className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap">Activate →</span>
            </Link>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }} className="glass-card p-5 md:p-6 space-y-5">

          {/* Subject */}
          <div className="space-y-1.5">
            <Label className="text-xs text-white/50 uppercase tracking-wider">Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId} disabled={isLoadingSubjects}>
              <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder={isLoadingSubjects ? "Loading subjects…" : "Choose a subject…"} />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e28] border-white/10">
                {(Array.isArray(subjects) ? subjects : []).map(s => (
                  <SelectItem key={s.id} value={s.id.toString()} className="text-white">{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Exam / Paper — show availability badges */}
          <div className="space-y-2">
            <Label className="text-xs text-white/50 uppercase tracking-wider">Exam Paper</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PAPER_OPTIONS.map(p => {
                const active = paper === p.value;
                const has = paperHasQuestions(p.value);
                return (
                  <motion.button
                    key={p.value}
                    whileHover={{ scale: 1.03, boxShadow: active ? "0 0 15px rgba(139,92,246,0.3)" : "0 0 10px rgba(255,255,255,0.05)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPaper(p.value)}
                    className={cn(
                      "relative flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl border text-left transition-all text-sm overflow-hidden",
                      active
                        ? "bg-violet-600/20 border-violet-500/80 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                        : "bg-white/3 border-white/8 text-white/60 hover:bg-white/6 hover:text-white/80"
                    )}
                  >
                    {active && (
                      <div className="absolute inset-0 border border-violet-400/30 rounded-xl pointer-events-none animate-pulse" />
                    )}
                    <span className={cn("font-bold text-[13px]", active ? "text-white" : "text-white/70")}>{p.label}</span>
                    <span className={cn("text-[10px] flex items-center gap-1",
                      has ? (active ? "text-emerald-400" : "text-emerald-500/60")
                          : (active ? "text-white/30" : "text-white/20"))}>
                      {has
                        ? <><CheckCircle2 className="h-2.5 w-2.5 animate-bounce" /> Questions available</>
                        : <><XCircle className="h-2.5 w-2.5" /> No questions yet</>}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* No-questions warning */}
          <AnimatePresence>
            {subjectId && !hasQuestions && (
              <motion.div key="no-q" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20">
                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-300">No questions available</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Questions for this subject + paper combination haven't been added yet.
                    {avail.some(r => r.subjectId === Number(subjectId))
                      ? " Try a different exam paper."
                      : " Try a different subject."}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question Type — only for single-paper sessions */}
          {!isMixed && (
            <div className="space-y-2">
              <Label className="text-xs text-white/50 uppercase tracking-wider">Question Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: "objective", label: "Objective (MCQ)", emoji: "☑️" },
                  { val: "theory",    label: "Theory (Essay)",  emoji: "✍️" },
                ].map(opt => {
                  const cnt = subjectId ? availCount(subjectId, paper, opt.val) : 0;
                  return (
                    <button
                      key={opt.val}
                      onClick={() => setType(opt.val)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all text-left",
                        type === opt.val
                          ? "bg-violet-600/20 border-violet-500/50"
                          : "bg-white/3 border-white/8 hover:bg-white/6"
                      )}
                    >
                      <span className="text-base">{opt.emoji}</span>
                      <div>
                        <p className={cn("text-[13px] font-bold", type === opt.val ? "text-white" : "text-white/60")}>{opt.label}</p>
                        <p className={cn("text-[10px]", cnt > 0 ? "text-emerald-400/70" : "text-white/25")}>
                          {cnt > 0 ? `${cnt} questions` : "None available"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question Count — only for MCQ single sessions */}
          {!isMixed && type === "objective" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50 uppercase tracking-wider">
                Number of Questions
                {currentCount > 0 && (
                  <span className="ml-2 text-emerald-400/70 normal-case font-normal">{currentCount} available</span>
                )}
              </Label>
              {!activated ? (
                <div className="h-11 px-3 flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg text-sm text-amber-300">
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                  Max {trialRemaining} question{trialRemaining !== 1 ? "s" : ""} (free trial)
                </div>
              ) : (
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1e28] border-white/10">
                    {[
                      { val: "10", label: "10 — Quick Review" },
                      { val: "20", label: "20 — Standard" },
                      { val: "40", label: "40 — Full Paper" },
                      { val: "50", label: "50 — Comprehensive" },
                    ].map(o => (
                      <SelectItem key={o.val} value={o.val}
                        disabled={currentCount > 0 && currentCount < Number(o.val)}
                        className="text-white">
                        {o.label}
                        {currentCount > 0 && currentCount < Number(o.val)
                          ? <span className="text-white/30 ml-1">(only {currentCount} available)</span>
                          : null}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* ── Timer Section ── */}
          {isMixed ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/8 border border-red-500/20">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Exam Mode — Timer Locked</p>
                <p className="text-xs text-white/40">
                  Official timing: <span className="text-red-400 font-bold">{fmtMinutes(mockTimerMinutes)}</span> · Cannot be changed for mock/final exams
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Label className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5" /> Timer Mode
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: "none",   emoji: "∞",  title: "No Timer",   sub: "Unlimited time"          },
                  { id: "best",   emoji: "⚡", title: "Best Time",  sub: `${getBestMinutes()} min` },
                  { id: "custom", emoji: "✏️", title: "Custom",     sub: "You choose"              },
                ] as const).map(opt => (
                  <button key={opt.id} onClick={() => setTimerMode(opt.id)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all",
                      timerMode === opt.id
                        ? "bg-amber-500/15 border-amber-500/40"
                        : "bg-white/3 border-white/10 hover:bg-white/6"
                    )}>
                    <div className="text-base mb-0.5">{opt.emoji}</div>
                    <p className={cn("text-[11px] font-bold", timerMode === opt.id ? "text-amber-300" : "text-white/60")}>{opt.title}</p>
                    <p className={cn("text-[10px]", timerMode === opt.id ? "text-amber-400/70" : "text-white/30")}>{opt.sub}</p>
                  </button>
                ))}
              </div>
              {timerMode === "best" && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] text-amber-400/70 px-1 leading-relaxed">
                  ⚡ Recommended: <span className="font-bold text-amber-300">{getBestMinutes()} min</span> — {count} questions × {type === "theory" ? "25" : "1.5"} min each. Trains you to answer at exam pace.
                </motion.p>
              )}
              {timerMode === "custom" && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-2">
                  {CUSTOM_TIMES.map(m => (
                    <button key={m} onClick={() => setCustomMinutes(m)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                        customMinutes === m
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                          : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60"
                      )}>
                      {fmtMinutes(m)}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {/* ── Shuffle Toggle ── */}
          <button type="button" onClick={() => setShuffle(s => !s)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
              shuffle ? "bg-violet-500/10 border-violet-500/30" : "bg-white/3 border-white/10 hover:bg-white/6"
            )}>
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
              shuffle ? "bg-violet-500/20" : "bg-white/8")}>
              <Shuffle className={cn("h-4 w-4 transition-colors", shuffle ? "text-violet-400" : "text-white/30")} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-semibold transition-colors", shuffle ? "text-violet-200" : "text-white/50")}>
                Randomise Question Order
              </p>
              <p className={cn("text-[11px] transition-colors", shuffle ? "text-violet-400/60" : "text-white/25")}>
                {shuffle ? "Questions appear in a different order each session" : "Fixed order — good for systematic review"}
              </p>
            </div>
            <div className={cn("relative w-10 h-5 rounded-full transition-all flex-shrink-0", shuffle ? "bg-violet-500" : "bg-white/15")}>
              <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", shuffle ? "left-5" : "left-0.5")} />
            </div>
          </button>

          {/* Session Summary */}
          {subjectId && hasQuestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className={cn(
                "p-4 rounded-xl border transition-all duration-500 bg-gradient-to-r",
                isMixed 
                  ? "from-amber-600/15 to-orange-600/10 border-amber-500/30 text-amber-100" 
                  : type === "theory"
                  ? "from-emerald-600/15 to-teal-600/10 border-emerald-500/30 text-emerald-100"
                  : "from-violet-600/15 to-indigo-600/10 border-violet-500/30 text-violet-100"
              )}
            >
              <p className={cn("text-xs font-semibold uppercase tracking-wider mb-2",
                isMixed ? "text-amber-300" : type === "theory" ? "text-emerald-300" : "text-violet-300"
              )}>Session Summary</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-white font-bold text-sm truncate">{subjects?.find(s => s.id === Number(subjectId))?.name.split("-")[0]}</p>
                  <p className="text-[10px] text-white/40">Subject</p>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{isMixed ? "Mixed" : type === "objective" ? count : "All"}</p>
                  <p className="text-[10px] text-white/40">Questions</p>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{timerLabel}</p>
                  <p className="text-[10px] text-white/40">Time Limit</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Begin Quiz Button */}
          <motion.button
            whileHover={hasQuestions && subjectId ? { scale: 1.02, boxShadow: "0 0 25px rgba(139,92,246,0.5)" } : {}}
            whileTap={hasQuestions && subjectId ? { scale: 0.98 } : {}}
            disabled={!subjectId || !hasQuestions || startQuiz.isPending}
            onClick={handleStart}
            className={cn(
              "w-full h-12 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center relative overflow-hidden",
              hasQuestions && subjectId
                ? "bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 hover:from-violet-500 hover:to-indigo-500 btn-shimmer pulse-ring"
                : "bg-white/8 border border-white/10 cursor-not-allowed opacity-50"
            )}
          >
            {startQuiz.isPending ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Starting Session…</>
            ) : !hasQuestions && subjectId ? (
              <><XCircle className="h-5 w-5 mr-2 text-white/30" /> <span className="text-white/30">No Questions Available</span></>
            ) : (
              <><PlayCircle className="h-5 w-5 mr-2" /> Begin Quiz Session</>
            )}
          </motion.button>
        </motion.div>

        {/* Feature tips */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-4 grid grid-cols-3 gap-3">
          {[
            { icon: Target,   text: "Past questions from real JUPEB papers", animation: { rotate: [0, 10, -10, 0] } },
            { icon: Timer,    text: "Train at exam speed with Best Time mode", animation: { scale: [1, 1.12, 1] } },
            { icon: BookOpen, text: "Answers & explanations after quiz", animation: { y: [0, -3, 0] } },
          ].map((tip, i) => (
            <div key={i} className="flex flex-col items-center text-center p-3 rounded-xl bg-white/2 border border-white/5 group hover:bg-white/4 transition-colors">
              <motion.div
                animate={tip.animation}
                transition={{ repeat: Infinity, duration: 4, delay: i * 0.5, ease: "easeInOut" }}
              >
                <tip.icon className="h-4 w-4 text-violet-400/55 group-hover:text-violet-400 mb-1.5 transition-colors" />
              </motion.div>
              <p className="text-[10px] text-white/30 leading-relaxed group-hover:text-white/50 transition-colors">{tip.text}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </Shell>
  );
}
