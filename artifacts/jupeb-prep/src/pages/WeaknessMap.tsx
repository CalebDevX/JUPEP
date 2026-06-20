import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingDown, Loader2, Target, BookOpen, AlertTriangle } from "lucide-react";
import { useListSubjects } from "@workspace/api-client-react";
import { Link } from "wouter";

const BASE = import.meta.env.VITE_API_URL || "";

function getProfile() {
  try { return JSON.parse(localStorage.getItem("jupeb_profile") || "null"); } catch { return null; }
}

const PAPER_LABELS: Record<string, string> = {
  "001": "1st In-Course", "002": "1st Semester",
  "003": "2nd In-Course", "004": "Mock Exam",
};

function strengthColor(pct: number) {
  if (pct >= 70) return { bar: "bg-emerald-500", text: "text-emerald-400", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20", label: "Strong" };
  if (pct >= 40) return { bar: "bg-amber-500", text: "text-amber-400", badge: "bg-amber-500/15 text-amber-300 border-amber-500/20", label: "Okay" };
  return { bar: "bg-red-500", text: "text-red-400", badge: "bg-red-500/15 text-red-300 border-red-500/20", label: "Weak" };
}

interface WeaknessEntry {
  subjectId: number; subjectName: string; paper: string;
  total: number; correct: number; wrong: number; pct: number;
}

export default function WeaknessMap() {
  const [entries, setEntries] = useState<WeaknessEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState("all");

  const { data: subjectsRaw } = useListSubjects();
  const subjects = Array.isArray(subjectsRaw) ? subjectsRaw : [];
  const profile = getProfile();

  useEffect(() => {
    async function load() {
      if (!profile?.phone) { setLoading(false); return; }
      setLoading(true);
      try {
        // Get wrong answer stats
        const r = await fetch(`${BASE}/api/student/wrong-answers/stats?phone=${encodeURIComponent(profile.phone)}`);
        if (!r.ok) { setLoading(false); return; }
        const stats = await r.json();

        // Also fetch quiz sessions for correct answer counts
        const qr = await fetch(`${BASE}/api/quiz/history?phone=${encodeURIComponent(profile.phone)}&limit=200`);
        const quizHistory = qr.ok ? await qr.json() : [];

        // Build weakness map from wrong answers stats + quiz history
        const map: Record<string, WeaknessEntry> = {};

        // Count wrong answers per subject/paper from stats
        for (const [subjectIdStr, data] of Object.entries(stats.bySubject as Record<string, { name: string; pending: number; revised: number }>)) {
          const key = `${subjectIdStr}-all`;
          if (!map[key]) {
            map[key] = {
              subjectId: parseInt(subjectIdStr),
              subjectName: data.name,
              paper: "all",
              total: 0, correct: 0, wrong: 0, pct: 0,
            };
          }
          map[key].wrong += data.pending + data.revised;
        }

        // Count correct answers from quiz sessions
        for (const session of quizHistory) {
          if (!session.subjectId || !session.subjectName) continue;
          const key = `${session.subjectId}-all`;
          if (!map[key]) {
            map[key] = {
              subjectId: session.subjectId,
              subjectName: session.subjectName,
              paper: "all",
              total: 0, correct: 0, wrong: 0, pct: 0,
            };
          }
          map[key].correct += session.score ?? 0;
          map[key].total += session.totalMarks ?? 0;
        }

        // Merge and compute pct
        const result: WeaknessEntry[] = Object.values(map).map(e => {
          const total = e.correct + e.wrong;
          const pct = total > 0 ? Math.round((e.correct / total) * 100) : 0;
          return { ...e, total, pct };
        }).filter(e => e.total > 0)
          .sort((a, b) => a.pct - b.pct); // weakest first

        setEntries(result);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = subjectFilter === "all"
    ? entries
    : entries.filter(e => String(e.subjectId) === subjectFilter);

  const weakCount = entries.filter(e => e.pct < 40).length;
  const okCount = entries.filter(e => e.pct >= 40 && e.pct < 70).length;
  const strongCount = entries.filter(e => e.pct >= 70).length;

  return (
    <Shell>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Topic Weakness Map</h1>
              <p className="text-sm text-white/50">Based on your quiz history and wrong answers</p>
            </div>
          </div>
        </motion.div>

        {/* Summary row */}
        {!loading && entries.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Weak", count: weakCount, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
              { label: "Okay", count: okCount, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
              { label: "Strong", count: strongCount, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
            ].map(s => (
              <div key={s.label} className={cn("rounded-2xl p-3 text-center border", s.bg, s.border)}>
                <p className={cn("text-2xl font-black", s.color)}>{s.count}</p>
                <p className="text-white/50 text-xs">{s.label} subjects</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-3">
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
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-white/40" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 bg-white/[0.03] rounded-2xl border border-white/[0.06]">
            <BarChart3 className="w-12 h-12 text-cyan-400/30 mx-auto mb-3" />
            <p className="text-white font-semibold text-lg">No data yet</p>
            <p className="text-white/40 text-sm mt-1 mb-5">Complete some quizzes to see your weakness map.</p>
            <Link href="/quiz">
              <button className="bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/20 text-cyan-300 text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors">
                Start Practicing
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((entry, i) => {
              const sc = strengthColor(entry.pct);
              return (
                <motion.div
                  key={`${entry.subjectId}-${entry.paper}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-semibold">{entry.subjectName}</p>
                        <span className={cn("text-xs rounded-full px-2 py-0.5 border font-medium", sc.badge)}>
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-white/40 text-xs mt-0.5">
                        {entry.correct} correct · {entry.wrong} wrong · {entry.total} total
                      </p>
                    </div>
                    <span className={cn("text-xl font-black", sc.text)}>{entry.pct}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-white/[0.06] rounded-full h-2 mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${entry.pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className={cn("h-2 rounded-full", sc.bar)}
                    />
                  </div>

                  {entry.pct < 70 && (
                    <Link href={`/quiz?subjectId=${entry.subjectId}`}>
                      <button className="text-xs bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white/60 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" />
                        Practice this subject
                      </button>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}
