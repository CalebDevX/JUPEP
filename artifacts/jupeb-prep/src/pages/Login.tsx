import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Loader2, ArrowRight, BookOpen, Trophy, Users, Star, CheckCircle } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const STATS = [
  { icon: Users, value: "2,400+", label: "Active Students" },
  { icon: Trophy, value: "89%", label: "Pass Rate" },
  { icon: Star, value: "4.9", label: "Student Rating" },
  { icon: BookOpen, value: "39+", label: "Textbook Chapters" },
];

const FEATURES = [
  "AI-powered study notes for all subjects",
  "Past questions with detailed explanations",
  "Live leaderboard and XP tracking",
  "Voice teacher & flashcard system",
];

export default function Login() {
  const [, navigate] = useLocation();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      return setError("Please enter a valid phone number.");
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      localStorage.setItem("jupeb_profile", JSON.stringify(data.profile));
      localStorage.setItem("jupeb_display_name", data.profile.fullName);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#09090f]">
      {/* ── LEFT PANEL (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between overflow-hidden">
        {/* Layered gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0533] via-[#0f0a2e] to-[#09090f]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_10%,rgba(139,92,246,0.25),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(99,102,241,0.2),transparent)]" />

        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #a78bfa 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-violet-600/20 rounded-full blur-[90px]" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-indigo-500/15 rounded-full blur-[70px]" />

        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">JUPEB Prep</p>
              <p className="text-violet-300/60 text-[10px] tracking-widest uppercase mt-0.5">Foundation Studies</p>
            </div>
          </motion.div>

          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-auto"
          >
            <p className="text-violet-300/70 text-sm font-medium tracking-widest uppercase mb-4">Your University Journey Starts Here</p>
            <h2 className="text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tight">
              Study Smarter.<br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                Score Higher.
              </span>
            </h2>
            <p className="mt-5 text-white/40 text-base leading-relaxed max-w-md">
              The #1 JUPEB prep platform trusted by thousands of Nigerian students aiming for admission into top universities.
            </p>

            {/* Feature list */}
            <ul className="mt-7 space-y-3">
              {FEATURES.map((f, i) => (
                <motion.li
                  key={f}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.07 }}
                  className="flex items-center gap-3 text-sm text-white/55"
                >
                  <CheckCircle className="h-4 w-4 text-violet-400 shrink-0" />
                  {f}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-12 grid grid-cols-4 gap-4"
          >
            {STATS.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="bg-white/5 border border-white/8 rounded-2xl p-3.5 backdrop-blur-sm"
              >
                <Icon className="h-4 w-4 text-violet-400 mb-2" />
                <p className="text-white font-bold text-lg leading-none">{value}</p>
                <p className="text-white/35 text-[10px] mt-1 leading-tight">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative">
        {/* Mobile background */}
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0533]/60 via-[#09090f] to-[#09090f]" />
          <div className="absolute top-0 left-0 w-full h-64 bg-[radial-gradient(ellipse_80%_60%_at_30%_0%,rgba(139,92,246,0.2),transparent)]" />
        </div>

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center mb-10 lg:hidden"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30 mb-3">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">JUPEB Prep</h1>
            <p className="text-white/35 text-xs tracking-widest uppercase mt-1">Foundation Studies Platform</p>
          </motion.div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white tracking-tight">Welcome back</h2>
              <p className="text-white/40 text-sm mt-1.5">Sign in to continue your studies</p>
            </div>

            {/* Phone input */}
            <div className="space-y-2 mb-2">
              <label className="text-[11px] font-bold text-white/50 tracking-[0.12em] uppercase">
                Phone Number
              </label>
              <div className="relative group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-600/30 to-indigo-600/30 opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300" />
                <div className="relative flex items-center bg-white/[0.06] border border-white/10 rounded-2xl group-focus-within:border-violet-500/50 transition-colors duration-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3.5 border-r border-white/10">
                    <span className="text-base">🇳🇬</span>
                    <span className="text-white/40 text-sm font-medium">+234</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="080 1234 5678"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    autoFocus
                    className="flex-1 bg-transparent px-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none"
                  />
                  <Phone className="h-4 w-4 text-white/20 mr-4" />
                </div>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-300 flex items-start gap-2">
                    <span className="text-rose-400 mt-0.5">⚠</span>
                    <span>
                      {error}
                      {error.includes("register") && (
                        <Link href="/register">
                          <span className="ml-1 text-violet-400 hover:text-violet-300 font-semibold cursor-pointer underline underline-offset-2">
                            Register here
                          </span>
                        </Link>
                      )}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full mt-5 relative group overflow-hidden rounded-2xl px-6 py-4 font-bold text-sm text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 transition-all group-hover:from-violet-500 group-hover:to-indigo-500" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1),transparent_70%)]" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="relative flex items-center justify-center gap-2.5">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing you in…
                  </>
                ) : (
                  <>
                    Sign In to JUPEB Prep
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-white/20 text-xs">or</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Register link */}
            <Link href="/register">
              <button className="w-full py-3.5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all text-sm font-semibold text-white/60 hover:text-white/80">
                Create a new account
              </button>
            </Link>

            <p className="text-center text-xs text-white/20 mt-6 leading-relaxed">
              By signing in you agree to our terms of service.<br />
              Your data is secure and private.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
