import { useState, useEffect, useRef, useCallback } from "react";
import { Shell } from "@/components/layout/Shell";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ClipboardList, Clock, AlertTriangle, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, Loader2, Trophy, BarChart3,
} from "lucide-react";
import { useListSubjects } from "@workspace/api-client-react";
import { useLocation } from "wouter";

const BASE = import.meta.env.VITE_API_URL || "";

function getProfile() {
  try { return JSON.parse(localStorage.getItem("jupeb_profile") || "null"); } catch { return null; }
}

const GRADE_INFO: Record<string, { label: string; color: string; bg: string; border: string }> = {
  A: { label: "Distinction", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
  B: { label: "Credit", color: "text-sky-400", bg: "bg-sky-500/15", border: "border-sky-500/30" },
  C: { label: "Merit", color: "text-blue-400", bg: "bg-blue-500/15", border: "border-blue-500/30" },
  D: { label: "Pass", color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30" },
  E: { label: "Conditional Pass", color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/30" },
  F: { label: "Fail", color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30" },
};

const PAPER_LABELS: Record<string, string> = {
  "001": "1st In-Course", "002": "1st Semester",
  "003": "2nd In-Course", "004": "2nd Semester",
};

type Phase = "setup" | "exam" | "result";

export default function MockExam() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [starting, setStarting] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60); // 3 hours in seconds
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [, navigate] = useLocation();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: subjectsRaw } = useListSubjects();
  const subjects = Array.isArray(subjectsRaw) ? subjectsRaw : [];
  const profile = getProfile();

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleSubmit = useCallback(async () => {
    if (!sessionId) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const answerList = questions.map(q => ({
      questionId: q.id,
      selectedOption: answers[q.id] ?? null,
    }));
    const r = await fetch(`${BASE}/api/quiz/sessions/${sessionId}/submit`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: answerList, phone: profile?.phone }),
    });
    if (r.ok) {
      const data = await r.json();
      setResult(data);
      setPhase("result");
    }
    setSubmitting(false);
  }, [sessionId, questions, answers, profile]);

  useEffect(() => {
    if (phase === "exam") {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            handleSubmit();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, handleSubmit]);

  async function startMock() {
    if (!selectedSubjectId || !profile?.phone) return;
    setStarting(true);
    const r = await fetch(`${BASE}/api/quiz/start`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: parseInt(selectedSubjectId),
        paper: "mock",
        questionType: "objective",
        limit: 100,
        phone: profile.phone,
      }),
    });
    if (r.ok) {
      const data = await r.json();
      setSessionId(data.id);
      setQuestions(data.questions ?? []);
      setPhase("exam");
    } else {
      alert("Not enough questions available for a full mock exam. Add more questions first.");
    }
    setStarting(false);
  }

  const answeredCount = Object.keys(answers).length;
  const selectedSubject = subjects.find((s: any) => String(s.id) === selectedSubjectId);

  // ── Setup ──
  if (phase === "setup") {
    return (
      <Shell>
        <div className="max-w-xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-500/15 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Full Mock Exam</h1>
                <p className="text-sm text-white/50">Authentic JUPEB simulation — 100 questions, 3 hours</p>
              </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "📝", label: "100 Questions", sub: "All 4 papers" },
                { icon: "⏱️", label: "3 Hours", sub: "Auto-submits" },
                { icon: "🏅", label: "Official Grade", sub: "A–F scale" },
              ].map(c => (
                <div key={c.label} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-3 text-center">
                  <div className="text-xl mb-1">{c.icon}</div>
                  <p className="text-white text-sm font-semibold">{c.label}</p>
                  <p className="text-white/40 text-xs">{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Rules */}
            <div className="bg-amber-500/8 border border-amber-500/15 rounded-2xl p-4 space-y-2">
              <p className="text-amber-300 font-semibold text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Exam Rules
              </p>
              <ul className="text-sm text-white/60 space-y-1 list-disc list-inside">
                <li>Timer starts immediately when you begin</li>
                <li>Exam auto-submits when time expires</li>
                <li>40% (40/100) is the JUPEB pass mark</li>
                <li>Grading: A ≥70%, B ≥60%, C ≥50%, D ≥45%, E ≥40%, F &lt;40%</li>
              </ul>
            </div>

            {/* Subject picker */}
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Select Subject</label>
              <select
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-white/20"
              >
                <option value="">Choose a subject…</option>
                {subjects.map((s: any) => (
                  <option key={s.id} value={String(s.id)}>{s.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={startMock}
              disabled={!selectedSubjectId || starting}
              className="w-full flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white font-bold rounded-2xl py-3.5 transition-colors text-sm"
            >
              {starting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ClipboardList className="w-5 h-5" />}
              {starting ? "Preparing exam…" : "Start Mock Exam"}
            </button>
          </motion.div>
        </div>
      </Shell>
    );
  }

  // ── Exam ──
  if (phase === "exam") {
    const q = questions[current];
    const isLow = timeLeft < 600;

    return (
      <div className="min-h-screen bg-[#0f0f14] flex flex-col">
        {/* Exam toolbar */}
        <div className="sticky top-0 z-10 bg-[#0f0f14]/95 backdrop-blur border-b border-white/[0.07] px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <ClipboardList className="w-4 h-4 text-violet-400" />
            <span className="text-white text-sm font-semibold">{selectedSubject?.name} Mock</span>
            <span className="text-white/40 text-xs ml-1">{answeredCount}/{questions.length} answered</span>
          </div>
          <div className={cn(
            "flex items-center gap-2 font-mono font-bold text-sm rounded-xl px-3 py-1.5 border",
            isLow ? "text-red-300 bg-red-500/15 border-red-500/25 animate-pulse" : "text-white bg-white/[0.06] border-white/10"
          )}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-violet-500 hover:bg-violet-400 text-white text-sm font-bold rounded-xl px-4 py-2 transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
          </button>
        </div>

        {/* Question */}
        <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-6">
          {q && (
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span>Question {current + 1} of {questions.length}</span>
                  <span>·</span>
                  <span>{PAPER_LABELS[q.paper] ?? q.paper}</span>
                </div>
                <p className="text-white/90 text-base leading-relaxed font-medium">{q.questionText}</p>
                <div className="space-y-2.5">
                  {Array.isArray(q.options) && q.options.map((opt: string, idx: number) => {
                    const letter = String.fromCharCode(65 + idx);
                    const selected = answers[q.id] === letter;
                    return (
                      <button
                        key={idx}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: letter }))}
                        className={cn(
                          "w-full flex items-start gap-3 rounded-2xl px-4 py-3.5 text-left text-sm border transition-all",
                          selected
                            ? "bg-violet-500/20 border-violet-500/40 text-white"
                            : "bg-white/[0.04] border-white/[0.08] text-white/70 hover:bg-white/[0.07] hover:border-white/15"
                        )}
                      >
                        <span className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 border",
                          selected ? "bg-violet-500 border-violet-400 text-white" : "border-white/20 text-white/50"
                        )}>{letter}</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Nav */}
        <div className="sticky bottom-0 bg-[#0f0f14]/95 backdrop-blur border-t border-white/[0.07] px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
            className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white/70 text-sm rounded-xl px-4 py-2.5 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <div className="flex-1 bg-white/[0.04] rounded-full h-2">
            <div
              className="bg-violet-500 h-2 rounded-full transition-all"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>
          {current < questions.length - 1 ? (
            <button
              onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
              className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white/70 text-sm rounded-xl px-4 py-2.5 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-violet-500 hover:bg-violet-400 text-white text-sm font-bold rounded-xl px-4 py-2.5 disabled:opacity-50 transition-colors"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit <CheckCircle2 className="w-4 h-4" /></>}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Result ──
  if (phase === "result" && result) {
    const grade = result.grade as string;
    const g = GRADE_INFO[grade] ?? GRADE_INFO.F;
    const pass = grade !== "F" && grade !== "E";

    return (
      <Shell>
        <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            {/* Grade card */}
            <div className={cn("rounded-3xl p-8 text-center border mb-6", g.bg, g.border)}>
              <div className="text-5xl font-black mb-2" style={{ fontFamily: "Fraunces, serif" }}>
                <span className={g.color}>{grade}</span>
              </div>
              <p className={cn("font-bold text-lg", g.color)}>{g.label}</p>
              <p className="text-white/50 text-sm mt-1">{result.score}/{result.totalMarks} correct · {result.percentage}%</p>
              <p className="text-white/60 text-sm mt-3 italic">"{result.feedback}"</p>
              <div className={cn(
                "mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold border",
                pass ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-300" : "bg-red-500/15 border-red-500/25 text-red-300"
              )}>
                {pass ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {pass ? "PASSED" : "FAILED"} — {result.percentage}% {pass ? "≥" : "<"} 40% pass mark
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Score", value: `${result.score}/${result.totalMarks}` },
                { label: "Percentage", value: `${result.percentage}%` },
                { label: "Questions", value: result.totalMarks },
              ].map(stat => (
                <div key={stat.label} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-3 text-center">
                  <p className="text-white text-lg font-black">{stat.value}</p>
                  <p className="text-white/40 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setPhase("setup")}
                className="w-full bg-violet-500 hover:bg-violet-400 text-white font-bold rounded-2xl py-3.5 transition-colors text-sm"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white/70 font-semibold rounded-2xl py-3.5 transition-colors text-sm"
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </Shell>
    );
  }

  return null;
}
