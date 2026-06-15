import { useListSubjects } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Library, FileText, ChevronRight, BookOpen, Landmark, Cross,
  FlaskConical, TrendingUp, Lock, Clock, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PAPER_LABELS: Record<string, string> = {
  "001": "1st Incourse",
  "002": "1st Semester Exam",
  "003": "2nd Incourse",
  "004": "Mock Exam",
};

const SUBJECT_THEMES: Record<string, { icon: any; gradient: string; glow: string; accent: string }> = {
  "Literature-in-English": {
    icon: BookOpen,
    gradient: "from-violet-600/20 to-purple-900/10",
    glow: "shadow-violet-500/20",
    accent: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  },
  "Government": {
    icon: Landmark,
    gradient: "from-blue-600/20 to-cyan-900/10",
    glow: "shadow-blue-500/20",
    accent: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  "CRS": {
    icon: Cross,
    gradient: "from-emerald-600/20 to-teal-900/10",
    glow: "shadow-emerald-500/20",
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
};

interface ComingSoonSubject {
  name: string;
  code: string;
  description: string;
  color: string;
  iconColor: string;
}

interface ComingSoonTrack {
  track: string;
  subtitle: string;
  icon: any;
  headerGradient: string;
  headerBorder: string;
  badgeClass: string;
  subjects: ComingSoonSubject[];
}

const COMING_SOON_TRACKS: ComingSoonTrack[] = [
  {
    track: "Science Track",
    subtitle: "For students targeting Medicine, Engineering, Sciences & Technology",
    icon: FlaskConical,
    headerGradient: "from-rose-600/15 to-orange-900/10",
    headerBorder: "border-rose-500/15",
    badgeClass: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    subjects: [
      { name: "Physics", code: "PHY", description: "Mechanics, Electricity, Waves, Modern Physics", color: "bg-rose-500/8 border-rose-500/10", iconColor: "text-rose-400" },
      { name: "Chemistry", code: "CHE", description: "Organic, Inorganic & Physical Chemistry", color: "bg-orange-500/8 border-orange-500/10", iconColor: "text-orange-400" },
      { name: "Biology", code: "BIO", description: "Cell Biology, Genetics, Ecology, Evolution", color: "bg-green-500/8 border-green-500/10", iconColor: "text-green-400" },
      { name: "Mathematics", code: "MTH", description: "Calculus, Algebra, Statistics, Trigonometry", color: "bg-sky-500/8 border-sky-500/10", iconColor: "text-sky-400" },
      { name: "Further Maths", code: "FMT", description: "Advanced Mathematics for Science students", color: "bg-indigo-500/8 border-indigo-500/10", iconColor: "text-indigo-400" },
    ],
  },
  {
    track: "Social Science / Economics Track",
    subtitle: "For students targeting Economics, Accounting, Business & Social Sciences",
    icon: TrendingUp,
    headerGradient: "from-amber-600/15 to-yellow-900/10",
    headerBorder: "border-amber-500/15",
    badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    subjects: [
      { name: "Economics", code: "ECO", description: "Micro & Macroeconomics, Nigerian Economy", color: "bg-amber-500/8 border-amber-500/10", iconColor: "text-amber-400" },
      { name: "Accounting", code: "ACC", description: "Financial Accounting, Bookkeeping, Costing", color: "bg-yellow-500/8 border-yellow-500/10", iconColor: "text-yellow-400" },
      { name: "Business Studies", code: "BUS", description: "Business Management, Commerce, Marketing", color: "bg-lime-500/8 border-lime-500/10", iconColor: "text-lime-400" },
      { name: "Geography", code: "GEO", description: "Physical, Human & Economic Geography", color: "bg-cyan-500/8 border-cyan-500/10", iconColor: "text-cyan-400" },
    ],
  },
];

export default function Subjects() {
  const { data: subjectsRaw, isLoading } = useListSubjects();
  const subjects = Array.isArray(subjectsRaw) ? subjectsRaw : [];

  return (
    <Shell>
      <div className="p-6 max-w-5xl mx-auto w-full space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Library className="h-5 w-5 text-blue-400" />
            </div>
            Subjects
          </h1>
          <p className="text-white/40 text-sm mt-1 ml-13">All JUPEB subject tracks — start with yours below.</p>
        </motion.div>

        {/* ── ACTIVE: Non-Science Arts Track ─────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest">Arts / Law Track</h2>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              ✓ Available Now
            </span>
            <span className="flex-1 h-px bg-white/5" />
          </div>
          <p className="text-xs text-white/30 -mt-2">Literature-in-English · Government · CRS/IRS — for Law, Political Science, Mass Comm & other Arts courses</p>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-72 bg-white/5 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subjects?.map((subject, i) => {
                const theme = SUBJECT_THEMES[subject.name] || SUBJECT_THEMES["Literature-in-English"];
                const Icon = theme.icon;
                return (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -3 }}
                    className={cn("glass-card overflow-hidden flex flex-col shadow-xl", theme.glow)}
                  >
                    <div className={cn("p-6 bg-gradient-to-br", theme.gradient)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border", theme.accent)}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full border", theme.accent)}>
                          {subject.code}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold font-serif text-white leading-tight">{subject.name}</h2>
                      <p className="text-white/50 text-xs mt-1 leading-relaxed line-clamp-2">{subject.description}</p>
                    </div>

                    <div className="p-4 flex-1 flex flex-col gap-1.5">
                      <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-1">Papers</p>
                      {["001", "002", "003", "004"].map((paper) => (
                        <Link key={paper} href={`/questions?subjectId=${subject.id}&paper=${paper}`}>
                          <motion.div
                            whileHover={{ x: 3 }}
                            className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/6 text-white/70 hover:text-white/90 transition-all cursor-pointer group border border-transparent hover:border-white/8"
                          >
                            <div className="flex items-center gap-2.5 text-sm">
                              <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>{PAPER_LABELS[paper]}</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.div>
                        </Link>
                      ))}
                    </div>

                    <div className="px-4 pb-4">
                      <Link href={`/questions?subjectId=${subject.id}`}>
                        <div className={cn(
                          "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer transition-all hover:scale-[1.02]",
                          theme.accent
                        )}>
                          <BookOpen className="h-4 w-4" />
                          View All Questions
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── COMING SOON TRACKS ─────────────────────────────────────── */}
        {COMING_SOON_TRACKS.map((track, trackIdx) => {
          const TrackIcon = track.icon;
          return (
            <motion.section
              key={track.track}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + trackIdx * 0.15 }}
              className="space-y-4"
            >
              {/* Section header */}
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest">{track.track}</h2>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/8 text-white/40 border border-white/10 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Coming Soon
                </span>
                <span className="flex-1 h-px bg-white/5" />
              </div>
              <p className="text-xs text-white/30 -mt-2">{track.subtitle}</p>

              {/* Track banner */}
              <div className={cn("rounded-2xl border p-5 bg-gradient-to-br", track.headerGradient, track.headerBorder)}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", track.badgeClass)}>
                    <TrackIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{track.track}</p>
                    <p className="text-xs text-white/40">{track.subjects.length} subjects in preparation</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <Sparkles className="h-3 w-3 text-white/40" />
                    <span className="text-[11px] text-white/40 font-medium">Coming Soon</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {track.subjects.map((subj, i) => (
                    <motion.div
                      key={subj.code}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + trackIdx * 0.1 + i * 0.06 }}
                      className={cn(
                        "relative rounded-xl border p-4 overflow-hidden",
                        subj.color
                      )}
                    >
                      {/* lock overlay */}
                      <div className="absolute top-3 right-3">
                        <Lock className="h-3.5 w-3.5 text-white/20" />
                      </div>

                      <div className="flex items-start gap-3">
                        <div className={cn("w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0", subj.iconColor)}>
                          <span className="text-[10px] font-black">{subj.code}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white/70 leading-tight">{subj.name}</p>
                          <p className="text-[11px] text-white/35 mt-0.5 leading-snug">{subj.description}</p>
                        </div>
                      </div>

                      <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full w-0 rounded-full bg-white/10" />
                      </div>
                      <p className="text-[10px] text-white/25 mt-1">In development</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          );
        })}

        {/* JUPEB info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-5"
        >
          <h3 className="text-sm font-semibold text-white/70 mb-2">JUPEB Paper Structure</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(PAPER_LABELS).map(([code, label]) => (
              <div key={code} className="p-3 rounded-xl bg-white/3 border border-white/5 text-center">
                <p className="text-xs font-bold text-white/80">{code}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </Shell>
  );
}
