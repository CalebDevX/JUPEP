import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone, Mail, GraduationCap, BookOpen,
  ChevronRight, ArrowLeft, Loader2, CheckCircle2,
  MessageCircle, ChevronDown, Search, Check, Zap, Trophy, Brain,
  Building2, Users, Star, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

declare global { interface Window { google: any; } }

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
  { code: "LIT", name: "Literature in English",    emoji: "📖" },
  { code: "GOV", name: "Government",                emoji: "🏛️" },
  { code: "ECO", name: "Economics",                 emoji: "📊" },
  { code: "ENG", name: "English Language",          emoji: "✍️" },
  { code: "HIS", name: "History",                   emoji: "📜" },
  { code: "GEO", name: "Geography",                 emoji: "🌍" },
  { code: "ACC", name: "Accounting",                emoji: "🧾" },
  { code: "COM", name: "Commerce",                  emoji: "🏪" },
  { code: "MTH", name: "Mathematics",               emoji: "📐" },
  { code: "BIO", name: "Biology",                   emoji: "🔬" },
  { code: "CHE", name: "Chemistry",                 emoji: "⚗️" },
  { code: "PHY", name: "Physics",                   emoji: "⚡" },
  { code: "CRS", name: "Christian Religious Studies", emoji: "✝️" },
  { code: "IRS", name: "Islamic Religious Studies", emoji: "☪️" },
  { code: "FMT", name: "Further Mathematics",       emoji: "∑"  },
  { code: "AGR", name: "Agricultural Science",      emoji: "🌾" },
  { code: "CMP", name: "Computer Science",          emoji: "💻" },
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

// ── Shared primitives ──────────────────────────────────────────────────────────

const inputCls = "w-full bg-white border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 transition-all duration-200 rounded-lg";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">{children}</p>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="px-4 py-3 border border-red-200 bg-red-50 text-sm text-red-600 rounded-lg">
      {msg}
    </motion.div>
  );
}

function Divider({ label }: { label?: string }) {
  if (!label) return <div className="h-px bg-gray-200 my-1" />;
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

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

function GoogleButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-40 text-sm font-medium text-gray-700 rounded-lg shadow-sm">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
        <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0">
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
          className="text-[11px] text-gray-400 hover:text-orange-500 transition-colors">
          ← Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(v => !v)}
        className={cn("w-full flex items-center gap-3 border px-4 py-3 text-sm text-left transition-all duration-200 rounded-lg bg-white shadow-sm",
          open ? "border-orange-400 ring-2 ring-orange-400/10" : "border-gray-200 hover:border-gray-300")}>
        <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <span className={cn("flex-1", value ? "text-gray-900" : "text-gray-400")}>{value || "Select your university"}</span>
        <ChevronDown className={cn("h-4 w-4 text-gray-400 flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-xl overflow-hidden z-50 rounded-lg">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input type="text" placeholder="Search…" value={search}
                  onChange={e => setSearch(e.target.value)} autoFocus
                  className="w-full bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none rounded-md" />
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
                      isSelected  ? "bg-orange-50 text-orange-600 font-medium" :
                      isOthers    ? "text-orange-500 hover:bg-orange-50 border-t border-gray-100 font-medium" :
                                    "text-gray-600 hover:bg-gray-50 hover:text-gray-900")}>
                    <span className="flex-1">{uni}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="px-4 py-4 text-sm text-gray-400 text-center">
                  No match —{" "}
                  <button className="text-orange-500 font-medium"
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

function StepBar({ step }: { step: RegStep }) {
  const labels = ["Personal Info", "Your Goals", "Subjects"];
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3].map(n => (
          <div key={n} className="relative flex-1 h-1 rounded-full overflow-hidden bg-gray-200">
            <motion.div
              className={cn("absolute inset-y-0 left-0 rounded-full",
                step > n ? "bg-green-500" : step === n ? "bg-orange-500" : "bg-transparent")}
              initial={{ width: "0%" }}
              animate={{ width: step >= n ? "100%" : "0%" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 tracking-wider uppercase">
        Step {step} of 3 — <span className="text-gray-600 font-medium">{labels[step - 1]}</span>
      </p>
    </div>
  );
}

// ── Login form ─────────────────────────────────────────────────────────────────

type LoginStep = "phone" | "pin";

function PinDots({ value }: { value: string }) {
  return (
    <div className="flex justify-center gap-3 py-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          animate={i < value.length
            ? { scale: [1, 1.25, 1], backgroundColor: "#f97316" }
            : { scale: 1, backgroundColor: "transparent" }}
          transition={{ duration: 0.15 }}
          className="w-4 h-4 rounded-full border-2 border-gray-300"
          style={{ borderColor: i < value.length ? "#f97316" : undefined }}
        />
      ))}
    </div>
  );
}

function LoginForm({ onGoogleClick, googleLoading }: { onGoogleClick: () => void; googleLoading: boolean }) {
  const [, navigate]            = useLocation();
  const [loginStep, setLoginStep] = useState<LoginStep>("phone");
  const [phone, setPhone]       = useState("");
  const [pin, setPin]           = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const pinRef                  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (loginStep === "pin") setTimeout(() => pinRef.current?.focus(), 80);
  }, [loginStep]);

  const handlePhoneSubmit = async () => {
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      return setError("Please enter a valid phone number.");
    }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (data.requiresPin) { setLoginStep("pin"); return; }
      if (!res.ok) throw new Error(data.error || "Login failed.");
      localStorage.setItem("jupeb_profile", JSON.stringify(data.profile));
      localStorage.setItem("jupeb_display_name", data.profile.fullName);
      if (data.profile.sessionToken) localStorage.setItem("jupeb_session_token", data.profile.sessionToken);
      navigate("/");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handlePinChange = async (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 6);
    setPin(digits);
    if (digits.length === 6) await submitPin(digits);
  };

  const submitPin = async (digits: string) => {
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), pin: digits }),
      });
      const data = await res.json();
      if (!res.ok) { setPin(""); throw new Error(data.error || "Incorrect PIN."); }
      localStorage.setItem("jupeb_profile", JSON.stringify(data.profile));
      localStorage.setItem("jupeb_display_name", data.profile.fullName);
      if (data.profile.sessionToken) localStorage.setItem("jupeb_session_token", data.profile.sessionToken);
      navigate("/");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence mode="wait">
      {loginStep === "phone" ? (
        <motion.div key="phone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
          <GoogleButton onClick={onGoogleClick} loading={googleLoading} />
          <Divider label="or sign in with phone" />

          <div>
            <Label>Phone Number <span className="text-red-400">*</span></Label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input type="tel" placeholder="e.g. 08012345678" value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handlePhoneSubmit()} autoFocus
                className={cn(inputCls, "pl-10")} />
            </div>
          </div>

          <AnimatePresence>{error && <ErrorBox msg={error} />}</AnimatePresence>

          <button onClick={handlePhoneSubmit} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all duration-200 disabled:opacity-50 rounded-lg shadow-sm shadow-orange-500/20">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Checking…</> : <>Continue<ChevronRight className="h-4 w-4" /></>}
          </button>
        </motion.div>
      ) : (
        <motion.div key="pin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
          <button onClick={() => { setLoginStep("phone"); setPin(""); setError(""); }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Change number
          </button>

          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto mb-3">
              <Lock className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-sm font-bold text-gray-900">Enter your 6-digit PIN</p>
            <p className="text-xs text-gray-400 mt-0.5">{phone}</p>
          </div>

          <PinDots value={pin} />

          <div className="relative">
            <input
              ref={pinRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={e => handlePinChange(e.target.value)}
              placeholder="••••••"
              className={cn(inputCls, "text-center text-xl tracking-[0.5em] font-bold")}
              disabled={loading}
            />
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
              </div>
            )}
          </div>

          <AnimatePresence>{error && <ErrorBox msg={error} />}</AnimatePresence>

          <button onClick={() => pin.length === 6 && submitPin(pin)} disabled={loading || pin.length < 6}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all duration-200 disabled:opacity-40 rounded-lg shadow-sm shadow-orange-500/20">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Verifying…</> : <>Sign In<ChevronRight className="h-4 w-4" /></>}
          </button>

          <p className="text-center text-[11px] text-gray-400">
            Forgot your PIN? Contact support to reset it.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Register form ──────────────────────────────────────────────────────────────

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
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) return setError("Please enter a valid phone number.");
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
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-gray-400">
            {step === 1 ? "Personal Info" : step === 2 ? "Your Goals" : "JUPEB Subjects"}
          </p>
          <h2 className="text-lg font-bold text-gray-900 mt-0.5">
            {step === 1 ? "Create your account" : step === 2 ? "Target & course" : "Pick your subjects"}
          </h2>
        </div>
        {step > 1 && (
          <button onClick={() => { setStep((step - 1) as RegStep); setError(""); }}
            className="w-8 h-8 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all duration-200 flex-shrink-0 mt-1 rounded-lg hover:bg-gray-50">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <StepBar step={step} />

      {step === 1 && (
        <>
          <GoogleButton onClick={onGoogleClick} loading={googleLoading} />
          {googlePreFill && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-2 border border-green-200 bg-green-50 text-xs text-green-700 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
              Connected as {googlePreFill.email} — add your phone to finish
            </motion.div>
          )}
          <Divider label="or fill in manually" />
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
                <Label>Full Name <span className="text-red-400">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                  <input type="text" placeholder="e.g. Chinaza Okafor" value={fullName}
                    onChange={e => setFullName(e.target.value)} className={cn(inputCls, "pl-10")} />
                </div>
              </div>
              <div>
                <Label>Phone Number <span className="text-red-400">*</span></Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                  <input type="tel" placeholder="e.g. 08012345678" value={phone}
                    onChange={e => setPhone(e.target.value)} className={cn(inputCls, "pl-10")} />
                </div>
                <p className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-1.5">
                  <MessageCircle className="h-3 w-3" />Used for community updates &amp; payment confirmation
                </p>
              </div>
              <div>
                <Label>Email Address <span className="text-gray-300">(optional)</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                  <input type="email" placeholder="you@example.com" value={email}
                    onChange={e => setEmail(e.target.value)} className={cn(inputCls, "pl-10")} />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label>Target University <span className="text-red-400">*</span></Label>
                <UniversitySelect value={targetUniversity} onChange={setTargetUniversity} />
              </div>
              <div>
                <Label>Intended Course <span className="text-red-400">*</span></Label>
                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                  <input type="text" placeholder="e.g. Law, Medicine, Engineering" value={course}
                    onChange={e => setCourse(e.target.value)} className={cn(inputCls, "pl-10")} />
                </div>
              </div>
              <div>
                <Label>Target Grade <span className="text-red-400">*</span></Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {GRADE_OPTIONS.map(g => (
                    <motion.button key={g.value} type="button" onClick={() => setTargetGrade(g.value)}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className={cn("flex flex-col items-start px-3 py-2.5 border text-left transition-all duration-200 rounded-lg",
                        targetGrade === g.value
                          ? "border-orange-400 bg-orange-50 ring-1 ring-orange-400/20"
                          : "border-gray-200 hover:border-gray-300 bg-white")}>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-sm font-bold", targetGrade === g.value ? "text-orange-600" : "text-gray-600")}>{g.label}</span>
                        <span className={cn("text-[9px] px-1.5 py-0.5 font-bold tracking-wider rounded-md",
                          targetGrade === g.value ? "bg-orange-100 text-orange-500" : "bg-gray-100 text-gray-400")}>{g.points}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5 leading-tight">{g.desc}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Select up to 3 subjects <span className="text-red-400">*</span></Label>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 border tracking-wider rounded-md",
                  subjects.length === 3 ? "bg-green-50 text-green-600 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200")}>
                  {subjects.length}/3
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {ALL_SUBJECTS.map((s, idx) => {
                  const selected = subjects.includes(s.name);
                  const maxed    = !selected && subjects.length >= 3;
                  return (
                    <motion.button key={s.code} type="button" onClick={() => !maxed && toggleSubject(s.name)}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      whileHover={!maxed ? { scale: 1.02 } : undefined}
                      whileTap={!maxed ? { scale: 0.98 } : undefined}
                      className={cn("flex items-center gap-2.5 px-3 py-2.5 border text-left transition-all duration-200 rounded-lg",
                        selected  ? "border-orange-400 bg-orange-50 ring-1 ring-orange-400/20" :
                        maxed     ? "border-gray-100 opacity-40 cursor-not-allowed bg-white" :
                                    "border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white")}>
                      <span className="text-base leading-none flex-shrink-0">{s.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-xs font-semibold leading-tight", selected ? "text-orange-600" : "text-gray-600")}>{s.name}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5 tracking-wider">{s.code}</p>
                      </div>
                      {selected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="w-3.5 h-3.5 bg-orange-500 flex items-center justify-center flex-shrink-0 rounded-sm">
                          <Check className="h-2 w-2 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
              {subjects.length === 3 && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] text-green-600 flex items-center gap-1.5">
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
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all duration-200 disabled:opacity-50 rounded-lg shadow-sm shadow-orange-500/20"
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

// ── Main export ────────────────────────────────────────────────────────────────

const STATS = [
  { icon: Users, value: "2,400+", label: "Active Students" },
  { icon: Trophy, value: "89%", label: "Pass Rate" },
  { icon: Star, value: "4.9", label: "Student Rating" },
  { icon: BookOpen, value: "39+", label: "Chapters" },
];

const FEATURES = [
  { icon: Brain,  label: "AI Tutor & Voice Teacher" },
  { icon: Zap,    label: "Past Questions Database"  },
  { icon: Trophy, label: "Leaderboard & XP Tracking"},
  { icon: BookOpen, label: "Full Textbook Notes"    },
];

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

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── LEFT HERO PANEL (hidden on mobile) ───────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] bg-[#0f172a] flex-col justify-between p-12 xl:p-16 relative overflow-hidden">
        {/* Subtle texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        {/* Orange accent glow at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">JUPEB Prep</p>
            <p className="text-white/40 text-[10px] tracking-widest uppercase mt-0.5">Foundation Studies</p>
          </div>
        </motion.div>

        {/* Hero text */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-auto relative z-10">
          <p className="text-orange-400 text-sm font-semibold tracking-widest uppercase mb-4">Your University Journey Starts Here</p>
          <h2 className="text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tight">
            Study Smarter.<br />
            <span className="text-orange-400">Score Higher.</span>
          </h2>
          <p className="mt-5 text-white/50 text-base leading-relaxed max-w-md">
            The #1 JUPEB prep platform trusted by thousands of Nigerian students aiming for top universities.
          </p>

          <ul className="mt-7 space-y-3">
            {FEATURES.map((f, i) => (
              <motion.li key={f.label}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="flex items-center gap-3 text-sm text-white/60">
                <f.icon className="h-4 w-4 text-orange-400 shrink-0" />
                {f.label}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="mt-12 grid grid-cols-4 gap-3 relative z-10">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-white/5 border border-white/8 rounded-2xl p-3.5">
              <Icon className="h-4 w-4 text-orange-400 mb-2" />
              <p className="text-white font-bold text-lg leading-none">{value}</p>
              <p className="text-white/35 text-[10px] mt-1 leading-tight">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── RIGHT FORM PANEL ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-gray-50 relative">

        {/* Mobile header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8 lg:hidden">
          <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 mb-3">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">JUPEB Prep</h1>
          <p className="text-gray-400 text-xs tracking-widest uppercase mt-1">Foundation Studies Platform</p>
        </motion.div>

        <div className="w-full max-w-sm">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

              {/* Tab bar */}
              <div className="flex border-b border-gray-200">
                {(["register", "login"] as Tab[]).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={cn(
                      "flex-1 py-3.5 text-xs font-bold tracking-widest uppercase transition-all duration-200 relative",
                      tab === t ? "text-gray-900 bg-white" : "text-gray-400 hover:text-gray-600 bg-gray-50"
                    )}>
                    {t === "register" ? "Register" : "Sign In"}
                    {tab === t && (
                      <motion.div
                        layoutId="authTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Form body */}
              <div className="px-6 py-6">
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
            </div>

            {/* Footer switch */}
            <p className="text-center text-xs text-gray-400 mt-4">
              {tab === "register" ? (
                <>Already have an account?{" "}
                  <button onClick={() => setTab("login")} className="text-orange-500 hover:text-orange-600 font-semibold transition-colors">Sign in</button>
                </>
              ) : (
                <>New student?{" "}
                  <button onClick={() => setTab("register")} className="text-orange-500 hover:text-orange-600 font-semibold transition-colors">Register</button>
                </>
              )}
            </p>

            {/* Social proof */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-2 text-[11px] text-gray-400 mt-3">
              <div className="flex -space-x-1.5">
                {["🟠", "🟡", "🟢"].map((c, i) => (
                  <div key={i} className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[8px] border border-gray-50 shadow-sm">
                    {c}
                  </div>
                ))}
              </div>
              <span>Join <span className="text-orange-500 font-semibold"><AnimatedCounter to={500} duration={2} />+</span> JUPEB students</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
