import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone, Mail, GraduationCap, KeyRound, Building2,
  ChevronRight, ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff,
  BookOpen, Target, Sparkles,
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

const POPULAR_UNIS = [
  "University of Lagos (UNILAG)",
  "University of Ibadan (UI)",
  "Obafemi Awolowo University (OAU)",
  "University of Nigeria, Nsukka (UNN)",
  "Ahmadu Bello University (ABU Zaria)",
  "University of Benin (UNIBEN)",
  "Lagos State University (LASU)",
  "Covenant University",
  "Pan-Atlantic University",
  "Babcock University",
  "Federal University of Technology, Akure (FUTA)",
  "University of Port Harcourt (UNIPORT)",
];

function InputField({
  label, placeholder, value, onChange, type = "text", icon: Icon, required, hint, maxLength,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string;
  icon?: any; required?: boolean; hint?: string; maxLength?: number;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-white/60 tracking-wide uppercase">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />}
        <input
          type={isPassword && show ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          maxLength={maxLength}
          className={cn(
            "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20",
            "focus:outline-none focus:border-violet-500/60 focus:bg-white/8 transition-all",
            Icon ? "pl-10" : "",
            isPassword ? "pr-10" : ""
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {hint && <p className="text-[11px] text-white/30">{hint}</p>}
    </div>
  );
}

function UniversityInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const filtered = value
    ? POPULAR_UNIS.filter(u => u.toLowerCase().includes(value.toLowerCase()))
    : POPULAR_UNIS;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-white/60 tracking-wide uppercase">
          Target University <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
          <input
            type="text"
            placeholder="e.g. University of Lagos (UNILAG)"
            value={value}
            onChange={e => { onChange(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/60 focus:bg-white/8 transition-all"
          />
        </div>
      </div>
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e2c] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto"
          >
            {filtered.slice(0, 8).map(u => (
              <button
                key={u}
                type="button"
                onClick={() => { onChange(u); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                {u}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Register() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [targetUniversity, setTargetUniversity] = useState("");
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
    if (!targetUniversity.trim()) return setError("Please enter your target university.");
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
          email: email.trim() || null,
          subjects,
          targetUniversity: targetUniversity.trim(),
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
    <div className="min-h-screen bg-[#0d0d11] flex flex-col items-center justify-center p-4 py-10">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-600/8 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/8 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-violet-500/25 mb-4">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">JUPEB Prep</h1>
          <p className="text-white/40 text-xs mt-0.5 tracking-widest uppercase">Foundation Studies Platform</p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all",
                step === s ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30" :
                step > s ? "bg-emerald-500 text-white" : "bg-white/10 text-white/30"
              )}>
                {step > s ? <CheckCircle2 className="h-3.5 w-3.5" /> : s}
              </div>
              <span className={cn("text-xs font-medium", step === s ? "text-white/80" : "text-white/25")}>
                {s === 1 ? "Personal Info" : "Subjects & Code"}
              </span>
              {s < 2 && <ChevronRight className="h-3 w-3 text-white/15" />}
            </div>
          ))}
        </div>

        {/* Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: step === 1 ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="bg-[#161620] border border-white/8 rounded-3xl p-6 shadow-2xl"
        >
          {step === 1 ? (
            <>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-white">Create your account</h2>
                <p className="text-sm text-white/40 mt-0.5">Let's get you set up for success.</p>
              </div>

              <div className="space-y-4">
                <InputField
                  label="Full Name" placeholder="e.g. Chinaza Okafor"
                  value={fullName} onChange={setFullName}
                  icon={User} required
                />
                <InputField
                  label="Phone Number" placeholder="e.g. 08012345678"
                  value={phone} onChange={setPhone}
                  icon={Phone} required type="tel"
                  hint="Used to log in — keep it safe"
                />
                <InputField
                  label="Email Address" placeholder="you@example.com (optional)"
                  value={email} onChange={setEmail}
                  icon={Mail} type="email"
                />
                <UniversityInput value={targetUniversity} onChange={setTargetUniversity} />

                {/* Target grade */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/60 tracking-wide uppercase">
                    Target Grade <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {GRADE_OPTIONS.map(g => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => setTargetGrade(g.value)}
                        className={cn(
                          "flex flex-col items-start px-3.5 py-2.5 rounded-xl border text-left transition-all",
                          targetGrade === g.value
                            ? "border-violet-500/60 bg-violet-500/10"
                            : "border-white/8 bg-white/3 hover:border-white/15"
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={cn("text-sm font-bold", targetGrade === g.value ? "text-violet-300" : "text-white/70")}>
                            {g.label}
                          </span>
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-semibold",
                            targetGrade === g.value ? "bg-violet-500/20 text-violet-400" : "bg-white/5 text-white/30"
                          )}>
                            {g.points}
                          </span>
                        </div>
                        <span className="text-[10px] text-white/30 mt-0.5">{g.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-5">
                <button
                  onClick={() => { setStep(1); setError(""); }}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-white">Pick your subjects</h2>
                  <p className="text-sm text-white/40 mt-0.5">Select 2 to 4 JUPEB subjects.</p>
                </div>
              </div>

              {/* Subject chips */}
              <div className="space-y-2 mb-5">
                <label className="text-xs font-semibold text-white/60 tracking-wide uppercase">
                  JUPEB Subjects <span className="text-rose-400">*</span>
                  <span className="ml-2 normal-case font-normal text-white/30">({subjects.length}/4 selected)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SUBJECTS.map(s => {
                    const selected = subjects.includes(s.name);
                    return (
                      <button
                        key={s.code}
                        type="button"
                        onClick={() => toggleSubject(s.name)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
                          selected ? s.color : "border-white/8 bg-white/3 text-white/45 hover:border-white/20 hover:text-white/70",
                          !selected && subjects.length >= 4 && "opacity-40 cursor-not-allowed"
                        )}
                      >
                        <span>{s.emoji}</span>
                        <span>{s.name}</span>
                        {selected && <CheckCircle2 className="h-3 w-3 ml-0.5 opacity-80" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Access Code / Free Trial toggle */}
              <div className="space-y-3 mb-1">
                <label className="text-xs font-semibold text-white/60 tracking-wide uppercase">Access</label>

                {/* Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setHasCode(false)}
                    className={cn(
                      "flex flex-col items-start px-3.5 py-2.5 rounded-xl border text-left transition-all",
                      !hasCode
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-white/8 bg-white/3 hover:border-white/15"
                    )}
                  >
                    <span className={cn("text-sm font-bold", !hasCode ? "text-emerald-300" : "text-white/60")}>
                      🎯 Free Trial
                    </span>
                    <span className="text-[10px] text-white/30 mt-0.5">5 practice questions</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasCode(true)}
                    className={cn(
                      "flex flex-col items-start px-3.5 py-2.5 rounded-xl border text-left transition-all",
                      hasCode
                        ? "border-violet-500/50 bg-violet-500/10"
                        : "border-white/8 bg-white/3 hover:border-white/15"
                    )}
                  >
                    <span className={cn("text-sm font-bold", hasCode ? "text-violet-300" : "text-white/60")}>
                      🔑 Have a Code
                    </span>
                    <span className="text-[10px] text-white/30 mt-0.5">Full access</span>
                  </button>
                </div>

                {/* Code input */}
                {hasCode ? (
                  <div className="space-y-1.5">
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Enter your access code"
                        value={accessCode}
                        onChange={e => setAccessCode(e.target.value.toUpperCase())}
                        maxLength={24}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/60 focus:bg-white/8 transition-all tracking-widest font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-white/25">Access codes are provided by your JUPEB Prep coordinator.</p>
                  </div>
                ) : (
                  <div className="px-3.5 py-3 rounded-xl bg-emerald-500/6 border border-emerald-500/15 text-xs text-white/50 leading-relaxed">
                    ✅ Practice 5 questions free — no payment needed.<br />
                    You can activate full access anytime from your account.
                  </div>
                )}
              </div>
            </>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 px-4 py-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-sm text-rose-300"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <div className="mt-5">
            {step === 1 ? (
              <button
                onClick={handleStep1}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-semibold text-sm hover:from-violet-500 hover:to-indigo-600 transition-all shadow-lg shadow-violet-500/25"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-semibold text-sm hover:from-violet-500 hover:to-indigo-600 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Create My Account</>
                )}
              </button>
            )}
          </div>
        </motion.div>

        {/* Footer links */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-white/30 mt-5"
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
