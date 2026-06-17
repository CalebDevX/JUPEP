import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone, Mail, GraduationCap, Building2, BookOpen,
  ChevronRight, ArrowLeft, Loader2, CheckCircle2,
  MessageCircle, ChevronDown, Search, Check, Zap, Trophy, Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

declare global { interface Window { google: any; } }

// ── Data ──────────────────────────────────────────────────────────────────────

const NIGERIAN_UNIVERSITIES = [
  "University of Lagos (UNILAG)", "University of Ibadan (UI)", "Obafemi Awolowo University (OAU)",
  "University of Nigeria, Nsukka (UNN)", "Ahmadu Bello University (ABU)", "University of Benin (UNIBEN)",
  "University of Ilorin (UNILORIN)", "University of Abuja (UNIABUJA)", "University of Port Harcourt (UNIPORT)",
  "Nnamdi Azikiwe University (UNIZIK)", "Federal University of Technology, Akure (FUTA)",
  "Federal University of Technology, Minna (FUTMINNA)", "Bayero University Kano (BUK)",
  "University of Jos (UNIJOS)", "Imo State University (IMSU)", "Lagos State University (LASU)",
  "Olabisi Onabanjo University (OOU)", "Covenant University", "Babcock University",
  "Pan-Atlantic University (PAU)", "American University of Nigeria (AUN)", "Crawford University",
  "Redeemer's University", "Landmark University", "Others (type manually)",
];

const ALL_SUBJECTS = [
  { code: "LIT", name: "Literature in English",    emoji: "📖", color: "violet" },
  { code: "GOV", name: "Government",                emoji: "🏛️", color: "blue"   },
  { code: "ECO", name: "Economics",                 emoji: "📊", color: "amber"  },
  { code: "ENG", name: "English Language",          emoji: "✍️", color: "pink"   },
  { code: "HIS", name: "History",                   emoji: "📜", color: "orange" },
  { code: "GEO", name: "Geography",                 emoji: "🌍", color: "cyan"   },
  { code: "ACC", name: "Accounting",                emoji: "🧾", color: "lime"   },
  { code: "COM", name: "Commerce",                  emoji: "🏪", color: "emerald"},
  { code: "MTH", name: "Mathematics",               emoji: "📐", color: "sky"    },
  { code: "BIO", name: "Biology",                   emoji: "🔬", color: "green"  },
  { code: "CHE", name: "Chemistry",                 emoji: "⚗️", color: "red"    },
  { code: "PHY", name: "Physics",                   emoji: "⚡", color: "rose"   },
  { code: "CRS", name: "Christian Religious Studies", emoji: "✝️", color: "teal" },
  { code: "IRS", name: "Islamic Religious Studies", emoji: "☪️", color: "indigo" },
  { code: "FMT", name: "Further Mathematics",       emoji: "∑",  color: "purple" },
  { code: "AGR", name: "Agricultural Science",      emoji: "🌾", color: "lime"   },
  { code: "CMP", name: "Computer Science",          emoji: "💻", color: "blue"   },
];

const GRADE_OPTIONS = [
  { value: "aaa1", label: "AAA+1", points: "16 pts", desc: "Medicine, Law, Pharmacy" },
  { value: "aab1", label: "AAB+1", points: "15 pts", desc: "Engineering, Economics"  },
  { value: "bbb1", label: "BBB+1", points: "12 pts", desc: "Sciences, Social Sciences"},
  { value: "ccc1", label: "CCC+1", points: "9 pts",  desc: "Arts, Humanities"        },
];

type Tab      = "login" | "register";
type RegStep  = 1 | 2 | 3;
type GoogleData = { name: string; email: string; picture?: string | null } | null;

// ── Shared primitives ─────────────────────────────────────────────────────────

const inputCls = "w-full bg-transparent border border-white/12 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] transition-all duration-200 rounded-lg";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 mb-1.5">{children}</p>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="px-4 py-3 border border-rose-500/30 bg-rose-500/8 text-sm text-rose-300 rounded-lg">
      {msg}
    </motion.div>
  );
}

// Thin art-deco rule with optional center text
function Rule({ label }: { label?: string }) {
  if (!label) return <div className="h-px bg-white/8 my-1" />;
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-white/8" />
      <span className="text-[10px] tracking-widest uppercase text-white/20">{label}</span>
      <div className="flex-1 h-px bg-white/8" />
    </div>
  );
}

// Art-deco corner brackets — now with animated glow
function CornerMark({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const borderCls = {
    tl: "top-0 left-0 border-t border-l",
    tr: "top-0 right-0 border-t border-r",
    bl: "bottom-0 left-0 border-b border-l",
    br: "bottom-0 right-0 border-b border-r",
  }[pos];
  return (
    <motion.span
      className={cn("absolute w-3.5 h-3.5 border-violet-500/50", borderCls)}
      animate={{ borderColor: ["rgba(139,92,246,0.3)", "rgba(139,92,246,0.6)", "rgba(139,92,246,0.3)"] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────

function AnimatedCounter({ to, duration = 1.5 }: { to: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const end = start + duration * 1000;
    const tick = () => {
      const now = Date.now();
      const pct = Math.min(1, (now - start) / (duration * 1000));
      setCount(Math.round(pct * to));
      if (now < end) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to, duration]);
  return <>{count}</>;
}

// ── Google button ─────────────────────────────────────────────────────────────

function GoogleButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-white/10 bg-white/3 hover:bg-white/6 hover:border-white/20 transition-all duration-200 disabled:opacity-40 text-sm font-medium text-white/60 hover:text-white rounded-lg group">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
        <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      )}
      Continue with Google
    </button>
  );
}

// ── University selector ───────────────────────────────────────────────────────

function UniversitySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen]               = useState(false);
  const [search, setSearch]           = useState("");
  const [manualMode, setManualMode]   = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = NIGERIAN_UNIVERSITIES.filter(u => u.toLowerCase().includes(search.toLowerCase()));

  if (manualMode) {
    return (
      <div className="space-y-2">
        <input type="text" placeholder="Type your university name…" value={value}
          onChange={e => onChange(e.target.value)} autoFocus className={inputCls} />
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
        className={cn("w-full flex items-center gap-3 border px-4 py-3 text-sm text-left transition-all duration-200 rounded-lg",
          open ? "border-violet-500/50 bg-white/5 shadow-[0_0_0_3px_rgba(139,92,246,0.12)]" : "border-white/12 bg-transparent hover:border-white/20")}>
        <Building2 className="h-4 w-4 text-white/20 flex-shrink-0" />
        <span className={cn("flex-1", value ? "text-white" : "text-white/20")}>{value || "Select your university"}</span>
        <ChevronDown className={cn("h-4 w-4 text-white/20 flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }}
            className="absolute top-full left-0 right-0 mt-px bg-[#131318] border border-white/12 shadow-2xl overflow-hidden z-50 rounded-lg">
            <div className="p-2 border-b border-white/8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                <input type="text" placeholder="Search…" value={search}
                  onChange={e => setSearch(e.target.value)} autoFocus
                  className="w-full bg-white/5 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none rounded-md" />
              </div>
            </div>
            <div className="overflow-y-auto max-h-52">
              {filtered.map(uni => {
                const isOthers = uni === "Others (type manually)";
                const isSelected = value === uni;
                return (
                  <button key={uni} type="button"
                    onClick={() => {
                      if (isOthers) { setManualMode(true); setOpen(false); }
                      else { onChange(uni); setOpen(false); setSearch(""); }
                    }}
                    className={cn("w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors",
                      isSelected  ? "bg-violet-500/12 text-violet-300" :
                      isOthers    ? "text-violet-400 hover:bg-violet-500/8 border-t border-white/6 font-medium" :
                                    "text-white/55 hover:bg-white/5 hover:text-white")}>
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

// ── Step progress bar ─────────────────────────────────────────────────────────

function StepBar({ step }: { step: RegStep }) {
  const labels = ["Personal Info", "Your Goals", "Subjects"];
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3].map(n => (
          <div key={n} className="relative flex-1 h-1 rounded-full overflow-hidden bg-white/10">
            <motion.div
              className={cn("absolute inset-y-0 left-0 rounded-full",
                step > n ? "bg-emerald-500" : step === n ? "bg-gradient-to-r from-violet-500 to-indigo-500" : "bg-transparent")}
              initial={{ width: "0%" }}
              animate={{ width: step >= n ? "100%" : "0%" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        ))}
      </div>
      <p className="text-[10px] text-white/25 tracking-wider uppercase">
        Step {step} of 3 — <span className="text-white/40">{labels[step - 1]}</span>
      </p>
    </div>
  );
}

// ── Login form ────────────────────────────────────────────────────────────────

function LoginForm({ onGoogleClick, googleLoading }: { onGoogleClick: () => void; googleLoading: boolean }) {
  const [, navigate] = useLocation();
  const [phone, setPhone]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

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
      if (data.profile.sessionToken) localStorage.setItem("jupeb_session_token", data.profile.sessionToken);
      navigate("/");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <GoogleButton onClick={onGoogleClick} loading={googleLoading} />
      <Rule label="or" />

      <div>
        <Label>WhatsApp Number <span className="text-rose-400">*</span></Label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20 pointer-events-none" />
          <input type="tel" placeholder="e.g. 08012345678" value={phone}
            onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()} autoFocus
            className={cn(inputCls, "pl-10")} />
        </div>
      </div>

      <AnimatePresence>{error && <ErrorBox msg={error} />}</AnimatePresence>

      <button onClick={handleLogin} disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm transition-all duration-200 disabled:opacity-50 rounded-lg btn-shimmer">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</> : <>Sign In<ChevronRight className="h-4 w-4" /></>}
      </button>
    </div>
  );
}

// ── Register form ─────────────────────────────────────────────────────────────

function RegisterForm({ onGoogleClick, googleLoading, googlePreFill }: {
  onGoogleClick: () => void; googleLoading: boolean; googlePreFill: GoogleData;
}) {
  const [, navigate] = useLocation();
  const [step, setStep]               = useState<RegStep>(1);
  const [fullName, setFullName]       = useState(googlePreFill?.name || "");
  const [phone, setPhone]             = useState("");
  const [email, setEmail]             = useState(googlePreFill?.email || "");
  const [targetUniversity, setTargetUniversity] = useState("");
  const [course, setCourse]           = useState("");
  const [targetGrade, setTargetGrade] = useState("aaa1");
  const [subjects, setSubjects]       = useState<string[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  useEffect(() => {
    if (googlePreFill) {
      if (googlePreFill.name)  setFullName(googlePreFill.name);
      if (googlePreFill.email) setEmail(googlePreFill.email);
    }
  }, [googlePreFill]);

  const toggleSubject = (name: string) => {
    setSubjects(prev => prev.includes(name) ? prev.filter(s => s !== name) : prev.length < 3 ? [...prev, name] : prev);
  };

  const goStep2 = () => {
    if (!fullName.trim()) return setError("Please enter your full name.");
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) return setError("Please enter a valid WhatsApp number.");
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
      if (data.profile.sessionToken) localStorage.setItem("jupeb_session_token", data.profile.sessionToken);
      navigate("/");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-white/30">
            {step === 1 ? "Personal Info" : step === 2 ? "Your Goals" : "JUPEB Subjects"}
          </p>
          <h2 className="text-lg font-bold font-serif text-white mt-0.5">
            {step === 1 ? "Create your account" : step === 2 ? "Target & course" : "Pick your subjects"}
          </h2>
        </div>
        {step > 1 && (
          <button onClick={() => { setStep((step - 1) as RegStep); setError(""); }}
            className="w-8 h-8 border border-white/12 flex items-center justify-center text-white/30 hover:text-white hover:border-white/25 transition-all duration-200 flex-shrink-0 mt-1 rounded-lg hover:bg-white/5">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <StepBar step={step} />

      {step === 1 && (
        <>
          <GoogleButton onClick={onGoogleClick} loading={googleLoading} />
          {googlePreFill && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-2 border border-emerald-500/25 bg-emerald-500/8 text-xs text-emerald-400 rounded-lg"
            >
              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
              Connected as {googlePreFill.email} — add your phone to finish
            </motion.div>
          )}
          <Rule label="or" />
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={step}
          initial={{ opacity: 0, x: 20, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-4"
        >

          {step === 1 && (
            <>
              <div>
                <Label>Full Name <span className="text-rose-400">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20 pointer-events-none" />
                  <input type="text" placeholder="e.g. Chinaza Okafor" value={fullName}
                    onChange={e => setFullName(e.target.value)} className={cn(inputCls, "pl-10")} />
                </div>
              </div>
              <div>
                <Label>WhatsApp Number <span className="text-rose-400">*</span></Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20 pointer-events-none" />
                  <input type="tel" placeholder="e.g. 08012345678" value={phone}
                    onChange={e => setPhone(e.target.value)} className={cn(inputCls, "pl-10")} />
                </div>
                <p className="text-[10px] text-white/20 flex items-center gap-1.5 mt-1.5">
                  <MessageCircle className="h-3 w-3" />Used for community updates &amp; payment confirmation
                </p>
              </div>
              <div>
                <Label>Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20 pointer-events-none" />
                  <input type="email" placeholder="you@example.com" value={email}
                    onChange={e => setEmail(e.target.value)} className={cn(inputCls, "pl-10")} />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label>Target University <span className="text-rose-400">*</span></Label>
                <UniversitySelect value={targetUniversity} onChange={setTargetUniversity} />
              </div>
              <div>
                <Label>Intended Course <span className="text-rose-400">*</span></Label>
                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20 pointer-events-none" />
                  <input type="text" placeholder="e.g. Law, Medicine, Engineering" value={course}
                    onChange={e => setCourse(e.target.value)} className={cn(inputCls, "pl-10")} />
                </div>
              </div>
              <div>
                <Label>Target Grade <span className="text-rose-400">*</span></Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {GRADE_OPTIONS.map(g => (
                    <motion.button key={g.value} type="button" onClick={() => setTargetGrade(g.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn("flex flex-col items-start px-3 py-2.5 border text-left transition-all duration-200 rounded-lg",
                        targetGrade === g.value
                          ? "border-violet-500/50 bg-violet-500/8 shadow-[0_0_0_1px_rgba(139,92,246,0.2)]"
                          : "border-white/8 hover:border-white/15 bg-transparent")}>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-sm font-bold", targetGrade === g.value ? "text-violet-300" : "text-white/60")}>{g.label}</span>
                        <span className={cn("text-[9px] px-1.5 py-0.5 font-bold tracking-wider rounded-md",
                          targetGrade === g.value ? "bg-violet-500/15 text-violet-400" : "bg-white/5 text-white/25")}>{g.points}</span>
                      </div>
                      <span className="text-[10px] text-white/25 mt-0.5 leading-tight">{g.desc}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Select up to 3 subjects <span className="text-rose-400">*</span></Label>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 border tracking-wider rounded-md",
                  subjects.length === 3 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-transparent text-white/25 border-white/8")}>
                  {subjects.length}/3
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {ALL_SUBJECTS.map((s, idx) => {
                  const selected = subjects.includes(s.name);
                  const maxed    = !selected && subjects.length >= 3;
                  return (
                    <motion.button key={s.code} type="button" onClick={() => !maxed && toggleSubject(s.name)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      whileHover={!maxed ? { scale: 1.02 } : undefined}
                      whileTap={!maxed ? { scale: 0.98 } : undefined}
                      className={cn("flex items-center gap-2.5 px-3 py-2.5 border text-left transition-all duration-200 rounded-lg",
                        selected  ? "border-violet-500/40 bg-violet-500/8 shadow-[0_0_0_1px_rgba(139,92,246,0.15)]" :
                        maxed     ? "border-white/5 opacity-30 cursor-not-allowed" :
                                    "border-white/8 hover:border-white/18 hover:bg-white/3")}>
                      <span className="text-base leading-none flex-shrink-0">{s.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-xs font-semibold leading-tight", selected ? "text-violet-300" : "text-white/55")}>{s.name}</p>
                        <p className="text-[9px] text-white/20 mt-0.5 tracking-wider">{s.code}</p>
                      </div>
                      {selected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3.5 h-3.5 bg-violet-500 flex items-center justify-center flex-shrink-0 rounded-sm"
                        >
                          <Check className="h-2 w-2 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
              {subjects.length === 3 && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3" />All 3 subjects selected — you're ready
                </motion.p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>{error && <ErrorBox msg={error} />}</AnimatePresence>

      <motion.button
        onClick={step === 1 ? goStep2 : step === 2 ? goStep3 : handleRegister}
        disabled={loading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm transition-all duration-200 disabled:opacity-50 rounded-lg btn-shimmer"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Creating account…</>
        ) : step < 3 ? (
          <>Continue<ChevronRight className="h-4 w-4" /></>
        ) : (
          <>Create Account<ChevronRight className="h-4 w-4" /></>
        )}
      </motion.button>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function Auth() {
  const [, navigate]          = useLocation();
  const [tab, setTab]         = useState<Tab>("register");
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
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({ client_id: googleClientId, callback: handleGoogleResponse });
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
        if (data.profile.sessionToken) localStorage.setItem("jupeb_session_token", data.profile.sessionToken);
        navigate("/");
      } else if (data.needsRegistration) {
        setGooglePreFill(data.googleData);
        setTab("register");
      }
    } catch {}
    finally { setGoogleLoading(false); }
  }, [navigate]);

  const handleGoogleClick = () => { if (googleClientId) window.google?.accounts.id.prompt(); };

  const FEATURES = [
    { icon: Brain,  label: "AI Tutor",        col: "text-violet-400" },
    { icon: Zap,    label: "Past Questions",   col: "text-amber-400"  },
    { icon: Trophy, label: "Leaderboard",      col: "text-emerald-400"},
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-5 relative overflow-hidden">

      {/* Animated mesh background */}
      <div className="pointer-events-none fixed inset-0 mesh-bg-auth" />

      {/* Subtle grid overlay */}
      <div className="pointer-events-none fixed inset-0 opacity-40"
        style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.02) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

      {/* Floating decorative orbs */}
      <div className="pointer-events-none fixed top-1/4 left-1/4 w-64 h-64 rounded-full bg-violet-500/5 blur-3xl float-slow" />
      <div className="pointer-events-none fixed bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-indigo-500/5 blur-3xl float-delayed" />

      <div className="w-full max-w-[420px] relative z-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}>

          {/* ── Tagline ── */}
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-5"
          >
            <span className="shimmer-text text-lg md:text-xl font-serif font-light tracking-tight">
              Your path to 16 points starts here
            </span>
          </motion.p>

          {/* ── Brand block ── */}
          <div className="border border-white/8 bg-[#0f0f16] px-6 pt-7 pb-6 relative overflow-hidden rounded-t-2xl">
            <CornerMark pos="tl" /><CornerMark pos="tr" />

            {/* Premium gradient border glow at top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

            {/* Art-deco top rule */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-violet-500/30" />
              <motion.div
                className="w-1.5 h-1.5 bg-violet-500/60 rotate-45"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-violet-500/30" />
            </div>

            <div className="flex items-center gap-4">
              <motion.div
                className="w-10 h-10 border border-violet-500/30 flex items-center justify-center flex-shrink-0 bg-violet-500/8 rounded-xl"
                whileHover={{ scale: 1.05, borderColor: "rgba(139,92,246,0.5)" }}
              >
                <GraduationCap className="h-5 w-5 text-violet-400" />
              </motion.div>
              <div>
                <h1 className="text-base font-bold font-serif text-white tracking-wide">JUPEB Prep</h1>
                <p className="text-[9px] tracking-[0.2em] uppercase text-white/25 mt-0.5">Foundation Studies Platform</p>
              </div>
            </div>

            {/* Feature tags — stagger animated */}
            <div className="flex flex-wrap gap-2 mt-5">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 border border-white/6 bg-white/2 rounded-lg hover:bg-white/4 hover:border-white/12 transition-all duration-200 group cursor-default"
                >
                  <f.icon className={cn("h-2.5 w-2.5 transition-transform group-hover:scale-110", f.col)} />
                  <span className="text-[9px] tracking-wider uppercase text-white/30 group-hover:text-white/50 transition-colors">{f.label}</span>
                </motion.div>
              ))}
            </div>

            <CornerMark pos="bl" /><CornerMark pos="br" />
          </div>

          {/* ── Tab bar ── */}
          <div className="flex border-x border-white/8 bg-[#0c0c12] relative">
            {(["register", "login"] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn(
                  "flex-1 py-3 text-xs font-bold tracking-widest uppercase transition-all duration-200 relative",
                  tab === t ? "text-white bg-[#0f0f16]" : "text-white/25 hover:text-white/50 bg-transparent"
                )}>
                {t === "register" ? "Register" : "Sign In"}
                {tab === t && (
                  <motion.div
                    layoutId="authTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── Form panel ── */}
          <div className="border border-t-0 border-white/8 bg-[#0f0f16] px-6 py-6 rounded-b-2xl">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {tab === "login"
                  ? <LoginForm    onGoogleClick={handleGoogleClick} googleLoading={googleLoading} />
                  : <RegisterForm onGoogleClick={handleGoogleClick} googleLoading={googleLoading} googlePreFill={googlePreFill} />
                }
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Footer switch + social proof ── */}
          <div className="text-center mt-4 space-y-3">
            <p className="text-[11px] text-white/20 tracking-wide">
              {tab === "register" ? (
                <>Already have an account?{" "}
                  <button onClick={() => setTab("login")} className="text-violet-400 hover:text-violet-300 transition-colors">Sign in</button>
                </>
              ) : (
                <>New student?{" "}
                  <button onClick={() => setTab("register")} className="text-violet-400 hover:text-violet-300 transition-colors">Register</button>
                </>
              )}
            </p>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-2 text-[10px] text-white/20"
            >
              <div className="flex -space-x-1.5">
                {["🟣", "🔵", "🟢"].map((c, i) => (
                  <div key={i} className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[7px] border border-[#0a0a0f]">
                    {c}
                  </div>
                ))}
              </div>
              <span>Join <span className="text-violet-400/80 font-semibold"><AnimatedCounter to={500} duration={2} />+</span> JUPEB students</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
