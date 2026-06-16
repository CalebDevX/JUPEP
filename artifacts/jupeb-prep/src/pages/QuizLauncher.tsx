import { useState, useEffect } from "react";
import { useListSubjects, useStartQuiz } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Loader2, PlayCircle, Timer, BookOpen, Target, Zap, Lock, AlertTriangle, Shuffle } from "lucide-react";
import { motion } from "framer-motion";
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
  { value: "001",   label: "1st In-Course Exam",    desc: "First in-course test"                          },
  { value: "002",   label: "1st Semester Exam",      desc: "End of first semester exam"                    },
  { value: "003",   label: "2nd In-Course Exam",     desc: "Second in-course test"                         },
  { value: "004",   label: "2nd Semester Exam",      desc: "End of second semester exam"                   },
  { value: "mock",  label: "Mock Exam",              desc: "Full mock covering all four papers (001–004)"  },
  { value: "jupeb", label: "JUPEB Final Exam",       desc: "Past JUPEB final examination questions"        },
];

const CUSTOM_TIMES = [10, 15, 20, 30, 45, 60, 90, 120];

export default function QuizLauncher() {
  const [, setLocation] = useLocation();
  const { data: subjects, isLoading: isLoadingSubjects } = useListSubjects();
  const startQuiz = useStartQuiz();

  const activated = isActivated();
  const trialRemaining = getTrialRemaining();

  const [subjectId, setSubjectId]   = useState<string>("");
  const [paper, setPaper]           = useState<string>("001");
  const [type, setType]             = useState<string>("objective");
  const [count, setCount]           = useState<string>(activated ? "20" : String(Math.min(5, trialRemaining)));

  // Timer state — "none" | "best" | "custom"  (mock/jupeb → locked automatically)
  const [timerMode, setTimerMode]       = useState<"none" | "best" | "custom">("best");
  const [customMinutes, setCustomMinutes] = useState<number>(30);

  const [mockTimerMinutes, setMockTimerMinutes] = useState(120);
  const [shuffle, setShuffle] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/settings`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setMockTimerMinutes(parseInt(data.mock_timer_minutes ?? "120") || 120);
      })
      .catch(() => {});
  }, []);

  const isMock  = paper === "mock";
  const isJupeb = paper === "jupeb";
  const isMixed = isMock || isJupeb;

  // Best time: 1.5 min/question for objective, 25 min/question for theory (min 10 / 20)
  const getBestMinutes = () => {
    const q = Number(count);
    if (type === "theory") return Math.max(20, q * 25);
    return Math.max(10, Math.round((q * 1.5) / 5) * 5);
  };

  // Resolve the actual timed minutes to pass to API
  const resolveTimedMinutes = (): number | undefined => {
    if (isMixed) return mockTimerMinutes;
    if (timerMode === "none") return undefined;
    if (timerMode === "best") return getBestMinutes();
    return customMinutes;
  };

  const timedMinutes = resolveTimedMinutes();
  const timerLabel   = timedMinutes !== undefined ? fmtMinutes(timedMinutes) : "∞";

  const selectedPaper = PAPER_OPTIONS.find(p => p.value === paper);

  const handleStart = () => {
    if (!subjectId) return;
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
      onSuccess: (session) => setLocation(`/quiz/session/${session.id}`)
    });
  };

  return (
    <Shell>
      <div className="p-4 md:p-6 max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 md:mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-orange-500/15 flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
            <Zap className="h-8 w-8 text-orange-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-white">Launch Quiz Session</h1>
          <p className="text-white/50 text-sm mt-2 max-w-sm mx-auto">
            Simulate actual JUPEB exam conditions. Configure your session below.
          </p>
        </motion.div>

        {!activated && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 mb-4"
          >
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 md:p-6 space-y-5"
        >
          {/* Subject + Session */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50 uppercase tracking-wider">Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId} disabled={isLoadingSubjects}>
                <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Choose a subject…" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e28] border-white/10">
                  {(Array.isArray(subjects) ? subjects : []).map(s => (
                    <SelectItem key={s.id} value={s.id.toString()} className="text-white">{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-white/50 uppercase tracking-wider">Session / Exam</Label>
              <Select value={paper} onValueChange={setPaper}>
                <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e28] border-white/10">
                  {PAPER_OPTIONS.map(p => (
                    <SelectItem key={p.value} value={p.value} className="text-white">
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPaper && (
                <p className="text-[10px] text-white/30 pl-1">{selectedPaper.desc}</p>
              )}
            </div>

            {/* Question Type — only for single-paper sessions */}
            {!isMixed && (
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50 uppercase tracking-wider">Question Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1e28] border-white/10">
                    <SelectItem value="objective" className="text-white">Objective (MCQ)</SelectItem>
                    <SelectItem value="theory" className="text-white">Theory (Written)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Question Count — only for MCQ single sessions */}
            {!isMixed && type === "objective" && (
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50 uppercase tracking-wider">Number of Questions</Label>
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
                      <SelectItem value="10" className="text-white">10 — Quick Review</SelectItem>
                      <SelectItem value="20" className="text-white">20 — Standard</SelectItem>
                      <SelectItem value="40" className="text-white">40 — Full Paper</SelectItem>
                      <SelectItem value="50" className="text-white">50 — Comprehensive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>

          {/* ── Timer Section ── */}
          {isMixed ? (
            /* Mock / JUPEB Final — timer is locked, can't change */
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
            /* Practice papers — user can choose timer mode */
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
                  <button
                    key={opt.id}
                    onClick={() => setTimerMode(opt.id)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all",
                      timerMode === opt.id
                        ? "bg-amber-500/15 border-amber-500/40"
                        : "bg-white/3 border-white/10 hover:bg-white/6"
                    )}
                  >
                    <div className="text-base mb-0.5">{opt.emoji}</div>
                    <p className={cn("text-[11px] font-bold", timerMode === opt.id ? "text-amber-300" : "text-white/60")}>{opt.title}</p>
                    <p className={cn("text-[10px]", timerMode === opt.id ? "text-amber-400/70" : "text-white/30")}>{opt.sub}</p>
                  </button>
                ))}
              </div>

              {timerMode === "best" && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] text-amber-400/70 px-1 leading-relaxed"
                >
                  ⚡ Recommended: <span className="font-bold text-amber-300">{getBestMinutes()} min</span> — {count} questions × {type === "theory" ? "25" : "1.5"} min each.
                  Trains you to answer at exam pace.
                </motion.p>
              )}

              {timerMode === "custom" && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-2"
                >
                  {CUSTOM_TIMES.map(m => (
                    <button
                      key={m}
                      onClick={() => setCustomMinutes(m)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                        customMinutes === m
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                          : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60"
                      )}
                    >
                      {fmtMinutes(m)}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {/* ── Shuffle Toggle ── */}
          <button
            type="button"
            onClick={() => setShuffle(s => !s)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
              shuffle
                ? "bg-violet-500/10 border-violet-500/30"
                : "bg-white/3 border-white/10 hover:bg-white/6"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
              shuffle ? "bg-violet-500/20" : "bg-white/8"
            )}>
              <Shuffle className={cn("h-4 w-4 transition-colors", shuffle ? "text-violet-400" : "text-white/30")} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-semibold transition-colors", shuffle ? "text-violet-200" : "text-white/50")}>
                Randomise Question Order
              </p>
              <p className={cn("text-[11px] transition-colors", shuffle ? "text-violet-400/60" : "text-white/25")}>
                {shuffle ? "Questions appear in a different order each session" : "Questions appear in their original fixed order"}
              </p>
            </div>
            {/* visual toggle pill */}
            <div className={cn(
              "relative w-10 h-5 rounded-full transition-all flex-shrink-0",
              shuffle ? "bg-violet-500" : "bg-white/15"
            )}>
              <div className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
                shuffle ? "left-5" : "left-0.5"
              )} />
            </div>
          </button>

          {/* Summary */}
          {subjectId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20"
            >
              <p className="text-xs text-violet-300 font-semibold uppercase tracking-wider mb-2">Session Summary</p>
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

          <Button
            size="lg"
            className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50"
            disabled={!subjectId || startQuiz.isPending}
            onClick={handleStart}
          >
            {startQuiz.isPending ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Starting Session…</>
            ) : (
              <><PlayCircle className="h-5 w-5 mr-2" /> Begin Quiz Session</>
            )}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 grid grid-cols-3 gap-3"
        >
          {[
            { icon: Target,   text: "Past questions from real JUPEB papers" },
            { icon: Timer,    text: "Train at exam speed with Best Time mode" },
            { icon: BookOpen, text: "Answers & explanations after quiz" },
          ].map((tip, i) => (
            <div key={i} className="flex flex-col items-center text-center p-3 rounded-xl bg-white/2 border border-white/5">
              <tip.icon className="h-4 w-4 text-white/30 mb-1.5" />
              <p className="text-[10px] text-white/30 leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </Shell>
  );
}
