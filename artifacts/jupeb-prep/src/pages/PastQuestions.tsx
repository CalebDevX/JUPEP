import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, BookOpen, Search, Eye, EyeOff, ChevronRight, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

const API = import.meta.env.VITE_API_URL || "";

const PAPER_LABELS: Record<string, string> = {
  "001": "1st In-Course",
  "002": "1st Semester",
  "003": "2nd In-Course",
  "004": "Mock Exam",
  "mock": "Mock Exam",
  "jupeb": "JUPEB Final",
};

const PAPER_COLORS: Record<string, string> = {
  "001": "#0891b2",
  "002": "#7c3aed",
  "003": "#059669",
  "004": "#d97706",
  "mock": "#d97706",
  "jupeb": "#dc2626",
};

interface PastPaper {
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  subjectColor: string;
  paper: string;
  examType: string | null;
  year: number;
  count: number;
  objectiveCount: number;
  theoryCount: number;
}

interface Question {
  id: number;
  questionText: string;
  questionType: string;
  options: Record<string, string> | null;
  correctOption: string | null;
  explanation: string | null;
  markingGuide: string | null;
  marks: number;
}

function paperLabel(p: PastPaper) {
  return PAPER_LABELS[p.examType || p.paper] || p.paper;
}
function paperColor(p: PastPaper) {
  return PAPER_COLORS[p.examType || p.paper] || "#8b5cf6";
}

function QuestionCard({ q, index }: { q: Question; index: number }) {
  const [revealed, setRevealed] = useState(false);
  const opts = q.options ? Object.keys(q.options).sort() : [];

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: q.questionType === "theory" ? "rgba(220,38,38,0.12)" : "rgba(8,145,178,0.12)",
            color: q.questionType === "theory" ? "#dc2626" : "#0891b2",
          }}
        >
          {q.questionType === "theory" ? "Theory" : "MCQ"}
        </span>
        {q.marks > 1 && (
          <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
            {q.marks} marks
          </span>
        )}
      </div>

      {/* Question text */}
      <p className="text-white/90 text-sm leading-relaxed">{q.questionText}</p>

      {/* MCQ options */}
      {q.questionType === "objective" && opts.length > 0 && (
        <div className="flex flex-col gap-2">
          {opts.map(letter => {
            const isCorrect = revealed && letter === q.correctOption;
            return (
              <div
                key={letter}
                className="flex items-center gap-3 border rounded-lg px-3 py-2 transition-colors"
                style={{
                  borderColor: isCorrect ? "rgba(22,163,74,0.5)" : "rgba(255,255,255,0.08)",
                  background: isCorrect ? "rgba(22,163,74,0.08)" : "transparent",
                }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: isCorrect ? "#16a34a" : "rgba(255,255,255,0.08)",
                    color: isCorrect ? "#fff" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {letter}
                </span>
                <span className={`text-sm flex-1 ${isCorrect ? "text-green-400" : "text-white/80"}`}>
                  {(q.options as any)[letter]}
                </span>
                {isCorrect && <CheckCircle2 size={16} className="text-green-500 shrink-0" />}
              </div>
            );
          })}
        </div>
      )}

      {/* Toggle answer */}
      <button
        onClick={() => setRevealed(v => !v)}
        className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors border border-white/10 rounded-lg px-3 py-1.5 self-start"
      >
        {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
        {revealed ? "Hide Answer" : "Show Answer"}
      </button>

      {/* Answer / explanation */}
      {revealed && (
        <div className="bg-green-500/8 border border-green-500/20 rounded-xl p-4 flex flex-col gap-2">
          {q.questionType === "objective" && q.correctOption && (
            <p className="text-green-400 text-xs font-bold uppercase tracking-wide">
              Correct Answer: {q.correctOption}
            </p>
          )}
          {q.questionType === "theory" && q.markingGuide && (
            <>
              <p className="text-green-400 text-xs font-bold uppercase tracking-wide">Marking Guide</p>
              <p className="text-white/80 text-sm leading-relaxed">{q.markingGuide}</p>
            </>
          )}
          {q.explanation && (
            <>
              <p className="text-green-400 text-xs font-bold uppercase tracking-wide mt-1">Explanation</p>
              <p className="text-white/75 text-sm leading-relaxed">{q.explanation}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function PastQuestions() {
  const [, setLocation] = useLocation();
  const [papers, setPapers] = useState<PastPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PastPaper | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const [search, setSearch] = useState("");
  const [revealAll, setRevealAll] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/questions/past-papers`)
      .then(r => r.json())
      .then(d => { setPapers(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) { setQuestions([]); return; }
    setLoadingQ(true);
    const params = new URLSearchParams({ subjectId: String(selected.subjectId), year: String(selected.year), limit: "200" });
    if (selected.examType) params.set("examType", selected.examType);
    else params.set("paper", selected.paper);
    fetch(`${API}/api/questions?${params}`)
      .then(r => r.json())
      .then(d => { setQuestions(Array.isArray(d) ? d : []); setLoadingQ(false); })
      .catch(() => setLoadingQ(false));
  }, [selected]);

  const grouped = useMemo(() => {
    const filtered = search.trim()
      ? papers.filter(p =>
          p.subjectName.toLowerCase().includes(search.toLowerCase()) ||
          paperLabel(p).toLowerCase().includes(search.toLowerCase())
        )
      : papers;
    const map = new Map<number, { subject: PastPaper; papers: PastPaper[] }>();
    for (const p of filtered) {
      if (!map.has(p.subjectId)) map.set(p.subjectId, { subject: p, papers: [] });
      map.get(p.subjectId)!.papers.push(p);
    }
    return [...map.values()];
  }, [papers, search]);

  // ── Questions view ──────────────────────────────────────────────────────────
  if (selected) {
    const color = paperColor(selected);
    return (
      <div className="min-h-screen bg-[#0d0d12] text-white flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[#0d0d12]/95 backdrop-blur border-b border-white/8 px-4 md:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft size={18} /> Back
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-white truncate">{selected.subjectName}</h1>
            <p className="text-xs text-white/40">
              {paperLabel(selected)} · {selected.year}/{selected.year + 1} · {selected.count} questions
            </p>
          </div>
          <button
            onClick={() => setRevealAll(v => !v)}
            className="flex items-center gap-1.5 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            {revealAll ? <EyeOff size={13} /> : <Eye size={13} />}
            {revealAll ? "Hide all" : "Reveal all"}
          </button>
        </div>

        <div className="max-w-3xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-3">
          {loadingQ ? (
            <div className="flex items-center justify-center py-20 gap-3 text-white/40">
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              Loading questions…
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-16 text-white/30">No questions found.</div>
          ) : (
            questions.map((q, i) => (
              <div key={q.id} className={revealAll ? "pq-reveal-all" : ""}>
                <QuestionCard q={q} index={i} />
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ── Papers list view ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0d0d12] text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d0d12]/95 backdrop-blur border-b border-white/8 px-4 md:px-8 py-4 flex items-center gap-4">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm"
        >
          <ChevronLeft size={18} /> Back
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <BookOpen size={18} className="text-violet-400" /> Past Questions
          </h1>
          <p className="text-xs text-white/40">Browse and study previous JUPEB exam papers</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-6">
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search by subject or paper type…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-white/40">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            Loading papers…
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            {search ? "No results found." : "No past questions uploaded yet."}
          </div>
        ) : (
          grouped.map(({ subject, papers: subPapers }) => (
            <div key={subject.subjectId} className="flex flex-col gap-2">
              {/* Subject heading */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: subject.subjectColor || "#8b5cf6" }}
                />
                <span className="text-sm font-bold text-white">{subject.subjectName}</span>
                <span className="text-xs text-white/30 font-mono">{subject.subjectCode}</span>
              </div>

              {/* Paper cards */}
              {subPapers.map(p => (
                <button
                  key={`${p.subjectId}-${p.paper}-${p.year}`}
                  onClick={() => setSelected(p)}
                  className="w-full flex items-center gap-0 bg-white/4 hover:bg-white/7 border border-white/8 hover:border-white/15 rounded-xl overflow-hidden transition-all text-left group"
                >
                  <div className="w-1 self-stretch shrink-0" style={{ background: paperColor(p) }} />
                  <div className="flex-1 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{paperLabel(p)}</span>
                      <span className="text-xs text-white/40">{p.year}/{p.year + 1}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      {p.objectiveCount > 0 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">
                          {p.objectiveCount} MCQ
                        </span>
                      )}
                      {p.theoryCount > 0 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                          {p.theoryCount} Theory
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-white/25 group-hover:text-white/50 transition-colors mr-3" />
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
