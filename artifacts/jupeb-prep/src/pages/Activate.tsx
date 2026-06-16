import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { KeyRound, GraduationCap, CheckCircle2, Loader2, Lock, Star, Zap, BookOpen, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const PERKS = [
  { icon: Zap, label: "Unlimited quiz practice — all papers" },
  { icon: BookOpen, label: "Full explanations after every answer" },
  { icon: Brain, label: "AI Tutor & study notes" },
  { icon: Star, label: "Leaderboard & streak tracking" },
];

export default function Activate() {
  const [, navigate] = useLocation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const profile = (() => {
    try { return JSON.parse(localStorage.getItem("jupeb_profile") || "null"); } catch { return null; }
  })();

  const handleActivate = async () => {
    if (!code.trim()) return setError("Please enter your access code.");
    if (!profile?.phone) return setError("No account found. Please log in first.");
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: profile.phone, accessCode: code.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Activation failed.");
      localStorage.setItem("jupeb_profile", JSON.stringify(data.profile));
      setSuccess(true);
      setTimeout(() => navigate("/"), 2200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d11] flex flex-col items-center justify-center p-4 py-10">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-600/8 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-amber-600/6 blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/30 mb-4">
            <Star className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Activate Account</h1>
          <p className="text-white/40 text-xs mt-0.5 tracking-widest uppercase">Unlock Full Access</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#161620] border border-white/8 rounded-3xl p-6 shadow-2xl"
        >
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Account Activated! 🎉</h2>
                <p className="text-white/45 text-sm mt-1">Full access unlocked. Redirecting you now…</p>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="mb-5">
                <h2 className="text-lg font-bold text-white">Enter your access code</h2>
                <p className="text-sm text-white/40 mt-0.5">
                  {profile ? `Activating account for ${profile.firstName}` : "Enter the code from your coordinator."}
                </p>
              </div>

              {/* Perks list */}
              <div className="space-y-2 mb-5 p-4 rounded-2xl bg-amber-500/6 border border-amber-500/15">
                <p className="text-[10px] font-bold text-amber-400/70 uppercase tracking-widest mb-2.5">What you unlock</p>
                {PERKS.map(({ icon: Icon, label }, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-2.5 w-2.5 text-amber-400" />
                    </div>
                    <span className="text-xs text-white/60">{label}</span>
                  </div>
                ))}
              </div>

              {/* Code input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 tracking-wide uppercase flex items-center gap-1.5">
                  <Lock className="h-3 w-3" /> Access Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. JUPEB2025"
                    value={code}
                    onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleActivate()}
                    maxLength={24}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all tracking-widest font-mono"
                  />
                </div>
                <p className="text-[11px] text-white/25">Access codes are provided by your JUPEB Prep coordinator.</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 px-4 py-2.5 bg-rose-500/10 border border-rose-500/25 rounded-xl text-sm text-rose-300"
                >
                  {error}
                </motion.div>
              )}

              <button
                onClick={handleActivate}
                disabled={loading}
                className="mt-5 w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-sm hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Activating…</>
                ) : (
                  <><Star className="h-4 w-4" /> Activate Full Access</>
                )}
              </button>
            </>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center mt-4">
          <Link href="/">
            <span className="text-sm text-white/25 hover:text-white/50 cursor-pointer transition-colors">← Back to dashboard</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
