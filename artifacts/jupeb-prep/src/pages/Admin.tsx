import { useState, useRef, useCallback } from "react";
import { Shell } from "@/components/layout/Shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Lock, Plus, Trash2, Edit, Upload, Megaphone, Pin, CheckCircle2,
  Sparkles, X, ImagePlus, User, FileText, Download, AlertCircle,
  CheckCircle, Loader2, Timer, Settings2, Brain,
} from "lucide-react";
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
  const [tab, setTab] = useState<"questions" | "manage" | "announcements" | "bulk" | "branding" | "settings">("announcements");

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
    { id: "questions",     label: "➕ Add Question" },
    { id: "manage",        label: "📋 Manage" },
    { id: "bulk",          label: "⬆️ Bulk Upload" },
    { id: "settings",      label: "⚙️ Settings" },
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
              <BulkUploadTab />
            </motion.div>
          )}
          {tab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AppSettingsTab />
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

// ─── Bulk Upload Tab ────────────────────────────────────────────────────────

type ParsedQuestion = {
  subjectId: string; paper: string; year: string; questionType: string;
  questionText: string; optionA?: string; optionB?: string; optionC?: string; optionD?: string;
  correctOption?: string; explanation?: string; markingGuide?: string; marks?: string;
};

function parseCSVLocal(csv: string): ParsedQuestion[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals: string[] = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { vals.push(cur.trim()); cur = ""; }
      else { cur += ch; }
    }
    vals.push(cur.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] ?? "").replace(/^"|"$/g, ""); });
    return obj as ParsedQuestion;
  });
}

type UploadResult = { inserted: number; failed: number; total: number; errors: { row: number; error: string }[] };

function BulkUploadTab() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedQuestion[]>([]);
  const [fileName, setFileName] = useState("");
  const [autoExplain, setAutoExplain] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback((file: File) => {
    setError(""); setResult(null);
    const ext = file.name.split(".").pop()?.toLowerCase();
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        if (ext === "json") {
          const data = JSON.parse(text);
          const arr = Array.isArray(data) ? data : data.questions ?? [];
          setParsed(arr);
        } else if (ext === "csv") {
          setParsed(parseCSVLocal(text));
        } else {
          setError("Only .json and .csv files are supported.");
        }
      } catch {
        setError("Could not parse file. Check the format and try again.");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const downloadTemplate = () => {
    window.location.href = `${BASE}/api/questions/bulk/template`;
  };

  const handleUpload = async () => {
    if (!parsed.length) return;
    setUploading(true); setResult(null); setError("");
    try {
      const isCSV = fileName.endsWith(".csv");
      const body: any = { adminPin: "JUPEB2024", autoExplain };
      if (isCSV) {
        // Re-read as raw csv for server-side parsing
        body.questions = parsed;
      } else {
        body.questions = parsed;
      }
      const r = await fetch(`${BASE}/api/questions/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error ?? "Upload failed"); return; }
      setResult(data);
      toast({ title: `✅ Uploaded ${data.inserted} of ${data.total} questions` });
      if (data.inserted === data.total) {
        setParsed([]); setFileName("");
        if (fileRef.current) fileRef.current.value = "";
      }
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Section title="Bulk Question Upload">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-sm text-white/55 leading-relaxed">
              Upload dozens of questions at once using a <strong className="text-white/80">CSV</strong> or <strong className="text-white/80">JSON</strong> file.
              Optionally let AI automatically generate academic explanations for any question that doesn't have one.
            </p>
            <button onClick={downloadTemplate}
              className="flex items-center gap-2 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors border border-violet-500/20 hover:border-violet-400/40 rounded-xl px-3 py-2 bg-violet-500/5 hover:bg-violet-500/10">
              <Download className="h-3.5 w-3.5" />
              Download CSV Template
            </button>
          </div>
          <div className="text-xs text-white/35 space-y-1 bg-white/3 rounded-xl p-3 border border-white/8">
            <p className="font-semibold text-white/50 mb-2">Required CSV columns:</p>
            <p><span className="text-white/60">subjectId</span> — numeric subject ID</p>
            <p><span className="text-white/60">paper</span> — 001, 002, 003, 004</p>
            <p><span className="text-white/60">year</span> — e.g. 2024</p>
            <p><span className="text-white/60">questionType</span> — objective / theory</p>
            <p><span className="text-white/60">questionText</span> — the question</p>
            <p><span className="text-white/60">optionA–D</span> — for objective only</p>
            <p><span className="text-white/60">correctOption</span> — A, B, C or D</p>
          </div>
        </div>
      </Section>

      {/* File picker / drop zone */}
      <Section title="Select File">
        <input ref={fileRef} type="file" accept=".json,.csv" className="hidden" onChange={handleFile} />
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-4 py-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all",
            dragOver ? "border-violet-400/60 bg-violet-500/8" :
            fileName ? "border-violet-500/30 bg-violet-500/5" :
            "border-white/10 hover:border-white/20 hover:bg-white/3"
          )}
        >
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center",
            fileName ? "bg-violet-500/20" : "bg-white/5")}>
            <FileText className={cn("h-6 w-6", fileName ? "text-violet-400" : "text-white/30")} />
          </div>
          <div className="text-center">
            {fileName ? (
              <>
                <p className="text-sm font-bold text-white">{fileName}</p>
                <p className="text-xs text-violet-400 mt-1">{parsed.length} questions parsed — click to change file</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-white/60">Drop your CSV or JSON file here</p>
                <p className="text-xs text-white/30 mt-1">or click to browse</p>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </Section>

      {/* Preview */}
      {parsed.length > 0 && (
        <Section title={`Preview — ${parsed.length} Questions`}>
          <div className="overflow-x-auto rounded-xl border border-white/8">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/8 bg-white/3">
                  {["#","Subject ID","Paper","Year","Type","Question (preview)","Has Options","Has Answer"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-white/40 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsed.slice(0, 10).map((q, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-3 py-2.5 text-white/30">{i + 1}</td>
                    <td className="px-3 py-2.5 text-white/70">{q.subjectId}</td>
                    <td className="px-3 py-2.5 text-white/70">{q.paper}</td>
                    <td className="px-3 py-2.5 text-white/70">{q.year}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-semibold",
                        (q.questionType ?? "").toLowerCase() === "objective"
                          ? "bg-blue-500/15 text-blue-300"
                          : "bg-amber-500/15 text-amber-300")}>
                        {q.questionType}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-white/60 max-w-[200px] truncate">{q.questionText}</td>
                    <td className="px-3 py-2.5 text-center">
                      {q.optionA ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mx-auto" />
                                 : <X className="h-3.5 w-3.5 text-red-400/50 mx-auto" />}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {q.correctOption ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mx-auto" />
                                       : <X className="h-3.5 w-3.5 text-red-400/50 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsed.length > 10 && (
              <p className="px-4 py-2.5 text-xs text-white/30 border-t border-white/8">
                … and {parsed.length - 10} more questions
              </p>
            )}
          </div>

          {/* AI Explain option */}
          <div
            onClick={() => setAutoExplain(p => !p)}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
              autoExplain
                ? "bg-violet-500/10 border-violet-500/30"
                : "bg-white/3 border-white/8 hover:bg-white/5"
            )}
          >
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
              autoExplain ? "bg-violet-500/20" : "bg-white/5")}>
              <Brain className={cn("h-4 w-4", autoExplain ? "text-violet-400" : "text-white/30")} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">AI-Generate Explanations</p>
              <p className="text-xs text-white/40 mt-0.5">
                Use Gemini to auto-write academic explanations for questions that don't have one. Slower but very thorough.
              </p>
            </div>
            <div className={cn(
              "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
              autoExplain ? "bg-violet-500 border-violet-400" : "bg-white/5 border-white/15"
            )}>
              {autoExplain && <CheckCircle2 className="h-3 w-3 text-white" />}
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploading || parsed.length === 0}
            className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold text-white rounded-xl"
          >
            {uploading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading{autoExplain ? " & Generating Explanations" : ""}…</>
            ) : (
              <><Upload className="h-4 w-4 mr-2" /> Upload {parsed.length} Questions</>
            )}
          </Button>
        </Section>
      )}

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Section title="Upload Result">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-2xl font-bold text-emerald-400">{result.inserted}</p>
                <p className="text-xs text-white/40 mt-1">Inserted</p>
              </div>
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-2xl font-bold text-red-400">{result.failed}</p>
                <p className="text-xs text-white/40 mt-1">Failed</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/8">
                <p className="text-2xl font-bold text-white">{result.total}</p>
                <p className="text-xs text-white/40 mt-1">Total</p>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Errors</p>
                {result.errors.map((e, i) => (
                  <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-red-500/8 border border-red-500/15 text-xs text-red-300">
                    <span className="font-bold flex-shrink-0">Row {e.row}</span>
                    <span className="text-red-300/70">{e.error}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </motion.div>
      )}
    </div>
  );
}

// ─── App Settings Tab ──────────────────────────────────────────────────────

function AppSettingsTab() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    const r = await fetch(`${BASE}/api/settings`);
    if (r.ok) { setSettings(await r.json()); setLoaded(true); }
  };
  if (!loaded) { load(); }

  const save = async (key: string, value: string) => {
    setSaving(key);
    try {
      const r = await fetch(`${BASE}/api/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value, adminPin: "JUPEB2024" }),
      });
      if (r.ok) {
        setSettings(p => ({ ...p, [key]: value }));
        toast({ title: "Setting saved" });
      } else {
        toast({ title: "Failed to save", variant: "destructive" });
      }
    } finally { setSaving(null); }
  };

  const TimerField = ({ label, settingKey, desc }: { label: string; settingKey: string; desc: string }) => {
    const [val, setVal] = useState("");
    const current = settings[settingKey] ?? "";

    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Timer className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="text-xs text-white/40">{desc}</p>
            <p className="text-xs text-white/25 mt-0.5">Current: <span className="text-amber-400">{current} minutes</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Input
            type="number"
            min="10" max="360"
            placeholder={current}
            value={val}
            onChange={e => setVal(e.target.value)}
            className={cn(inputCls, "w-24 text-center")}
          />
          <Button
            size="sm"
            disabled={!val || saving === settingKey}
            onClick={() => { if (val) { save(settingKey, val); setVal(""); } }}
            className="bg-violet-600 hover:bg-violet-500 text-white h-9 px-4"
          >
            {saving === settingKey ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Section title="Exam Timer Durations">
        <p className="text-xs text-white/40 -mt-2 leading-relaxed">
          Configure default exam durations. Students will see these times on the quiz launcher. Changes take effect immediately.
        </p>
        <div className="space-y-3">
          <TimerField
            label="Objective (MCQ) Timer"
            settingKey="obj_timer_minutes"
            desc="Duration for Papers 001, 002, 003 — multiple choice"
          />
          <TimerField
            label="Theory Timer"
            settingKey="theory_timer_minutes"
            desc="Duration for written / essay type questions"
          />
          <TimerField
            label="Mock Exam Timer"
            settingKey="mock_timer_minutes"
            desc="Duration for full mock / Paper 004 exams"
          />
        </div>
      </Section>

      <Section title="About Timer Settings">
        <div className="grid sm:grid-cols-3 gap-3 text-center">
          {[
            { label: "Objective", key: "obj_timer_minutes", default: "60 min" },
            { label: "Theory", key: "theory_timer_minutes", default: "120 min" },
            { label: "Mock Exam", key: "mock_timer_minutes", default: "120 min" },
          ].map(item => (
            <div key={item.key} className="p-4 rounded-xl bg-white/3 border border-white/8">
              <p className="text-2xl font-bold text-amber-400">{settings[item.key] ?? item.default.split(" ")[0]}</p>
              <p className="text-xs text-white/30 mt-1">min — {item.label}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ─── Branding Tab ──────────────────────────────────────────────────────────

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
          Upload a custom image for LexBot — it will appear in the chat header, message bubbles, and AI generate dialogs.
          Recommended: square image, at least 128 × 128 px, under 2 MB.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
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
              <button onClick={handleClear}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/8 border border-red-500/15 hover:border-red-500/30 transition-all">
                <X className="h-3.5 w-3.5" />
                Remove image
              </button>
            )}
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Preview</p>
            <div className="glass-card p-4 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/8">
                <div className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20 flex-shrink-0">
                  {botImage ? <img src={botImage} alt="LexBot" className="w-full h-full object-cover" />
                             : <Sparkles className="h-5 w-5 text-white" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">LexBot</p>
                  <p className="text-[10px] text-white/35">JUPEB Study Assistant · Online</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <div className="w-8 h-8 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 flex-shrink-0">
                  {botImage ? <img src={botImage} alt="LexBot" className="w-full h-full object-cover" />
                             : <Sparkles className="h-3.5 w-3.5 text-white" />}
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

// ─── Announcements Tab ────────────────────────────────────────────────────

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
            <div onClick={() => setForm(p => ({ ...p, isPinned: !p.isPinned }))}
              className={cn(
                "w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer",
                form.isPinned ? "bg-violet-500 border-violet-400" : "bg-white/5 border-white/15"
              )}>
              {form.isPinned && <CheckCircle2 className="h-3 w-3 text-white" />}
            </div>
            <span className="text-sm text-white/60 flex items-center gap-1.5">
              <Pin className="h-3.5 w-3.5" />Pin to top of Dashboard
            </span>
          </label>
          {form.title && form.content && (
            <div className={cn("p-4 rounded-xl border border-l-4 bg-white/3",
              BORDER_MAP[form.type] || "border-l-sky-400", "border-white/8")}>
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

      <Section title={`Posted Announcements (${announcements.length})`}>
        {announcements.length === 0 ? (
          <div className="text-center py-10 text-white/25">
            <Megaphone className="h-8 w-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No announcements yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className={cn("flex items-start gap-4 p-4 rounded-2xl border border-l-4 bg-white/2",
                BORDER_MAP[a.type] || "border-l-sky-400", "border-white/6")}>
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
                <button onClick={() => handleDelete(a.id)} disabled={deleting === a.id}
                  className="flex-shrink-0 w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors">
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

// ─── Add Question Form ─────────────────────────────────────────────────────

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

// ─── Manage Questions ──────────────────────────────────────────────────────

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
