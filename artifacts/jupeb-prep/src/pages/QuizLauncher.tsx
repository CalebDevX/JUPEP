import { useState, useEffect } from "react";
import { useListSubjects, useStartQuiz } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";
import { Loader2, PlayCircle, Timer, BookOpen, Target, Zap, Lock } from "lucide-react";
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
  { value: "001", label: "1st In-Course Exam",          desc: "First in-course test"              },
  { value: "002", label: "1st Semester Exam",            desc: "End of first semester exam"         },
  { value: "003", label: "2nd In-Course Exam",           desc: "Second in-course test"              },
  { value: "mock", label: "Mock Exam",                   desc: "Combination of all sessions"        },
  { value: "jupeb", label: "JUPEB Final Exam",           desc: "Past JUPEB final examination questions" },
];

export default function QuizLauncher() {
  const [, setLocation] = useLocation();
  const { data: subjects, isLoading: isLoadingSubjects } = useListSubjects();
  const startQuiz = useStartQuiz();

  const activated = isActivated();
  const trialRemaining = getTrialRemaining();

  const [subjectId, setSubjectId] = useState<string>("");
  const [paper, setPaper] = useState<string>("001");
  const [type, setType] = useState<string>("objective");
  const [count, setCount] = useState<string>(activated ? "20" : String(Math.min(5, trialRemaining)));
  const [isTimed, setIsTimed] = useState<boolean>(true);

  const [timerSettings, setTimerSettings] = useState({
    obj_timer_minutes: 60,
    theory_timer_minutes: 120,
    mock_timer_minutes: 120,
  });

  useEffect(() => {
    fetch(`${BASE}/api/settings`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setTimerSettings({
            obj_timer_minutes: parseInt(data.obj_timer_minutes ?? "60") || 60,
            theory_timer_minutes: parseInt(data.theory_timer_minutes ?? "120") || 120,
            mock_timer_minutes: parseInt(data.mock_timer_minutes ?? "120") || 120,
          });
        }
      })
      .catch(() => {});
  }, []);

  const isMock = paper === "mock";
  const isJupeb = paper === "jupeb";
  const isMixed = isMock || isJupeb;

  const getTimedMinutes = () => {
    if (isMixed) return timerSettings.mock_timer_minutes;
    if (type === "theory") return timerSettings.theory_timer_minutes;
    return timerSettings.obj_timer_minutes;
  };

  const timedMinutes = getTimedMinutes();
  const timerLabel = fmtMinutes(timedMinutes);

  const selectedPaper = PAPER_OPTIONS.find(p => p.value === paper);

  const handleStart = () => {
    if (!subjectId) return;
    startQuiz.mutate({
      data: {
        subjectId: Number(subjectId),
        paper: paper as any,
        questionType: isMixed ? "mixed" : type as any,
        questionCount: Number(count),
        timedMinutes: isTimed ? timedMinutes : undefined,
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

          {/* Timed mode */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Timer className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Timed Mode</p>
                <p className="text-xs text-white/40">
                  Countdown timer · <span className="text-amber-400/80">{timerLabel}</span>
                </p>
              </div>
            </div>
            <Switch checked={isTimed} onCheckedChange={setIsTimed} />
          </div>

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
                  <p className="text-white font-bold text-sm">{isTimed ? timerLabel : "∞"}</p>
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
            { icon: Target, text: "Past questions from real JUPEB papers" },
            { icon: Timer, text: "Auto-submits when time expires" },
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
