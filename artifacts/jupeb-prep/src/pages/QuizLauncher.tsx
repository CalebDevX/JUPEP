import { useState } from "react";
import { useListSubjects, useStartQuiz } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";
import { Loader2, PlayCircle, Timer, BookOpen, FileText, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function QuizLauncher() {
  const [, setLocation] = useLocation();
  const { data: subjects, isLoading: isLoadingSubjects } = useListSubjects();
  const startQuiz = useStartQuiz();

  const [subjectId, setSubjectId] = useState<string>("");
  const [paper, setPaper] = useState<string>("001");
  const [type, setType] = useState<string>("objective");
  const [count, setCount] = useState<string>("20");
  const [isTimed, setIsTimed] = useState<boolean>(true);

  const isMock = paper === "mock";
  const timerLabel = isMock || type === "theory" ? "2 Hours" : "1 Hour";

  const handleStart = () => {
    if (!subjectId) return;
    const timedMinutes = isTimed
      ? (isMock || type === "theory" ? 120 : 60)
      : undefined;

    startQuiz.mutate({
      data: {
        subjectId: Number(subjectId),
        paper: paper as any,
        questionType: isMock ? "mixed" : type as any,
        questionCount: Number(count),
        timedMinutes,
      }
    }, {
      onSuccess: (session) => setLocation(`/quiz/session/${session.id}`)
    });
  };

  const options = [
    { label: "Subject", content: (
      <Select value={subjectId} onValueChange={setSubjectId} disabled={isLoadingSubjects}>
        <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white">
          <SelectValue placeholder="Choose a subject…" />
        </SelectTrigger>
        <SelectContent className="bg-[#1e1e28] border-white/10">
          {subjects?.map(s => (
            <SelectItem key={s.id} value={s.id.toString()} className="text-white">{s.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    )},
    { label: "Paper", content: (
      <Select value={paper} onValueChange={setPaper}>
        <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#1e1e28] border-white/10">
          <SelectItem value="001" className="text-white">Paper 001 — 1st Incourse</SelectItem>
          <SelectItem value="002" className="text-white">Paper 002 — 1st Semester</SelectItem>
          <SelectItem value="003" className="text-white">Paper 003 — 2nd Incourse</SelectItem>
          <SelectItem value="004" className="text-white">Paper 004 — Mock Exam</SelectItem>
          <SelectItem value="mock" className="text-white">Full Mock (Mixed Papers)</SelectItem>
        </SelectContent>
      </Select>
    )},
  ];

  return (
    <Shell>
      <div className="p-6 max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-orange-500/15 flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
            <Zap className="h-8 w-8 text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold font-serif text-white">Launch Quiz Session</h1>
          <p className="text-white/50 text-sm mt-2 max-w-sm mx-auto">
            Simulate actual JUPEB exam conditions. Configure your session below.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {options.map(opt => (
              <div key={opt.label} className="space-y-1.5">
                <Label className="text-xs text-white/50 uppercase tracking-wider">{opt.label}</Label>
                {opt.content}
              </div>
            ))}

            {!isMock && (
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

            {!isMock && type === "objective" && (
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50 uppercase tracking-wider">Number of Questions</Label>
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
              </div>
            )}
          </div>

          {/* Timed mode toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Timer className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Timed Mode</p>
                <p className="text-xs text-white/40">Countdown timer · {timerLabel}</p>
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
                  <p className="text-white font-bold text-sm">{subjects?.find(s => s.id === Number(subjectId))?.name.split("-")[0]}</p>
                  <p className="text-[10px] text-white/40">Subject</p>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{isMock ? "Mixed" : type === "objective" ? count : "All"}</p>
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

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 grid grid-cols-3 gap-3"
        >
          {[
            { icon: Target, text: "Real past questions from JUPEB papers" },
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
