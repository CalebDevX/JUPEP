import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { XCircle, CheckCircle2, Filter, BookOpen, RefreshCw, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useListSubjects } from "@workspace/api-client-react";

const BASE = import.meta.env.VITE_API_URL || "";

function getProfile() {
  try { return JSON.parse(localStorage.getItem("jupeb_profile") || "null"); } catch { return null; }
}

function getToken() {
  return localStorage.getItem("jupeb_session_token") || "";
}

const PAPER_LABELS: Record<string, string> = {
  "001": "1st In-Course", "002": "1st Semester",
  "003": "2nd In-Course", "004": "2nd Semester", "mock": "Mock",
};

interface WrongAnswer {
  id: number; questionId: number; subjectId: number; paper: string;
  selectedOption: string | null; attemptedAt: string; revisedAt: string | null;
  questionText: string; options: string[]; correctOption: string;
  explanation: string | null; subjectName: string;
}

export default function WrongAnswers() {
  const [items, setItems] = useState<WrongAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [paperFilter, setPaperFilter] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [marking, setMarking] = useState<number | null>(null);

  const { data: subjectsRaw } = useListSubjects();
  const subjects = Array.isArray(subjectsRaw) ? subjectsRaw : [];
  const profile = getProfile();

  async function loadItems() {
    if (!profile?.phone) return;
    setLoading(true);
    const params = new URLSearchParams({ phone: profile.phone });
    if (subjectFilter !== "all") params.set("subjectId", subjectFilter);
    if (paperFilter !== "all") params.set("paper", paperFilter);
    const r = await fetch(`${BASE}/api/student/wrong-answers?${params}`, {
      headers: { "x-session-token": getToken() },
    });
    if (r.ok) setItems(await r.json());
    setLoading(false);
  }

  useEffect(() => { loadItems(); }, [subjectFilter, paperFilter]);

  async function markRevised(questionId: number) {
    if (!profile?.phone) return;
    setMarking(questionId);
    await fetch(`${BASE}/api/student/wrong-answers/${questionId}/mark-revised`, {
      method: "POST", headers: { "Content-Type": "application/json", "x-session-token": getToken() },
      body: JSON.stringify({ phone: profile.phone }),
    });
    setItems(prev => prev.filter(i => i.questionId !== questionId));
    setMarking(null);
  }

  const grouped = items.reduce<Record<string, WrongAnswer[]>>((acc, item) => {
    const key = item.subjectName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <Shell>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-red-500/15 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Wrong Answers Bank</h1>
              <p className="text-sm text-white/50">{items.length} question{items.length !== 1 ? "s" : ""} pending revision</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="bg-white/[0.06] border border-white/10 text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-white/20"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s: any) => (
              <option key={s.id} value={String(s.id)}>{s.name}</option>
            ))}
          </select>
          <select
            value={paperFilter}
            onChange={e => setPaperFilter(e.target.value)}
            className="bg-white/[0.06] border border-white/10 text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-white/20"
          >
            <option value="all">All Papers</option>
            {Object.entries(PAPER_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <button
            onClick={loadItems}
            className="ml-auto flex items-center gap-2 bg-white/[0.06] border border-white/10 text-white/70 text-sm rounded-xl px-3 py-2 hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-white/40" />
          </div>
        ) : items.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 bg-white/[0.03] rounded-2xl border border-white/[0.06]">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-white font-semibold text-lg">All caught up!</p>
            <p className="text-white/40 text-sm mt-1">No wrong answers pending revision for this filter.</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([subjectName, group]) => (
              <div key={subjectName}>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-semibold text-violet-300">{subjectName}</span>
                  <span className="text-xs bg-red-500/15 text-red-300 border border-red-500/20 rounded-full px-2 py-0.5">{group.length}</span>
                </div>
                <div className="space-y-3">
                  {group.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden"
                    >
                      <button
                        className="w-full text-left px-4 py-3.5 flex items-start gap-3"
                        onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                      >
                        <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <XCircle className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/90 text-sm leading-snug line-clamp-2">{item.questionText}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs bg-white/[0.08] text-white/50 rounded-md px-1.5 py-0.5">
                              {PAPER_LABELS[item.paper] ?? item.paper}
                            </span>
                            <span className="text-xs text-white/30">
                              {new Date(item.attemptedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {expanded === item.id ? (
                          <ChevronUp className="w-4 h-4 text-white/30 flex-shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0 mt-1" />
                        )}
                      </button>

                      {expanded === item.id && (
                        <div className="px-4 pb-4 space-y-3 border-t border-white/[0.06] pt-3">
                          {/* Options */}
                          {Array.isArray(item.options) && item.options.length > 0 && (
                            <div className="space-y-2">
                              {item.options.map((opt, idx) => {
                                const letter = String.fromCharCode(65 + idx);
                                const isCorrect = letter === item.correctOption;
                                const wasSelected = letter === item.selectedOption;
                                return (
                                  <div key={idx} className={cn(
                                    "flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm border",
                                    isCorrect ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" :
                                      wasSelected ? "bg-red-500/10 border-red-500/20 text-red-300" :
                                        "bg-white/[0.03] border-white/[0.06] text-white/50"
                                  )}>
                                    <span className="font-bold flex-shrink-0">{letter}.</span>
                                    <span>{opt}</span>
                                    {isCorrect && <CheckCircle2 className="w-4 h-4 ml-auto flex-shrink-0 mt-0.5" />}
                                    {wasSelected && !isCorrect && <XCircle className="w-4 h-4 ml-auto flex-shrink-0 mt-0.5" />}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Explanation */}
                          {item.explanation && (
                            <div className="bg-amber-500/8 border border-amber-500/15 rounded-xl p-3">
                              <p className="text-xs font-semibold text-amber-300 mb-1">Explanation</p>
                              <p className="text-sm text-white/70 leading-relaxed">{item.explanation}</p>
                            </div>
                          )}

                          {/* Mark revised */}
                          <button
                            onClick={() => markRevised(item.questionId)}
                            disabled={marking === item.questionId}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-300 text-sm font-semibold rounded-xl py-2.5 transition-colors disabled:opacity-50"
                          >
                            {marking === item.questionId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            Mark as Revised
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
