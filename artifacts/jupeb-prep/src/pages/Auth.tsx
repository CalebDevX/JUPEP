import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone, Mail, GraduationCap, Building2, BookOpen,
  ChevronRight, ArrowLeft, Loader2, CheckCircle2, Sparkles,
  MessageCircle, ChevronDown, Search, Check, Zap, Trophy, Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

declare global {
  interface Window { google: any; }
}

const NIGERIAN_UNIVERSITIES = [
  "University of Lagos (UNILAG)",
  "University of Ibadan (UI)",
  "Obafemi Awolowo University (OAU)",
  "University of Nigeria, Nsukka (UNN)",
  "Ahmadu Bello University (ABU)",
  "University of Benin (UNIBEN)",
  "University of Ilorin (UNILORIN)",
  "University of Abuja (UNIABUJA)",
  "University of Port Harcourt (UNIPORT)",
  "Nnamdi Azikiwe University (UNIZIK)",
  "Federal University of Technology, Akure (FUTA)",
  "Federal University of Technology, Minna (FUTMINNA)",
  "Bayero University Kano (BUK)",
  "University of Jos (UNIJOS)",
  "Imo State University (IMSU)",
  "Lagos State University (LASU)",
  "Olabisi Onabanjo University (OOU)",
  "Covenant University",
  "Babcock University",
  "Pan-Atlantic University (PAU)",
  "American University of Nigeria (AUN)",
  "Crawford University",
  "Redeemer's University",
  "Landmark University",
  "Others (type manually)",
];

const ALL_SUBJECTS = [
  { code: "LIT", name: "Literature in English", emoji: "📖", bg: "bg-violet-500/15", border: "border-violet-500/40", text: "text-violet-300", check: "bg-violet-500" },
  { code: "GOV", name: "Government",             emoji: "🏛️", bg: "bg-blue-500/15",   border: "border-blue-500/40",   text: "text-blue-300",   check: "bg-blue-500"   },
  { code: "ECO", name: "Economics",              emoji: "📊", bg: "bg-amber-500/15",  border: "border-amber-500/40",  text: "text-amber-300",  check: "bg-amber-500"  },
  { code: "ENG", name: "English Language",       emoji: "✍️", bg: "bg-pink-500/15",   border: "border-pink-500/40",   text: "text-pink-300",   check: "bg-pink-500"   },
  { code: "HIS", name: "History",                emoji: "📜", bg: "bg-orange-500/15", border: "border-orange-500/40", text: "text-orange-300", check: "bg-orange-500" },
  { code: "GEO", name: "Geography",              emoji: "🌍", bg: "bg-cyan-500/15",   border: "border-cyan-500/40",   text: "text-cyan-300",   check: "bg-cyan-500"   },
  { code: "ACC", name: "Accounting",             emoji: "🧾", bg: "bg-lime-500/15",   border: "border-lime-500/40",   text: "text-lime-300",   check: "bg-lime-500"   },
  { code: "COM", name: "Commerce",               emoji: "🏪", bg: "bg-emerald-500/15",border: "border-emerald-500/40",text: "text-emerald-300",check: "bg-emerald-500"},
  { code: "MTH", name: "Mathematics",            emoji: "📐", bg: "bg-sky-500/15",    border: "border-sky-500/40",    text: "text-sky-300",    check: "bg-sky-500"    },
  { code: "BIO", name: "Biology",                emoji: "🔬", bg: "bg-green-500/15",  border: "border-green-500/40",  text: "text-green-300",  check: "bg-green-500"  },
  { code: "CHE", name: "Chemistry",              emoji: "⚗️", bg: "bg-red-500/15",    border: "border-red-500/40",    text: "text-red-300",    check: "bg-red-500"    },
  { code: "PHY", name: "Physics",                emoji: "⚡", bg: "bg-rose-500/15",   border: "border-rose-500/40",   text: "text-rose-300",   check: "bg-rose-500"   },
  { code: "CRS", name: "Christian Religious Studies", emoji: "✝️", bg: "bg-teal-500/15", border: "border-teal-500/40", text: "text-teal-300", check: "bg-teal-500" },
  { code: "IRS", name: "Islamic Religious Studies",   emoji: "☪️", bg: "bg-indigo-500/15",border: "border-indigo-500/40",text: "text-indigo-300",check: "bg-indigo-500"},
  { code: "FMT", name: "Further Mathematics",    emoji: "∑",  bg: "bg-purple-500/15", border: "border-purple-500/40", text: "text-purple-300", check: "bg-purple-500" },
  { code: "AGR", name: "Agricultural Science",   emoji: "🌾", bg: "bg-lime-600/15",   border: "border-lime-600/40",   text: "text-lime-400",   check: "bg-lime-600"   },
  { code: "CMP", name: "Computer Science",       emoji: "💻", bg: "bg-blue-600/15",   border: "border-blue-600/40",   text: "text-blue-400",   check: "bg-blue-600"   },
];

const GRADE_OPTIONS = [
  { value: "aaa1", label: "AAA+1", points: "16 pts", desc: "Medicine, Law, Pharmacy" },
  { value: "aab1", label: "AAB+1", points: "15 pts", desc: "Engineering, Economics"  },
  { value: "bbb1", label: "BBB+1", points: "12 pts", desc: "Sciences, Social Sciences"},
  { value: "ccc1", label: "CCC+1", points: "9 pts",  desc: "Arts, Humanities"        },
];

type Tab = "login" | "register";
type RegStep = 1 | 2 | 3;
type GoogleData = { name: string; email: string; picture?: string | null } | null;

function UniversitySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen]           = useState(false);
  const [search, setSearch]       = useState("");
  const [manualMode, setManualMode] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = NIGERIAN_UNIVERSITIES.filter(u =>
    u.toLowerCase().includes(search.toLowerCase())
  );

  if (manualMode) {
    return (
      <div className="space-y-2">
        <input
          type="text" placeholder="Type your university name…" value={value}
          onChange={e => onChange(e.target.value)} autoFocus
          className="w-full bg-white/5 border border-violet-500/40 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none transition-all"
        />
        <button type="button" onClick={() => { setManualMode(false); onChange(""); }}
          className="text-[11px] text-white/30 hover:text-violet-400 transition-colors">
          ← Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className={cn("w-full flex items-center gap-3 bg-white/5 border rounded-xl px-4 py-3 text-sm text-left transition-all",
          open ? "border-violet-500/50 bg-white/8" : "border-white/10 hover:border-white/20")}>
        <Building2 className="h-4 w-4 text-white/25 flex-shrink-0" />
        <span className={value ? "text-white flex-1 truncate" : "text-white/25 flex-1"}>
          {value || "Select your university"}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-white/25 flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.14 }}
            className="absolute top-full left-0 right-0 mt-1.5 bg-[#1c1c26] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
            <div className="p-2.5 border-b border-white/8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" />
                <input type="text" placeholder="Search universities…" value={search}
                  onChange={e => setSearch(e.target.value)} autoFocus
                  className="w-full bg-white/5 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none" />
              </div>
            </div>
            <div className="overflow-y-auto max-h-52">
              {filtered.map(uni => {
                const isOthers   = uni === "Others (type manually)";
                const isSelected = value === uni;
                return (
                  <button key={uni} type="button"
                    onClick={() => {
                      if (isOthers) { setManualMode(true); setOpen(false); }
                      else { onChange(uni); setOpen(false); setSearch(""); }
                    }}
                    className={cn("w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2",
                      isSelected  ? "bg-violet-500/15 text-violet-300" :
                      isOthers    ? "text-violet-400 hover:bg-violet-500/10 border-t border-white/6 mt-0.5 font-medium" :
                                    "text-white/65 hover:bg-white/5 hover:text-white")}>
                    <span className="flex-1">{uni}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="px-4 py-4 text-sm text-white/30 text-center">
                  No match —{" "}
                  <button className="text-violet-400 font-medium"
                    onClick={() => { setManualMode(true); setOpen(false); }}>
                    type manually
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, type = "text", icon: Icon, required, hint, children }: {
  label: string; placeholder?: string; value?: string; onChange?: (v: string) => void;
  type?: string; icon?: any; required?: boolean; hint?: string; children?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-white/40 tracking-widest uppercase">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {children ?? (
        <div className="relative">
          {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />}
          <input type={type} placeholder={placeholder} value={value}
            onChange={e => onChange?.(e.target.value)}
            className={cn("w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20",
              "focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all", Icon && "pl-10")} />
        </div>
      )}
      {hint && (
        <p className="text-[11px] text-emerald-400/70 flex items-center gap-1.5">
          <MessageCircle className="h-3 w-3 flex-shrink-0" />{hint}
        </p>
      )}
    </div>
  );
}

function StepBar({ step }: { step: RegStep }) {
  const labels = ["Personal Info", "Your Goals", "Subjects"];
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {[1, 2, 3].map(n => (
          <div key={n} className={cn("flex-1 h-1 rounded-full transition-all duration-500",
            step > n ? "bg-emerald-500" : step === n ? "bg-violet-500" : "bg-white/10")} />
        ))}
      </div>
      <p className="text-[11px] text-white/30">
        Step {step} of 3 — <span className="text-white/50 font-medium">{labels[step - 1]}</span>
      </p>
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-300">
      {msg}
    </motion.div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-white/8" />
      <span className="text-[11px] text-white/20 font-medium">or</span>
      <div className="flex-1 h-px bg-white/8" />
    </div>
  );
}

function GoogleButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/12 hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-white/40" />
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      )}
      <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">
        Continue with Google
      </span>
    </button>
  );
}

function LoginForm({ onGoogleClick, googleLoading }: {
  onGoogleClick: () => void; googleLoading: boolean;
}) {
  const [, navigate] = useLocation();
  const [phone, setPhone]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleLogin = async () => {
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      return setError("Please enter a valid WhatsApp number.");
    }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      localStorage.setItem("jupeb_profile", JSON.stringify(data.profile));
      localStorage.setItem("jupeb_display_name", data.profile.fullName);
      navigate("/");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Welcome back 👋</h2>
        <p className="text-sm text-white/35 mt-0.5">Sign in with Google or your WhatsApp number.</p>
      </div>

      <GoogleButton onClick={onGoogleClick} loading={googleLoading} />
      <Divider />

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-white/40 tracking-widest uppercase">
          WhatsApp Number <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />
          <input type="tel" placeholder="e.g. 08012345678" value={phone}
            onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()} autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
        </div>
      </div>

      <AnimatePresence>{error && <ErrorBox msg={error} />}</AnimatePresence>

      <button onClick={handleLogin} disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</> : <><Sparkles className="h-4 w-4" />Sign In</>}
      </button>
    </div>
  );
}

function RegisterForm({ onGoogleClick, googleLoading, googlePreFill }: {
  onGoogleClick: () => void; googleLoading: boolean; googlePreFill: GoogleData;
}) {
  const [, navigate] = useLocation();
  const [step, setStep]                   = useState<RegStep>(1);
  const [fullName, setFullName]           = useState(googlePreFill?.name || "");
  const [phone, setPhone]                 = useState("");
  const [email, setEmail]                 = useState(googlePreFill?.email || "");
  const [targetUniversity, setTargetUniversity] = useState("");
  const [course, setCourse]               = useState("");
  const [targetGrade, setTargetGrade]     = useState("aaa1");
  const [subjects, setSubjects]           = useState<string[]>([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");

  useEffect(() => {
    if (googlePreFill) {
      if (googlePreFill.name)  setFullName(googlePreFill.name);
      if (googlePreFill.email) setEmail(googlePreFill.email);
    }
  }, [googlePreFill]);

  const toggleSubject = (name: string) => {
    setSubjects(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : prev.length < 3 ? [...prev, name] : prev
    );
  };

  const goStep2 = () => {
    if (!fullName.trim()) return setError("Please enter your full name.");
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) return setError("Please enter a valid WhatsApp number (at least 10 digits).");
    setError(""); setStep(2);
  };

  const goStep3 = () => {
    if (!targetUniversity.trim()) return setError("Please select or enter your target university.");
    if (!course.trim()) return setError("Please enter your intended course of study.");
    setError(""); setStep(3);
  };

  const handleRegister = async () => {
    if (subjects.length < 1) return setError("Please select at least 1 JUPEB subject.");
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(), phone: phone.trim(),
          email: email.trim() || null, subjects,
          targetUniversity: targetUniversity.trim(),
          targetGrade, accessCode: "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");
      localStorage.setItem("jupeb_profile", JSON.stringify(data.profile));
      localStorage.setItem("jupeb_display_name", data.profile.fullName);
      navigate("/");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            {step === 1 ? "Create your account" : step === 2 ? "Your goals" : "Pick your subjects"}
          </h2>
          <p className="text-sm text-white/35 mt-0.5">
            {step === 1 ? "Set up your profile in 3 quick steps." : step === 2 ? "Tell us your target and course." : "Choose up to 3 JUPEB subjects."}
          </p>
        </div>
        {step > 1 && (
          <button onClick={() => { setStep((step - 1) as RegStep); setError(""); }}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all flex-shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      <StepBar step={step} />

      {step === 1 && (
        <>
          <GoogleButton onClick={onGoogleClick} loading={googleLoading} />
          {googlePreFill && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
              Connected as {googlePreFill.email} — just add your phone to finish
            </div>
          )}
          <Divider />
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-4">
          {step === 1 && (
            <>
              <Field label="Full Name" placeholder="e.g. Chinaza Okafor" value={fullName} onChange={setFullName} icon={User} required />
              <Field label="WhatsApp Number" placeholder="e.g. 08012345678" value={phone} onChange={setPhone}
                icon={Phone} required type="tel" hint="WhatsApp is preferred — we use it for community updates" />
              <Field label="Email Address" placeholder="you@example.com" value={email} onChange={setEmail} icon={Mail} type="email" />
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Target University" required>
                <UniversitySelect value={targetUniversity} onChange={setTargetUniversity} />
              </Field>
              <Field label="Intended Course" placeholder="e.g. Law, Medicine, Engineering"
                value={course} onChange={setCourse} icon={BookOpen} required />
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-white/40 tracking-widest uppercase">
                  Target Grade <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GRADE_OPTIONS.map(g => (
                    <button key={g.value} type="button" onClick={() => setTargetGrade(g.value)}
                      className={cn("flex flex-col items-start px-3 py-2.5 rounded-xl border text-left transition-all",
                        targetGrade === g.value ? "border-violet-500/60 bg-violet-500/10" : "border-white/8 bg-white/3 hover:border-white/15")}>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-sm font-bold", targetGrade === g.value ? "text-violet-300" : "text-white/70")}>{g.label}</span>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-semibold", targetGrade === g.value ? "bg-violet-500/20 text-violet-400" : "bg-white/5 text-white/30")}>{g.points}</span>
                      </div>
                      <span className="text-[10px] text-white/30 mt-0.5 leading-tight">{g.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-white/40 tracking-widest uppercase">
                  JUPEB Subjects <span className="text-rose-400">*</span>
                </label>
                <span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-lg border transition-all",
                  subjects.length === 3 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-white/5 text-white/30 border-white/8")}>
                  {subjects.length}/3
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ALL_SUBJECTS.map(s => {
                  const selected = subjects.includes(s.name);
                  const maxed    = !selected && subjects.length >= 3;
                  return (
                    <button key={s.code} type="button" onClick={() => !maxed && toggleSubject(s.name)}
                      className={cn("flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all",
                        selected ? cn(s.bg, s.border) : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5",
                        maxed && "opacity-30 cursor-not-allowed")}>
                      <span className="text-lg leading-none flex-shrink-0">{s.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-xs font-semibold leading-tight", selected ? s.text : "text-white/60")}>{s.name}</p>
                        <p className="text-[9px] text-white/25 mt-0.5">{s.code}</p>
                      </div>
                      {selected && (
                        <div className={cn("w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0", s.check)}>
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {subjects.length === 3 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-[11px] text-emerald-400/70 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3" />All 3 subjects selected — you're ready!
                </motion.p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>{error && <ErrorBox msg={error} />}</AnimatePresence>

      <button onClick={step === 1 ? goStep2 : step === 2 ? goStep3 : handleRegister} disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Creating account…</>
        ) : step < 3 ? (
          <>Continue<ChevronRight className="h-4 w-4" /></>
        ) : (
          <><Sparkles className="h-4 w-4" />Create My Account</>
        )}
      </button>
    </div>
  );
}

export default function Auth() {
  const [, navigate]      = useLocation();
  const [tab, setTab]     = useState<Tab>("register");
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading]   = useState(false);
  const [googlePreFill, setGooglePreFill]   = useState<GoogleData>(null);

  useEffect(() => {
    fetch(`${BASE}/api/auth/google/config`)
      .then(r => r.json())
      .then(d => { if (d.clientId) setGoogleClientId(d.clientId); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!googleClientId) return;
    const script = document.createElement("script");
    script.src  = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleResponse,
      });
    };
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, [googleClientId]);

  const handleGoogleResponse = useCallback(async (response: any) => {
    setGoogleLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/google`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (data.profile) {
        localStorage.setItem("jupeb_profile", JSON.stringify(data.profile));
        localStorage.setItem("jupeb_display_name", data.profile.fullName);
        navigate("/");
      } else if (data.needsRegistration) {
        setGooglePreFill(data.googleData);
        setTab("register");
      }
    } catch {}
    finally { setGoogleLoading(false); }
  }, [navigate]);

  const handleGoogleClick = () => {
    if (!googleClientId) return;
    window.google?.accounts.id.prompt();
  };

  const FEATURES = [
    { icon: Brain,   label: "AI-Powered Learning",   color: "text-violet-400" },
    { icon: Trophy,  label: "Track Your Progress",    color: "text-amber-400"  },
    { icon: Zap,     label: "Practice Past Questions", color: "text-emerald-400"},
  ];

  return (
    <div className="min-h-screen bg-[#09090e] flex flex-col items-center justify-center p-4 py-8">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-violet-700/8 blur-[80px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-indigo-700/8 blur-[80px]" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 rounded-full bg-emerald-700/5 blur-[60px]" />
      </div>

      <div className="w-full max-w-md relative">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl overflow-hidden shadow-2xl border border-white/8">

          {/* Brand header */}
          <div className="relative bg-gradient-to-br from-[#1a1030] via-[#151025] to-[#0e0e1a] px-6 pt-8 pb-6 border-b border-white/6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-indigo-600/8" />
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-violet-500/8 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 ring-1 ring-white/10 flex-shrink-0">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white leading-none">JUPEB Prep</h1>
                  <p className="text-[10px] text-white/35 tracking-widest uppercase mt-0.5">Foundation Studies</p>
                </div>
              </div>
              <p className="text-white/60 text-sm mb-4 leading-relaxed">
                Nigeria's smartest JUPEB prep platform. Study smarter, score higher.
              </p>
              <div className="flex flex-wrap gap-2">
                {FEATURES.map(f => (
                  <div key={f.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/8">
                    <f.icon className={cn("h-3 w-3", f.color)} />
                    <span className="text-[10px] font-medium text-white/50">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#0f0f18] border-b border-white/6">
            {(["register", "login"] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn("flex-1 py-3.5 text-sm font-semibold transition-all relative",
                  tab === t ? "text-white" : "text-white/30 hover:text-white/55")}>
                {t === "register" ? "Create Account" : "Sign In"}
                {tab === t && (
                  <motion.div layoutId="auth-tab-line"
                    className="absolute bottom-0 left-6 right-6 h-[2px] bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="bg-[#0f0f18] px-6 py-6">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                {tab === "login" ? (
                  <LoginForm onGoogleClick={handleGoogleClick} googleLoading={googleLoading} />
                ) : (
                  <RegisterForm onGoogleClick={handleGoogleClick} googleLoading={googleLoading} googlePreFill={googlePreFill} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-center text-xs text-white/20 mt-4">
          {tab === "register" ? (
            <>Already have an account?{" "}
              <button onClick={() => setTab("login")} className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">Sign in</button>
            </>
          ) : (
            <>New student?{" "}
              <button onClick={() => setTab("register")} className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">Create an account</button>
            </>
          )}
        </motion.p>
      </div>
    </div>
  );
}
