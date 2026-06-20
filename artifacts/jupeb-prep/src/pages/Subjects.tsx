import { useListSubjects } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Library, ChevronRight, Lock, Clock, Sparkles, Zap,
  FlaskConical, BookOpen, Flame, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PAPER_LABELS: Record<string, string> = {
  "001": "1st In-Course",
  "002": "1st Semester",
  "003": "2nd In-Course",
  "004": "Mock Exam",
};

const AVAILABLE_NAMES = new Set([
  "Government",
  "Christian Religious Studies", "CRS",
  "Literature in English", "Literature-in-English",
]);

function getSubjectStatus(name: string): "available" | "science" | "locked" {
  if (AVAILABLE_NAMES.has(name)) return "available";
  return "locked";
}

const SUBJECT_META: Record<string, { emoji: string; iconColor: string; gradient: string; accent: string; btnBg: string }> = {
  "Economics":                  { emoji: "📊", iconColor: "text-amber-400",  gradient: "from-amber-600/20 to-yellow-900/10",  accent: "border-amber-500/30 bg-amber-500/10 text-amber-400", btnBg: "bg-amber-600/80 hover:bg-amber-500 text-white border-transparent" },
  "History":                    { emoji: "📜", iconColor: "text-orange-400", gradient: "from-orange-600/20 to-red-900/10",    accent: "border-orange-500/30 bg-orange-500/10 text-orange-400", btnBg: "bg-orange-600/80 hover:bg-orange-500 text-white border-transparent" },
  "Geography":                  { emoji: "🌍", iconColor: "text-cyan-400",   gradient: "from-cyan-600/20 to-teal-900/10",    accent: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400", btnBg: "bg-cyan-600/80 hover:bg-cyan-500 text-white border-transparent" },
  "Accounting":                 { emoji: "🧾", iconColor: "text-lime-400",   gradient: "from-lime-600/20 to-green-900/10",   accent: "border-lime-500/30 bg-lime-500/10 text-lime-400", btnBg: "bg-lime-600/80 hover:bg-lime-500 text-white border-transparent" },
  "Commerce":                   { emoji: "🏪", iconColor: "text-emerald-400",gradient: "from-emerald-600/20 to-teal-900/10", accent: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400", btnBg: "bg-emerald-600/80 hover:bg-emerald-500 text-white border-transparent" },
  "English Language":           { emoji: "✍️",  iconColor: "text-pink-400",  gradient: "from-pink-600/20 to-rose-900/10",    accent: "border-pink-500/30 bg-pink-500/10 text-pink-400", btnBg: "bg-pink-600/80 hover:bg-pink-500 text-white border-transparent" },
  "Literature in English":      { emoji: "📖", iconColor: "text-violet-400", gradient: "from-violet-600/20 to-purple-900/10",accent: "border-violet-500/30 bg-violet-500/10 text-violet-400", btnBg: "bg-violet-600/80 hover:bg-violet-500 text-white border-transparent" },
  "Literature-in-English":      { emoji: "📖", iconColor: "text-violet-400", gradient: "from-violet-600/20 to-purple-900/10",accent: "border-violet-500/30 bg-violet-500/10 text-violet-400", btnBg: "bg-violet-600/80 hover:bg-violet-500 text-white border-transparent" },
  "Government":                 { emoji: "🏛️", iconColor: "text-blue-400",   gradient: "from-blue-600/20 to-sky-900/10",     accent: "border-blue-500/30 bg-blue-500/10 text-blue-400", btnBg: "bg-blue-600/80 hover:bg-blue-500 text-white border-transparent" },
  "Christian Religious Studies":{ emoji: "✝️",  iconColor: "text-teal-400",  gradient: "from-teal-600/20 to-emerald-900/10", accent: "border-teal-500/30 bg-teal-500/10 text-teal-400", btnBg: "bg-teal-600/80 hover:bg-teal-500 text-white border-transparent" },
  "CRS":                        { emoji: "✝️",  iconColor: "text-teal-400",  gradient: "from-teal-600/20 to-emerald-900/10", accent: "border-teal-500/30 bg-teal-500/10 text-teal-400", btnBg: "bg-teal-600/80 hover:bg-teal-500 text-white border-transparent" },
  "Islamic Religious Studies":  { emoji: "☪️",  iconColor: "text-sky-400",   gradient: "from-sky-600/20 to-cyan-900/10",     accent: "border-sky-500/30 bg-sky-500/10 text-sky-400", btnBg: "bg-sky-600/80 hover:bg-sky-500 text-white border-transparent" },
  "Physics":                    { emoji: "⚡", iconColor: "text-rose-400",   gradient: "from-rose-600/20 to-pink-900/10",    accent: "border-rose-500/30 bg-rose-500/10 text-rose-400", btnBg: "bg-rose-600/80 hover:bg-rose-500 text-white border-transparent" },
  "Chemistry":                  { emoji: "⚗️",  iconColor: "text-orange-400",gradient: "from-orange-600/20 to-red-900/10",   accent: "border-orange-500/30 bg-orange-500/10 text-orange-400", btnBg: "bg-orange-600/80 hover:bg-orange-500 text-white border-transparent" },
  "Biology":                    { emoji: "🔬", iconColor: "text-green-400",  gradient: "from-green-600/20 to-emerald-900/10",accent: "border-green-500/30 bg-green-500/10 text-green-400", btnBg: "bg-green-600/80 hover:bg-green-500 text-white border-transparent" },
  "Mathematics":                { emoji: "📐", iconColor: "text-sky-400",    gradient: "from-sky-600/20 to-blue-900/10",     accent: "border-sky-500/30 bg-sky-500/10 text-sky-400", btnBg: "bg-sky-600/80 hover:bg-sky-500 text-white border-transparent" },
  "Further Mathematics":        { emoji: "∑",  iconColor: "text-indigo-400", gradient: "from-indigo-600/20 to-violet-900/10",accent: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400", btnBg: "bg-indigo-600/80 hover:bg-indigo-500 text-white border-transparent" },
  "Further Maths":              { emoji: "∑",  iconColor: "text-indigo-400", gradient: "from-indigo-600/20 to-violet-900/10",accent: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400", btnBg: "bg-indigo-600/80 hover:bg-indigo-500 text-white border-transparent" },
  "Agricultural Science":       { emoji: "🌾", iconColor: "text-lime-400",   gradient: "from-lime-600/20 to-green-900/10",   accent: "border-lime-500/30 bg-lime-500/10 text-lime-400", btnBg: "bg-lime-600/80 hover:bg-lime-500 text-white border-transparent" },
  "Computer Science":           { emoji: "💻", iconColor: "text-blue-400",   gradient: "from-blue-600/20 to-indigo-900/10",  accent: "border-blue-500/30 bg-blue-500/10 text-blue-400", btnBg: "bg-blue-600/80 hover:bg-blue-500 text-white border-transparent" },
};

const DEFAULT_META = {
  emoji: "📚", iconColor: "text-white/50",
  gradient: "from-white/5 to-transparent",
  accent: "border-white/10 bg-white/5 text-white/40",
  btnBg: "bg-white/10 hover:bg-white/15 text-white/70 border-white/10",
};

const HARDCODED_SCIENCE = [
  { code: "PHY", name: "Physics",             emoji: "⚡", color: "text-rose-400",   bg: "bg-rose-500/8 border-rose-500/15" },
  { code: "CHE", name: "Chemistry",           emoji: "⚗️",  color: "text-orange-400",bg: "bg-orange-500/8 border-orange-500/15" },
  { code: "BIO", name: "Biology",             emoji: "🔬", color: "text-green-400", bg: "bg-green-500/8 border-green-500/15" },
  { code: "MTH", name: "Mathematics",         emoji: "📐", color: "text-sky-400",   bg: "bg-sky-500/8 border-sky-500/15" },
  { code: "FMT", name: "Further Maths",       emoji: "∑",  color: "text-indigo-400",bg: "bg-indigo-500/8 border-indigo-500/15" },
  { code: "AGR", name: "Agricultural Science",emoji: "🌾", color: "text-lime-400",  bg: "bg-lime-500/8 border-lime-500/15" },
  { code: "CMP", name: "Computer Science",    emoji: "💻", color: "text-blue-400",  bg: "bg-blue-500/8 border-blue-500/15" },
];

const HARDCODED_NON_SCIENCE_LOCKED = [
  { code: "GOV", name: "Government",                  emoji: "🏛️", color: "text-blue-400",   bg: "bg-blue-500/8 border-blue-500/15" },
  { code: "CRS", name: "Christian Religious Studies", emoji: "✝️",  color: "text-teal-400",  bg: "bg-teal-500/8 border-teal-500/15" },
  { code: "LIT", name: "Literature in English",       emoji: "📖", color: "text-violet-400",bg: "bg-violet-500/8 border-violet-500/15" },
];

export default function Subjects() {
  const { data: subjectsRaw, isLoading } = useListSubjects();
  const subjects = Array.isArray(subjectsRaw) ? subjectsRaw : [];

  let profileSubjects: string[] = [];
  try {
    const p = JSON.parse(localStorage.getItem("jupeb_profile") || "null");
    if (Array.isArray(p?.subjects)) profileSubjects = p.subjects;
  } catch {}

  const available = subjects.filter(s => getSubjectStatus(s.name) === "available");
  const dbLocked  = subjects.filter(s => getSubjectStatus(s.name) === "locked");
  const dbScience = subjects.filter(s => getSubjectStatus(s.name) === "science");
  const mySubjects = available.filter(s => profileSubjects.includes(s.name));

  const lockedNames = new Set(dbLocked.map(s => s.name));
  const extraLocked = HARDCODED_NON_SCIENCE_LOCKED.filter(s => !lockedNames.has(s.name));

  const scienceNames = new Set(dbScience.map(s => s.name));
  const extraScience = HARDCODED_SCIENCE.filter(s => !scienceNames.has(s.name));

  const readyCount = available.length;

  return (
    <Shell>
      <div className="px-4 pb-6 pt-4 max-w-4xl mx-auto w-full space-y-6">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Library className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">JUPEB Subjects</h1>
            <p className="text-white/35 text-xs mt-0.5">Select a subject to start practising.</p>
          </div>
        </motion.div>

        {/* Motivational push banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-600/12 to-orange-600/8 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Flame className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white">
                {readyCount > 0
                  ? `${readyCount} subject${readyCount > 1 ? "s" : ""} ready to practise! 🚀`
                  : "Subjects loading…"}
              </p>
              <p className="text-xs text-white/45 mt-0.5">
                Daily practice = higher grades. Even 10 minutes counts. Keep pushing!
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-amber-400 flex-shrink-0" />
          </div>
        </motion.div>

        {/* ── YOUR SUBJECTS ─────────────────────────────────────────── */}
        {mySubjects.length > 0 && (
          <motion.section initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <h2 className="text-xs font-black text-white/50 uppercase tracking-widest">Your Subjects</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/25">
                {mySubjects.length} selected
              </span>
              <span className="flex-1 h-px bg-white/[0.05]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {mySubjects.map((subject, i) => {
                const meta = SUBJECT_META[subject.name] || DEFAULT_META;
                return (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={cn("relative bg-white/[0.04] border border-violet-500/25 rounded-2xl overflow-hidden flex flex-col bg-gradient-to-br ring-1 ring-violet-500/20", meta.gradient)}
                  >
                    <div className="absolute top-2.5 right-2.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-violet-500/25 text-violet-300 border border-violet-500/30 z-10">
                      ⭐ Yours
                    </div>
                    <div className="p-4 flex-1">
                      <span className="text-3xl leading-none block mb-2.5">{meta.emoji}</span>
                      <h3 className="text-sm font-black text-white leading-tight">{subject.name}</h3>
                      <p className="text-[11px] text-white/35 mt-0.5 font-mono">{subject.code}</p>
                    </div>
                    {/* Quick paper links */}
                    <div className="px-3 pb-1 space-y-0.5 border-t border-white/[0.05]">
                      {["001","002","003","004"].map(paper => (
                        <Link key={paper} href={`/questions?subjectId=${subject.id}&paper=${paper}`}>
                          <div className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer group">
                            <span className="text-xs text-white/45 group-hover:text-white/70 transition-colors">{PAPER_LABELS[paper]}</span>
                            <ChevronRight className="h-3 w-3 text-white/20 group-hover:text-white/50 transition-colors" />
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="p-3 pt-1">
                      <Link href={`/quiz?subjectId=${subject.id}`}>
                        <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black cursor-pointer transition-all active:scale-[0.97] bg-violet-600/90 hover:bg-violet-500 text-white border border-violet-500/30">
                          <Zap className="h-4 w-4" />Start Practice
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* ── AVAILABLE NOW ──────────────────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <h2 className="text-xs font-black text-white/50 uppercase tracking-widest">Available Now</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              ✓ Active
            </span>
            <span className="flex-1 h-px bg-white/[0.05]" />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-48 bg-white/[0.05] rounded-2xl" />)}
            </div>
          ) : available.length === 0 ? (
            <div className="text-center py-10 text-white/25 text-sm">No subjects available yet — check back soon.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {available.map((subject, i) => {
                const meta = SUBJECT_META[subject.name] || DEFAULT_META;
                return (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileHover={{ y: -2 }}
                    className={cn("bg-white/[0.04] border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col bg-gradient-to-br transition-shadow", meta.gradient)}
                  >
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl leading-none">{meta.emoji}</span>
                        <span className={cn("text-[11px] font-bold px-2 py-1 rounded-lg border", meta.accent)}>
                          {subject.code}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-white leading-tight">{subject.name}</h3>
                      <p className="text-xs text-white/35 mt-1">4 papers · Ready to practice</p>
                    </div>

                    {/* Papers quick-links */}
                    <div className="px-3 pb-1 border-t border-white/[0.05] space-y-0.5">
                      {["001","002","003","004"].map(paper => (
                        <Link key={paper} href={`/questions?subjectId=${subject.id}&paper=${paper}`}>
                          <div className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer group">
                            <span className="text-xs text-white/45 group-hover:text-white/70 transition-colors">{PAPER_LABELS[paper]}</span>
                            <ChevronRight className="h-3 w-3 text-white/20 group-hover:text-white/50 transition-colors" />
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Practice button */}
                    <div className="p-3 pt-1">
                      <Link href={`/quiz?subjectId=${subject.id}`}>
                        <div className={cn(
                          "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border cursor-pointer transition-all active:scale-[0.97]",
                          meta.btnBg
                        )}>
                          <Zap className="h-4 w-4" />
                          Practice Now
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── SCIENCE TRACK — COMING SOON ───────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            <h2 className="text-xs font-black text-white/50 uppercase tracking-widest">Science Track</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-white/35 border border-white/10 flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" /> Coming Soon
            </span>
            <span className="flex-1 h-px bg-white/[0.05]" />
          </div>

          <div className="rounded-2xl border border-rose-500/15 overflow-hidden bg-gradient-to-br from-rose-600/8 to-orange-900/5">
            <div className="px-4 py-4 flex items-center gap-3 border-b border-rose-500/10">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center flex-shrink-0">
                <FlaskConical className="h-5 w-5 text-rose-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white/80">Science subjects coming soon</p>
                <p className="text-xs text-white/35">We'll notify you via WhatsApp & email when live</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] flex-shrink-0">
                <Sparkles className="h-3 w-3 text-rose-400" />
                <span className="text-[10px] text-rose-400 font-semibold">In dev</span>
              </div>
            </div>

            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {[...dbScience.map(s => ({
                code: s.code, name: s.name,
                emoji: (SUBJECT_META[s.name] || DEFAULT_META).emoji,
                color: (SUBJECT_META[s.name] || DEFAULT_META).iconColor,
                bg: "bg-white/[0.04] border-white/[0.08]",
              })), ...extraScience].map((subj, i) => (
                <motion.div key={subj.code}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className={cn("relative rounded-xl border p-3 flex items-center gap-2.5 opacity-60", subj.bg)}
                >
                  <span className="text-xl leading-none">{subj.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white/55 leading-tight truncate">{subj.name}</p>
                    <p className="text-[10px] text-white/25">{subj.code}</p>
                  </div>
                  <Lock className="h-3.5 w-3.5 text-white/20 flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── ARTS / HUMANITIES — COMING SOON ────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <h2 className="text-xs font-black text-white/50 uppercase tracking-widest">Arts / Humanities</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-white/35 border border-white/10 flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" /> Coming Soon
            </span>
            <span className="flex-1 h-px bg-white/[0.05]" />
          </div>

          <div className="rounded-2xl border border-blue-500/15 overflow-hidden bg-gradient-to-br from-blue-600/8 to-indigo-900/5">
            <div className="px-4 py-4 flex items-center gap-3 border-b border-blue-500/10">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white/80">Government, CRS & Literature</p>
                <p className="text-xs text-white/35">Questions & notes being prepared</p>
              </div>
            </div>

            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[...dbLocked.map(s => ({
                code: s.code, name: s.name,
                emoji: (SUBJECT_META[s.name] || DEFAULT_META).emoji,
                color: (SUBJECT_META[s.name] || DEFAULT_META).iconColor,
                bg: "bg-white/[0.04] border-white/[0.08]",
              })), ...extraLocked].map((subj, i) => (
                <motion.div key={subj.code}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + i * 0.06 }}
                  className={cn("relative rounded-xl border p-3 flex items-center gap-2.5 opacity-60", subj.bg)}
                >
                  <span className="text-xl leading-none">{subj.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white/55 leading-tight truncate">{subj.name}</p>
                    <p className="text-[10px] text-white/25">{subj.code}</p>
                  </div>
                  <Lock className="h-3.5 w-3.5 text-white/20 flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── PAPER STRUCTURE ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
        >
          <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3">JUPEB Paper Structure</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(PAPER_LABELS).map(([code, label]) => (
              <div key={code} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                <p className="text-sm font-bold text-white/70">{code}</p>
                <p className="text-xs text-white/35 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </Shell>
  );
}
