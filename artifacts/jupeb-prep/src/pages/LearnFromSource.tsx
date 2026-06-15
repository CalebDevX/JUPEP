import { useState, useRef } from "react";
import { Shell } from "@/components/layout/Shell";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2, Youtube, Globe, FileText, Upload, Loader2, Sparkles,
  Volume2, VolumeX, Square, Save, BookOpen, ChevronDown, Check,
  Pause, Play, X, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListSubjects } from "@workspace/api-client-react";
import { useReadAloud } from "@/hooks/useReadAloud";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

type SourceType = "youtube" | "website" | "text" | "file";

const SOURCE_TABS: { id: SourceType; label: string; icon: any; placeholder: string; description: string }[] = [
  {
    id: "youtube",
    label: "YouTube",
    icon: Youtube,
    placeholder: "https://www.youtube.com/watch?v=...",
    description: "Paste any YouTube video URL — lecture, documentary, tutorial",
  },
  {
    id: "website",
    label: "Website",
    icon: Globe,
    placeholder: "https://example.com/article",
    description: "Paste a web article, blog post or educational page URL",
  },
  {
    id: "text",
    label: "Paste Text",
    icon: FileText,
    placeholder: "Paste your lecture notes, textbook excerpt, or any text here…",
    description: "Copy-paste text from anywhere — textbook, handout, WhatsApp notes",
  },
  {
    id: "file",
    label: "Upload File",
    icon: Upload,
    placeholder: "",
    description: "Upload a PDF, Word doc, or text file from your device",
  },
];

const PAPER_LABELS: Record<string, string> = {
  "001": "Paper 001 — 1st Incourse",
  "002": "Paper 002 — 1st Semester",
  "003": "Paper 003 — 2nd Incourse",
  "004": "Paper 004 — Mock Exam",
};

interface GeneratedNote {
  title: string;
  content: string;
  type: SourceType;
}

export default function LearnFromSource() {
  const [activeTab, setActiveTab] = useState<SourceType>("youtube");
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [subjectCtx, setSubjectCtx] = useState("none");
  const [paper, setPaper] = useState("001");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GeneratedNote | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState<{ base64: string; mimeType: string } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const { data: subjects } = useListSubjects();
  const { state: ttsState, speak, pause, resume, stop, isSupported } = useReadAloud();
  const queryClient = useQueryClient();
  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  const currentTab = SOURCE_TABS.find(t => t.id === activeTab)!;

  const handleFile = (file: File) => {
    const allowed = ["application/pdf", "text/plain", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|txt|doc|docx)$/i)) {
      setError("Please upload a PDF, Word doc (.docx), or text file (.txt)");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File too large — maximum 20 MB");
      return;
    }
    setError("");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      setFileData({ base64, mimeType: file.type || "application/octet-stream" });
      if (!noteTitle) setNoteTitle(file.name.replace(/\.[^.]+$/, ""));
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    setError("");
    setResult(null);

    if (activeTab === "file" && !fileData) {
      setError("Please upload a file first.");
      return;
    }
    if ((activeTab === "youtube" || activeTab === "website") && !urlInput.trim()) {
      setError("Please enter a URL.");
      return;
    }
    if (activeTab === "text" && !textInput.trim()) {
      setError("Please paste some text.");
      return;
    }

    setLoading(true);
    try {
      const body: any = {
        type: activeTab,
        title: noteTitle || undefined,
        subject: subjectCtx !== "none" ? subjects?.find(s => s.id.toString() === subjectCtx)?.name : undefined,
      };

      if (activeTab === "youtube" || activeTab === "website") body.content = urlInput.trim();
      if (activeTab === "text") body.content = textInput.trim();
      if (activeTab === "file") {
        body.fileBase64 = fileData!.base64;
        body.fileMimeType = fileData!.mimeType;
        body.title = noteTitle || fileName;
      }

      const res = await fetch(`${BASE}/api/ai/learn-from-source`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const data = await res.json();
      setResult(data);
      setSaved(false);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    const sid = subjectCtx !== "none" ? subjectCtx : subjects?.[0]?.id?.toString();
    if (!sid) { setError("Please select a subject before saving."); return; }
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/ai/save-generated-note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: parseInt(sid),
          paper,
          title: result.title,
          content: result.content,
          tags: ["ai-generated", "learn-from-source", activeTab],
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Save failed");
      }
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ["listNotes"] });
    } catch (e: any) {
      setError(e.message || "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleTTS = () => {
    if (!result) return;
    if (ttsState === "playing") pause();
    else if (ttsState === "paused") resume();
    else speak(`${result.title}. ${result.content}`);
  };

  return (
    <Shell>
      <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
              <Wand2 className="h-5 w-5 text-rose-400" />
            </div>
            AI Learn
          </h1>
          <p className="text-white/40 text-sm mt-1 ml-13">Turn any content into exam-ready JUPEB study notes — YouTube, websites, text, or files.</p>
        </motion.div>

        {/* Source type tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SOURCE_TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setError(""); setResult(null); }}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                  isActive
                    ? "bg-rose-500/15 border-rose-500/25 text-rose-300"
                    : "bg-white/3 border-white/5 text-white/50 hover:bg-white/6 hover:text-white/80"
                )}
              >
                <TabIcon className="h-5 w-5" />
                <span className="text-xs font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 space-y-4"
        >
          <p className="text-xs text-white/40">{currentTab.description}</p>

          {/* URL input (YouTube / Website) */}
          {(activeTab === "youtube" || activeTab === "website") && (
            <div className="space-y-1">
              <div className="relative">
                {activeTab === "youtube"
                  ? <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
                  : <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />}
                <Input
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder={currentTab.placeholder}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11"
                />
              </div>
              {activeTab === "youtube" && (
                <p className="text-[11px] text-white/30 pl-1">Works with any public YouTube video — lectures, documentaries, tutorials</p>
              )}
            </div>
          )}

          {/* Text paste */}
          {activeTab === "text" && (
            <Textarea
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder={currentTab.placeholder}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[160px] resize-y"
            />
          )}

          {/* File upload */}
          {activeTab === "file" && (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
              }}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all",
                dragOver ? "border-rose-400/50 bg-rose-500/10" : "border-white/10 hover:border-white/25 hover:bg-white/3",
                fileData && "border-emerald-500/30 bg-emerald-500/5"
              )}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              {fileData ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto">
                    <Check className="h-6 w-6 text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-emerald-400">{fileName}</p>
                  <p className="text-xs text-white/30">File ready — click Generate to create notes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto">
                    <Upload className="h-6 w-6 text-white/30" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60 font-medium">Drop file here or click to browse</p>
                    <p className="text-xs text-white/30 mt-1">PDF, Word (.docx), or Text (.txt) — max 20 MB</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Options row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">Note Title (optional)</label>
              <Input
                value={noteTitle}
                onChange={e => setNoteTitle(e.target.value)}
                placeholder="Auto-generated if blank"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">Subject Context</label>
              <Select value={subjectCtx} onValueChange={setSubjectCtx}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 text-sm">
                  <SelectValue placeholder="Auto-detect" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e28] border-white/10">
                  <SelectItem value="none" className="text-white">Auto-detect</SelectItem>
                  {(Array.isArray(subjects) ? subjects : []).map(s => (
                    <SelectItem key={s.id} value={s.id.toString()} className="text-white">{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">Save to Paper</label>
              <Select value={paper} onValueChange={setPaper}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e28] border-white/10">
                  {Object.entries(PAPER_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-white text-xs">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-rose-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                AI is reading and generating notes…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Study Notes
              </>
            )}
          </Button>
        </motion.div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-card overflow-hidden"
            >
              {/* Result header */}
              <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-rose-400" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold font-serif text-white truncate">{result.title}</h2>
                    <p className="text-xs text-white/40">AI-generated · Ready to study</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* TTS */}
                  {isSupported && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleTTS}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all",
                          ttsState === "playing"
                            ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
                            : ttsState === "paused"
                            ? "bg-blue-500/20 border-blue-500/30 text-blue-300"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                        )}
                      >
                        {ttsState === "playing" ? (
                          <><Pause className="h-3.5 w-3.5" /> Pause</>
                        ) : ttsState === "paused" ? (
                          <><Play className="h-3.5 w-3.5" /> Resume</>
                        ) : (
                          <><Volume2 className="h-3.5 w-3.5" /> Read Aloud</>
                        )}
                      </button>
                      {ttsState !== "idle" && (
                        <button
                          onClick={stop}
                          className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white/80 transition-colors"
                        >
                          <Square className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Save */}
                  <button
                    onClick={handleSave}
                    disabled={saving || saved}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all",
                      saved
                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                        : "bg-violet-500/15 border-violet-500/25 text-violet-300 hover:bg-violet-500/25"
                    )}
                  >
                    {saving ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
                    ) : saved ? (
                      <><Check className="h-3.5 w-3.5" /> Saved!</>
                    ) : (
                      <><Save className="h-3.5 w-3.5" /> Save to Notes</>
                    )}
                  </button>
                </div>
              </div>

              {/* Note content */}
              <div className="px-5 py-6">
                {ttsState === "playing" && (
                  <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-1 rounded-full bg-amber-400"
                          animate={{ height: ["8px", "16px", "8px"] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-amber-300 font-medium">Reading aloud…</span>
                    <span className="text-[10px] text-amber-300/50 ml-auto">Nigerian English voice</span>
                  </div>
                )}
                <div
                  className="prose prose-sm prose-invert max-w-none
                    prose-headings:font-serif prose-headings:text-rose-300 prose-headings:border-b prose-headings:border-white/5 prose-headings:pb-1
                    prose-h2:text-lg prose-h3:text-base prose-h4:text-sm
                    prose-p:text-white/75 prose-p:leading-relaxed
                    prose-strong:text-white prose-strong:font-semibold
                    prose-ul:text-white/75 prose-ol:text-white/75 prose-li:my-0.5
                    prose-blockquote:border-rose-500 prose-blockquote:text-white/60 prose-blockquote:bg-rose-500/5 prose-blockquote:rounded-r-xl
                    prose-code:text-amber-300 prose-code:bg-white/10 prose-code:px-1.5 prose-code:rounded
                    whitespace-pre-wrap"
                >
                  {result.content}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info card */}
        {!result && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              { icon: Youtube, label: "YouTube lectures", color: "text-red-400", bg: "bg-red-500/10" },
              { icon: Globe, label: "Web articles", color: "text-blue-400", bg: "bg-blue-500/10" },
              { icon: FileText, label: "Lecture notes", color: "text-violet-400", bg: "bg-violet-500/10" },
              { icon: Upload, label: "PDF textbooks", color: "text-emerald-400", bg: "bg-emerald-500/10" },
            ].map(({ icon: Icon, label, color, bg }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/3 border border-white/5"
              >
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", bg)}>
                  <Icon className={cn("h-4 w-4", color)} />
                </div>
                <span className="text-xs text-white/50 text-center">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </Shell>
  );
}
