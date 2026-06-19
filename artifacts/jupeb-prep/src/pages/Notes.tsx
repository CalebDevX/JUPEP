import { useState, useMemo } from "react";
import { useListNotes, useListSubjects } from "@workspace/api-client-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { BookOpen, GraduationCap, Sparkles, FileText, Loader2, Search, Volume2, Pause, Play, Square, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { isActivated } from "@/lib/access";
import { PaywallGate } from "@/components/PaywallGate";
import { useReadAloud } from "@/hooks/useReadAloud";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

const paperLabels: Record<string, string> = {
  "001": "1st In-Course",
  "002": "1st Semester",
  "003": "2nd In-Course",
  "004": "2nd Semester",
  "mock": "Mock Exam",
  "jupeb": "JUPEB Final",
};

const subjectColors: Record<string, string> = {
  "Literature-in-English": "bg-violet-500/15 text-violet-300 border-violet-500/20",
  "Government": "bg-blue-500/15 text-blue-300 border-blue-500/20",
  "CRS": "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
};

export default function Notes() {
  const [subjectId, setSubjectId] = useState<string>("all");
  const [paper, setPaper] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [genForm, setGenForm] = useState({ subjectId: "", paper: "001", topic: "", syllabus: "" });
  const [genError, setGenError] = useState("");
  const [readingNoteId, setReadingNoteId] = useState<number | null>(null);
  const { state: ttsState, speak, pause, resume, stop, isSupported: ttsSupported } = useReadAloud();

  const { data: subjectsRaw } = useListSubjects();
  const subjects = Array.isArray(subjectsRaw) ? subjectsRaw : [];
  const queryClient = useQueryClient();
  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  const queryParams = useMemo(() => ({
    ...(subjectId !== "all" ? { subjectId: Number(subjectId) } : {}),
    ...(paper !== "all" ? { paper } : {}),
  }), [subjectId, paper]);

  const { data: notes, isLoading } = useListNotes(queryParams);

  const notesArr = Array.isArray(notes) ? notes : [];
  const filteredNotes = useMemo(() => {
    if (!search.trim()) return notesArr;
    const q = search.toLowerCase();
    return notesArr.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.subjectName?.toLowerCase().includes(q)
    );
  }, [notesArr, search]);

  const handleGenerate = async () => {
    if (!genForm.subjectId || !genForm.topic.trim()) {
      setGenError("Please select a subject and enter a topic.");
      return;
    }
    setGenError("");
    setGenerating(true);
    try {
      const res = await fetch(`${BASE}/api/ai/generate-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: parseInt(genForm.subjectId),
          paper: genForm.paper,
          topic: genForm.topic,
          syllabus: genForm.syllabus || undefined,
        }),
      });
      if (!res.ok) {
        let errMsg = "Failed to generate notes";
        try { const err = await res.json(); errMsg = err.error || errMsg; } catch {}
        throw new Error(errMsg);
      }
      const newNote = await res.json();
      queryClient.invalidateQueries({ queryKey: ["listNotes"] });
      setGenOpen(false);
      setGenForm({ subjectId: "", paper: "001", topic: "", syllabus: "" });
      setExpandedId(newNote.id);
    } catch (err: any) {
      setGenError(err.message || "Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (!isActivated()) {
    return (
      <Shell>
        <PaywallGate feature="notes" />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/15 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-pink-400" />
              </div>
              Study Notes
            </h1>
            <p className="text-white/40 text-sm mt-1 ml-13">Academic notes & study materials</p>
          </div>

          <Dialog open={genOpen} onOpenChange={setGenOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-500 text-white gap-2 rounded-xl">
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#18181f] border-white/10 text-white max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-serif text-xl">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  AI Note Generator
                </DialogTitle>
                <p className="text-sm text-white/50 mt-1">
                  Describe a topic and LexBot will generate comprehensive academic lecture notes instantly.
                </p>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/60">Subject *</Label>
                    <Select value={genForm.subjectId} onValueChange={v => setGenForm(f => ({ ...f, subjectId: v }))}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e1e28] border-white/10">
                        {subjects?.map(s => (
                          <SelectItem key={s.id} value={s.id.toString()} className="text-white">
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/60">Paper</Label>
                    <Select value={genForm.paper} onValueChange={v => setGenForm(f => ({ ...f, paper: v }))}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e1e28] border-white/10">
                        <SelectItem value="001" className="text-white">1st In-Course Exam</SelectItem>
                        <SelectItem value="002" className="text-white">1st Semester Exam</SelectItem>
                        <SelectItem value="003" className="text-white">2nd In-Course Exam</SelectItem>
                        <SelectItem value="004" className="text-white">2nd Semester Exam</SelectItem>
                        <SelectItem value="jupeb" className="text-white">JUPEB Final Exam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-white/60">Topic / Title *</Label>
                  <Input
                    placeholder="e.g. Dramatic irony in Things Fall Apart"
                    value={genForm.topic}
                    onChange={e => setGenForm(f => ({ ...f, topic: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-white/60">Syllabus / Outline (optional)</Label>
                  <Textarea
                    placeholder="Paste your syllabus, key points, or chapter outline here for more targeted notes…"
                    value={genForm.syllabus}
                    onChange={e => setGenForm(f => ({ ...f, syllabus: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px] resize-none"
                  />
                </div>
                {genError && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                    {genError}
                  </p>
                )}
                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl h-11"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating comprehensive notes…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Academic Notes
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              placeholder="Search notes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9"
            />
          </div>
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger className="w-[170px] bg-white/5 border-white/10 text-white h-9">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e28] border-white/10">
              <SelectItem value="all" className="text-white">All Subjects</SelectItem>
              {subjects?.map(s => (
                <SelectItem key={s.id} value={s.id.toString()} className="text-white">{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={paper} onValueChange={setPaper}>
            <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white h-9">
              <SelectValue placeholder="All Papers" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e28] border-white/10">
              <SelectItem value="all" className="text-white">All Papers</SelectItem>
              <SelectItem value="001" className="text-white">1st In-Course</SelectItem>
              <SelectItem value="002" className="text-white">1st Semester</SelectItem>
              <SelectItem value="003" className="text-white">2nd In-Course</SelectItem>
              <SelectItem value="004" className="text-white">2nd Semester</SelectItem>
              <SelectItem value="jupeb" className="text-white">JUPEB Final</SelectItem>
            </SelectContent>
          </Select>
          {filteredNotes && (
            <span className="text-xs text-white/30">{filteredNotes.length} note{filteredNotes.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {/* Notes grid */}
        <div className={cn(
          filteredNotes?.length && !isLoading
            ? "grid grid-cols-1 sm:grid-cols-2 gap-4 items-start"
            : "space-y-4"
        )}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 bg-white/5 rounded-2xl" />
            ))
          ) : !filteredNotes?.length ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-7 w-7 text-white/30" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white mb-2">No notes found</h3>
              <p className="text-white/40 text-sm mb-6">
                {search ? "No notes match your search." : "No notes yet. Generate notes or ask your admin to upload some!"}
              </p>
              <Button
                onClick={() => setGenOpen(true)}
                className="bg-violet-600 hover:bg-violet-500 text-white gap-2 rounded-xl"
              >
                <Sparkles className="h-4 w-4" /> Generate with AI
              </Button>
            </motion.div>
          ) : (
            filteredNotes?.map((note, i) => {
              const isExpanded = expandedId === note.id;
              const colorClass = subjectColors[note.subjectName || ""] || "bg-violet-500/15 text-violet-300 border-violet-500/20";
              const isAI = note.tags?.includes("ai-generated");
              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn("glass-card overflow-hidden", isExpanded && "sm:col-span-2")}
                >
                  <button
                    className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-white/3 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : note.id)}
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-4 w-4 text-pink-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-base font-semibold text-white font-serif">{note.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={cn("text-[10px] border px-2 py-0", colorClass)}>
                            {note.subjectName}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] bg-white/5 text-white/40 border-0 px-2 py-0">
                            Paper {note.paper} — {paperLabels[note.paper]}
                          </Badge>
                          {note.tags?.filter(t => t !== "ai-generated").map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px] bg-white/5 text-white/30 border-0 px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className={cn(
                      "text-white/30 flex-shrink-0 mt-1 transition-transform",
                      isExpanded && "rotate-180"
                    )}>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/5 px-5 pb-6 pt-4"
                    >
                      {/* Read Aloud bar */}
                      {ttsSupported && (
                        <div className="flex items-center gap-2 mb-4">
                          {readingNoteId === note.id && ttsState === "playing" ? (
                            <>
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
                                <div className="flex gap-0.5 items-end h-4">
                                  {[0,1,2].map(j => (
                                    <motion.div key={j} className="w-0.5 rounded-full bg-amber-400"
                                      animate={{ height: ["4px","12px","4px"] }}
                                      transition={{ repeat: Infinity, duration: 0.7, delay: j*0.13 }}
                                    />
                                  ))}
                                </div>
                                Reading aloud…
                              </div>
                              <button onClick={() => { pause(); }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10 transition-colors">
                                <Pause className="h-3 w-3" /> Pause
                              </button>
                              <button onClick={() => { stop(); setReadingNoteId(null); }}
                                className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
                                <Square className="h-3 w-3" />
                              </button>
                            </>
                          ) : readingNoteId === note.id && ttsState === "paused" ? (
                            <>
                              <button onClick={() => resume()}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-medium hover:bg-blue-500/25 transition-colors">
                                <Play className="h-3 w-3" /> Resume
                              </button>
                              <button onClick={() => { stop(); setReadingNoteId(null); }}
                                className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
                                <Square className="h-3 w-3" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                if (readingNoteId !== null && readingNoteId !== note.id) stop();
                                setReadingNoteId(note.id);
                                speak(`${note.title}. ${note.content}`);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-amber-500/10 hover:border-amber-500/20 hover:text-amber-300 transition-all"
                            >
                              <Volume2 className="h-3.5 w-3.5" /> Read Aloud
                            </button>
                          )}
                          <span className="text-[10px] text-white/20 ml-1">Nigerian English</span>
                        </div>
                      )}

                      {/* Export PDF */}
                      <div className="flex justify-end mb-3">
                        <button
                          onClick={() => {
                            const win = window.open("", "_blank");
                            if (!win) return;
                            win.document.write(`
                              <html><head><title>${note.title}</title>
                              <style>
                                body { font-family: Georgia, serif; max-width: 720px; margin: 40px auto; color: #111; line-height: 1.7; padding: 0 24px; }
                                h1 { font-size: 24px; border-bottom: 2px solid #7c3aed; padding-bottom: 8px; color: #4c1d95; }
                                h2 { font-size: 18px; color: #5b21b6; margin-top: 24px; }
                                h3 { font-size: 15px; color: #6d28d9; }
                                .meta { font-size: 12px; color: #666; margin-bottom: 24px; }
                                .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
                                .brand { font-size: 12px; color: #7c3aed; font-weight: bold; letter-spacing: 1px; }
                                @media print { button { display: none; } }
                              </style></head>
                              <body>
                                <div class="header">
                                  <span class="brand">JUPEB PREP</span>
                                  <span class="meta">${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                                </div>
                                <h1>${note.title}</h1>
                                <p class="meta">${note.subjectName || ""} · Paper ${note.paper} · ${paperLabels[note.paper] || ""}</p>
                                ${note.content.replace(/\n/g, "<br/>")}
                                <br/><hr/><p style="font-size:11px;color:#999;text-align:center">Generated by JUPEB Prep AI · jupeb.app</p>
                              </body></html>
                            `);
                            win.document.close();
                            win.focus();
                            setTimeout(() => { win.print(); }, 500);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-300 transition-all"
                        >
                          <Download className="h-3.5 w-3.5" /> Export PDF
                        </button>
                      </div>

                      <div
                        className="prose prose-sm prose-invert max-w-none
                          prose-headings:font-serif prose-headings:text-violet-300 prose-headings:border-b prose-headings:border-white/5 prose-headings:pb-1
                          prose-h2:text-lg prose-h3:text-base prose-h4:text-sm
                          prose-p:text-white/75 prose-p:leading-relaxed
                          prose-strong:text-white prose-strong:font-semibold
                          prose-ul:text-white/75 prose-ol:text-white/75 prose-li:my-0.5
                          prose-blockquote:border-violet-500 prose-blockquote:text-white/60 prose-blockquote:bg-violet-500/5 prose-blockquote:rounded-r-xl prose-blockquote:py-1
                          prose-code:text-amber-300 prose-code:bg-white/10 prose-code:px-1.5 prose-code:rounded
                          prose-em:text-white/60
                          prose-table:text-white/75 prose-thead:border-white/10 prose-tr:border-white/5 prose-th:text-white prose-td:text-white/70"
                      >
                        <ReactMarkdown>{note.content}</ReactMarkdown>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </Shell>
  );
}
