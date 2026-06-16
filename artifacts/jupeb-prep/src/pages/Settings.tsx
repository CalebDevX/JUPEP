import { useState, useRef } from "react";
import { Shell } from "@/components/layout/Shell";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  User, Target, Bell, Shield, Info,
  Trash2, ChevronRight, CheckCircle2,
  LogOut, Camera, Calendar, Clock, Flame, Trophy,
} from "lucide-react";

const GOAL_OPTIONS = [
  { value: "aaa1", label: "AAA+1", points: "16 pts", desc: "Medicine · Law · Pharmacy" },
  { value: "aab1", label: "AAB+1", points: "15 pts", desc: "Engineering · Accounting" },
  { value: "bbb1", label: "BBB+1", points: "12 pts", desc: "Sciences · Social Sciences" },
  { value: "ccc1", label: "CCC+1", points: "9 pts",  desc: "Arts · Education" },
];

function Section({ icon: Icon, title, children, color = "text-violet-400", bg = "bg-violet-500/15" }: {
  icon: any; title: string; children: React.ReactNode; color?: string; bg?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.04] border border-white/[0.07] rounded-2xl overflow-hidden"
    >
      <div className="px-4 py-3.5 border-b border-white/[0.06] flex items-center gap-3">
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
          <Icon className={cn("h-4 w-4", color)} />
        </div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </motion.div>
  );
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative w-12 h-6.5 rounded-full border transition-all flex-shrink-0",
        enabled ? "bg-sky-500 border-sky-400" : "bg-white/10 border-white/15"
      )}
      style={{ height: "26px" }}
    >
      <div className={cn(
        "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200",
        enabled ? "left-[22px]" : "left-0.5"
      )} />
    </button>
  );
}

export default function Settings() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(
    () => localStorage.getItem("user_display_name") || ""
  );
  const [goal, setGoal] = useState(
    () => localStorage.getItem("user_goal") || "aaa1"
  );
  const [notifications, setNotifications] = useState(
    () => localStorage.getItem("notif_enabled") !== "false"
  );
  const [profilePic, setProfilePic] = useState<string | null>(
    () => localStorage.getItem("jupeb_profile_picture")
  );
  const [examDate, setExamDate] = useState(
    () => localStorage.getItem("jupeb_exam_date") || ""
  );

  const handlePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 150; canvas.height = 150;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const size = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, 150, 150);
        const b64 = canvas.toDataURL("image/jpeg", 0.85);
        setProfilePic(b64);
        localStorage.setItem("jupeb_profile_picture", b64);
        toast({ title: "Photo updated!" });
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    localStorage.setItem("user_display_name", displayName.trim());
    localStorage.setItem("user_goal", goal);
    localStorage.setItem("notif_enabled", String(notifications));
    if (examDate) localStorage.setItem("jupeb_exam_date", examDate);
    else localStorage.removeItem("jupeb_exam_date");
    toast({ title: "Settings saved!", description: "Your preferences have been updated." });
  };

  const handleLogout = () => {
    if (!confirm("Sign out? You will need to log in again with your phone number.")) return;
    const pic = localStorage.getItem("jupeb_profile_picture");
    localStorage.clear();
    if (pic) localStorage.setItem("jupeb_profile_picture", pic);
    toast({ title: "Signed out", description: "See you next time!" });
    setTimeout(() => { window.location.href = "/auth"; }, 800);
  };

  const handleClearData = () => {
    if (!confirm("Clear app cache? Your login and profile picture will be kept.")) return;
    const keep = [
      "user_display_name", "user_goal", "notif_enabled",
      "jupeb_profile", "jupeb_session_token", "jupeb_profile_picture",
      "jupeb_display_name", "jupeb_exam_date", "jupeb_community_name",
      "jupeb_joined_communities",
    ];
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && !keep.includes(key)) localStorage.removeItem(key);
    }
    toast({ title: "Cache cleared", description: "Quiz sessions and cached data reset." });
  };

  const selectedGoal = GOAL_OPTIONS.find(g => g.value === goal);

  const daysUntilExam = examDate
    ? Math.max(0, Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <Shell>
      <div className="px-4 pb-24 pt-4 max-w-2xl mx-auto w-full space-y-4">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl font-black text-white">Settings</h1>
          <p className="text-white/40 text-xs mt-0.5">Customise your JUPEB Prep experience.</p>
        </motion.div>

        {/* Motivation widget */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-600/15 to-indigo-900/10 p-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white">
                {displayName ? `Hi, ${displayName.split(" ")[0]}! 👋` : "Welcome, Scholar! 👋"}
              </p>
              <p className="text-xs text-white/50 mt-0.5">
                {daysUntilExam !== null
                  ? `${daysUntilExam} days to your exam — stay consistent!`
                  : "Set your exam date to track your countdown."}
              </p>
            </div>
            <Flame className="h-6 w-6 text-amber-400 flex-shrink-0" />
          </div>
        </motion.div>

        {/* Profile */}
        <Section icon={User} title="Your Profile" color="text-violet-400" bg="bg-violet-500/15">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0 group">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-2xl overflow-hidden cursor-pointer ring-2 ring-white/10 hover:ring-violet-500/40 transition-all relative"
                >
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
                      {displayName ? displayName.charAt(0).toUpperCase() : "S"}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePicUpload} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-violet-600 border-2 border-[#0d0d14] flex items-center justify-center hover:bg-violet-500 transition-colors"
                >
                  <Camera className="h-3.5 w-3.5 text-white" />
                </button>
              </div>

              <div className="flex-1 space-y-1.5">
                <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Display Name</label>
                <Input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g. Adaeze, John…"
                  className="bg-white/[0.06] border-white/[0.09] text-white placeholder:text-white/25 h-11"
                  maxLength={40}
                />
              </div>
            </div>
            {profilePic && (
              <button
                onClick={() => { setProfilePic(null); localStorage.removeItem("jupeb_profile_picture"); }}
                className="text-xs text-white/30 hover:text-red-400 transition-colors"
              >
                Remove photo
              </button>
            )}
          </div>
        </Section>

        {/* Study Goal */}
        <Section icon={Target} title="Study Goal" color="text-amber-400" bg="bg-amber-500/15">
          <div className="space-y-3">
            <p className="text-xs text-white/40">What grade combination are you aiming for?</p>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setGoal(opt.value)}
                  className={cn(
                    "text-left p-3.5 rounded-2xl border transition-all active:scale-[0.97]",
                    goal === opt.value
                      ? "bg-amber-500/15 border-amber-500/40 ring-1 ring-amber-500/20"
                      : "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06]"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn("font-black text-base", goal === opt.value ? "text-amber-400" : "text-white/60")}>
                      {opt.label}
                    </span>
                    {goal === opt.value && <CheckCircle2 className="h-4 w-4 text-amber-400" />}
                  </div>
                  <p className={cn("text-[11px] font-bold", goal === opt.value ? "text-amber-300" : "text-white/40")}>{opt.points}</p>
                  <p className="text-[10px] text-white/30 mt-0.5 leading-snug">{opt.desc}</p>
                </button>
              ))}
            </div>
            {selectedGoal && (
              <div className="flex items-center gap-2 text-xs text-amber-400/70 bg-amber-500/[0.08] border border-amber-500/15 rounded-xl px-3 py-2.5">
                <Target className="h-3.5 w-3.5 flex-shrink-0" />
                Goal: <span className="font-bold ml-1">{selectedGoal.label} — {selectedGoal.points}</span>
              </div>
            )}
          </div>
        </Section>

        {/* Exam Date */}
        <Section icon={Calendar} title="Exam Countdown" color="text-rose-400" bg="bg-rose-500/15">
          <div className="space-y-3">
            <p className="text-xs text-white/40">Set your exam date to track exactly how much time you have left.</p>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Mock / Final Exam Date</label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                <input
                  type="date"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  className="w-full pl-11 pr-4 h-12 bg-white/[0.06] border border-white/[0.09] text-white rounded-xl text-sm outline-none focus:border-rose-500/40 transition-colors [color-scheme:dark]"
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>
            </div>
            {daysUntilExam !== null && (
              <div className={cn(
                "flex items-center gap-2 text-xs px-3.5 py-3 rounded-xl border font-medium",
                daysUntilExam <= 14
                  ? "text-rose-300 bg-rose-500/10 border-rose-500/20"
                  : daysUntilExam <= 30
                  ? "text-amber-300 bg-amber-500/10 border-amber-500/20"
                  : "text-emerald-300 bg-emerald-500/10 border-emerald-500/20"
              )}>
                <Flame className="h-3.5 w-3.5 flex-shrink-0" />
                <span>
                  {daysUntilExam === 0 ? "Exam day — good luck! 🎯" :
                   daysUntilExam <= 7 ? `${daysUntilExam} days left — final push! 💪` :
                   daysUntilExam <= 30 ? `${daysUntilExam} days remaining — keep going!` :
                   `${daysUntilExam} days until your exam — you've got this!`}
                </span>
              </div>
            )}
          </div>
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title="Notifications" color="text-sky-400" bg="bg-sky-500/15">
          <div
            className={cn(
              "flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all active:scale-[0.98]",
              notifications ? "bg-sky-500/10 border-sky-500/25" : "bg-white/[0.03] border-white/[0.07]"
            )}
            onClick={() => setNotifications(v => !v)}
          >
            <div className="flex-1 pr-4">
              <p className="text-sm font-bold text-white">Study Reminders</p>
              <p className="text-xs text-white/40 mt-0.5">Get reminded to review notes and take quizzes</p>
            </div>
            <Toggle enabled={notifications} onToggle={() => setNotifications(v => !v)} />
          </div>
        </Section>

        {/* About */}
        <Section icon={Info} title="About" color="text-emerald-400" bg="bg-emerald-500/15">
          <div className="space-y-0.5">
            {[
              { label: "App", value: "JUPEB Prep" },
              { label: "Institution", value: "UNILAG – Foundation Studies" },
              { label: "Programme", value: "JUPEB 2025/2026" },
              { label: "Track", value: "Law: Literature, Government & CRS" },
              { label: "Version", value: "1.0.0" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
                <span className="text-xs text-white/40">{item.label}</span>
                <span className="text-xs font-medium text-white/70 text-right max-w-[180px]">{item.value}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Danger zone */}
        <Section icon={Shield} title="Data & Privacy" color="text-red-400" bg="bg-red-500/15">
          <div className="space-y-2.5">
            <button
              onClick={handleClearData}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] active:scale-[0.98] transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="h-4 w-4 text-white/40 group-hover:text-red-400 transition-colors" />
                <div>
                  <p className="text-sm text-white/70 group-hover:text-white transition-colors font-medium">Clear App Cache</p>
                  <p className="text-xs text-white/30">Resets quiz sessions and cached data</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors" />
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-red-500/20 bg-red-500/[0.08] hover:bg-red-500/15 active:scale-[0.98] transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-4 w-4 text-red-400" />
                <div>
                  <p className="text-sm text-red-400 font-bold">Sign Out</p>
                  <p className="text-xs text-white/30">Clear session and local data</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-red-400/40 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </Section>
      </div>

      {/* Floating save button */}
      <div className="fixed bottom-0 inset-x-0 z-30 p-4 bg-gradient-to-t from-[#09090f] via-[#09090f]/90 to-transparent pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <button
            onClick={saveProfile}
            className="w-full h-13 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-violet-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
          >
            <CheckCircle2 className="h-4 w-4" />
            Save Settings
          </button>
        </div>
      </div>
    </Shell>
  );
}
