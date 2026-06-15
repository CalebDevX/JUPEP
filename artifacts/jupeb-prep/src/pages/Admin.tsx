import { useState, useRef } from "react";
import { Shell } from "@/components/layout/Shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Lock, Plus, Trash2, Edit, Upload, Megaphone, Pin, CheckCircle2, Sparkles, X, ImagePlus, User } from "lucide-react";
import { useListQuestions, useListSubjects, useCreateQuestion, useDeleteQuestion } from "@workspace/api-client-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-6 space-y-5">
      <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "bg-white/5 border-white/10 text-white placeholder:text-white/25";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("admin_auth") === "true");
  const [pin, setPin] = useState("");
  const { toast } = useToast();
  const [tab, setTab] = useState<"questions" | "manage" | "announcements" | "bulk" | "branding">("announcements");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "JUPEB2024") {
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
      toast({ title: "Authenticated" });
    } else {
      toast({ title: "Wrong PIN", variant: "destructive" });
      setPin("");
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_auth");
  };

  if (!isAuthenticated) {
    return (
      <Shell>
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm"
          >
            <div className="glass-card p-8 space-y-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/15 flex items-center justify-center mx-auto border border-violet-500/25">
                <Lock className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-serif text-white">Admin Access</h1>
                <p className="text-white/40 text-sm mt-1">Enter your PIN to continue</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="password"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="Enter PIN"
                  className={cn(inputCls, "text-center text-lg tracking-widest h-12")}
                  autoFocus
                />
                <Button type="submit" className="w-full h-12 bg-violet-600 hover:bg-violet-500 font-bold">
                  Verify Access
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </Shell>
    );
  }

  const TABS = [
    { id: "announcements", label: "📢 Announcements" },
    { id: "questions",     label: "Add Question" },
    { id: "manage",        label: "Manage Questions" },
    { id: "bulk",          label: "Bulk Upload" },
    { id: "branding",      label: "🎨 Branding" },
  ] as const;

  return (
    <Shell>
      <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-serif text-white">Content Management</h1>
            <p className="text-white/40 text-sm mt-0.5">Post announcements, manage questions and notes.</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}
            className="border-white/15 text-white/60 hover:bg-white/8 hover:text-white bg-transparent">
            Lock Session
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap border-b border-white/8 pb-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
                tab === t.id ? "border-violet-400 text-violet-400" : "border-transparent text-white/40 hover:text-white/70"
              )}>
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "announcements" && (
            <motion.div key="ann" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnnouncementsTab />
            </motion.div>
          )}
          {tab === "questions" && (
            <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AddQuestionForm />
            </motion.div>
          )}
          {tab === "manage" && (
            <motion.div key="manage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ManageQuestionsList />
            </motion.div>
          )}
          {tab === "bulk" && (
            <motion.div key="bulk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Section title="Bulk Upload">
                <div className="flex flex-col items-center justify-center py-14 border-2 border-dashed border-white/10 rounded-2xl text-center">
                  <Upload className="h-10 w-10 text-white/20 mb-4" />
                  <h3 className="text-base font-bold text-white/50">Coming Soon</h3>
                  <p className="text-xs text-white/30 mt-1 max-w-xs">
                    Bulk JSON/CSV upload is in development. Use the single question form for now.
                  </p>
                </div>
              </Section>
            </motion.div>
          )}
          {tab === "branding" && (
            <motion.div key="branding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BrandingTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Shell>
  );
}

function BrandingTab() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [botImage, setBotImage] = useState<string | null>(() => localStorage.getItem("jupeb_bot_image"));

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Please use an image under 2 MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      localStorage.setItem("jupeb_bot_image", b64);
      setBotImage(b64);
      toast({ title: "Bot image updated", description: "LexBot will now use this image across the app." });
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    localStorage.removeItem("jupeb_bot_image");
    setBotImage(null);
    if (fileRef.current) fileRef.current.value = "";
    toast({ title: "Bot image removed" });
  };

  return (
    <div className="space-y-6">
      <Section title="LexBot Identity Image">
        <p className="text-xs text-white/40 leading-relaxed -mt-2">
          Upload a custom image for LexBot — it will appear in the chat header, message bubbles, and AI generate dialogs across the entire app.
          Recommended: square image, at least 128 × 128 px, under 2 MB.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload control */}
          <div className="space-y-3">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <button
              onClick={() => fileRef.current?.click()}
              className={cn(
                "w-full flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 border-dashed transition-all",
                botImage
                  ? "border-violet-500/30 bg-violet-500/5 hover:border-violet-400/50"
                  : "border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5"
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/8 flex items-center justify-center">
                <ImagePlus className="h-5 w-5 text-white/40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white/60">{botImage ? "Replace image" : "Upload bot image"}</p>
                <p className="text-xs text-white/30 mt-0.5">PNG, JPG, WebP · Max 2 MB</p>
              </div>
            </button>

            {botImage && (
              <button
                onClick={handleClear}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/8 border border-red-500/15 hover:border-red-500/30 transition-all"
              >
                <X className="h-3.5 w-3.5" />
                Remove image
              </button>
            )}
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Preview</p>
            <div className="glass-card p-4 space-y-4">
              {/* Chat header preview */}
              <div className="flex items-center gap-3 pb-3 border-b border-white/8">
                <div className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20 flex-shrink-0">
                  {botImage
                    ? <img src={botImage} alt="LexBot" className="w-full h-full object-cover" />
                    : <Sparkles className="h-5 w-5 text-white" />
                  }
                </div>
                <div>
                  <p className="text-sm font-bold text-white">LexBot</p>
                  <p className="text-[10px] text-white/35">JUPEB Study Assistant · Online</p>
                </div>
              </div>
              {/* Message bubble preview */}
              <div className="flex gap-2.5 items-start">
                <div className="w-8 h-8 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 flex-shrink-0">
                  {botImage
                    ? <img src={botImage} alt="LexBot" className="w-full h-full object-cover" />
                    : <Sparkles className="h-3.5 w-3.5 text-white" />
                  }
                </div>
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-tl-sm px-3 py-2">
                  <p className="text-xs text-white/70">Hey! I'm LexBot, your JUPEB study assistant 🎓</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="User Appearance">
        <div className="flex items-start gap-4 py-2">
          <div className="w-10 h-10 rounded-2xl bg-violet-500/15 flex items-center justify-center flex-shrink-0 border border-violet-500/20">
            <User className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white/80">User Profile Pictures</p>
            <p className="text-xs text-white/40 mt-1 leading-relaxed">
              Students manage their own profile picture from the <span className="text-violet-400">Settings</span> page.
              Profile photos appear in the sidebar, chat bubbles, and community posts automatically.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}

const TYPE_OPTIONS = [
  { value: "info",    label: "ℹ️  Info",    color: "text-sky-400" },
  { value: "success", label: "✅  Success", color: "text-emerald-400" },
  { value: "warning", label: "⚠️  Warning", color: "text-amber-400" },
  { value: "event",   label: "🎉  Event",   color: "text-violet-400" },
];

const TYPE_BADGE: Record<string, string> = {
  info:    "bg-sky-500/15 text-sky-300 border-sky-500/20",
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  event:   "bg-violet-500/15 text-violet-300 border-violet-500/20",
};

const BORDER_MAP: Record<string, string> = {
  info: "border-l-sky-400", success: "border-l-emerald-400",
  warning: "border-l-amber-400", event: "border-l-violet-400",
};

function AnnouncementsTab() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", type: "info", emoji: "📢", authorName: "Admin", isPinned: false });
  const [posting, setPosting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = async () => {
    const r = await fetch(`${BASE}/api/announcements`);
    if (r.ok) { setAnnouncements(await r.json()); setLoaded(true); }
  };

  if (!loaded) { load(); }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Title and content are required", variant: "destructive" }); return;
    }
    setPosting(true);
    try {
      const r = await fetch(`${BASE}/api/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, adminPin: "JUPEB2024" }),
      });
      if (r.ok) {
        const ann = await r.json();
        setAnnouncements(p => [ann, ...p]);
        setForm({ title: "", content: "", type: "info", emoji: "📢", authorName: "Admin", isPinned: false });
        toast({ title: "Announcement posted!" });
      } else {
        const d = await r.json();
        toast({ title: d.error || "Failed", variant: "destructive" });
      }
    } finally { setPosting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this announcement?")) return;
    setDeleting(id);
    try {
      const r = await fetch(`${BASE}/api/announcements/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPin: "JUPEB2024" }),
      });
      if (r.ok) {
        setAnnouncements(p => p.filter(a => a.id !== id));
        toast({ title: "Deleted" });
      }
    } finally { setDeleting(null); }
  };

  const EMOJI_PRESETS = ["📢", "🎉", "⚠️", "📌", "✅", "🚀", "📚", "🔔", "🏆", "💡"];

  return (
    <div className="space-y-6">
      {/* Post form */}
      <Section title="Post New Announcement">
        <form onSubmit={handlePost} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title *">
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. New questions added for CRS Paper 002" className={inputCls} />
            </Field>
            <Field label="Type">
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                <SelectTrigger className={cn(inputCls)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10">
                  {TYPE_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value} className="text-white">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Content *">
            <Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              placeholder="Write your message to scholars…"
              className={cn(inputCls, "min-h-[100px] resize-none")} />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Author Name">
              <Input value={form.authorName} onChange={e => setForm(p => ({ ...p, authorName: e.target.value }))}
                placeholder="Admin" className={inputCls} />
            </Field>
            <Field label="Emoji">
              <div className="space-y-2">
                <Input value={form.emoji} onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))}
                  placeholder="📢" className={cn(inputCls, "w-24")} maxLength={4} />
                <div className="flex gap-1.5 flex-wrap">
                  {EMOJI_PRESETS.map(em => (
                    <button key={em} type="button" onClick={() => setForm(p => ({ ...p, emoji: em }))}
                      className={cn(
                        "w-8 h-8 rounded-lg text-lg flex items-center justify-center border transition-all",
                        form.emoji === em ? "bg-violet-500/20 border-violet-500/40" : "bg-white/5 border-white/10 hover:bg-white/10"
                      )}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </Field>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm(p => ({ ...p, isPinned: !p.isPinned }))}
              className={cn(
                "w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer",
                form.isPinned ? "bg-violet-500 border-violet-400" : "bg-white/5 border-white/15"
              )}
            >
              {form.isPinned && <CheckCircle2 className="h-3 w-3 text-white" />}
            </div>
            <span className="text-sm text-white/60 flex items-center gap-1.5">
              <Pin className="h-3.5 w-3.5" />Pin to top of Dashboard
            </span>
          </label>

          {/* Preview */}
          {form.title && form.content && (
            <div className={cn(
              "p-4 rounded-xl border border-l-4 bg-white/3",
              BORDER_MAP[form.type] || "border-l-sky-400", "border-white/8"
            )}>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2 font-semibold">Preview</p>
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{form.emoji}</span>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-white">{form.title}</span>
                    <span className={cn("text-[10px] border px-1.5 py-0.5 rounded capitalize", TYPE_BADGE[form.type])}>{form.type}</span>
                    {form.isPinned && <span className="text-[10px] text-white/35">📌 Pinned</span>}
                  </div>
                  <p className="text-xs text-white/55 leading-relaxed">{form.content}</p>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" disabled={posting || !form.title.trim() || !form.content.trim()}
            className="bg-violet-600 hover:bg-violet-500 text-white font-bold h-11 px-8">
            <Megaphone className="h-4 w-4 mr-2" />
            {posting ? "Posting…" : "Post Announcement"}
          </Button>
        </form>
      </Section>

      {/* Existing */}
      <Section title={`Posted Announcements (${announcements.length})`}>
        {announcements.length === 0 ? (
          <div className="text-center py-10 text-white/25">
            <Megaphone className="h-8 w-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No announcements yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className={cn(
                "flex items-start gap-4 p-4 rounded-2xl border border-l-4 bg-white/2",
                BORDER_MAP[a.type] || "border-l-sky-400", "border-white/6"
              )}>
                <span className="text-2xl flex-shrink-0">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-bold text-white">{a.title}</span>
                    <span className={cn("text-[10px] border px-1.5 py-0.5 rounded capitalize", TYPE_BADGE[a.type])}>{a.type}</span>
                    {a.isPinned && <span className="flex items-center gap-1 text-[10px] text-white/35"><Pin className="h-2.5 w-2.5" />Pinned</span>}
                  </div>
                  <p className="text-xs text-white/55 leading-relaxed">{a.content}</p>
                  <p className="text-[10px] text-white/25 mt-1">— {a.authorName} · {format(new Date(a.createdAt), "MMM d, yyyy h:mm a")}</p>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={deleting === a.id}
                  className="flex-shrink-0 w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function AddQuestionForm() {
  const { data: subjects } = useListSubjects();
  const createQuestion = useCreateQuestion();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    subjectId: "", paper: "001", year: new Date().getFullYear().toString(),
    questionType: "objective", questionText: "",
    optionA: "", optionB: "", optionC: "", optionD: "",
    correctOption: "A", explanation: "", markingGuide: "", marks: "5",
  });

  const set = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectId || !formData.questionText) {
      toast({ title: "Fill required fields", variant: "destructive" }); return;
    }
    const payload: any = {
      subjectId: Number(formData.subjectId),
      paper: formData.paper,
      year: Number(formData.year),
      questionType: formData.questionType,
      questionText: formData.questionText,
    };
    if (formData.questionType === "objective") {
      payload.options = [formData.optionA, formData.optionB, formData.optionC, formData.optionD];
      payload.correctOption = formData.correctOption;
      payload.explanation = formData.explanation;
    } else {
      payload.markingGuide = formData.markingGuide;
      payload.marks = Number(formData.marks);
      payload.explanation = formData.explanation;
    }
    createQuestion.mutate({ data: payload }, {
      onSuccess: () => {
        toast({ title: "Question saved!" });
        setFormData(p => ({ ...p, questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", explanation: "", markingGuide: "" }));
      },
      onError: () => toast({ title: "Failed to save", variant: "destructive" }),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Section title="New Question">
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Subject *">
              <Select value={formData.subjectId} onValueChange={v => set("subjectId", v)}>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Choose…" /></SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10">
                  {(Array.isArray(subjects) ? subjects : []).map(s => <SelectItem key={s.id} value={s.id.toString()} className="text-white">{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Paper">
              <Select value={formData.paper} onValueChange={v => set("paper", v)}>
                <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10">
                  {[["001","1st Incourse"],["002","1st Semester"],["003","2nd Incourse"],["004","Mock"]].map(([v,l]) => (
                    <SelectItem key={v} value={v} className="text-white">{v} — {l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Year">
              <Input type="number" value={formData.year} onChange={e => set("year", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Type">
              <Select value={formData.questionType} onValueChange={v => set("questionType", v)}>
                <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10">
                  <SelectItem value="objective" className="text-white">Objective</SelectItem>
                  <SelectItem value="theory"    className="text-white">Theory</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Question Text *">
            <Textarea value={formData.questionText} onChange={e => set("questionText", e.target.value)}
              className={cn(inputCls, "min-h-[100px] font-serif")} placeholder="Type the question here…" />
          </Field>

          {formData.questionType === "objective" ? (
            <div className="p-4 rounded-2xl bg-white/3 border border-white/8 space-y-4">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Answer Options</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {["A","B","C","D"].map(l => (
                  <div key={l} className="flex items-center gap-2.5">
                    <span className="w-6 text-sm font-bold text-white/40">{l}.</span>
                    <Input value={(formData as any)[`option${l}`]} onChange={e => set(`option${l}`, e.target.value)}
                      className={inputCls} placeholder={`Option ${l}`} />
                  </div>
                ))}
              </div>
              <Field label="Correct Answer">
                <Select value={formData.correctOption} onValueChange={v => set("correctOption", v)}>
                  <SelectTrigger className={cn(inputCls, "w-28")}><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    {["A","B","C","D"].map(l => <SelectItem key={l} value={l} className="text-white">{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/3 border border-white/8 space-y-4">
              <Field label="Marking Guide / Expected Answer">
                <Textarea value={formData.markingGuide} onChange={e => set("markingGuide", e.target.value)}
                  className={cn(inputCls, "min-h-[130px]")} placeholder="Expected answer or marking points…" />
              </Field>
              <Field label="Marks">
                <Input type="number" value={formData.marks} onChange={e => set("marks", e.target.value)}
                  className={cn(inputCls, "w-28")} />
              </Field>
            </div>
          )}

          <Field label="Explanation (Optional)">
            <Textarea value={formData.explanation} onChange={e => set("explanation", e.target.value)}
              className={cn(inputCls, "min-h-[80px]")} placeholder="Why is this the answer?" />
          </Field>

          <Button type="submit" disabled={createQuestion.isPending}
            className="bg-violet-600 hover:bg-violet-500 text-white font-bold h-11 px-8">
            <Plus className="h-4 w-4 mr-2" />
            {createQuestion.isPending ? "Saving…" : "Save Question"}
          </Button>
        </div>
      </Section>
    </form>
  );
}

function ManageQuestionsList() {
  const { data: questions, refetch } = useListQuestions({ limit: 50 });
  const deleteQuestion = useDeleteQuestion();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (!confirm("Delete this question?")) return;
    deleteQuestion.mutate({ questionId: id }, {
      onSuccess: () => { toast({ title: "Question deleted" }); refetch(); },
    });
  };

  return (
    <Section title="Recent Questions">
      <div className="space-y-3">
        {(Array.isArray(questions) ? questions : []).map(q => (
          <div key={q.id} className="flex items-start gap-4 p-4 rounded-2xl bg-white/3 border border-white/8 hover:bg-white/4 transition-colors">
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex gap-2 flex-wrap">
                <span className="text-[10px] bg-violet-500/15 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded-lg">{q.subjectName}</span>
                <span className="text-[10px] bg-white/8 text-white/50 border border-white/10 px-2 py-0.5 rounded-lg">{q.paper}</span>
                <span className="text-[10px] bg-white/8 text-white/50 border border-white/10 px-2 py-0.5 rounded-lg capitalize">{q.questionType}</span>
              </div>
              <p className="text-sm text-white/75 line-clamp-2 leading-snug">{q.questionText}</p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button title="Edit (coming soon)" className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 transition-colors">
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => handleDelete(q.id)} disabled={deleteQuestion.isPending}
                className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {questions?.length === 0 && (
          <p className="text-center text-white/30 py-8 text-sm">No questions yet. Add some!</p>
        )}
      </div>
    </Section>
  );
}
