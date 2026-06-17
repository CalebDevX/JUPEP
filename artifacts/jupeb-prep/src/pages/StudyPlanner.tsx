import { useState, useRef } from "react";
import { Shell } from "@/components/layout/Shell";
import { motion } from "framer-motion";
import { Calendar, Sparkles, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function getProfile() {
  try { return JSON.parse(localStorage.getItem("jupeb_profile") || "{}"); } catch { return {}; }
}

function renderLine(line: string, i: number) {
  if (line.startsWith("## ")) return (
    <h2 key={i} className="text-xl font-black text-white mt-8 mb-3 first:mt-0">{line.slice(3)}</h2>
  );
  if (line.startsWith("### ")) return (
    <h3 key={i} className="text-sm font-bold text-violet-300 mt-5 mb-2 uppercase tracking-wide">{line.slice(4)}</h3>
  );
  if (line.startsWith("#### ")) return (
    <h4 key={i} className="text-sm font-semibold text-white/80 mt-3 mb-1">{line.slice(5)}</h4>
  );
  if (line.startsWith("---")) return <hr key={i} className="border-white/10 my-5" />;
  if (line.startsWith("| ")) {
    const cells = line.split("|").slice(1, -1).map(c => c.trim());
    const isSeparator = cells.every(c => /^[-:]+$/.test(c));
    if (isSeparator) return null;
    const isHeader = i > 0;
    return (
      <div key={i} className={cn(
        "grid text-xs border-b border-white/5 py-1.5 px-1",
        cells.length >= 5 ? "grid-cols-5" : cells.length === 4 ? "grid-cols-4" : cells.length === 3 ? "grid-cols-3" : "grid-cols-2"
      )}>
        {cells.map((c, j) => (
          <span key={j} className={cn(j === 0 ? "text-white/50" : "text-white/65", "leading-relaxed")}>{c}</span>
        ))}
      </div>
    );
  }
  if (line.match(/^\*\*(.+)\*\*$/)) return (
    <p key={i} className="text-sm font-semibold text-white/80 my-1">{line.slice(2, -2)}</p>
  );
  if (line.startsWith("- ") || line.startsWith("* ")) return (
    <li key={i} className="text-sm text-white/55 ml-5 list-disc leading-relaxed py-0.5">
      {line.slice(2).replace(/\*\*(.+?)\*\*/g, "$1")}
    </li>
  );
  if (/^\d+\. /.test(line)) return (
    <li key={i} className="text-sm text-white/55 ml-5 list-decimal leading-relaxed py-0.5">
      {line.replace(/^\d+\. /, "")}
    </li>
  );
  if (line.trim() === "") return <div key={i} className="h-1.5" />;
  const formatted = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  return <p key={i} className="text-sm text-white/55 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
}

export default function StudyPlanner() {
  const [examDate, setExamDate] = useState("");
  const [dailyHours, setDailyHours] = useState("3");
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState("");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const profile = getProfile();
  const subjects: string[] = profile.subjects || [];

  const today = new Date().toISOString().split("T")[0];
  const daysUntilExam = examDate
    ? Math.max(0, Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000))
    : 0;

  const generate = async () => {
    if (!examDate) return setError("Please select your exam date.");
    if (subjects.length === 0) return setError("No subjects found. Please update your profile.");
    setError("");
    setPlan("");
    setGenerating(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const examDateFormatted = new Date(examDate).toLocaleDateString("en-NG", {
      day: "numeric", month: "long", year: "numeric",
    });

    const prompt = `You are a JUPEB exam preparation expert for Nigerian foundation-year students. Create a detailed, realistic week-by-week study plan.

**Student Details:**
- Subjects: ${subjects.join(", ")}
- Exam date: ${examDateFormatted}
- Days remaining: ${daysUntilExam}
- Daily study hours: ${dailyHours} hours

**Instructions:**
Generate a complete week-by-week JUPEB study plan from today until the exam. Use this exact format:

## 📅 My JUPEB Study Plan
**Exam:** ${examDateFormatted} | **Days Left:** ${daysUntilExam} | **Daily Hours:** ${dailyHours}h

---

### Week 1: Foundation
**Focus:** [what to cover]
**Subjects this week:** [list]

| Day | Subject | Topic | Hours | Tasks |
|-----|---------|-------|-------|-------|
| Monday | [subject] | [real JUPEB topic] | [hours] | [2 specific tasks] |
| Tuesday | [subject] | [real JUPEB topic] | [hours] | [2 specific tasks] |
| Wednesday | [subject] | [real JUPEB topic] | [hours] | [2 specific tasks] |
| Thursday | [subject] | [real JUPEB topic] | [hours] | [2 specific tasks] |
| Friday | [subject] | [real JUPEB topic] | [hours] | [2 specific tasks] |
| Saturday | Revision | Review week's notes | ${Math.ceil(Number(dailyHours) * 0.5)}h | Past questions, mind maps |
| Sunday | Rest | Light reading only | 1h | Review flashcards |

**Week 1 Tips:** [2 practical study tips for this week]

---

[Continue this exact pattern for ALL weeks until exam. Cover each subject's real JUPEB syllabus topics.]

---

### 🎯 Final Week Checklist
[Bullet points for last-minute revision strategy]

### 💡 Key Success Tips for JUPEB
[5 specific, actionable tips]

Use REAL JUPEB syllabus topics for each subject (e.g., for Government: Nature of Government, Pre-Colonial Governments, Colonialism, Military Rule, etc.). Be specific and encouraging.`;

    try {
      const resp = await fetch(`${BASE}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
        signal: abortRef.current.signal,
      });

      if (!resp.body) throw new Error("No stream");
      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let result = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw || raw === "[DONE]") continue;
          try {
            const p = JSON.parse(raw);
            const chunk = p.content ?? p.text ?? p.delta ?? "";
            result += chunk;
            setPlan(result);
          } catch {}
        }
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") setError("Failed to generate plan. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Shell>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-violet-400" />
              </div>
              Study Planner
            </h1>
            <p className="text-white/40 text-sm mt-1">AI generates your personalised week-by-week JUPEB schedule.</p>
          </div>
          {plan && !generating && (
            <button
              onClick={() => { setPlan(""); setExamDate(""); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white text-sm transition-all"
            >
              <RotateCcw className="h-4 w-4" /> New Plan
            </button>
          )}
        </motion.div>

        {/* Setup form — shown when no plan yet */}
        {!plan && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6 space-y-6"
          >
            {/* Subjects */}
            <div>
              <label className="text-[11px] font-bold text-white/40 tracking-widest uppercase block mb-2">
                Your Subjects
              </label>
              <div className="flex flex-wrap gap-2">
                {subjects.length > 0 ? subjects.map(s => (
                  <span key={s} className="px-3 py-1.5 rounded-xl bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs font-semibold">{s}</span>
                )) : (
                  <span className="text-sm text-white/30 italic">No subjects in your profile — update your profile first.</span>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Exam date */}
              <div>
                <label className="text-[11px] font-bold text-white/40 tracking-widest uppercase block mb-2">
                  JUPEB Exam Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  min={today}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/40 transition-colors"
                />
                {examDate && daysUntilExam > 0 && (
                  <p className="text-xs text-violet-400 mt-1.5">
                    📅 {daysUntilExam} day{daysUntilExam !== 1 ? "s" : ""} until exam · {Math.ceil(daysUntilExam / 7)} week{Math.ceil(daysUntilExam / 7) !== 1 ? "s" : ""} to prepare
                  </p>
                )}
                {examDate && daysUntilExam <= 0 && (
                  <p className="text-xs text-rose-400 mt-1.5">⚠ Please select a future date</p>
                )}
              </div>

              {/* Daily hours */}
              <div>
                <label className="text-[11px] font-bold text-white/40 tracking-widest uppercase block mb-2">
                  Daily Study Hours
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["2", "3", "4", "5"].map(h => (
                    <button key={h} type="button" onClick={() => setDailyHours(h)}
                      className={cn(
                        "py-3 rounded-xl border text-sm font-bold transition-all",
                        dailyHours === h
                          ? "border-violet-500/50 bg-violet-500/15 text-violet-300"
                          : "border-white/10 bg-white/3 text-white/40 hover:border-white/20 hover:text-white/60"
                      )}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-white/25 mt-1.5">Be realistic — consistency beats marathon sessions.</p>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-300">
                ⚠ {error}
              </div>
            )}

            <button
              onClick={generate}
              disabled={generating || subjects.length === 0 || !examDate || daysUntilExam <= 0}
              className="w-full relative group overflow-hidden rounded-2xl px-6 py-4 font-bold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 group-hover:from-violet-500 group-hover:to-indigo-500 transition-all" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="relative flex items-center justify-center gap-2.5">
                {generating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Writing your study plan…</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Generate My Study Plan</>
                )}
              </span>
            </button>
          </motion.div>
        )}

        {/* Generated plan */}
        {plan && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6"
          >
            {generating && (
              <div className="flex items-center gap-2 text-violet-400 text-sm mb-4 pb-4 border-b border-white/10">
                <Loader2 className="h-4 w-4 animate-spin" />
                Writing your personalised study plan…
              </div>
            )}

            <div className="space-y-0.5 overflow-x-auto min-w-0">
              {plan.split("\n").map((line, i) => renderLine(line, i))}
            </div>

            {!generating && (
              <div className="mt-8 pt-4 border-t border-white/10 grid sm:grid-cols-2 gap-3">
                <button
                  onClick={() => { setPlan(""); setExamDate(""); }}
                  className="py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white text-sm font-medium transition-all"
                >
                  ↩ Start Over
                </button>
                <button
                  onClick={generate}
                  className="py-3 rounded-xl bg-violet-600/80 hover:bg-violet-600 border border-violet-500/30 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" /> Regenerate Plan
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Shell>
  );
}
