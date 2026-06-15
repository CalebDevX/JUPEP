import { useListSubjects } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Library, FileText, ChevronRight, BookOpen, Landmark, Cross } from "lucide-react";
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

export default function Subjects() {
  const { data: subjects, isLoading } = useListSubjects();

  return (
    <Shell>
      <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Library className="h-5 w-5 text-blue-400" />
            </div>
            Subjects
          </h1>
          <p className="text-white/40 text-sm mt-1 ml-13">Your three core JUPEB subjects — 16 points starts here.</p>
        </motion.div>

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
                  className={cn(
                    "glass-card overflow-hidden flex flex-col shadow-xl",
                    theme.glow
                  )}
                >
                  {/* Header */}
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

                  {/* Papers */}
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

                  {/* Footer CTA */}
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

        {/* JUPEB info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
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
