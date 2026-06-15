import { useState, useRef, useCallback } from "react";
import { Shell } from "@/components/layout/Shell";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2, Youtube, Globe, FileText, Upload, Loader2, Sparkles,
  Volume2, VolumeX, Square, Save, BookOpen, Check, Pause, Play,
  X, AlertCircle, Brain, ListChecks, ChevronRight, RotateCcw,
  Mic, AudioWaveform, Zap, Trophy, Star,
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
type ViewTab = "generate" | "notes" | "quiz";

interface QuizItem {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

interface GeneratedNote {
  title: string;
  content: string;
  type: SourceType;
}

const SOURCE_TABS: { id: SourceType; label: string; icon: any; placeholder: string; description: string; accent: string }[] = [
  {
    id: "youtube",
    label: "YouTube",
    icon: Youtube,
    placeholder: "https://www.youtube.com/watch?v=...",
    description: "Paste any YouTube lecture, documentary or tutorial URL",
    accent: "text-red-400 border-red-500/30 bg-red-500/10",
  },
  {
    id: "website",
    label: "Website",
    icon: Globe,
    placeholder: "https://example.com/article",
    description: "Paste a web article, blog post or educational page URL",
    accent: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  },
  {
    id: "text",
    label: "Paste Text",
    icon: FileText,
    placeholder: "Paste your lecture notes, textbook excerpt, or any text here…",
    description: "Copy-paste text from anywhere — textbook, handout, WhatsApp notes",
    accent: "text-violet-400 border-violet-500/30 bg-violet-500/10",
  },
  {
    id: "file",
    label: "Upload File",
    icon: Upload,
    placeholder: "",
    description: "Upload a PDF, Word doc, or text file from your device",
    accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
];

const PAPER_LABELS: Record<string, string> = {
  "001": "Paper 001 — 1st Incourse",
  "002": "Paper 002 — 1st Semester",
  "003": "Paper 003 — 2nd Incourse",
  "004": "Paper 004 — Mock Exam",
};

const VOICES = [
  { value: "Kore", label: "Kore — Warm & Clear", description: "Natural educator voice" },
  { value: "Aoede", label: "Aoede — Calm & Natural", description: "Smooth and expressive" },
  { value: "Charon", label: "Charon — Crisp & Precise", description: "Clear and professional" },
  { value: "Puck", label: "Puck — Bright & Energetic", description: "Engaging and lively" },
];

function NoteRenderer({ content }: { content: string }) {
  const formatted = content
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^## (.+)$/gm, `<h2 class="text-rose-300 font-bold text-lg mt-6 mb-2 pb-1.5 border-b border-white/8 font-serif">$1</h2>`)
    .replace(/^### (.+)$/gm, `<h3 class="text-white font-semibold text-base mt-4 mb-1.5">$1</h3>`)
    .replace(/^#### (.+)$/gm, `<h4 class="text-white/80 font-semibold text-sm mt-3 mb-1">$1</h4>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em class='text-white/75 italic'>$1</em>")
    .replace(/`([^`]+)`/g, "<code class='bg-white/10 text-amber-300 px-1.5 py-0.5 rounded text-xs font-mono'>$1</code>")
    .replace(/^> (.+)$/gm, "<blockquote class='border-l-3 border-rose-400/40 pl-4 py-1 bg-rose-500/5 rounded-r-lg my-2 italic text-white/65'>$1</blockquote>")
    .replace(/^[-*] (.+)$/gm, "<li class='text-white/80 my-1 pl-1'>$1</li>")
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, m => `<ul class="list-disc pl-5 space-y-1 my-2">${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, "<li class='text-white/80 my-1 pl-1'>$1</li>")
    .replace(/\n\n/g, "</p><p class='text-white/75 leading-relaxed my-2'>")
    .replace(/\n/g, "<br/>")
    .replace(/^(?!<[hublip])(.+)$/gm, "<p class='text-white/75 leading-relaxed my-2'>$1</p>")
    .replace(/<p[^>]*><\/p>/g, "");

  return (
    <div
      className="text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: formatted }}
    />
  );
}

export default function LearnFromSource() {
  const [activeSource, setActiveSource] = useState<SourceType>("youtube");
  const [viewTab, setViewTab] = useState<ViewTab>("generate");
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [subjectCtx, setSubjectCtx] = useState("none");
  const [paper, setPaper] = useState("001");
  const [selectedVoice, setSelectedVoice] = useState("Kore");
  const [loading, setLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GeneratedNote | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState<{ base64: string; mimeType: string } | null>(null);
  const [quiz, setQuiz] = useState<QuizItem[] | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loadStep, setLoadStep] = useState(0);

  const fileRef = useRef<HTMLInputElement>(null);
  const { data: subjectsRaw } = useListSubjects();
  const subjects = Array.isArray(subjectsRaw) ? subjectsRaw : [];
  const { state: ttsState, engine: ttsEngine, speak, pause, resume, stop } = useReadAloud();
  const queryClient = useQueryClient();
  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  const currentSource = SOURCE_TABS.find(t => t.id === activeSource)!;

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

  const LOAD_STEPS = [
    "Reading source content…",
    "Analysing key concepts…",
    "Structuring lecture notes…",
    "Adding exam tips…",
    "Finalising…",
  ];

  const handleGenerate = useCallback(async () => {
    setError("");
    setResult(null);
    setQuiz(null);
    setQuizAnswers({});
    setQuizSubmitted(false);

    if (activeSource === "file" && !fileData) { setError("Please upload a file first."); return; }
    if ((activeSource === "youtube" || activeSource === "website") && !urlInput.trim()) { setError("Please enter a URL."); return; }
    if (activeSource === "text" && !textInput.trim()) { setError("Please paste some text."); return; }

    setLoading(true);
    setLoadStep(0);

    const stepInterval = setInterval(() => {
      setLoadStep(s => Math.min(s + 1, LOAD_STEPS.length - 1));
    }, 2500);

    try {
      const body: any = {
        type: activeSource,
        title: noteTitle || undefined,
        subject: subjectCtx !== "none" ? subjects.find(s => s.id.toString() === subjectCtx)?.name : undefined,
      };
      if (activeSource === "youtube" || activeSource === "website") body.content = urlInput.trim();
      if (activeSource === "text") body.content = textInput.trim();
      if (activeSource === "file") {
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
        let errMsg = "Generation failed";
        try { const d = await res.json(); errMsg = d.error || errMsg; } catch {}
        throw new Error(errMsg);
      }

      const data = await res.json();
      setResult(data);
      setSaved(false);
      setViewTab("notes");
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  }, [activeSource, fileData, urlInput, textInput, noteTitle, subjectCtx, paper, subjects, fileName, BASE]);

  const handleGenerateQuiz = useCallback(async () => {
    if (!result) return;
    setQuizLoading(true);
    setQuiz(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    try {
      const subjectName = subjectCtx !== "none" ? subjects.find(s => s.id.toString() === subjectCtx)?.name : undefined;
      const res = await fetch(`${BASE}/api/ai/quiz-from-note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: result.content, subject: subjectName, count: 5 }),
      });
      if (!res.ok) {
        let errMsg = "Quiz generation failed";
        try { const d = await res.json(); errMsg = d.error || errMsg; } catch {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      setQuiz(data.quiz);
      setViewTab("quiz");
    } catch (e: any) {
      setError(e.message || "Could not generate quiz.");
    } finally {
      setQuizLoading(false);
    }
  }, [result, subjectCtx, subjects, BASE]);

  const handleSave = useCallback(async () => {
    if (!result) return;
    const sid = subjectCtx !== "none" ? subjectCtx : subjects[0]?.id?.toString();
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
          tags: ["ai-generated", "learn-from-source", activeSource],
        }),
      });
      if (!res.ok) {
        let errMsg = "Save failed";
        try { const d = await res.json(); errMsg = d.error || errMsg; } catch {}
        throw new Error(errMsg);
      }
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ["listNotes"] });
    } catch (e: any) {
      setError(e.message || "Failed to save note");
    } finally {
      setSaving(false);
    }
  }, [result, subjectCtx, subjects, paper, activeSource, BASE, queryClient]);

  const handleTTS = useCallback(() => {
    if (!result) return;
    if (ttsState === "playing") pause();
    else if (ttsState === "paused") resume();
    else speak(`${result.title}. ${result.content}`, true);
  }, [result, ttsState, speak, pause, resume, selectedVoice]);

  const quizScore = quizSubmitted && quiz
    ? quiz.filter((q, i) => quizAnswers[i] === q.correct[0]).length
    : 0;

  return (
    <Shell>
      <div className="min-h-screen bg-[#0c0c10]">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <Wand2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-serif font-light text-white leading-tight">AI Learn</h1>
                  <p className="text-[11px] text-white/35 leading-none mt-0.5">JUPEB study notes from any source</p>
                </div>
              </div>
            </div>

            {result && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {["notes", "quiz"].map(t => (
                  <button
                    key={t}
                    onClick={() => setViewTab(t as ViewTab)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                      viewTab === t
                        ? "bg-rose-500/20 border-rose-500/30 text-rose-300"
                        : "bg-white/5 border-white/8 text-white/40 hover:text-white/70"
                    )}
                  >
                    {t === "notes" ? <BookOpen className="h-3.5 w-3.5" /> : <Brain className="h-3.5 w-3.5" />}
                    {t === "notes" ? "My Notes" : "Quiz Me"}
                  </button>
                ))}
                <button
                  onClick={() => setViewTab("generate")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                    viewTab === "generate"
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-white/5 border-white/8 text-white/40 hover:text-white/70"
                  )}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  New
                </button>
              </div>
            )}
          </motion.div>

          {/* ── GENERATE TAB ── */}
          <AnimatePresence mode="wait">
            {viewTab === "generate" && (
              <motion.div
                key="generate"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-4"
              >
                {/* Source type selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SOURCE_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeSource === tab.id;
                    return (
                      <motion.button
                        key={tab.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setActiveSource(tab.id); setError(""); }}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200",
                          isActive
                            ? `border-rose-500/30 bg-rose-500/12 text-rose-300`
                            : "bg-white/[0.03] border-white/[0.06] text-white/45 hover:bg-white/[0.06] hover:text-white/75"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-semibold">{tab.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Input card */}
                <motion.div
                  key={activeSource}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 space-y-4"
                >
                  <p className="text-xs text-white/40">{currentSource.description}</p>

                  {/* URL input */}
                  {(activeSource === "youtube" || activeSource === "website") && (
                    <div className="relative">
                      {activeSource === "youtube"
                        ? <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
                        : <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />}
                      <Input
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        placeholder={currentSource.placeholder}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 h-11"
                      />
                    </div>
                  )}

                  {/* Text paste */}
                  {activeSource === "text" && (
                    <Textarea
                      value={textInput}
                      onChange={e => setTextInput(e.target.value)}
                      placeholder={currentSource.placeholder}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/25 min-h-[150px] resize-y"
                    />
                  )}

                  {/* File upload */}
                  {activeSource === "file" && (
                    <div
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => {
                        e.preventDefault(); setDragOver(false);
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
                      <input ref={fileRef} type="file" accept=".pdf,.txt,.doc,.docx" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                      {fileData ? (
                        <div className="space-y-2">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto">
                            <Check className="h-6 w-6 text-emerald-400" />
                          </div>
                          <p className="text-sm font-medium text-emerald-400">{fileName}</p>
                          <button onClick={e => { e.stopPropagation(); setFileData(null); setFileName(""); }}
                            className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 mx-auto">
                            <X className="h-3 w-3" /> Remove file
                          </button>
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
                      <Input value={noteTitle} onChange={e => setNoteTitle(e.target.value)}
                        placeholder="Auto-generated if blank"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/25 h-9 text-sm" />
                    </div>
                    <div>
                      <label className="text-[11px] text-white/40 mb-1 block">Subject Context</label>
                      <Select value={subjectCtx} onValueChange={setSubjectCtx}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 text-sm">
                          <SelectValue placeholder="Auto-detect" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e1e28] border-white/10">
                          <SelectItem value="none" className="text-white">Auto-detect</SelectItem>
                          {subjects.map(s => (
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

                  {error && (
                    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                      <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-rose-500/15"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                        <span className="truncate">{LOAD_STEPS[loadStep]}</span>
                      </div>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Study Notes
                      </>
                    )}
                  </Button>

                  {/* Loading progress dots */}
                  {loading && (
                    <div className="flex items-center justify-center gap-2 pt-1">
                      {LOAD_STEPS.map((_, i) => (
                        <motion.div
                          key={i}
                          animate={i <= loadStep ? { scale: [1, 1.3, 1], opacity: 1 } : { opacity: 0.2 }}
                          transition={{ duration: 0.4 }}
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-500",
                            i <= loadStep ? "bg-rose-400 w-5" : "bg-white/15 w-2"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Capability cards */}
                {!loading && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { icon: Youtube, label: "YouTube Lectures", color: "text-red-400", bg: "bg-red-500/10" },
                      { icon: Globe, label: "Web Articles", color: "text-blue-400", bg: "bg-blue-500/10" },
                      { icon: FileText, label: "Lecture Notes", color: "text-violet-400", bg: "bg-violet-500/10" },
                      { icon: Upload, label: "PDF Textbooks", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    ].map(({ icon: Icon, label, color, bg }, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.07 }}
                        className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]"
                      >
                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
                          <Icon className={cn("h-4 w-4", color)} />
                        </div>
                        <span className="text-xs text-white/50">{label}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── NOTES TAB ── */}
            {viewTab === "notes" && result && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-4"
              >
                {/* Note toolbar */}
                <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-5 w-5 text-rose-400" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-sm font-bold text-white truncate">{result.title}</h2>
                        <p className="text-[10px] text-white/35 mt-0.5">AI-generated study notes</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Voice selector */}
                      <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                        <SelectTrigger className="h-8 bg-white/5 border-white/10 text-white text-xs w-[130px]">
                          <Mic className="h-3 w-3 mr-1.5 text-white/40" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e1e28] border-white/10">
                          {VOICES.map(v => (
                            <SelectItem key={v.value} value={v.value} className="text-white text-xs">
                              {v.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* TTS button */}
                      <button
                        onClick={handleTTS}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                          ttsState === "loading"
                            ? "bg-white/5 border-white/10 text-white/50 cursor-wait"
                            : ttsState === "playing"
                            ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
                            : ttsState === "paused"
                            ? "bg-blue-500/20 border-blue-500/30 text-blue-300"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                        )}
                      >
                        {ttsState === "loading" ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…</>
                        ) : ttsState === "playing" ? (
                          <><Pause className="h-3.5 w-3.5" /> Pause</>
                        ) : ttsState === "paused" ? (
                          <><Play className="h-3.5 w-3.5" /> Resume</>
                        ) : (
                          <><Volume2 className="h-3.5 w-3.5" /> Read Aloud</>
                        )}
                      </button>

                      {ttsState !== "idle" && (
                        <button onClick={stop}
                          className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white/80">
                          <Square className="h-3 w-3" />
                        </button>
                      )}

                      {/* Quiz generate */}
                      <button
                        onClick={handleGenerateQuiz}
                        disabled={quizLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border bg-violet-500/15 border-violet-500/25 text-violet-300 hover:bg-violet-500/25 transition-all"
                      >
                        {quizLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
                        {quizLoading ? "Generating…" : "Quiz Me"}
                      </button>

                      {/* Save */}
                      <button
                        onClick={handleSave}
                        disabled={saving || saved}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                          saved
                            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                        )}
                      >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                        {saving ? "Saving…" : saved ? "Saved!" : "Save"}
                      </button>
                    </div>
                  </div>

                  {/* TTS playing bar */}
                  <AnimatePresence>
                    {ttsState === "playing" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3"
                      >
                        <div className="flex gap-0.5 items-center">
                          {[0, 1, 2, 3, 4].map(i => (
                            <motion.div
                              key={i}
                              className="w-1 rounded-full bg-amber-400"
                              animate={{ height: ["6px", `${10 + i * 3}px`, "6px"] }}
                              transition={{ repeat: Infinity, duration: 0.6 + i * 0.12, delay: i * 0.1 }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-amber-300/80 font-medium">
                          Reading aloud with {VOICES.find(v => v.value === selectedVoice)?.label?.split(" — ")[0] || selectedVoice}
                          {ttsEngine === "browser" && <span className="text-white/30 ml-1">(browser voice)</span>}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Notes content */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-6">
                  <NoteRenderer content={result.content} />
                </div>

                {error && (
                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── QUIZ TAB ── */}
            {viewTab === "quiz" && result && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-4"
              >
                {quizLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-violet-500/15 flex items-center justify-center">
                      <Brain className="h-7 w-7 text-violet-400 animate-pulse" />
                    </div>
                    <p className="text-white/50 text-sm">Generating quiz questions…</p>
                  </div>
                ) : quiz ? (
                  <>
                    {/* Quiz score header */}
                    {quizSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          "p-4 rounded-2xl border flex items-center gap-4",
                          quizScore >= quiz.length * 0.8
                            ? "bg-emerald-500/10 border-emerald-500/20"
                            : quizScore >= quiz.length * 0.5
                            ? "bg-amber-500/10 border-amber-500/20"
                            : "bg-red-500/10 border-red-500/20"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0",
                          quizScore >= quiz.length * 0.8 ? "bg-emerald-500/20" : quizScore >= quiz.length * 0.5 ? "bg-amber-500/20" : "bg-red-500/20"
                        )}>
                          {quizScore >= quiz.length * 0.8 ? "🏆" : quizScore >= quiz.length * 0.5 ? "⭐" : "💪"}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-white text-base">
                            {quizScore}/{quiz.length} correct
                          </p>
                          <p className={cn("text-sm", quizScore >= quiz.length * 0.8 ? "text-emerald-400" : quizScore >= quiz.length * 0.5 ? "text-amber-400" : "text-red-400")}>
                            {quizScore >= quiz.length * 0.8 ? "Excellent! You understand this topic well." : quizScore >= quiz.length * 0.5 ? "Good effort! Review the explanations below." : "Keep studying! Review your notes and try again."}
                          </p>
                        </div>
                        <button
                          onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 hover:text-white/80"
                        >
                          <RotateCcw className="h-3 w-3" /> Retry
                        </button>
                      </motion.div>
                    )}

                    {/* Questions */}
                    <div className="space-y-4">
                      {quiz.map((q, qi) => {
                        const answered = quizAnswers[qi];
                        const isCorrect = answered === q.correct[0];
                        return (
                          <motion.div
                            key={qi}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: qi * 0.06 }}
                            className={cn(
                              "bg-white/[0.03] border rounded-2xl p-5 transition-all",
                              quizSubmitted && isCorrect ? "border-emerald-500/25" : quizSubmitted && answered ? "border-red-500/25" : "border-white/[0.06]"
                            )}
                          >
                            <div className="flex items-start gap-3 mb-4">
                              <span className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                {qi + 1}
                              </span>
                              <p className="text-sm text-white/90 leading-relaxed">{q.question}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.options.map((opt, oi) => {
                                const letter = String.fromCharCode(65 + oi);
                                const optText = opt.replace(/^[A-D]\.\s*/, "");
                                const isSelected = quizAnswers[qi] === letter;
                                const isRight = q.correct[0] === letter;
                                return (
                                  <button
                                    key={oi}
                                    disabled={quizSubmitted}
                                    onClick={() => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [qi]: letter }))}
                                    className={cn(
                                      "text-left p-3 rounded-xl border text-sm transition-all",
                                      quizSubmitted && isRight ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" :
                                      quizSubmitted && isSelected && !isRight ? "bg-red-500/15 border-red-500/30 text-red-300" :
                                      isSelected ? "bg-violet-500/20 border-violet-500/35 text-violet-200" :
                                      "bg-white/3 border-white/8 text-white/65 hover:bg-white/7 hover:border-white/15"
                                    )}
                                  >
                                    <span className="font-bold mr-2 opacity-60">{letter}.</span>{optText}
                                  </button>
                                );
                              })}
                            </div>
                            {quizSubmitted && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-3 pt-3 border-t border-white/5"
                              >
                                <p className="text-xs text-white/50 leading-relaxed">
                                  <span className={cn("font-bold mr-1", isCorrect ? "text-emerald-400" : "text-red-400")}>
                                    {isCorrect ? "✓ Correct!" : `✗ Correct: ${q.correct[0]}.`}
                                  </span>
                                  {q.explanation}
                                </p>
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>

                    {!quizSubmitted && (
                      <Button
                        onClick={() => setQuizSubmitted(true)}
                        disabled={Object.keys(quizAnswers).length < quiz.length}
                        className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl disabled:opacity-30"
                      >
                        <ListChecks className="h-4 w-4 mr-2" />
                        Submit Answers ({Object.keys(quizAnswers).length}/{quiz.length} answered)
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-violet-500/10 flex items-center justify-center">
                      <Brain className="h-8 w-8 text-violet-400/60" />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">No quiz generated yet</p>
                      <p className="text-white/25 text-xs mt-1">Go to Notes and click "Quiz Me"</p>
                    </div>
                    <button onClick={() => setViewTab("notes")} className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300">
                      <ChevronRight className="h-3.5 w-3.5" /> View my notes
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Nigerian Voice Info ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4 flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              <Mic className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-300/90 mb-0.5">Nigerian Accent Voice Reading</p>
              <p className="text-[11px] text-white/40 leading-relaxed">
                The AI voices (Kore, Aoede, etc.) are clear natural English voices. For a Nigerian English accent, use{" "}
                <strong className="text-white/60">Chrome on Android</strong> — it uses Google's en-NG voice engine automatically
                via the browser fallback. Best experience on mobile!
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </Shell>
  );
}
