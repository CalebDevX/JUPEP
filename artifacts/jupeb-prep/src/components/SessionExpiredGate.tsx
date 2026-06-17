import { motion } from "framer-motion";
import { CalendarX, Zap, ArrowRight, RefreshCw } from "lucide-react";
import { Link } from "wouter";

export function SessionExpiredGate() {
  return (
    <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto"
        >
          <CalendarX className="h-8 w-8 text-amber-400" />
        </motion.div>

        <div>
          <h1 className="text-2xl font-bold font-serif text-white">Session Ended</h1>
          <p className="text-white/45 text-sm mt-2 leading-relaxed">
            Your access for this JUPEB session has expired. Renew to continue studying for the next session.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-amber-500/15 space-y-3">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">New session includes</p>
          {["Updated question bank", "Fresh study notes & syllabus", "Full AI Tutor access", "Progress tracking reset"].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              className="flex items-center gap-2.5 text-sm text-white/60"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              {item}
            </motion.div>
          ))}
        </div>

        <div className="space-y-3">
          <Link href="/subscribe">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-500/20 transition-colors"
            >
              <Zap className="h-4 w-4" />
              Subscribe for New Session
              <ArrowRight className="h-4 w-4 ml-auto" />
            </motion.button>
          </Link>
          <button
            onClick={() => {
              const profile = JSON.parse(localStorage.getItem("jupeb_profile") || "{}");
              if (profile.phone) {
                fetch(`/api/payment/status/${encodeURIComponent(profile.phone)}`)
                  .then(r => r.json())
                  .then(data => {
                    if (data.isActive) {
                      profile.sessionActive = true;
                      profile.paymentStatus = "paid";
                      if (data.expiresAt) profile.expiresAt = data.expiresAt;
                      localStorage.setItem("jupeb_profile", JSON.stringify(profile));
                      window.location.reload();
                    }
                  });
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            <RefreshCw className="h-3 w-3" /> Already paid? Refresh status
          </button>
        </div>
      </motion.div>
    </div>
  );
}
