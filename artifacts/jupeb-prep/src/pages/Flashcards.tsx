import { useState, useEffect, useCallback } from "react";
import { Shell } from "@/components/layout/Shell";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, ChevronRight, ChevronLeft, RotateCcw, Check, X,
  Zap, BookOpen, Trophy, ArrowLeft, Shuffle, Eye,
  EyeOff, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.VITE_API_URL || "";

interface Question {
  id: number; subjectId: number; subjectName: string | null;
  paper: string; year: number; questionType: string;
  questionText: string; options: string[] | null;
  correctOption: string | null; explanation: string | null;
  markingGuide: string | null; marks: number | null;
}

interface Subject { id: number; name: string; color: string; }

const PAPER_OPTS = [
  { value: "all", label: "All Papers" },
  { value: "001", label: "001 — 1st Incourse" },
  { value: "002", label: "002 — 1st Semester" },
  { value: "003", label: "003 — 2nd Incourse" },
  { value: "004", label: "004 — Mock Exam" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function FlipCard({ question, onKnow, onReview, autoFlip }: {
  question: Question;
  onKnow: () => void;
  onReview: () => void;
  autoFlip?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => { setFlipped(false); }, [question.id]);

  useEffect(() => {
    if (!autoFlip) return;
    const t = setTimeout(() => setFlipped(true), 4000);
    return () => clearTimeout(t);
  }, [question.id, autoFlip]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlipped(v => !v); }
      if (e.key === "ArrowRight" && flipped) onKnow();
      if (e.key === "ArrowLeft" && flipped) onReview();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [flipped, onKnow, onReview]);

  const correctAnswer = question.questionType === "objective" && question.correctOption && question.options
    ? (() => {
        const idx = ["A","B","C","D"].indexOf(question.correctOption);
        return idx >= 0 ? `${question.correctOption}. ${question.options[idx]}` : question.correctOption;
      })()
    : null;

  return (
    <div className="w-full max-w-lg mx-auto" style={{ perspective: 1200 }}>
      <motion.div
        className="relative w-full cursor-pointer"
        style={{ transformStyle: "preserve-3d", minHeight: 280 }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        onClick={() => setFlipped(v => !v)}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-3xl border border-white/10 bg-white/[0.04] p-6 flex flex-col justify-between select-none"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex items-center justify-between text-[10px] text-white/30">
            <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/8">{question.questionType === "objective" ? "MCQ" : "Theory"}</span>
            <span>{question.year} · Paper {question.paper}</span>
          </div>
          <div className="flex-1 flex items-center justify-center py-6">
            <p className="text-base md:text-lg text-white/90 text-center leading-relaxed font-medium">
              {question.questionText}
            </p>
          </div>
          {question.questionType === "objective" && question.options && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {question.options.map((opt, i) => (
                <div key={i} className="text-xs text-white/50 bg-white/4 border border-white/6 rounded-xl px-3 py-2 flex items-start gap-1.5">
                  <span className="font-bold text-white/30 flex-shrink-0">{["A","B","C","D"][i]}.</span>
                  <span>{opt}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-[10px] text-white/25 flex items-center gap-1">
              <Eye className="h-3 w-3" /> Tap to reveal answer
            </span>
            <div className="h-px flex-1 bg-white/8" />
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-3xl border border-emerald-500/25 bg-emerald-500/5 p-6 flex flex-col justify-between select-none"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex items-center justify-between text-[10px] text-white/30">
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">Answer</span>
            <EyeOff className="h-3 w-3" />
          </div>

          <div className="flex-1 flex flex-col justify-center gap-4 py-4">
            {correctAnswer && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4 text-center">
                <p className="text-xs text-emerald-400/70 uppercase tracking-wider mb-1">Correct Answer</p>
                <p className="text-lg font-bold text-emerald-300">{correctAnswer}</p>
              </div>
            )}

            {question.explanation && (
              <div className="bg-white/4 border border-white/8 rounded-2xl p-4">
                <p className="text-[10px] text-amber-400/80 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Info className="h-3 w-3" /> Explanation
                </p>
                <p className="text-sm text-white/70 leading-relaxed">{question.explanation}</p>
              </div>
            )}

            {!correctAnswer && !question.explanation && question.markingGuide && (
              <div className="bg-white/4 border border-white/8 rounded-2xl p-4">
                <p className="text-[10px] text-emerald-400/80 uppercase tracking-wider mb-1.5">Marking Guide</p>
                <p className="text-sm text-white/70 leading-relaxed line-clamp-6">{question.markingGuide}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-2">
            <button onClick={e => { e.stopPropagation(); onReview(); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/15 border border-red-500/25 text-red-400 hover:bg-red-500/25 transition-colors font-semibold text-sm">
              <X className="h-4 w-4" /> Review Again
            </button>
            <button onClick={e => { e.stopPropagation(); onKnow(); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25 transition-colors font-semibold text-sm">
              <Check className="h-4 w-4" /> Got It!
            </button>
          </div>
        </div>
      </motion.div>

      <p className="text-center text-[11px] text-white/20 mt-3">
        Space/Enter to flip · ← Review · → Got It (after flipping)
      </p>
    </div>
  );
}

export default function Flashcards() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedPaper, setSelectedPaper] = useState("all");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [deck, setDeck] = useState<Question[]>([]);
  const [reviewPile, setReviewPile] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [showingReview, setShowingReview] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/subjects`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setSubjects(Array.isArray(d) ? d : []));
  }, []);

  const loadCards = async () => {
    if (!selectedSubject) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ subjectId: String(selectedSubject), questionType: "objective", limit: "100" });
      if (selectedPaper !== "all") params.set("paper", selectedPaper);
      const res = await fetch(`${BASE}/api/questions?${params}`);
      if (res.ok) {
        const data: Question[] = await res.json();
        const shuffled = shuffle(data);
        setQuestions(shuffled);
        setDeck(shuffled);
        setReviewPile([]);
        setCurrent(0);
        setKnownCount(0);
        setDone(false);
        setShowingReview(false);
        setStarted(true);
      }
    } finally { setLoading(false); }
  };

  const handleKnow = useCallback(() => {
    setKnownCount(k => k + 1);
    if (current + 1 >= deck.length) {
      if (reviewPile.length === 0) setDone(true);
      else { setDone(true); }
    } else { setCurrent(c => c + 1); }
  }, [current, deck.length, reviewPile.length]);

  const handleReview = useCallback(() => {
    setReviewPile(r => [...r, deck[current]]);
    if (current + 1 >= deck.length) {
      setDone(true);
    } else { setCurrent(c => c + 1); }
  }, [current, deck]);

  const restartWithReview = () => {
    const newDeck = shuffle(reviewPile);
    setDeck(newDeck);
    setReviewPile([]);
    setCurrent(0);
    setKnownCount(0);
    setDone(false);
    setShowingReview(true);
  };

  const restartAll = () => {
    const shuffled = shuffle(questions);
    setDeck(shuffled);
    setReviewPile([]);
    setCurrent(0);
    setKnownCount(0);
    setDone(false);
    setShowingReview(false);
  };

  if (!started) {
    return (
      <Shell>
        <div className="p-4 md:p-8 max-w-2xl mx-auto w-full space-y-6">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <Layers className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-serif text-white">Flashcards</h1>
                <p className="text-white/40 text-sm">Flip through questions to test your recall.</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs text-white/50 font-semibold uppercase tracking-wider">Select Subject</label>
              <Select
                value={selectedSubject ? String(selectedSubject) : ""}
                onValueChange={v => setSelectedSubject(Number(v))}
              >
                <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Choose a subject…" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e28] border-white/10">
                  {subjects.map(s => (
                    <SelectItem key={s.id} value={String(s.id)} className="text-white">{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/50 font-semibold uppercase tracking-wider">Exam Paper</label>
              <Select value={selectedPaper} onValueChange={setSelectedPaper}>
                <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e28] border-white/10">
                  {PAPER_OPTS.map(p => (
                    <SelectItem key={p.value} value={p.value} className="text-white">{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={loadCards}
              disabled={!selectedSubject || loading}
              className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-2xl"
            >
              {loading ? (
                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Loading cards…</span>
              ) : (
                <><Layers className="h-4 w-4 mr-2" />Start Flashcards</>
              )}
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: Zap, label: "Tap to flip", desc: "See answer" },
              { icon: Check, label: "Got It", desc: "Move to done" },
              { icon: RotateCcw, label: "Review Again", desc: "Revisit later" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="glass-card p-4">
                <Icon className="h-5 w-5 text-violet-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-white/70">{label}</p>
                <p className="text-[10px] text-white/35 mt-0.5">{desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </Shell>
    );
  }

  if (done) {
    const total = deck.length + (showingReview ? 0 : reviewPile.length);
    const known = knownCount;
    const pct = Math.round((known / (deck.length || 1)) * 100);
    return (
      <Shell>
        <div className="p-4 md:p-8 max-w-lg mx-auto w-full space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center space-y-4">
            <div className="text-6xl mb-2">{pct >= 80 ? "🏆" : pct >= 60 ? "⚡" : "📚"}</div>
            <h2 className="text-2xl font-bold font-serif text-white">
              {pct >= 80 ? "Excellent!" : pct >= 60 ? "Good Work!" : "Keep Practising!"}
            </h2>
            <div className="flex items-center justify-center gap-6 py-4">
              <div>
                <p className="text-3xl font-black text-emerald-400">{known}</p>
                <p className="text-xs text-white/40">Got It</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <p className="text-3xl font-black text-amber-400">{reviewPile.length}</p>
                <p className="text-xs text-white/40">Review Again</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <p className="text-3xl font-black text-white">{pct}%</p>
                <p className="text-xs text-white/40">Recall Rate</p>
              </div>
            </div>

            <div className="h-2 rounded-full bg-white/8 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn("h-full rounded-full", pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500")}
              />
            </div>

            <div className="flex gap-3 pt-2">
              {reviewPile.length > 0 && (
                <Button onClick={restartWithReview}
                  className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-2xl">
                  <RotateCcw className="h-4 w-4 mr-2" />Review {reviewPile.length} Again
                </Button>
              )}
              <Button onClick={restartAll}
                className="flex-1 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl">
                <Shuffle className="h-4 w-4 mr-2" />Shuffle All
              </Button>
            </div>
            <button onClick={() => setStarted(false)}
              className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1 mx-auto">
              <ArrowLeft className="h-3 w-3" /> Change Subject
            </button>
          </motion.div>
        </div>
      </Shell>
    );
  }

  const card = deck[current];
  const progress = ((current) / deck.length) * 100;

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-lg mx-auto w-full space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setStarted(false)}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 transition-colors flex-shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-white/50 mb-1.5">
              <span>{showingReview ? "🔁 Review Round" : "📚 Flashcards"}</span>
              <span className="font-mono">{current + 1} / {deck.length}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                style={{ width: `${progress}%` }}
                layout
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs text-emerald-400 font-bold">{knownCount} ✓</span>
            {reviewPile.length > 0 && <span className="text-xs text-amber-400/70">{reviewPile.length} ↩</span>}
          </div>
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <FlipCard question={card} onKnow={handleKnow} onReview={handleReview} />
          </motion.div>
        </AnimatePresence>

        {/* Nav */}
        <div className="flex items-center justify-center gap-3">
          <button disabled={current === 0}
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center text-white/50 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrent(c => Math.min(deck.length - 1, c + 1))}
            disabled={current >= deck.length - 1}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center text-white/50 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Shell>
  );
}
