import { useState, useEffect, useRef } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  User, Target, Bell, Shield, Info,
  Trash2, ChevronRight, CheckCircle2,
  LogOut, Camera, Calendar, Clock,
} from "lucide-react";

const GOAL_OPTIONS = [
  { value: "aaa1", label: "AAA+1", points: "16 Points", desc: "Medicine, Law, Pharmacy — top programmes" },
  { value: "aab1", label: "AAB+1", points: "15 Points", desc: "Engineering, Accounting, Economics" },
  { value: "bbb1", label: "BBB+1", points: "12 Points", desc: "Sciences, Social Sciences" },
  { value: "ccc1", label: "CCC+1", points: "9 Points",  desc: "Arts, Education, Humanities" },
];

const SUBJECT_OPTIONS = [
  "Literature-in-English", "Government", "CRS", "Islamic Studies",
  "Economics", "Commerce", "Accounting", "Mathematics",
  "Physics", "Chemistry", "Biology", "Geography",
  "French", "Arabic", "Fine Art", "Music",
];

function Section({ icon: Icon, title, children, color = "text-violet-400", bg = "bg-violet-500/15" }: {
  icon: any; title: string; children: React.ReactNode; color?: string; bg?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-white/6 flex items-center gap-3">
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", bg)}>
          <Icon className={cn("h-4 w-4", color)} />
        </div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
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
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 150, 150);
        const b64 = canvas.toDataURL("image/jpeg", 0.85);
        setProfilePic(b64);
        localStorage.setItem("jupeb_profile_picture", b64);
        toast({ title: "Photo updated!", description: "Your profile picture has been saved." });
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
    if (!confirm("Clear all local session data and return to the app?")) return;
    localStorage.removeItem("admin_auth");
    localStorage.removeItem("user_display_name");
    localStorage.removeItem("user_goal");
    localStorage.removeItem("notif_enabled");
    toast({ title: "Session cleared", description: "Local data has been reset." });
  };

  const handleClearData = () => {
    if (!confirm("This will clear all local app data including session info. Continue?")) return;
    const keep = ["user_display_name", "user_goal", "notif_enabled"];
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && !keep.includes(key)) localStorage.removeItem(key);
    }
    toast({ title: "Data cleared", description: "App cache and session data reset." });
  };

  const selectedGoal = GOAL_OPTIONS.find(g => g.value === goal);

  return (
    <Shell>
      <div className="p-6 max-w-2xl mx-auto w-full space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-serif text-white">Settings</h1>
          <p className="text-white/40 text-sm mt-1">Customise your JUPEB Prep experience.</p>
        </motion.div>

        {/* Profile */}
        <Section icon={User} title="Your Profile" color="text-violet-400" bg="bg-violet-500/15">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {/* Profile picture */}
              <div className="relative flex-shrink-0 group">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-2xl overflow-hidden cursor-pointer ring-2 ring-white/10 hover:ring-violet-500/40 transition-all relative"
                >
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                      {displayName ? displayName.charAt(0).toUpperCase() : "S"}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePicUpload} />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-violet-600 border-2 border-[#1a1a2e] flex items-center justify-center cursor-pointer hover:bg-violet-500 transition-colors"
                >
                  <Camera className="h-3 w-3 text-white" />
                </div>
              </div>

              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Display Name</label>
                <Input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g. Adaeze, John, Scholar…"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 h-10"
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
            <p className="text-xs text-white/40">Select the grade combination you are aiming for.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GOAL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setGoal(opt.value)}
                  className={cn(
                    "text-left p-4 rounded-2xl border transition-all",
                    goal === opt.value
                      ? "bg-amber-500/15 border-amber-500/40 ring-1 ring-amber-500/20"
                      : "bg-white/3 border-white/8 hover:bg-white/6"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn("font-black text-lg font-serif", goal === opt.value ? "text-amber-400" : "text-white/60")}>
                      {opt.label}
                    </span>
                    {goal === opt.value && <CheckCircle2 className="h-4 w-4 text-amber-400" />}
                  </div>
                  <p className={cn("text-xs font-bold", goal === opt.value ? "text-amber-300" : "text-white/40")}>{opt.points}</p>
                  <p className="text-[10px] text-white/30 mt-0.5 leading-snug">{opt.desc}</p>
                </button>
              ))}
            </div>
            {selectedGoal && (
              <div className="flex items-center gap-2 text-xs text-amber-400/70 bg-amber-500/8 border border-amber-500/15 rounded-xl px-3 py-2">
                <Target className="h-3.5 w-3.5 flex-shrink-0" />
                Current goal: <span className="font-bold">{selectedGoal.label} — {selectedGoal.points}</span>
              </div>
            )}
          </div>
        </Section>

        {/* Exam Date */}
        <Section icon={Calendar} title="Exam & Countdown" color="text-rose-400" bg="bg-rose-500/15">
          <div className="space-y-3">
            <p className="text-xs text-white/40">Set your exam date to see a countdown on the dashboard.</p>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Mock / Final Exam Date</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                <input
                  type="date"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  className="w-full pl-10 pr-4 h-11 bg-white/5 border border-white/10 text-white rounded-xl text-sm outline-none focus:border-rose-500/40 transition-colors [color-scheme:dark]"
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>
            </div>
            {examDate && (
              <div className="flex items-center gap-2 text-xs text-rose-400/70 bg-rose-500/8 border border-rose-500/15 rounded-xl px-3 py-2">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                {Math.max(0, Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000))} days remaining
              </div>
            )}
          </div>
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title="Notifications" color="text-sky-400" bg="bg-sky-500/15">
          <div
            className={cn(
              "flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all",
              notifications ? "bg-sky-500/10 border-sky-500/25" : "bg-white/3 border-white/8"
            )}
            onClick={() => setNotifications(v => !v)}
          >
            <div>
              <p className="text-sm font-semibold text-white">Study Reminders</p>
              <p className="text-xs text-white/40 mt-0.5">Get reminded to review notes and take quizzes</p>
            </div>
            <div className={cn(
              "w-11 h-6 rounded-full border transition-colors relative flex-shrink-0",
              notifications ? "bg-sky-500 border-sky-400" : "bg-white/10 border-white/15"
            )}>
              <div className={cn(
                "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all",
                notifications ? "left-5" : "left-0.5"
              )} />
            </div>
          </div>
        </Section>

        {/* About */}
        <Section icon={Info} title="About" color="text-emerald-400" bg="bg-emerald-500/15">
          <div className="space-y-3">
            {[
              { label: "App", value: "JUPEB Prep" },
              { label: "Institution", value: "UNILAG School of Foundation Studies" },
              { label: "Programme", value: "JUPEB 2025/2026" },
              { label: "Subjects", value: "Law-track: Literature, Government & CRS" },
              { label: "Version", value: "1.0.0" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-xs text-white/40">{item.label}</span>
                <span className="text-xs font-medium text-white/70">{item.value}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Save button */}
        <Button
          onClick={saveProfile}
          className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Save Settings
        </Button>

        {/* Danger zone */}
        <Section icon={Shield} title="Data & Privacy" color="text-red-400" bg="bg-red-500/15">
          <div className="space-y-3">
            <button
              onClick={handleClearData}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="h-4 w-4 text-white/40 group-hover:text-red-400 transition-colors" />
                <div>
                  <p className="text-sm text-white/70 group-hover:text-white transition-colors">Clear App Cache</p>
                  <p className="text-xs text-white/30">Resets stored quiz sessions and cached data</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors" />
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-red-500/20 bg-red-500/8 hover:bg-red-500/15 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-4 w-4 text-red-400" />
                <div>
                  <p className="text-sm text-red-400 font-medium">Sign Out</p>
                  <p className="text-xs text-white/30">Clear session and local data</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-red-400/40 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </Section>
      </div>
    </Shell>
  );
}
