import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Zap, Brain, BookOpen, Mic, Trophy, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PERKS = [
  { icon: Zap,         text: "Unlimited practice questions" },
  { icon: Brain,       text: "Personal AI Tutor (LexBot)" },
  { icon: BookOpen,    text: "Full AI study notes per topic" },
  { icon: Mic,         text: "Voice AI teacher" },
  { icon: Trophy,      text: "Leaderboard & streaks" },
  { icon: CheckCircle2,text: "Full explanations after every answer" },
];

export default function Subscribe() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [config, setConfig] = useState<{ price: number; sessionEnd: string; configured: boolean } | null>(null);

  const profile = (() => {
    try { return JSON.parse(localStorage.getItem("jupeb_profile") || "{}"); } catch { return {}; }
  })();

  useEffect(() => {
    fetch("/api/payment/config")
      .then(r => r.json())
      .then(setConfig)
      .catch(() => {});
  }, []);

  const priceNaira = config ? Math.round(config.price / 100) : null;
  const sessionEnd = config?.sessionEnd
    ? new Date(config.sessionEnd).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })
    : "end of August 2026";

  async function handlePay() {
    if (!profile.phone) {
      window.location.href = "/auth";
      return;
    }
    if (!config?.configured) {
      setError("Payment is not configured yet. Please contact your coordinator.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: profile.phone, email: profile.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize payment.");
      window.location.href = data.authorizationUrl;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
            <Zap className="h-7 w-7 text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-white">Activate for This Session</h1>
          <p className="text-white/45 text-sm mt-2">
            Full access until <span className="text-violet-400 font-semibold">{sessionEnd}</span>
          </p>
        </div>

        {/* Price card */}
        <div className="glass-card rounded-2xl p-5 mb-4 border border-violet-500/20">
          {/* Perks */}
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">What you get</p>
          <div className="space-y-2.5 mb-5">
            {PERKS.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <span className="text-sm text-white/70">{text}</span>
              </motion.div>
            ))}
          </div>

          {/* Price */}
          <div className="border-t border-white/8 pt-4 mb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-white/50 text-sm">This session</span>
              {priceNaira != null ? (
                <span className="text-2xl font-bold text-white">
                  ₦{priceNaira.toLocaleString()}
                  <span className="text-sm text-white/40 font-normal ml-1">one-time</span>
                </span>
              ) : (
                <span className="text-white/40 text-sm">Loading…</span>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-400 text-xs mb-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button
            onClick={handlePay}
            disabled={loading || !config}
            className={cn(
              "w-full h-12 font-bold text-sm rounded-xl bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-500/20 transition-all",
              loading && "opacity-70"
            )}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing…</>
            ) : (
              <>Pay with Paystack <ArrowRight className="h-4 w-4 ml-2" /></>
            )}
          </Button>
        </div>

        {/* Back link */}
        <button
          onClick={() => window.history.back()}
          className="w-full text-center text-xs text-white/30 hover:text-white/50 transition-colors py-2"
        >
          ← Go back
        </button>
      </motion.div>
    </div>
  );
}
