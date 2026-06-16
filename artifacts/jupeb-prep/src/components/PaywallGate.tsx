import { Lock, Zap, BookOpen, Brain, ChevronRight, Star, GraduationCap } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const FEATURE_CONFIG = {
  notes: {
    icon: BookOpen,
    title: "Notes are locked",
    subtitle: "Activate your account to access AI-generated study notes, summaries, and flashcards for all your JUPEB subjects.",
    color: "from-violet-600/20 to-purple-900/10",
    accent: "violet",
    perks: ["AI-generated study notes per topic", "Paper-by-paper breakdowns", "Save & highlight key points", "Audio read-aloud (TTS)"],
  },
  chat: {
    icon: Brain,
    title: "AI Tutor is locked",
    subtitle: "Activate your account to get a personal JUPEB AI tutor that answers your questions, explains concepts, and helps you prepare.",
    color: "from-amber-600/20 to-orange-900/10",
    accent: "amber",
    perks: ["Ask any JUPEB question", "Get step-by-step explanations", "Subject-specific study plans", "Exam tips and mnemonics"],
  },
  quiz: {
    icon: Zap,
    title: "Free trial complete",
    subtitle: "You've used all 5 free practice questions. Activate your account to keep practising without limits.",
    color: "from-rose-600/20 to-pink-900/10",
    accent: "rose",
    perks: ["Unlimited quiz questions", "Full explanations after every answer", "Track your progress & streaks", "Compete on the leaderboard"],
  },
  class: {
    icon: GraduationCap,
    title: "Class is locked",
    subtitle: "Activate your account to access interactive AI-powered lectures with real-time streaming content and timed reading sessions.",
    color: "from-emerald-600/20 to-teal-900/10",
    accent: "emerald",
    perks: ["Live AI lectures for any topic", "Auto-timed reading sessions", "Practice questions after each class", "Read-aloud in Nigerian English"],
  },
} as const;

type FeatureKey = keyof typeof FEATURE_CONFIG;

export function PaywallGate({ feature }: { feature: FeatureKey }) {
  const cfg = FEATURE_CONFIG[feature];
  const Icon = cfg.icon;
  const accentMap = {
    violet:  { border: "border-violet-500/30",  bg: "bg-violet-500/15",  text: "text-violet-400",  btn: "bg-violet-600 hover:bg-violet-500 shadow-violet-500/25",   dot: "bg-violet-500"  },
    amber:   { border: "border-amber-500/30",   bg: "bg-amber-500/15",   text: "text-amber-400",   btn: "bg-amber-600 hover:bg-amber-500 shadow-amber-500/25",     dot: "bg-amber-500"   },
    rose:    { border: "border-rose-500/30",    bg: "bg-rose-500/15",    text: "text-rose-400",    btn: "bg-rose-600 hover:bg-rose-500 shadow-rose-500/25",       dot: "bg-rose-500"    },
    emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/15", text: "text-emerald-400", btn: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25", dot: "bg-emerald-500" },
  };
  const ac = accentMap[cfg.accent];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={cn("w-full max-w-sm rounded-3xl border overflow-hidden", ac.border)}
        style={{ background: "rgba(22,22,32,0.95)" }}
      >
        {/* Header gradient */}
        <div className={cn("px-6 pt-8 pb-6 bg-gradient-to-br", cfg.color)}>
          <div className="flex flex-col items-center text-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.1 }}
              className={cn("w-16 h-16 rounded-2xl border flex items-center justify-center relative", ac.border, ac.bg)}
            >
              <Icon className={cn("h-8 w-8", ac.text)} />
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#161620] border border-white/10 flex items-center justify-center">
                <Lock className="h-2.5 w-2.5 text-white/50" />
              </div>
            </motion.div>
            <div>
              <h2 className="text-xl font-bold font-serif text-white">{cfg.title}</h2>
              <p className="text-sm text-white/45 mt-2 leading-relaxed">{cfg.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Perks list */}
        <div className="px-6 py-5 space-y-2.5">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Included with activation</p>
          {cfg.perks.map((perk, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.07 }}
              className="flex items-center gap-3"
            >
              <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", ac.dot)} />
              <span className="text-sm text-white/65">{perk}</span>
            </motion.div>
          ))}
        </div>

        {/* CTAs */}
        <div className="px-6 pb-6 space-y-3">
          <Link href="/subscribe">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white shadow-lg transition-colors",
                ac.btn
              )}
            >
              <Star className="h-4 w-4" />
              Subscribe Now
              <ChevronRight className="h-4 w-4 ml-auto" />
            </motion.button>
          </Link>
          <Link href="/">
            <button className="w-full py-2.5 rounded-xl text-xs text-white/35 hover:text-white/60 transition-colors">
              ← Back to Dashboard
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Helper text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-white/25 text-center mt-5 max-w-xs"
      >
        Pay once for full access until end of August.
      </motion.p>
    </div>
  );
}
