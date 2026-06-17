import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone, KeyRound,
  ArrowLeft, Loader2, CheckCircle2,
  BookOpen, ChevronRight, ArrowRight, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const ALL_SUBJECTS = [
  { code: "LIT", name: "Literature in English", emoji: "📖", sel: "bg-violet-500/15 border-violet-500/50 text-violet-200" },
  { code: "GOV", name: "Government", emoji: "🏛️", sel: "bg-blue-500/15 border-blue-500/50 text-blue-200" },
  { code: "ECO", name: "Economics", emoji: "📊", sel: "bg-amber-500/15 border-amber-500/50 text-amber-200" },
  { code: "ENG", name: "English Language", emoji: "✍️", sel: "bg-pink-500/15 border-pink-500/50 text-pink-200" },
  { code: "MTH", name: "Mathematics", emoji: "📐", sel: "bg-cyan-500/15 border-cyan-500/50 text-cyan-200" },
  { code: "BIO", name: "Biology", emoji: "🔬", sel: "bg-emerald-500/15 border-emerald-500/50 text-emerald-200" },
  { code: "CHE", name: "Chemistry", emoji: "⚗️", sel: "bg-red-500/15 border-red-500/50 text-red-200" },
  { code: "PHY", name: "Physics", emoji: "⚡", sel: "bg-sky-500/15 border-sky-500/50 text-sky-200" },
  { code: "CRS", name: "Christian Religious Studies", emoji: "✝️", sel: "bg-orange-500/15 border-orange-500/50 text-orange-200" },
  { code: "IRS", name: "Islamic Religious Studies", emoji: "☪️", sel: "bg-teal-500/15 border-teal-500/50 text-teal-200" },
];

const GRADE_OPTIONS = [
  { value: "aaa1", label: "AAA+1", points: "16 pts", desc: "Medicine · Law · Pharmacy", color: "border-violet-500/50 bg-violet-500/10 text-violet-300 ring-violet-500/30" },
  { value: "aab1", label: "AAB+1", points: "15 pts", desc: "Engineering · Economics", color: "border-indigo-500/50 bg-indigo-500/10 text-indigo-300 ring-indigo-500/30" },
  { value: "bbb1", label: "BBB+1", points: "12 pts", desc: "Sciences · Social Sci.", color: "border-blue-500/50 bg-blue-500/10 text-blue-300 ring-blue-500/30" },
  { value: "ccc1", label: "CCC+1", points: "9 pts", desc: "Arts · Humanities", color: "border-sky-500/50 bg-sky-500/10 text-sky-300 ring-sky-500/30" },
];


function Field({
  label, placeholder, value, onChange, type = "text", icon: Icon, required, hint, maxLength,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string;
  icon?: any; required?: boolean; hint?: string; maxLength?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-white/45 tracking-[0.12em] uppercase">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <div className="relative group">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none" />
        <div className="relative flex items-center bg-white/[0.05] border border-white/[0.09] rounded-xl group-focus-within:border-violet-500/40 transition-colors duration-200">
          {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />}
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            maxLength={maxLength}
            className={cn(
              "w-full bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/18 focus:outline-none",
              Icon ? "pl-10" : ""
            )}
          />
        </div>
      </div>
      {hint && <p className="text-[11px] text-white/25 pl-0.5">{hint}</p>}
    </div>
  );
}

export default function Register() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [targetGrade, setTargetGrade] = useState("aaa1");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [accessCode, setAccessCode] = useState("");
  const [hasCode, setHasCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleSubject = (name: string) => {
    setSubjects(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : prev.length < 4 ? [...prev, name] : prev
    );
  };

  const handleStep1 = () => {
    if (!fullName.trim()) return setError("Please enter your full name.");
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) return setError("Please enter a valid phone number (at least 10 digits).");
    setError("");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRegister = async () => {
    if (subjects.length < 2) return setError("Please select at least 2 JUPEB subjects.");
    if (hasCode && !accessCode.trim()) return setError("Please enter your access code or choose 'Start Free Trial'.");
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          subjects,
          targetGrade,
          accessCode: hasCode ? accessCode.trim().toUpperCase() : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");
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
    <div className="min-h-screen bg-[#09090f] flex flex-col items-center justify-start py-8 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(139,92,246,0.18),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_0%_100%,rgba(99,102,241,0.12),transparent)]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #a78bfa 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30 mb-3">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">JUPEB Prep</h1>
          <p className="text-white/30 text-[10px] tracking-widest uppercase mt-0.5">Foundation Studies Platform</p>
        </motion.div>

        {/* Step progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          {/* Progress bar */}
          <div className="h-1 bg-white/8 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
              animate={{ width: step === 1 ? "50%" : "100%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>

          <div className="flex items-center justify-between px-1">
            {[
              { n: 1, label: "Personal Info" },
              { n: 2, label: "Subjects & Access" },
            ].map(({ n, label }) => (
              <div key={n} className="flex items-center gap-2">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300",
                  step > n ? "bg-emerald-500 text-white" :
                  step === n ? "bg-violet-600 text-white ring-4 ring-violet-500/20" :
                  "bg-white/8 text-white/30"
                )}>
                  {step > n ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
                </div>
                <span className={cn(
                  "text-xs font-medium transition-colors",
                  step === n ? "text-white/80" : step > n ? "text-emerald-400/70" : "text-white/20"
                )}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: step === 1 ? -24 : 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: step === 1 ? 24 : -24, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm"
          >
            {step === 1 ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-white tracking-tight">Create your account</h2>
                  <p className="text-white/40 text-sm mt-1">Let's get you set up for success.</p>
                </div>

                <div className="space-y-4">
                  <Field
                    label="Full Name" placeholder="e.g. Chinaza Okafor"
                    value={fullName} onChange={setFullName} icon={User} required
                  />
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-white/45 tracking-[0.12em] uppercase">
                        Phone Number <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none" />
                        <div className="relative flex items-center bg-white/[0.05] border border-white/[0.09] rounded-xl group-focus-within:border-violet-500/40 transition-colors duration-200 overflow-hidden">
                          <div className="flex items-center gap-2 px-3.5 py-3 border-r border-white/10 shrink-0">
                            <span className="text-sm">🇳🇬</span>
                            <span className="text-white/35 text-xs font-medium">+234</span>
                          </div>
                          <input
                            type="tel"
                            placeholder="080 1234 5678"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="flex-1 bg-transparent px-3.5 py-3 text-sm text-white placeholder:text-white/18 focus:outline-none"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-white/25 pl-0.5">Used to log in — keep it safe</p>
                    </div>
                  </div>

                  {/* Target grade */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/45 tracking-[0.12em] uppercase">
                      Target Grade <span className="text-rose-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {GRADE_OPTIONS.map(g => (
                        <button
                          key={g.value} type="button"
                          onClick={() => setTargetGrade(g.value)}
                          className={cn(
                            "flex flex-col items-start px-4 py-3 rounded-xl border text-left transition-all",
                            targetGrade === g.value
                              ? cn(g.color, "ring-1")
                              : "border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.05]"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={cn("text-sm font-black", targetGrade === g.value ? "" : "text-white/60")}>
                              {g.label}
                            </span>
                            <span className={cn(
                              "text-[9px] px-1.5 py-0.5 rounded-md font-bold",
                              targetGrade === g.value ? "bg-white/15 text-white/80" : "bg-white/5 text-white/25"
                            )}>
                              {g.points}
                            </span>
                          </div>
                          <span className="text-[10px] text-white/30">{g.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => { setStep(1); setError(""); }}
                    className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-white/40 hover:text-white transition-all shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Pick your subjects</h2>
                    <p className="text-white/40 text-sm mt-0.5">Select 2 to 4 JUPEB subjects.</p>
                  </div>
                </div>

                {/* Subject chips */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-white/45 tracking-[0.12em] uppercase">
                      JUPEB Subjects <span className="text-rose-400">*</span>
                    </label>
                    <span className={cn(
                      "text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors",
                      subjects.length >= 2 ? "bg-emerald-500/15 text-emerald-400" : "bg-white/8 text-white/30"
                    )}>
                      {subjects.length}/4 selected
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {ALL_SUBJECTS.map(s => {
                      const selected = subjects.includes(s.name);
                      const maxed = !selected && subjects.length >= 4;
                      return (
                        <motion.button
                          key={s.code} type="button"
                          onClick={() => !maxed && toggleSubject(s.name)}
                          whileTap={!maxed ? { scale: 0.95 } : undefined}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
                            selected
                              ? s.sel
                              : maxed
                                ? "border-white/[0.05] bg-white/[0.02] text-white/20 cursor-not-allowed"
                                : "border-white/[0.08] bg-white/[0.03] text-white/40 hover:border-white/20 hover:text-white/70 hover:bg-white/[0.06]"
                          )}
                        >
                          <span className={maxed ? "grayscale opacity-50" : ""}>{s.emoji}</span>
                          <span>{s.name}</span>
                          {selected && (
                            <CheckCircle2 className="h-3 w-3 ml-0.5 opacity-80" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Access toggle */}
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-white/45 tracking-[0.12em] uppercase">
                    Access Type
                  </label>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button" onClick={() => setHasCode(false)}
                      className={cn(
                        "flex flex-col items-start px-4 py-3.5 rounded-xl border text-left transition-all",
                        !hasCode
                          ? "border-emerald-500/40 bg-emerald-500/10 ring-1 ring-emerald-500/20"
                          : "border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.05]"
                      )}
                    >
                      <span className="text-xl mb-1.5">🎯</span>
                      <span className={cn("text-sm font-bold", !hasCode ? "text-emerald-300" : "text-white/60")}>
                        Free Trial
                      </span>
                      <span className="text-[10px] text-white/30 mt-0.5">5 practice questions</span>
                    </button>
                    <button
                      type="button" onClick={() => setHasCode(true)}
                      className={cn(
                        "flex flex-col items-start px-4 py-3.5 rounded-xl border text-left transition-all",
                        hasCode
                          ? "border-violet-500/40 bg-violet-500/10 ring-1 ring-violet-500/20"
                          : "border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.05]"
                      )}
                    >
                      <span className="text-xl mb-1.5">🔑</span>
                      <span className={cn("text-sm font-bold", hasCode ? "text-violet-300" : "text-white/60")}>
                        Have a Code
                      </span>
                      <span className="text-[10px] text-white/30 mt-0.5">Full access</span>
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {hasCode ? (
                      <motion.div
                        key="code"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="relative group pt-1">
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none" />
                          <div className="relative flex items-center bg-white/[0.05] border border-white/[0.09] rounded-xl group-focus-within:border-violet-500/40 transition-colors duration-200">
                            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />
                            <input
                              type="text"
                              placeholder="Enter your access code"
                              value={accessCode}
                              onChange={e => setAccessCode(e.target.value.toUpperCase())}
                              maxLength={24}
                              className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/18 focus:outline-none tracking-widest font-mono"
                            />
                          </div>
                          <p className="text-[11px] text-white/20 mt-1.5 pl-0.5">
                            Access codes are provided by your JUPEB Prep coordinator.
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="free"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-1 px-4 py-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15 text-xs text-white/45 leading-relaxed">
                          ✅ Practice 5 questions for free — no payment needed.<br />
                          You can activate full access anytime from your account.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-300 flex items-start gap-2">
                    <span className="text-rose-400 mt-0.5 shrink-0">⚠</span>
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA */}
            <div className="mt-6">
              {step === 1 ? (
                <button
                  onClick={handleStep1}
                  className="w-full relative group overflow-hidden rounded-2xl px-6 py-4 font-bold text-sm text-white transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 transition-all group-hover:from-violet-500 group-hover:to-indigo-500" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1),transparent_70%)]" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <span className="relative flex items-center justify-center gap-2.5">
                    Continue to Step 2
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full relative group overflow-hidden rounded-2xl px-6 py-4 font-bold text-sm text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 group-hover:from-violet-500 group-hover:to-indigo-500 transition-all" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1),transparent_70%)]" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <span className="relative flex items-center justify-center gap-2.5">
                    {loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Create My Account<ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" /></>
                    )}
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-center text-sm text-white/25 mt-5"
        >
          Already have an account?{" "}
          <Link href="/login">
            <span className="text-violet-400 hover:text-violet-300 font-semibold cursor-pointer transition-colors">
              Sign in
            </span>
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
