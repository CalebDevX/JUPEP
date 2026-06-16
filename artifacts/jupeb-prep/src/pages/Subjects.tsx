import { useListSubjects } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Library, ChevronRight, Lock, Clock, Sparkles, Zap,
  FlaskConical, BookOpen, Landmark, Cross, TrendingUp,
  Atom, Calculator, Leaf, Cpu, BrainCircuit,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PAPER_LABELS: Record<string, string> = {
  "001": "1st Incourse",
  "002": "1st Semester",
  "003": "2nd Incourse",
  "004": "Mock Exam",
};

const SCIENCE_NAMES = new Set([
  "Mathematics", "Biology", "Chemistry", "Physics",
  "Agricultural Science", "Computer Science", "Further Mathematics", "Further Maths",
]);

const NON_SCIENCE_LOCKED = new Set([
  "Government", "Christian Religious Studies", "CRS",
  "Literature in English", "Literature-in-English",
  "Islamic Religious Studies", "IRS",
]);

function getSubjectStatus(name: string): "available" | "science" | "locked" {
  if (SCIENCE_NAMES.has(name)) return "science";
  if (NON_SCIENCE_LOCKED.has(name)) return "locked";
  return "available";
}

const SUBJECT_META: Record<string, { emoji: string; iconColor: string; gradient: string; accent: string }> = {
  "Economics":                  { emoji: "📊", iconColor: "text-amber-400",  gradient: "from-amber-600/20 to-yellow-900/10",  accent: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  "History":                    { emoji: "📜", iconColor: "text-orange-400", gradient: "from-orange-600/20 to-red-900/10",    accent: "border-orange-500/30 bg-orange-500/10 text-orange-400" },
  "Geography":                  { emoji: "🌍", iconColor: "text-cyan-400",   gradient: "from-cyan-600/20 to-teal-900/10",    accent: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400" },
  "Accounting":                 { emoji: "🧾", iconColor: "text-lime-400",   gradient: "from-lime-600/20 to-green-900/10",   accent: "border-lime-500/30 bg-lime-500/10 text-lime-400" },
  "Commerce":                   { emoji: "🏪", iconColor: "text-emerald-400",gradient: "from-emerald-600/20 to-teal-900/10", accent: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
  "English Language":           { emoji: "✍️",  iconColor: "text-pink-400",  gradient: "from-pink-600/20 to-rose-900/10",    accent: "border-pink-500/30 bg-pink-500/10 text-pink-400" },
  "Literature in English":      { emoji: "📖", iconColor: "text-violet-400", gradient: "from-violet-600/20 to-purple-900/10",accent: "border-violet-500/30 bg-violet-500/10 text-violet-400" },
  "Literature-in-English":      { emoji: "📖", iconColor: "text-violet-400", gradient: "from-violet-600/20 to-purple-900/10",accent: "border-violet-500/30 bg-violet-500/10 text-violet-400" },
  "Government":                 { emoji: "🏛️", iconColor: "text-blue-400",   gradient: "from-blue-600/20 to-sky-900/10",     accent: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
  "Christian Religious Studies":{ emoji: "✝️",  iconColor: "text-teal-400",  gradient: "from-teal-600/20 to-emerald-900/10", accent: "border-teal-500/30 bg-teal-500/10 text-teal-400" },
  "CRS":                        { emoji: "✝️",  iconColor: "text-teal-400",  gradient: "from-teal-600/20 to-emerald-900/10", accent: "border-teal-500/30 bg-teal-500/10 text-teal-400" },
  "Islamic Religious Studies":  { emoji: "☪️",  iconColor: "text-sky-400",   gradient: "from-sky-600/20 to-cyan-900/10",     accent: "border-sky-500/30 bg-sky-500/10 text-sky-400" },
  "Physics":                    { emoji: "⚡", iconColor: "text-rose-400",   gradient: "from-rose-600/20 to-pink-900/10",    accent: "border-rose-500/30 bg-rose-500/10 text-rose-400" },
  "Chemistry":                  { emoji: "⚗️",  iconColor: "text-orange-400",gradient: "from-orange-600/20 to-red-900/10",   accent: "border-orange-500/30 bg-orange-500/10 text-orange-400" },
  "Biology":                    { emoji: "🔬", iconColor: "text-green-400",  gradient: "from-green-600/20 to-emerald-900/10",accent: "border-green-500/30 bg-green-500/10 text-green-400" },
  "Mathematics":                { emoji: "📐", iconColor: "text-sky-400",    gradient: "from-sky-600/20 to-blue-900/10",     accent: "border-sky-500/30 bg-sky-500/10 text-sky-400" },
  "Further Mathematics":        { emoji: "∑",  iconColor: "text-indigo-400", gradient: "from-indigo-600/20 to-violet-900/10",accent: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400" },
  "Further Maths":              { emoji: "∑",  iconColor: "text-indigo-400", gradient: "from-indigo-600/20 to-violet-900/10",accent: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400" },
  "Agricultural Science":       { emoji: "🌾", iconColor: "text-lime-400",   gradient: "from-lime-600/20 to-green-900/10",   accent: "border-lime-500/30 bg-lime-500/10 text-lime-400" },
  "Computer Science":           { emoji: "💻", iconColor: "text-blue-400",   gradient: "from-blue-600/20 to-indigo-900/10",  accent: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
};

const DEFAULT_META = { emoji: "📚", iconColor: "text-white/50", gradient: "from-white/5 to-transparent", accent: "border-white/10 bg-white/5 text-white/40" };

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

  const available = subjects.filter(s => getSubjectStatus(s.name) === "available");
  const dbLocked  = subjects.filter(s => getSubjectStatus(s.name) === "locked");
  const dbScience = subjects.filter(s => getSubjectStatus(s.name) === "science");

  const lockedNames = new Set(dbLocked.map(s => s.name));
  const extraLocked = HARDCODED_NON_SCIENCE_LOCKED.filter(s => !lockedNames.has(s.name));

  const scienceNames = new Set(dbScience.map(s => s.name));
  const extraScience = HARDCODED_SCIENCE.filter(s => !scienceNames.has(s.name));

  return (
    <Shell>
      <div className="p-4 md:p-6 max-w-4xl mx-auto w-full space-y-7">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl md:text-2xl font-bold font-serif text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
              <Library className="h-4.5 w-4.5 text-blue-400" />
            </div>
            JUPEB Subjects
          </h1>
          <p className="text-white/35 text-xs mt-1 ml-11.5">Select a subject to start practising.</p>
        </motion.div>

        {/* ── AVAILABLE ──────────────────────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest">Available Now</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              ✓ Active
            </span>
            <span className="flex-1 h-px bg-white/5" />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-28 bg-white/5 rounded-2xl" />)}
            </div>
          ) : available.length === 0 ? (
            <div className="text-center py-10 text-white/25 text-sm">No subjects available yet — check back soon.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {available.map((subject, i) => {
                const meta = SUBJECT_META[subject.name] || DEFAULT_META;
                return (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileHover={{ y: -2 }}
                    className={cn(
                      "glass-card overflow-hidden flex flex-col bg-gradient-to-br",
                      meta.gradient
                    )}
                  >
                    {/* Card top */}
                    <div className="p-3 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-2xl leading-none">{meta.emoji}</span>
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-lg border", meta.accent)}>
                          {subject.code}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white leading-tight mt-1">{subject.name}</h3>
                      <p className="text-[10px] text-white/35 mt-0.5">4 papers</p>
                    </div>

                    {/* Papers quick-links */}
                    <div className="px-3 pb-2 space-y-0.5">
                      {["001","002","003","004"].map(paper => (
                        <Link key={paper} href={`/questions?subjectId=${subject.id}&paper=${paper}`}>
                          <div className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white/6 transition-colors cursor-pointer group">
                            <span className="text-[10px] text-white/45 group-hover:text-white/70 transition-colors">{PAPER_LABELS[paper]}</span>
                            <ChevronRight className="h-2.5 w-2.5 text-white/20 group-hover:text-white/50 transition-colors" />
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Practice button */}
                    <div className="p-2.5 pt-1">
                      <Link href={`/quiz?subjectId=${subject.id}`}>
                        <div className={cn(
                          "w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold border cursor-pointer transition-all active:scale-95",
                          meta.accent
                        )}>
                          <Zap className="h-3 w-3" />
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
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse flex-shrink-0" />
            <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest">Science Track</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/6 text-white/35 border border-white/10 flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" /> Coming Soon
            </span>
            <span className="flex-1 h-px bg-white/5" />
          </div>

          <div className="rounded-2xl border border-rose-500/15 overflow-hidden bg-gradient-to-br from-rose-600/8 to-orange-900/5">
            {/* Banner */}
            <div className="px-4 py-3.5 flex items-center gap-3 border-b border-rose-500/10">
              <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/25 flex items-center justify-center flex-shrink-0">
                <FlaskConical className="h-4 w-4 text-rose-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white/80">Science subjects coming soon</p>
                <p className="text-[11px] text-white/35 truncate">We'll notify you via WhatsApp & email when your subject goes live</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/4 border border-white/8 flex-shrink-0">
                <Sparkles className="h-3 w-3 text-rose-400" />
                <span className="text-[10px] text-rose-400 font-semibold">In dev</span>
              </div>
            </div>

            {/* Subject chips */}
            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {[...dbScience.map(s => ({
                code: s.code, name: s.name,
                emoji: (SUBJECT_META[s.name] || DEFAULT_META).emoji,
                color: (SUBJECT_META[s.name] || DEFAULT_META).iconColor,
                bg: "bg-white/4 border-white/8",
              })), ...extraScience].map((subj, i) => (
                <motion.div
                  key={subj.code}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className={cn("relative rounded-xl border p-2.5 flex items-center gap-2", subj.bg, "opacity-60")}
                >
                  <span className="text-base leading-none">{subj.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-white/55 leading-tight truncate">{subj.name}</p>
                    <p className="text-[9px] text-white/25">{subj.code}</p>
                  </div>
                  <Lock className="h-3 w-3 text-white/20 flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── NON-SCIENCE LOCKED — COMING SOON ──────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
            <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest">Arts / Humanities</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/6 text-white/35 border border-white/10 flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" /> Coming Soon
            </span>
            <span className="flex-1 h-px bg-white/5" />
          </div>

          <div className="rounded-2xl border border-blue-500/15 overflow-hidden bg-gradient-to-br from-blue-600/8 to-indigo-900/5">
            <div className="px-4 py-3.5 flex items-center gap-3 border-b border-blue-500/10">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white/80">Government, CRS & Literature</p>
                <p className="text-[11px] text-white/35">Questions & notes being prepared — activating soon</p>
              </div>
            </div>

            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[...dbLocked.map(s => ({
                code: s.code, name: s.name,
                emoji: (SUBJECT_META[s.name] || DEFAULT_META).emoji,
                color: (SUBJECT_META[s.name] || DEFAULT_META).iconColor,
                bg: "bg-white/4 border-white/8",
              })), ...extraLocked].map((subj, i) => (
                <motion.div
                  key={subj.code}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + i * 0.06 }}
                  className={cn("relative rounded-xl border p-2.5 flex items-center gap-2", subj.bg, "opacity-60")}
                >
                  <span className="text-base leading-none">{subj.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-white/55 leading-tight truncate">{subj.name}</p>
                    <p className="text-[9px] text-white/25">{subj.code}</p>
                  </div>
                  <Lock className="h-3 w-3 text-white/20 flex-shrink-0" />
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
          className="rounded-2xl border border-white/6 bg-white/2 p-4"
        >
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">JUPEB Paper Structure</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(PAPER_LABELS).map(([code, label]) => (
              <div key={code} className="p-2.5 rounded-xl bg-white/3 border border-white/5 text-center">
                <p className="text-xs font-bold text-white/70">{code}</p>
                <p className="text-[10px] text-white/35 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </Shell>
  );
}
