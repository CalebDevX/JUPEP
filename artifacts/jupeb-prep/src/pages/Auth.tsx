import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone, Mail, GraduationCap, Building2, BookOpen,
  ChevronRight, ArrowLeft, Loader2, CheckCircle2, Sparkles,
  Target, MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const ALL_SUBJECTS = [
  { code: "LIT", name: "Literature in English", emoji: "📖", color: "border-violet-500/50 bg-violet-500/10 text-violet-300" },
  { code: "GOV", name: "Government", emoji: "🏛️", color: "border-blue-500/50 bg-blue-500/10 text-blue-300" },
  { code: "ECO", name: "Economics", emoji: "📊", color: "border-amber-500/50 bg-amber-500/10 text-amber-300" },
  { code: "ENG", name: "English Language", emoji: "✍️", color: "border-pink-500/50 bg-pink-500/10 text-pink-300" },
  { code: "MTH", name: "Mathematics", emoji: "📐", color: "border-cyan-500/50 bg-cyan-500/10 text-cyan-300" },
  { code: "BIO", name: "Biology", emoji: "🔬", color: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300" },
  { code: "CHE", name: "Chemistry", emoji: "⚗️", color: "border-red-500/50 bg-red-500/10 text-red-300" },
  { code: "PHY", name: "Physics", emoji: "⚡", color: "border-sky-500/50 bg-sky-500/10 text-sky-300" },
  { code: "CRS", name: "Christian Religious Studies", emoji: "✝️", color: "border-orange-500/50 bg-orange-500/10 text-orange-300" },
  { code: "IRS", name: "Islamic Religious Studies", emoji: "☪️", color: "border-teal-500/50 bg-teal-500/10 text-teal-300" },
];

const GRADE_OPTIONS = [
  { value: "aaa1", label: "AAA+1", points: "16 pts", desc: "Medicine, Law, Pharmacy" },
  { value: "aab1", label: "AAB+1", points: "15 pts", desc: "Engineering, Economics" },
  { value: "bbb1", label: "BBB+1", points: "12 pts", desc: "Sciences, Social Sciences" },
  { value: "ccc1", label: "CCC+1", points: "9 pts", desc: "Arts, Humanities" },
];

type Tab = "login" | "register";
type RegStep = 1 | 2 | 3;

function InputField({
  label, placeholder, value, onChange, type = "text", icon: Icon, required, hint,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string;
  icon?: any; required?: boolean; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-white/50 tracking-wide uppercase">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={cn(
            "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20",
            "focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all",
            Icon ? "pl-10" : ""
          )}
        />
      </div>
      {hint && (
        <p className="text-[11px] text-white/30 flex items-center gap-1">
          <MessageCircle className="h-3 w-3 text-green-400" />
          {hint}
        </p>
      )}
    </div>
  );
}

function StepDot({ n, current, total }: { n: number; current: number; total: number }) {
  const done = current > n;
  const active = current === n;
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300",
        active ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30 scale-110" :
          done ? "bg-emerald-500/80 text-white" : "bg-white/8 text-white/25"
      )}>
        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
      </div>
      {n < total && (
        <div className={cn(
          "w-8 h-0.5 rounded-full transition-all duration-500",
          done ? "bg-emerald-500/60" : "bg-white/8"
        )} />
      )}
    </div>
  );
}

function LoginForm() {
  const [, navigate] = useLocation();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      return setError("Please enter a valid WhatsApp number.");
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
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Welcome back 👋</h2>
        <p className="text-sm text-white/35 mt-0.5">Enter your WhatsApp number to continue.</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-white/50 tracking-wide uppercase">
          WhatsApp Number <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />
          <input
            type="tel"
            placeholder="e.g. 08012345678"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-all"
          />
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-300"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : <><Sparkles className="h-4 w-4" /> Sign In</>}
      </button>
    </div>
  );
}

function RegisterForm() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<RegStep>(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [targetUniversity, setTargetUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [targetGrade, setTargetGrade] = useState("aaa1");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleSubject = (name: string) => {
    setSubjects(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : prev.length < 3 ? [...prev, name] : prev
    );
  };

  const goStep1 = () => {
    if (!fullName.trim()) return setError("Please enter your full name.");
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) return setError("Please enter a valid WhatsApp number (at least 10 digits).");
    setError(""); setStep(2); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goStep2 = () => {
    if (!targetUniversity.trim()) return setError("Please enter your target university.");
    if (!course.trim()) return setError("Please enter your course of study.");
    setError(""); setStep(3); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRegister = async () => {
    if (subjects.length < 1) return setError("Please select at least 1 JUPEB subject.");
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          subjects,
          targetUniversity: targetUniversity.trim(),
          targetGrade,
          accessCode: "",
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

  const stepLabels = ["Your Info", "Your Goals", "Subjects"];

  return (
    <div className="space-y-5">
      {/* Step header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            {step === 1 ? "Create your account" : step === 2 ? "Your goals" : "Pick your subjects"}
          </h2>
          <p className="text-sm text-white/35 mt-0.5">
            {step === 1 ? "Let's get you set up for success." : step === 2 ? "Tell us about your target." : "Choose up to 3 JUPEB subjects."}
          </p>
        </div>
        {step > 1 && (
          <button
            onClick={() => { setStep((step - 1) as RegStep); setError(""); }}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Step dots */}
      <div className="flex items-center">
        {[1, 2, 3].map(n => <StepDot key={n} n={n} current={step} total={3} />)}
        <span className="ml-2 text-[11px] text-white/25">{stepLabels[step - 1]}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-4"
        >
          {step === 1 && (
            <>
              <InputField label="Full Name" placeholder="e.g. Chinaza Okafor" value={fullName} onChange={setFullName} icon={User} required />
              <InputField
                label="WhatsApp Number" placeholder="e.g. 08012345678" value={phone} onChange={setPhone}
                icon={Phone} required type="tel"
                hint="WhatsApp is preferred — we use it for community updates"
              />
              <InputField label="Email Address" placeholder="you@example.com" value={email} onChange={setEmail} icon={Mail} type="email" />
            </>
          )}

          {step === 2 && (
            <>
              <InputField
                label="Target University" placeholder="e.g. University of Lagos (UNILAG)"
                value={targetUniversity} onChange={setTargetUniversity} icon={Building2} required
              />
              <InputField
                label="Course of Study" placeholder="e.g. Law, Medicine, Engineering"
                value={course} onChange={setCourse} icon={BookOpen} required
              />
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 tracking-wide uppercase">
                  Target Grade <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GRADE_OPTIONS.map(g => (
                    <button
                      key={g.value} type="button" onClick={() => setTargetGrade(g.value)}
                      className={cn(
                        "flex flex-col items-start px-3 py-2.5 rounded-xl border text-left transition-all",
                        targetGrade === g.value ? "border-violet-500/60 bg-violet-500/10" : "border-white/8 bg-white/3 hover:border-white/15"
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-sm font-bold", targetGrade === g.value ? "text-violet-300" : "text-white/70")}>{g.label}</span>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-semibold", targetGrade === g.value ? "bg-violet-500/20 text-violet-400" : "bg-white/5 text-white/30")}>{g.points}</span>
                      </div>
                      <span className="text-[10px] text-white/30 mt-0.5">{g.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/50 tracking-wide uppercase">JUPEB Subjects <span className="text-rose-400">*</span></label>
                <span className="text-[11px] text-white/30 bg-white/5 px-2 py-0.5 rounded-lg">{subjects.length}/3 selected</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ALL_SUBJECTS.map(s => {
                  const selected = subjects.includes(s.name);
                  const maxed = !selected && subjects.length >= 3;
                  return (
                    <button
                      key={s.code} type="button" onClick={() => !maxed && toggleSubject(s.name)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
                        selected ? s.color : "border-white/8 bg-white/3 text-white/40 hover:border-white/20 hover:text-white/70",
                        maxed && "opacity-30 cursor-not-allowed"
                      )}
                    >
                      <span>{s.emoji}</span>
                      <span>{s.name}</span>
                      {selected && <CheckCircle2 className="h-3 w-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
              {subjects.length === 3 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-emerald-400/70 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> All 3 subjects selected
                </motion.p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-300"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={step === 1 ? goStep1 : step === 2 ? goStep2 : handleRegister}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
        ) : step < 3 ? (
          <>Continue <ChevronRight className="h-4 w-4" /></>
        ) : (
          <><Sparkles className="h-4 w-4" /> Create My Account</>
        )}
      </button>
    </div>
  );
}

export default function Auth() {
  const [tab, setTab] = useState<Tab>("register");

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4 py-10">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-violet-700/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 w-80 h-80 rounded-full bg-indigo-700/8 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-violet-800/8 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-7"
        >
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center shadow-2xl shadow-violet-500/30 mb-4 ring-1 ring-white/10">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">JUPEB Prep</h1>
          <p className="text-white/30 text-[11px] mt-0.5 tracking-widest uppercase font-medium">Foundation Studies Platform</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="bg-[#13131a] border border-white/8 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Tabs */}
          <div className="flex border-b border-white/6">
            {(["register", "login"] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 py-3.5 text-sm font-semibold transition-all relative",
                  tab === t ? "text-white" : "text-white/30 hover:text-white/55"
                )}
              >
                {t === "register" ? "Create Account" : "Sign In"}
                {tab === t && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {tab === "login" ? <LoginForm /> : <RegisterForm />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-center text-xs text-white/20 mt-5"
        >
          {tab === "register" ? (
            <>Already have an account? <button onClick={() => setTab("login")} className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">Sign in</button></>
          ) : (
            <>New student? <button onClick={() => setTab("register")} className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">Create an account</button></>
          )}
        </motion.p>
      </div>
    </div>
  );
}
