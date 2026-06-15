import { useState, useEffect } from "react";
import { useGetQuizSession, useSubmitQuiz } from "@workspace/api-client-react";
import { useRoute, useLocation } from "wouter";
import { Shell } from "@/components/layout/Shell";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, CheckCircle2, ChevronLeft, ChevronRight, Send,
  BookOpen, Lightbulb, Grid3x3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function QuizSession() {
  const [, params] = useRoute("/quiz/session/:id");
  const [, setLocation] = useLocation();
  const id = Number(params?.id);
  const { toast } = useToast();

  const { data: session, isLoading } = useGetQuizSession(id, {
    query: { enabled: !!id },
  });

  const submitQuiz = useSubmitQuiz();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { selectedOption?: string; theoryAnswer?: string }>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showGuide, setShowGuide] = useState<Record<number, boolean>>({});
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    if (session?.timedMinutes && session.status === "in_progress" && timeLeft === null) {
      const elapsed = Math.floor((Date.now() - new Date(session.createdAt).getTime()) / 1000);
      setTimeLeft(Math.max(0, session.timedMinutes * 60 - elapsed));
    }
  }, [session, timeLeft]);

  useEffect(() => {
    if (timeLeft === null || session?.status !== "in_progress") return;
    if (timeLeft <= 0) { handleComplete(); return; }
    const t = setInterval(() => setTimeLeft(p => (p !== null && p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [timeLeft, session]);

  const handleSelect = (qId: number, opt: string) =>
    setAnswers(p => ({ ...p, [qId]: { ...p[qId], selectedOption: opt } }));

  const handleTheory = (qId: number, text: string) =>
    setAnswers(p => ({ ...p, [qId]: { ...p[qId], theoryAnswer: text } }));

  const handleComplete = () => {
    if (!session) return;
    submitQuiz.mutate({
      sessionId: id,
      data: {
        answers: session.questions.map(q => ({
          questionId: q.id,
          selectedOption: answers[q.id]?.selectedOption || null,
          theoryAnswer: answers[q.id]?.theoryAnswer || null,
        })),
      },
    }, {
      onSuccess: r => {
        toast({ title: "Quiz submitted!", description: "Check your result below." });
        setLocation(`/quiz/result/${r.sessionId}`);
      },
      onError: () => toast({ title: "Submission failed", variant: "destructive" }),
    });
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  if (isLoading) return (
    <Shell>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-violet-500/40 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-sm text-white/40">Loading quiz session…</p>
        </div>
      </div>
    </Shell>
  );

  if (!session) return null;
  if (session.status === "completed") { setLocation(`/quiz/result/${id}`); return null; }

  const question = session.questions[currentIndex];
  if (!question) return null;

  const total = session.questions.length;
  const answered = session.questions.filter(q =>
    q.questionType === "objective" ? !!answers[q.id]?.selectedOption : !!answers[q.id]?.theoryAnswer
  ).length;
  const isLast = currentIndex === total - 1;
  const isLowTime = timeLeft !== null && timeLeft < 300;
  const isCurrentAnswered = question.questionType === "objective"
    ? !!answers[question.id]?.selectedOption
    : !!answers[question.id]?.theoryAnswer;
  const LABELS = ["A", "B", "C", "D", "E"];

  return (
    <Shell>
      <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">

        {/* Top bar */}
        <div className="flex-shrink-0 px-4 md:px-6 py-3 border-b border-white/8 bg-[#0a0a15]/90 backdrop-blur-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-4 w-4 text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{session.subjectName}</p>
              <p className="text-[10px] text-white/40 capitalize">Paper {session.paper} · {session.questionType}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 text-xs text-white/50">
              <span className="font-bold text-white">{answered}</span>/<span>{total}</span>
              <span className="ml-1">answered</span>
            </div>
            {timeLeft !== null && (
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border",
                isLowTime
                  ? "bg-red-500/15 text-red-400 border-red-500/25 animate-pulse"
                  : "bg-white/5 text-white border-white/10"
              )}>
                <Clock className="h-3.5 w-3.5" />{formatTime(timeLeft)}
              </div>
            )}
            <button
              onClick={() => setShowNav(v => !v)}
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center border transition-colors",
                showNav ? "bg-violet-500/20 border-violet-500/30 text-violet-400" : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"
              )}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-white/5 flex-shrink-0">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
            animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Question area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-8 max-w-3xl mx-auto w-full space-y-4 pb-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  {/* Question text */}
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-violet-400 bg-violet-500/15 px-2.5 py-1 rounded-lg border border-violet-500/20">
                          Q{currentIndex + 1} / {total}
                        </span>
                        {question.marks && (
                          <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-lg border border-white/8">
                            {question.marks} mark{question.marks > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      {isCurrentAnswered && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Answered
                        </span>
                      )}
                    </div>
                    <p className="text-white font-medium leading-relaxed">
                      <span className="text-white/35 mr-2 font-bold">{currentIndex + 1}.</span>
                      {question.questionText}
                    </p>
                  </div>

                  {/* Objective options */}
                  {question.questionType === "objective" && question.options && (
                    <div className="space-y-2.5">
                      {question.options.map((opt, i) => {
                        const label = LABELS[i];
                        const isSelected = answers[question.id]?.selectedOption === label;
                        return (
                          <motion.button
                            key={i}
                            whileTap={{ scale: 0.998 }}
                            onClick={() => handleSelect(question.id, label)}
                            className={cn(
                              "w-full text-left p-4 rounded-2xl border transition-all duration-150 flex items-start gap-4 group",
                              isSelected
                                ? "bg-violet-500/18 border-violet-500/50 shadow-[0_0_0_1px_rgba(139,92,246,0.3)]"
                                : "bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/18"
                            )}
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors",
                              isSelected ? "bg-violet-500 text-white" : "bg-white/8 text-white/50 group-hover:bg-white/12 group-hover:text-white/70"
                            )}>
                              {label}
                            </div>
                            <p className={cn(
                              "pt-1 text-sm leading-relaxed",
                              isSelected ? "text-white" : "text-white/65"
                            )}>
                              {opt}
                            </p>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {/* Theory answer */}
                  {question.questionType === "theory" && (
                    <div className="space-y-3">
                      <div className="glass-card p-5 space-y-3">
                        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Your Answer</p>
                        <Textarea
                          placeholder="Write your comprehensive answer here…"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/25 min-h-[180px] resize-y text-sm leading-relaxed"
                          value={answers[question.id]?.theoryAnswer || ""}
                          onChange={e => handleTheory(question.id, e.target.value)}
                          disabled={showGuide[question.id]}
                        />
                        {!showGuide[question.id] && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowGuide(p => ({ ...p, [question.id]: true }))}
                            disabled={!answers[question.id]?.theoryAnswer?.trim()}
                            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 bg-transparent text-xs"
                          >
                            <Lightbulb className="h-3.5 w-3.5 mr-1.5" />Check Marking Guide
                          </Button>
                        )}
                      </div>

                      <AnimatePresence>
                        {showGuide[question.id] && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-3"
                          >
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                              <CheckCircle2 className="h-4 w-4" />Marking Guide
                            </div>
                            <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{question.markingGuide}</p>
                            {question.explanation && (
                              <div className="pt-3 border-t border-emerald-500/15">
                                <p className="text-xs font-semibold text-white/30 uppercase tracking-wide mb-1">Additional Notes</p>
                                <p className="text-sm text-white/55 leading-relaxed">{question.explanation}</p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Side nav panel */}
          <AnimatePresence>
            {showNav && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 200 }}
                exit={{ opacity: 0, width: 0 }}
                className="hidden md:flex flex-col flex-shrink-0 border-l border-white/8 bg-[#0a0a15]/80 overflow-hidden"
              >
                <div className="p-4 border-b border-white/8">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">All Questions</p>
                  <p className="text-xs text-white/25 mt-0.5">{answered}/{total} answered</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  <div className="grid grid-cols-5 gap-1.5">
                    {session.questions.map((q, i) => {
                      const isAns = q.questionType === "objective"
                        ? !!answers[q.id]?.selectedOption
                        : !!answers[q.id]?.theoryAnswer;
                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentIndex(i)}
                          className={cn(
                            "w-8 h-8 rounded-lg text-[10px] font-bold transition-all",
                            i === currentIndex
                              ? "bg-violet-500 text-white scale-110 shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                              : isAns
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-white/5 text-white/35 hover:bg-white/10 border border-white/8"
                          )}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="p-3 border-t border-white/8 space-y-1.5">
                  {[
                    { cls: "bg-violet-500", label: "Current" },
                    { cls: "bg-emerald-500/20 border border-emerald-500/30", label: "Answered" },
                    { cls: "bg-white/5 border border-white/8", label: "Skipped" },
                  ].map(({ cls, label }) => (
                    <div key={label} className="flex items-center gap-2 text-[10px] text-white/30">
                      <div className={cn("w-3 h-3 rounded", cls)} />{label}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom nav */}
        <div className="flex-shrink-0 px-4 md:px-6 py-3 border-t border-white/8 bg-[#0a0a15]/90 backdrop-blur-sm flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
            disabled={currentIndex === 0}
            className="text-white/50 hover:text-white hover:bg-white/8 disabled:opacity-25 gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>

          {/* Question dots */}
          <div className="flex gap-1 overflow-x-auto max-w-[200px] md:max-w-sm">
            {session.questions.map((q, i) => {
              const isAns = q.questionType === "objective"
                ? !!answers[q.id]?.selectedOption
                : !!answers[q.id]?.theoryAnswer;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "w-6 h-6 md:w-7 md:h-7 rounded-md text-[9px] md:text-[10px] font-bold flex-shrink-0 transition-all",
                    i === currentIndex
                      ? "bg-violet-500 text-white scale-110"
                      : isAns
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/5 text-white/35 hover:bg-white/10"
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {!isLast ? (
            <Button
              size="sm"
              onClick={() => setCurrentIndex(p => Math.min(total - 1, p + 1))}
              className="bg-violet-600 hover:bg-violet-500 text-white gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleComplete}
              disabled={submitQuiz.isPending}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold min-w-[110px] gap-1.5"
            >
              {submitQuiz.isPending
                ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Submitting…</>
                : <><Send className="h-3.5 w-3.5" />Submit Quiz</>}
            </Button>
          )}
        </div>
      </div>
    </Shell>
  );
}
