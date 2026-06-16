import { useState, useEffect, useRef } from "react";
import { useListSubjects } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import {
  GraduationCap, PlayCircle, Clock, Loader2, RotateCcw,
  Volume2, ChevronRight, Sparkles, Square, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isActivated } from "@/lib/access";
import { PaywallGate } from "@/components/PaywallGate";
import { useReadAloud } from "@/hooks/useReadAloud";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const WORDS_PER_MIN = 180;

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const PAPER_LABELS: Record<string, string> = {
  "001": "1st In-Course Exam",
  "002": "1st Semester Exam",
  "003": "2nd In-Course Exam",
  "mock": "Mock Exam",
};

const SUGGESTED_TOPICS: Record<string, string[]> = {
  default: [
    "Introduction & Overview",
    "Key Concepts",
    "Historical Background",
    "Analysis & Application",
    "Exam Preparation Tips",
  ],
};

export default function Class() {
  const { data: subjectsRaw } = useListSubjects();
  const subjects = Array.isArray(subjectsRaw) ? subjectsRaw : [];

  const [subjectId, setSubjectId] = useState("");
  const [paper, setPaper]         = useState("001");
  const [topic, setTopic]         = useState("");

  const [streaming, setStreaming] = useState(false);
  const [content, setContent]     = useState("");
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState("");

  // Timed reading session
  const [readingTime, setReadingTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft]       = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const abortRef   = useRef<AbortController | null>(null);

  const { state: ttsState, speak, stop: stopTts } = useReadAloud();

  // Countdown timer
  useEffect(() => {
    if (!timerRunning || timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0) setTimerRunning(false);
      return;
    }
    const t = setInterval(() => setTimeLeft(p => (p !== null && p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [timerRunning, timeLeft]);

  const subjectName = subjects.find(s => s.id === Number(subjectId))?.name || "";
  const timerPercent = readingTime && timeLeft !== null
    ? ((readingTime - timeLeft) / readingTime) * 100
    : 0;
  const isLowTime = timeLeft !== null && timeLeft < 60;

  const handleStartLecture = async () => {
    if (!subjectId || !topic.trim()) return;

    setContent("");
    setDone(false);
    setError("");
    setStreaming(true);
    setReadingTime(null);
    setTimeLeft(null);
    setTimerRunning(false);
    if (ttsState === "playing") stopTts();

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const prompt = `You are an expert JUPEB teacher delivering a live lecture to a Nigerian foundation-year student preparing for ${PAPER_LABELS[paper] || "JUPEB exams"}.

Subject: ${subjectName}
Topic: ${topic}

Deliver a comprehensive, well-structured lecture in the following format:

📚 LECTURE: ${topic.toUpperCase()}
Subject: ${subjectName}  |  Paper: ${PAPER_LABELS[paper] || paper}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INTRODUCTION
[Introduce the topic — what it is, why it matters, how it appears in JUPEB exams]

SECTION 1: Core Concepts
[Explain the key ideas clearly. Use numbered points. Give Nigerian/relatable examples where possible.]

SECTION 2: Detailed Content
[Go deeper into the main subject matter. Use bullet points, examples, and comparisons.]

SECTION 3: Exam Application
[Show how this topic appears in exam questions. Discuss what examiners look for.]

KEY POINTS TO REMEMBER
• [Point 1]
• [Point 2]
• [Point 3]
• [Point 4]
• [Point 5]

COMMON EXAM MISTAKES
• [Mistake 1] — and how to avoid it
• [Mistake 2] — and how to avoid it

PRACTICE QUESTIONS
1. [Exam-style objective or theory question on this topic]
2. [A different angle on the same topic]
3. [A harder, analysis-level question]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
End of Lecture. Review the key points, then attempt the practice questions before starting a quiz.

Write in clear, confident Nigerian academic English. Aim for 700–900 words. Be thorough — this is a complete lesson.`;

    try {
      const res = await fetch(`${BASE}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          stream: true,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error("Failed to start lecture");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText  = "";

      while (true) {
        const { done: d, value } = await reader.read();
        if (d) break;

        const lines = decoder.decode(value, { stream: true }).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") break;
          try {
            const parsed = JSON.parse(raw);
            if (parsed.chunk) {
              fullText += parsed.chunk;
              setContent(fullText);
              setTimeout(() => {
                contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight, behavior: "smooth" });
              }, 30);
            }
          } catch {}
        }
      }

      // Set reading timer based on word count
      const words    = countWords(fullText);
      const readSecs = Math.max(120, Math.ceil((words / WORDS_PER_MIN) * 60));
      setReadingTime(readSecs);
      setTimeLeft(readSecs);
      setTimerRunning(true);
      setDone(true);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError("Failed to load lecture. Please try again.");
      }
    } finally {
      setStreaming(false);
    }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    if (ttsState === "playing") stopTts();
    setContent("");
    setDone(false);
    setStreaming(false);
    setTimeLeft(null);
    setTimerRunning(false);
    setReadingTime(null);
    setError("");
  };

  if (!isActivated()) {
    return (
      <Shell>
        <PaywallGate feature="class" />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="p-4 md:p-6 max-w-4xl mx-auto w-full space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-emerald-400" />
              </div>
              Class
            </h1>
            <p className="text-white/40 text-sm mt-1 ml-[52px]">AI-powered live lectures — learn before you quiz</p>
          </div>

          {/* Reading timer chip */}
          {done && timeLeft !== null && (
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-sm font-bold flex-shrink-0",
              isLowTime
                ? "bg-red-500/15 text-red-400 border-red-500/25 animate-pulse"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
            )}>
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)} left to review
            </div>
          )}
        </div>

        {/* ── Lecture Setup Card (shown when not streaming or done) ── */}
        {!streaming && !done && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 md:p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">Start a New Lecture</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50 uppercase tracking-wider">Subject</Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Choose a subject…" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1e28] border-white/10">
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()} className="text-white">{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-white/50 uppercase tracking-wider">Paper / Exam</Label>
                <Select value={paper} onValueChange={setPaper}>
                  <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1e28] border-white/10">
                    {Object.entries(PAPER_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v} className="text-white">{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-white/50 uppercase tracking-wider">Topic / Chapter</Label>
              <Input
                placeholder="e.g. Dramatic irony in Things Fall Apart"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleStartLecture()}
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>

            {/* Quick topic chips */}
            {subjectId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap gap-2"
              >
                <span className="text-[10px] text-white/30 w-full">Quick topics:</span>
                {SUGGESTED_TOPICS.default.map(t => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/50 hover:bg-violet-500/15 hover:border-violet-500/30 hover:text-violet-300 transition-all"
                  >
                    {t}
                  </button>
                ))}
              </motion.div>
            )}

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
            )}

            <Button
              onClick={handleStartLecture}
              disabled={!subjectId || !topic.trim()}
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50"
            >
              <PlayCircle className="h-5 w-5 mr-2" />
              Begin Lecture
            </Button>

            <div className="grid grid-cols-3 gap-3">
              {[
                { emoji: "📡", text: "Real-time AI lecture" },
                { emoji: "⏱️", text: "Auto-timed reading session" },
                { emoji: "📝", text: "Practice questions included" },
              ].map((t, i) => (
                <div key={i} className="flex flex-col items-center text-center p-3 rounded-xl bg-white/2 border border-white/5">
                  <span className="text-lg mb-1">{t.emoji}</span>
                  <p className="text-[10px] text-white/30 leading-relaxed">{t.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Live Lecture View ── */}
        {(streaming || done) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Lecture top bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-bold flex-shrink-0">
                  {subjectName}
                </span>
                <ChevronRight className="h-3 w-3 text-white/20 flex-shrink-0" />
                <span className="text-sm text-white/60 font-medium truncate">{topic}</span>
                {streaming && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400 text-[11px] font-bold flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    LIVE
                  </div>
                )}
                {done && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/30 text-[11px]">
                    {PAPER_LABELS[paper]}
                  </span>
                )}
              </div>

              {done && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => ttsState === "playing" ? stopTts() : speak(content)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-amber-500/10 hover:border-amber-500/20 hover:text-amber-300 transition-all"
                  >
                    {ttsState === "playing"
                      ? <><Square className="h-3 w-3" /> Stop</>
                      : <><Volume2 className="h-3.5 w-3.5" /> Read Aloud</>
                    }
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-white/10 transition-all"
                  >
                    <RotateCcw className="h-3 w-3" /> New Lecture
                  </button>
                </div>
              )}
            </div>

            {/* Reading progress bar */}
            {done && readingTime && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-white/30">
                  <span>Reading session</span>
                  <span>
                    {timeLeft !== null ? formatTime(timeLeft) : "0:00"} remaining
                    {readingTime && ` of ${formatTime(readingTime)}`}
                  </span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full transition-colors", isLowTime ? "bg-red-500" : "bg-emerald-500")}
                    animate={{ width: `${timerPercent}%` }}
                    transition={{ duration: 0.8, ease: "linear" }}
                  />
                </div>
                {timeLeft === 0 && (
                  <p className="text-[11px] text-amber-400 text-center font-medium">
                    ⏰ Reading time complete — take the quiz to test yourself!
                  </p>
                )}
              </div>
            )}

            {/* Lecture content panel */}
            <div
              ref={contentRef}
              className="glass-card overflow-y-auto"
              style={{ maxHeight: "62vh" }}
            >
              {content ? (
                <div className="p-5 md:p-8">
                  <pre className="whitespace-pre-wrap text-white/85 text-sm leading-[1.85] font-sans">
                    {content}
                    {streaming && (
                      <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-0.5 rounded-sm align-middle" />
                    )}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/30">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm">LexBot is preparing your lecture…</span>
                </div>
              )}
            </div>

            {/* CTA after lecture completes */}
            {done && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Ready to test yourself?</p>
                    <p className="text-xs text-white/40">Take a quiz on {topic} to lock in what you learned.</p>
                  </div>
                </div>
                <a href="/quiz">
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl whitespace-nowrap">
                    Start Quiz →
                  </Button>
                </a>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </Shell>
  );
}
